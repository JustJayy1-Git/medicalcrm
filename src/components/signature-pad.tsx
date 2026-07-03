"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Touch + mouse signature capture. The drawn signature is exported as a PNG
 * data URL into a hidden input (`name`), so it submits with any plain form /
 * server action. Pass `initialDataUrl` to show a previously saved signature.
 */
export function SignaturePad({
  name,
  label,
  initialDataUrl,
  heightPx = 160,
}: {
  name: string;
  label: string;
  initialDataUrl?: string | null;
  heightPx?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(initialDataUrl));

  const syncHidden = useCallback(() => {
    const canvas = canvasRef.current;
    const hidden = hiddenRef.current;
    if (!canvas || !hidden) return;
    hidden.value = canvas.toDataURL("image/png");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = heightPx * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#101828";

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, heightPx);
        syncHidden();
      };
      img.src = initialDataUrl;
    }
    // Canvas is sized once on mount; forms are static-width in both portals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pointOf = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointOf(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointOf(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    syncHidden();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hiddenRef.current) hiddenRef.current.value = "";
    setHasInk(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-eggplant-700">
          {label}
        </label>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-neon-pink hover:text-eggplant-800 transition-colors"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ height: heightPx, touchAction: "none" }}
        className="w-full rounded-lg border border-dashed border-gold/50 bg-white cursor-crosshair shadow-sm"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={initialDataUrl ?? ""}
      />
      {!hasInk ? (
        <p className="text-[11px] text-vice-muted mt-1">
          Sign above with finger or stylus.
        </p>
      ) : null}
    </div>
  );
}

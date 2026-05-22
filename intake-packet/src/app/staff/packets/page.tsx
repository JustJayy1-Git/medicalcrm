import { listPackets } from "@/lib/form-persistence";
import Link from "next/link";

export default async function PacketsPage() {
  const packets = await listPackets();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginTop: 0 }}>Intake packets</h2>
        <Link href="/staff/packets/new" className="btn">
          New packet
        </Link>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Phone</th>
              <th>Accident date</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {packets.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/staff/packets/${p.id}`}>{p.id}</Link>
                </td>
                <td>{p.full_name || "—"}</td>
                <td>{p.phone || "—"}</td>
                <td>
                  {p.date_of_accident
                    ? new Date(p.date_of_accident).toISOString().slice(0, 10)
                    : "—"}
                </td>
                <td>{p.status}</td>
                <td>{new Date(p.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {packets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>
                  No packets yet. Create one to start the 8-page intake.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="staff-shell">
      <aside className="staff-nav">
        <h1>Pro Injury Intake</h1>
        {session ? (
          <>
            <nav style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Link href="/staff/packets">Packets</Link>
              <Link href="/staff/packets/new">New packet</Link>
            </nav>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{session.user?.email}</p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/staff/login" });
              }}
            >
              <button type="submit" className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
                Sign out
              </button>
            </form>
          </>
        ) : null}
      </aside>
      <main className="staff-main">{children}</main>
    </div>
  );
}

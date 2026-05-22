import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/staff/packets");

  const { callbackUrl } = await searchParams;

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <h2 style={{ marginTop: 0 }}>Staff sign in</h2>
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            redirectTo: callbackUrl || "/staff/packets",
          });
        }}
      >
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn">
          Sign in
        </button>
      </form>
    </div>
  );
}

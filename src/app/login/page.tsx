import { LoginForm } from "./login-form";

function safeNextPath(next: string | undefined): string {
  if (next && next.startsWith("/portal")) return "/dashboard";
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm afterLogin={safeNextPath(next)} />;
}

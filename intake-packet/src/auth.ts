import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Staff",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = process.env.STAFF_EMAIL;
        const password = process.env.STAFF_PASSWORD;
        if (!email || !password) return null;
        if (
          credentials?.email === email &&
          credentials?.password === password
        ) {
          return { id: "staff", name: "Staff", email };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/staff/login" },
  session: { strategy: "jwt" },
  trustHost: true,
});

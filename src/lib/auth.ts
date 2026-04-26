import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

type AuthProvider = AuthOptions["providers"][number];
import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

// Google SSO is opt-in: only mounted when both env vars are set so local dev
// without Google credentials still boots cleanly. Set GOOGLE_CLIENT_ID and
// GOOGLE_CLIENT_SECRET in `.env.local` to enable the "Continue with Google"
// button on the builder login page.
export const isGoogleSsoEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const providers: AuthProvider[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await db.user.findUnique({
        where: { email: credentials.email },
        include: { workspace: true },
      });

      if (!user) return null;

      const isValid = await compare(credentials.password, user.password);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspace?.id ?? null,
      };
    },
  }),
];

if (isGoogleSsoEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Force the consent screen so users can switch Google accounts cleanly.
      authorization: { params: { prompt: "consent" } },
    })
  );
}

export const authOptions: AuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Upsert a User row for Google sign-ins so the rest of the app — which
    // expects a `User` (and optionally a `Workspace`) keyed by email — keeps
    // working without a Prisma adapter. CredentialsProvider already requires
    // the row to exist, so this branch is Google-only.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user?.email) return false;

      const existing = await db.user.findUnique({
        where: { email: user.email },
      });
      if (existing) return true;

      // The User model requires `password`. For OAuth-provisioned accounts we
      // hash a long random secret nobody knows — they sign in via Google,
      // never via the credentials form.
      const placeholder = await hash(randomBytes(32).toString("hex"), 10);
      await db.user.create({
        data: {
          email: user.email,
          name: user.name || user.email.split("@")[0],
          password: placeholder,
        },
      });
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.workspaceId = (user as { workspaceId?: string | null }).workspaceId ?? null;
      }
      // Google sign-ins don't carry our DB id in `user`, so resolve it from
      // the email on the token after authorization completes.
      if (account?.provider === "google" && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          include: { workspace: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.workspaceId = dbUser.workspace?.id ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.workspaceId = token.workspaceId as string | null;
      }
      return session;
    },
  },
};

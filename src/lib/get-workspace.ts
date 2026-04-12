import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Look up a workspace by its URL slug (the `<slug>` in /apps/<slug> or
 * <slug>.erpbuilder.app). This is the runtime path — end users of a merchant's
 * ERP don't authenticate against the builder's session; they land directly
 * on their tenant's app via the slug. Returns null when the slug is unknown.
 */
export async function getWorkspaceBySlug(slug: string) {
  if (!slug) return null;
  return db.workspace.findUnique({ where: { slug } });
}

export async function getWorkspace() {
  const session = await getServerSession(authOptions);
  // AUTH BYPASS FOR DEV/PROTOTYPE
  if (!session?.user?.id) {
    if (process.env.NODE_ENV === "development") {
      const defaultEmail = "dev@erpbuilder.app";
      let user = await db.user.findUnique({ where: { email: defaultEmail } });
      if (!user) {
        user = await db.user.create({
          data: {
            email: defaultEmail,
            name: "Dev User",
            password: "hashed_password", // mock
            workspace: {
              create: { name: "Dev Workspace", slug: "dev" },
            },
          },
        });
      }
      return db.workspace.findUnique({ where: { userId: user.id } });
    }
    return null;
  }

  const workspace = await db.workspace.findUnique({
    where: { userId: session.user.id },
  });

  return workspace;
}

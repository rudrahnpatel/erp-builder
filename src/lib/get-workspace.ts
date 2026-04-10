import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getWorkspace() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const workspace = await db.workspace.findUnique({
    where: { userId: session.user.id },
  });

  return workspace;
}

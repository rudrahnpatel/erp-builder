import { db } from "@/lib/db";

export async function logAuditAction({
  action,
  actorId,
  actorEmail,
  targetId,
  details,
}: {
  action: string;
  actorId?: string;
  actorEmail?: string;
  targetId?: string;
  details?: any;
}) {
  try {
    await db.auditLog.create({
      data: {
        action,
        actorId,
        actorEmail,
        targetId,
        details: details || {},
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

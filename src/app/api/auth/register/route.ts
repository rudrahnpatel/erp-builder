import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

/**
 * Generate a placeholder workspace slug at registration time. The user will
 * replace this with a real, human-readable subdomain via the onboarding flow
 * — but we need *some* value now because `Workspace.slug` is NOT NULL unique,
 * and we never want to block signup on picking a subdomain.
 */
function makePlaceholderSlug(): string {
  return `u-${randomBytes(5).toString("hex")}`;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        workspace: {
          create: {
            name: workspaceName || `${name}'s Workspace`,
            slug: makePlaceholderSlug(),
          },
        },
      },
      include: { workspace: true },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, workspaceId: user.workspace?.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

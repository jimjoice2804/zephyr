import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@zephyr/db";
import { Lucia, type Session, type User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

type DatabaseUserAttributes = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
  email: string | null;
  emailVerified: boolean;
};

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: process.env.NODE_ENV === "production",
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  },
  getUserAttributes: (attributes) => ({
    id: attributes.id,
    username: attributes.username,
    displayName: attributes.displayName,
    avatarUrl: attributes.avatarUrl,
    googleId: attributes.googleId,
    email: attributes.email,
    emailVerified: attributes.emailVerified,
  }),
});

type SessionAttributes = {
  username: string;
  email: string;
};

declare module "lucia" {
  type Register = {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: SessionAttributes;
  };
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    return result;
  }
);

export function createSessionCookie(sessionId: string) {
  return lucia.createSessionCookie(sessionId);
}

export function createBlankSessionCookie() {
  return lucia.createBlankSessionCookie();
}

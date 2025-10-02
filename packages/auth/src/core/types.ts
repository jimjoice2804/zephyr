import type { auth } from "./config";

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export type AuthContext = {
  session: Session | null;
  user: User | null;
};

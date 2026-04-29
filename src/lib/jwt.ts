import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "./env";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

const ISSUER = "college-event-management";

export function signAccessToken(
  payload: AccessTokenPayload,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  const options: SignOptions = { expiresIn, issuer: ISSUER };
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role },
    env.JWT_SECRET,
    options
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: ISSUER,
  }) as jwt.JwtPayload & AccessTokenPayload;
  if (!decoded.sub || !decoded.email || !decoded.role) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

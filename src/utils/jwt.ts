import jwt from "jsonwebtoken";
import config from "../config/index.js";

const secret = config.jwt_secret ;
if (!secret) {
  throw new Error("Missing JWT_SECRET environment variable");
}
const expiresIn = (config.jwt_expires_in ?? "7d") as jwt.SignOptions["expiresIn"];
export type JwtUserPayload = {
  id: string;
  email: string;
  role: string;
  status: string;
};

export const signToken = (payload: JwtUserPayload) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secret) as JwtUserPayload;
};

import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "fixitnow-secret";
const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

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

import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { verifyToken } from "@/lib/auth";

export function requireAuth(
  handler: NextApiHandler,
  requiredRole?: string
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== "object" || !("role" in decoded)) {
      return res
        .status(401)
        .json({ message: `Invalid or expired token ${token}` });
    }

    const user = decoded as jwt.JwtPayload;

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden ${user.role}` });
    }

    (req as any).user = user;

    return handler(req, res);
  };
}

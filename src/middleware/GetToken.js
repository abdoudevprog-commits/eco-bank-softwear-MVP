import jwt from "jsonwebtoken";

export const GetToken = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const [scheme, token] = authorization?.split(" ") || [];

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token manquant." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ message: "Token invalide (payload incomplet)." });
    }

    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
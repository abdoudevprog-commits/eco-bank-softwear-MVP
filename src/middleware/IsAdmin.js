// middlewares/isAdmin.middleware.js
import User from "../models/User.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    // 1. L'id vient du token décodé par authMiddleware, jamais du body/params
    const userId = req.user._id;

    // 2. Re-fetch en DB pour avoir le role/status à jour (pas celui du vieux token)
    const currentUser = await User.findById(userId).select("role status");

    if (!currentUser) {
      return res.status(401).json({ message: "Utilisateur introuvable." });
    }

    // 3. Compte doit être actif
    if (currentUser.status !== "active") {
      return res.status(403).json({ message: "Compte inactif." });
    }

    // 4. Vérif du rôle
    if (currentUser.role !== "admin" && currentUser.role !== "owner") {
      return res.status(403).json({ message: "Accès réservé aux administrateurs." });
    }

    // 5. req.user à jour avec les données de la DB
    req.user = {
      _id: currentUser._id,
      role: currentUser.role,
      status: currentUser.status,
    };

    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
// controllers/freeze.controller.js
import { freezeUserService } from "../services/freeze.service.js";

export const freezeUser = async (req, res) => {
  try {
    // Vient du token, déjà vérifié par authMiddleware + isAdmin
    const adminId = req.user._id;

    // Vient de l'URL -> identifie la ressource ciblée
    const { clientId } = req.params;

    // Données envoyées par l'admin
    const { reason, password } = req.body;
 
     if (!clientId) {
      return res.status(400).json({ message: "ID du client requis." });
    }
    // Validation basique (pas de logique métier ici, juste la forme des données)
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ message: "Raison du freeze requise (min 3 caractères)." });
    }

    if (!password) {
      return res.status(400).json({ message: "Mot de passe requis pour confirmer." });
    }

    // Toute la logique métier + sécurité est dans le service
    const result = await freezeUserService({ clientId, adminId, reason, password });

    return res.status(200).json({
      message: "Compte freeze avec succès.",
      data: result,
    });
  } catch (error) {
    console.error("freezeUser controller error:", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Erreur serveur.",
    });
  }
};
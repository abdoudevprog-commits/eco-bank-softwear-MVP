// services/freeze.service.js
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import Freeze from "../models/Freeze.model.js";

export const freezeUserService = async ({ clientId, adminId, reason, password }) => {
  // 1. Vérifier le mot de passe de l'admin (protection contre token volé)
  const admin = await User.findById(adminId).select("+password");

  if (!admin) {
    const err = new Error("Administrateur introuvable.");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    const err = new Error("Mot de passe incorrect.");
    err.statusCode = 401;
    throw err;
  }

  // 2. Vérifier que le user cible existe
  const targetClient = await User.findById(clientId);
  if (!targetClient) {
    const err = new Error("Client introuvable.");
    err.statusCode = 404;
    throw err;
  }

  // 3. Vérifier que la cible est bien un client (pas admin/owner)
  if (targetClient.role !== "client") {
    const err = new Error("Seuls les clients peuvent être freeze.");
    err.statusCode = 403;
    throw err;
  }

  // 4. Vérifier qu'il n'y a pas de transaction en cours
  if (targetClient.isProcessing) {
    const err = new Error("Transaction en cours, impossible de freeze.");
    err.statusCode = 409;
    throw err;
  }

  // 5. Vérifier que le compte n'est pas déjà freeze
  if (targetClient.status === "inactive") {
    const err = new Error("Ce compte est déjà freeze.");
    err.statusCode = 409;
    throw err;
  }

  // 6. Update atomique -> évite les race conditions (2 admins qui freeze en même temps,
  //    ou une transaction qui démarre entre le check et l'update)
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, status: "active", isProcessing: false },
    { $set: { status: "inactive" } },
    { new: true }
  );

  if (!updatedUser) {
    const err = new Error("Le compte a déjà été freeze ou est en cours de transaction.");
    err.statusCode = 409;
    throw err;
  }

  // 7. Créer le document Freeze (audit trail : qui, quand, pourquoi)
  const freezeDoc = await Freeze.create({
    user: userId,
    frozenBy: adminId,
    reason,
  });

  return { user: updatedUser, freeze: freezeDoc };
};
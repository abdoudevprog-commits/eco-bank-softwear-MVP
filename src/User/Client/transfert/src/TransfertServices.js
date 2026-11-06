import User from '../../../models/userRepo.js';
import trasfertOTP from "../models/TrasnfertOtpRepo.js";
import crypto from "crypto";

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (code) => {
    return crypto.createHash("sha256").update(code).digest("hex");
};






/// debut transfer service section

// ---- Étape 1 : demander le transfert -> génère le OTP ----
export const requestTransfer = async (data, senderId) => {
    const { ReceiverId, amount } = data;

    if (!amount || amount <= 0) {
        const error = new Error("Montant invalide");
        error.status = 400;
        throw error;
    }

    const Sender = await User.findById(senderId);
    if (!Sender) {
        const error = new Error("Expéditeur non trouvé");
        error.status = 404;
        throw error;
    } 

    const Receiver = await User.findById(ReceiverId);
    if (!Receiver) {
        const error = new Error("Destinataire non trouvé");
        error.status = 404;
        throw error;
    }

    if (Sender.solde < amount) {
        const error = new Error("Solde insuffisant");
        error.status = 400;
        throw error;
    }

    // Invalide tous les anciens OTP en attente pour ce user
    await trasfertOTP.updateMany(
        { sender: senderId, used: false },
        { $set: { used: true } }
    );

    const rawCode = generateOtp();
    const codeHash = hashOtp(rawCode);

    await trasfertOTP.create({
        sender : Sender._id,
        receiver : Receiver._id,
        codeHash,
        amount,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    console.log(`[DEV] Code OTP pour ${Sender.email} : ${rawCode}`);

    return { message: "Code de confirmation envoyé" };
};

// ---- Étape 2 : vérifier le code -> exécute le transfert ----
export const verifyTransfer = async (data, senderId) => {
    const { ReceiverId, amount, code } = data;

    // verifacation du code  
      if (!code || !/^\d{6}$/.test(code)) {
        const error = new Error("Code invalide");
        error.status = 400;
        throw error;
    }

    const otpDoc = await trasfertOTP.findOne({
        sender: senderId,
        receiver: ReceiverId,
        amount,
        used: false
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
        const error = new Error("Aucune demande valide trouvée");
        error.status = 400;
        throw error;
    }

    if (otpDoc.expiresAt < new Date()) {
        const error = new Error("Code expiré");
        error.status = 400;
        throw error;
    }

    if (otpDoc.attempts >= otpDoc.maxAttempts) {
        const error = new Error("Trop de tentatives, redemande un code");
        error.status = 429;
        throw error;
    }

    const codeHash = hashOtp(code);

    if (codeHash !== otpDoc.codeHash) {
        // Incrémentation atomique des tentatives (évite d'écraser un compteur concurrent)
        await trasfertOTP.updateOne(
            { _id: otpDoc._id },
            { $inc: { attempts: 1 } }
        );
        const error = new Error("Code incorrect");
        error.status = 400;
        throw error;
    }

    // 🔒 Flip atomique de "used" : ne réussit QUE si used était encore false.
    // Si deux requêtes concurrentes arrivent avec le même code valide,
    // une seule passera ce point, l'autre recevra null.
    const claimedOtp = await trasfertOTP.findOneAndUpdate(
        { _id: otpDoc._id, used: false },
        { $set: { used: true } },
        { new: true }
    );

    if (!claimedOtp) {
        const error = new Error("Ce code a déjà été utilisé");
        error.status = 400;
        throw error;
    }

     

    // EXÉCUTION DU TRANSFERT : retrait du sender et ajout au receiver
    const session = await User.startSession();
    session.startTransaction();
    try {
        const updatedSender = await User.findOneAndUpdate(
            { _id: senderId, solde: { $gte: amount } },
            { $inc: { solde: -amount } },
            { new: true, session }
        );

        if (!updatedSender) {
            const error = new Error("Solde insuffisant au moment du transfert");
            error.status = 400;
            throw error;
        }

        const updatedReceiver = await User.findOneAndUpdate(
            { _id: ReceiverId },
            { $inc: { solde: amount } },
            { new: true, session }
        );

        if (!updatedReceiver) {
            const error = new Error("Destinataire introuvable");
            error.status = 404;
            throw error;
        }

        await session.commitTransaction();
        return { sender: updatedSender, receiver: updatedReceiver };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

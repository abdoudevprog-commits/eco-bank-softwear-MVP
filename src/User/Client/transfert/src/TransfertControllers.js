import * as trasfertService from "./TransfertServices.js";

export const requestTransfer = async (req, res) => {
    try {
        const requestTransferOpt = await clientService.requestTransfer(
            req.body,
            req.user._id
        );
        res.status(200).json(requestTransferOpt);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }   
}; 

export const confirmTransfer = async (req, res) => {
    try {
        const confirmTransferOpt = await clientService.verifyTransfer(
            req.body,
            req.user._id
        );
        res.status(200).json(confirmTransferOpt);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}; 

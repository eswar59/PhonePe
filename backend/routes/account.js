const express = require("express");
const authMiddleware = require("../middleware");
const { Account } = require("../db");
const zod = require("zod")
const { default: mongoose } = require('mongoose');


const accountRouter = express.Router();

accountRouter.get("/balance",authMiddleware, async (req, res) => {
    const userId = req.userId;  // in middleware we are adding userId to req
    const account = await Account.findOne({
        userId: userId
    })
    res.json({
        balance: account.balance
    })
})

accountRouter.post("/transfer", authMiddleware, async (req, res)=>{ 
    // create session
    const session = await mongoose.startSession();
    // start transaction
    session.startTransaction();

    const { amount, to } = req.body;
    const receiverId = to;
    const senderId = req.userId;

    // Fetch the accounts within the transaction
    // query to db end => .session(session)
    const account = await Account.findOne({ userId: senderId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction(); // fail => session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }
    // query to db end => .session(session)
    const receiverAccount = await Account.findOne({ userId: receiverId }).session(session);

    if (!receiverAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid receiver account"
        });
    }

    // Perform the transfer
    await Account.updateOne({ userId: senderId}, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: receiverId }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction succesful transaction
    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
})

module.exports = accountRouter;
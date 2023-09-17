const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
transactionHash: String,
state: String,
network: String,
createdAt: Date,
to: String,
from: String,

})

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
 
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    designation: String,
    name:String,
    walletaddress: String
})
module.exports  = mongoose.model('addUser',userSchema);
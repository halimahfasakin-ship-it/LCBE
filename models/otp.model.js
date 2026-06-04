const mongoose = require('mongoose')

const otpSchema = mongoose.Schema({
    email : {type:String, required: true, unique: true},
    otp:{type:String, required: true},
    expires:{
        type: Date,
        default: Date.now,
        expires:300
    }
}, {timestamps:true})
const OtpModel = mongoose.model("otp", otpSchema)
module.exports = OtpModel

// const mongoose = require("mongoose")

// const otpSchema = mongoose.Schema({
//     email: {
//         type: String,
//         required: true
//     },

//     otp: {
//         type: String,
//         required: true
//     }
// }, { timestamps: true })



// module.exports = OtpModel
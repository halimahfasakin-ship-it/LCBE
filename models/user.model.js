const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
    gender: { type: String, enum: ["male", "female"] },
    isVerified: { type: Boolean, default: false },
    profileImage: {
        public_id: { type: String },
        secure_url: { type: String }
    }

}, { timestamps: true, strict: "throw" })


const UserModel = mongoose.model("user", UserSchema)

module.exports = UserModel

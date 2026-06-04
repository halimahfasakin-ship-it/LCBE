const mongoose = require("mongoose")

const StaffSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"] },
    role: { type: String, default: "staff" },
    isVerified: { type: Boolean, default: false },
    profileImage: {
        public_id: { type: String },
        secure_url: { type: String }
    }

}, { timestamps: true, strict: "throw" })


const StaffModel = mongoose.model("staff", StaffSchema)

module.exports = StaffModel
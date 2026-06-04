const mongoose = require("mongoose")

const ProdSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true},
    price: { type: Number, required: true},
    category: { type: String, required: true},
    description: { type: String, required: true},
    quantity: { type: Number, required: true, default: 1},
    prodImage: {
        public_id: { type: String },
        secure_url: { type: String }
    },
    stock: { type: Number, required: true, default: 0 }

}, { timestamps: true, strict: "throw" })

const ProductModel = mongoose.model("product", ProdSchema)

module.exports = ProductModel

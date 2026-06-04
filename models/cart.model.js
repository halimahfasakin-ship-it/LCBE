const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },

            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    // totalPrice: { type: Number, required: true, default: 0 }

}, { timestamps: true})

const CartModel = mongoose.model("cart", CartSchema)

module.exports = CartModel
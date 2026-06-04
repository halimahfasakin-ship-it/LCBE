const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },
            staffId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    totalPrice: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    orderStatus: { type: String, enum: ["processing", "shipped", "delivered"], default: "processing" }

}, { timestamps: true, })

const OrderModel = mongoose.model("order", OrderSchema)

module.exports = OrderModel
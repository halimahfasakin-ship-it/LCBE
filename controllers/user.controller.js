const express = require("express")
const UserModel = require("../models/user.model")
const ProductModel = require("../models/product.model")
const CartModel = require("../models/cart.model")
const OrderModel = require("../models/order.model")
const OtpModel = require("../models/otp.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const otpGen = require("otp-generator")
const nodemailer = require("nodemailer")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET

})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.APP_MAIL,
        pass: process.env.APP_PASSWORD
    }
})

let mailOptions = {
    from: process.env.APP_MAIL,
    to: 'halimahfasakin@gmail.com',
    subject: "Welcome to Leemah's Collection",
    html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>Welcome to Leemah's Collection</h1>
            <p>Your login was successful</p>
        </body>
        </html>`
};


const addUserToDB = async (req, res) => {
    const { firstName, lastName, email, password, gender, profileImage, role } = req.body
    try {
        const saltRound = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltRound);

        // if (!profileImage) {
        //     return res.status(400).send({
        //         message: "Profile image is required"
        //     })
        // }
        // const image = await cloudinary.uploader.upload(profileImage)


        const user = await UserModel.create({
            firstName, lastName, email, password: hashedPassword, gender, role
            // profileImage: {
            //     public_id: image.public_id,
            //     secure_url: image.secure_url
            // }
        })

        console.log(req.body)

        const token = await jwt.sign({ id: user._id }, process.env.APP_TOKEN, { expiresIn: "5h" })


        res.status(201).send({
            message: "User created successfully",
            data: {
                firstName,
                lastName,
                email,
                gender: gender ? gender : null,
                token
            }
        })


    } catch (error) {
        console.log(error);
        if (error.code == "11000") {
            res.status(400).send({
                message: "User already exists"
            })
        }

        res.status(400).send({
            message: "User failed to create",
        })

    }
}


const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const isUser = await UserModel.findOne({ email })
        if (!isUser) {
            res.status(400).send({
                message: "Invalid Email"
            })

            return;
        }

        const isMatch = await bcrypt.compare(password, isUser.password)
        if (!isMatch) {
            res.status(400).send({
                message: "Invalid Password"
            })

            return;
        }

        const token = await jwt.sign({ id: isUser._id, role: isUser.role }, process.env.APP_TOKEN, { expiresIn: "5h" })
        res.status(200).send({
            message: "User logged in successfully!",
            data: {
                firstName: isUser.firstName,
                lastName: isUser.lastName,
                email,
                token
            }
        })

        await transporter.sendMail({
            from: process.env.APP_MAIL,
            to: email,
            subject: "Login Alert",
            html:
                `<h2>New Login</h2>
                <p>Your account was just accessed.</p>`
        })


    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Invalid credentials"
        })
    }
}

const getUsers = async (req, res) => {
    try {

        const user = await UserModel.find().select("-password")

        res.status(200).send({
            message: "Users fetched successfully ",
            data: user
        })
    } catch (error) {
        res.status(400).send({
            message: "Cannot retrieve user information"
        })
    }
}


const getUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await UserModel.findById(id).select("-password")

        if (!user) {
            res.status(404).send({
                message: "User not found"
            })
            return
        }
        res.status(200).send({
            message: "User fetched successfully ",
            data: user
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Error fetching user"
        })
    }
}


const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await UserModel.findByIdAndDelete(id)

        res.status(200).send({
            message: "User deleted successfully",
            data: user
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Unable to delete user"
        })
    }
}

const editUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true })

        res.status(200).send({
            message: "User updated successfully",
            data: user
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Unable to update user"
        })
    }
}


const changePassword = async (req, res) => {
    const id = req.user
    // console.log(req.user);

    const { oldPassword, newPassword } = req.body
    try {

        const isUser = await UserModel.findById(id)

        if (!isUser) {
            res.status(404).send({
                message: "User not found"
            })
            return;
        }

        const isMatch = await bcrypt.compare(oldPassword, isUser.password)

        if (!isMatch) {
            res.status(400).send({
                message: "Error with Password Validation"
            })

            return;
        }

        let saltRound = 20
        const salt = await bcrypt.genSalt(saltRound)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        await UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })

        res.status(200).send({
            message: "Password updated successfully!"
        })

    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Error with Password Validation"
        })
    }
}

const verifyUser = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    console.log("Auth Header:", authHeader); // Debugging log
    console.log(req.headers.authorization)

    if (!authHeader) {
        return res.status(401).send({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1] || authHeader;

    try {
        jwt.verify(token, process.env.APP_TOKEN, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).send({
                    message: "User unauthorized"
                });
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        console.log(error);
        return res.status(401).send({
            message: "User unauthorized"
        });
    }
};

const requestOTP = async (req, res) => {
    const { email } = req.body
    try {
        const isUser = await UserModel.findOne({ email })

        if (!isUser) {
            res.status(404).send({
                message: "User not found, please proceed to account creation"
            })

            return;
        }
    } catch (error) {
        res.status(400).send({
            message: "Failed to send OTP"

        })
        return;
    }

    const otpToken = otpGen.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
    await OtpModel.create({ email, otp: otpToken })

    await transporter.sendMail({
        from: process.env.APP_MAIL,
        to: email,
        subject: "OTP Verification",
        html: `<h1>Your OTP is ${otpToken}</h1>`
    })

    res.status(200).send({
        message: "OTP sent successfully"
    })

}
const forgotPassword = async (req, res) => {
    const { email, password, otp } = req.body

    try {
        const isUser = await UserModel.findOne({ email })

        if (!isUser) {
            res.status(404).send({
                message: "User not found, please proceed to account creation"
            })

            return;
        }

        const otpToken = otpGen.generate(6, { upperCaseAlphabets: false })

        const otpSend = await OtpModel.create({ email, otp: otpToken })
    } catch (error) {

    }
}

const addProdToDB = async (req, res) => {
    const { title, price, category, description, quantity, prodImage } = req.body
    try {
        if (!prodImage) {
            return res.status(400).send({
                message: "Product image required"
            })
        }

        const image = await cloudinary.uploader.upload(prodImage)
        const prod = await ProductModel.create({
            title, price, category, description, quantity,
            prodImage: {
                public_id: image.public_id,
                secure_url: image.secure_url
            }
        })
        res.status(201).send({
            message: "Product created successfully",
            data: prod
        })
    } catch (error) {
        console.log(error);
        if (error.code == "11000") {
            res.status(400).send({
                message: "Product already exists"
            })
        }

        console.log(error);
        res.status(400).send({
            message: "Product failed to create",
        })
    }
}

const getProd = async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            return res.status(400).send({ message: "Product ID is required" });
        }

        const prod = await ProductModel.findById(id)

        if (!prod) {
            return res.status(404).send({ message: "Product not found" });
        }
        
        res.status(200).send({
            message: "Product fetched successfully ",
            data: prod
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Error fetching product"
        })
    }
}

const getProds = async (req, res) => {
    try {
        const prod = await ProductModel.find()

        res.status(200).send({
            message: "Products fetched successfully ",
            data: prod
        })
    } catch (error) {
        res.status(400).send({
            message: "Can not retrieve products information"
        })
    }
}

const deleteProd = async (req, res) => {
    const { id } = req.params
    try {
        const user = await ProductModel.findByIdAndDelete(id)

        res.status(200).send({
            message: "Product deleted successfully",
            data: user
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Unable to delete product"
        })
    }
}
const editProd = async (req, res) => {
    const { id } = req.params
    try {
        const user = await ProductModel.findByIdAndUpdate(id, req.body, { new: true })

        res.status(200).send({
            message: "Product edited successfully",
            data: user
        })
    } catch (error) {
        console.log(error);

        res.status(400).send({
            message: "Unable to edit product"
        })
    }
}

const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body
    console.log("BODY", req.body)
    try {
        const product = await ProductModel.findById(productId)
        console.log("PRODUCT", product)
        if (!product) {
            return res.status(404).send({
                message: "Product not found"
            })
        }
        let cart = await CartModel.findOne({ userId })
        console.log("CART", cart)

        if (!cart) {
            cart = await CartModel.create({ userId, products: [{ productId, quantity }] })
        } else {
            const existingProduct = cart.products.find(item => item.productId && item.productId.toString() === productId)

            if (existingProduct) {
                existingProduct.quantity += quantity
            } else {
                cart.products.push({ productId, quantity })
            }
        }
        await cart.save()
        return res.status(200).send({
            message: "Cart created successfully",
            data: cart
        })
    } catch (error) {
        console.log("ADD TO CART ERROR", error)

        res.status(500).send({
            message: "Error adding to cart"
        })
    }
}

const getUserCart = async (req, res) => {

    const { userId } = req.params

    try {

        const cart = await CartModel.findOne({ userId }).populate("products.productId")

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found"
            })
        }

        res.status(200).send({
            message: "Cart fetched successfully",
            data: cart
        })


    } catch (error) {
        console.log(error)

        res.status(500).send({
            message: "Error fetching cart"
        })
    }
}

const increaseQuantity = async (req, res) => {

    const { userId, productId } = req.params
    console.log(userId)
    console.log(productId)
    try {

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found"
            })
        }

        const product = cart.products.find(
            item => item.productId.toString() === productId
        )

        if (!product) {
            return res.status(404).send({
                message: "Product not found in cart"
            })
        }

        product.quantity += 1

        await cart.save()

        res.status(200).send({
            message: "Quantity increased",
            data: cart
        })


        cart.totalPrice = cart.products.reduce(
            (total, item) =>
                total + item.quantity * (item.productId?.price || 0),
            0
        )

        await cart.save()

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error increasing quantity"
        })
    }

}

const decreaseQuantity = async (req, res) => {

    const { userId, productId } = req.params

    try {

        const cart = await CartModel.findOne({ userId }).populate("products.productId")

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found"
            })
        }

        console.log(cart.products)
        console.log(productId)

        const productIndex = cart.products.findIndex(
            item => item.productId?._id?.toString() === productId
        )

        if (productIndex === -1) {
            return res.status(404).send({
                message: "Product not found in cart"
            })
        }

        cart.products[productIndex].quantity -= 1

        // Remove product if quantity becomes 0
        if (cart.products[productIndex].quantity <= 0) {

            cart.products.splice(productIndex, 1)
        }

        await cart.save()

        res.status(200).send({
            message: "Quantity decreased",
            data: cart
        })


        cart.totalPrice = cart.products.reduce(
            (total, item) =>
                total + item.quantity * item.productId?.price,
            0
        )

        await cart.save()


    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error decreasing quantity"
        })
    }

}

const removeFromCart = async (req, res) => {

    const { userId, productId } = req.params

    try {

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found"
            })
        }

        cart.products = cart.products.filter(
            item => item.productId.toString() !== productId
        )

        await cart.save()

        res.status(200).send({
            message: "Product removed from cart",
            data: cart
        })



        cart.totalPrice = cart.products.reduce(
            (total, item) =>
                total + item.quantity * item.productId?.price,
            0
        )

        await cart.save()

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error removing product"
        })
    }

}

const clearCart = async (req, res) => {

    const { userId } = req.params

    try {

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).send({
                message: "Cart not found"
            })
        }

        cart.products = []

        await cart.save()

        res.status(200).send({
            message: "Cart cleared",
            data: cart
        })


        cart.totalPrice = cart.products.reduce(
            (total, item) =>
                total + item.quantity * item.productId?.price,
            0
        )

        await cart.save()

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error clearing cart"
        })
    }


}

const createOrder = async (req, res) => {

    const { userId } = req.user
    const { deliveryAddress } = req.body
    try {

        // Find cart
        const cart = await CartModel.findOne({ userId })
            .populate("products.productId")

        if (!cart || cart.products.length === 0) {
            return res.status(400).send({
                message: "Cart is empty"
            })
        }

        // Calculate total
        let total = 0

        cart.products.forEach((item) => {
            total += item.productId.price * item.quantity
        })

        // Create order
        const order = await OrderModel.create({
            userId,
            products: cart.products.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity
            })),
            totalPrice: total,
            deliveryAddress
        })

        // Clear cart
        cart.products = []

        await cart.save()

        res.status(201).send({
            message: "Order created successfully",
            data: order
        })

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error creating order"
        })
    }
}

const getUserOrders = async (req, res) => {

    const { userId } = req.params

    try {

        const orders = await OrderModel.find({ userId })
            .populate("products.productId")

        res.status(200).send({
            message: "Orders fetched successfully",
            data: orders
        })

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error fetching orders"
        })
    }
}

const getAllOrders = async (req, res) => {

    try {

        const orders = await OrderModel.find()
            .populate("userId")
            .populate("products.productId")

        res.status(200).send({
            message: "Orders fetched successfully",
            data: orders
        })

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error fetching orders"
        })
    }
}

const updateOrderStatus = async (req, res) => {

    const { orderId } = req.params

    const { orderStatus } = req.body

    const allowedStatuses = [
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ]

    if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).send({
            message: "Invalid order status"
        })
    }

    try {

        const order = await OrderModel.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true }
        )

        res.status(200).send({
            message: "Order updated successfully",
            data: order
        })

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error updating order"
        })
    }
}

const cancelOrder = async (req, res) => {

    const { id } = req.params

    try {

        const order = await OrderModel.findById(id)

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            })
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).send({
                message: "Delivered orders cannot be cancelled"
            })
        }

        order.orderStatus = "cancelled"

        await order.save()

        res.status(200).send({
            message: "Order cancelled",
            data: order
        })

    } catch (error) {

        console.log(error)

        res.status(400).send({
            message: "Failed to cancel order"
        })
    }
}

const getSingleOrder = async (req, res) => {
    const { id } = req.params

    try {

        const order = await OrderModel.findById(id)
            .populate("products.productId")

        if (!order) {
            return res.status(404).send({
                message: "Order not found"
            })
        }

        res.status(200).send({
            message: "Order fetched successfully",
            data: order
        })

    } catch (error) {
        console.log(error)

        res.status(400).send({
            message: "Failed to fetch order"
        })
    }
}

const getStaffs = async (req, res) => {
    try {

        const staffs = await UserModel.find({
            role: "staff"
        }).select("-password")

        res.status(200).send({
            message: "Staff fetched successfully",
            data: staffs
        })

    } catch (error) {

        console.log(error)

        res.status(500).send({
            message: "Error fetching staff"
        })

    }
}


module.exports = {
    addUserToDB,
    getUsers,
    getUser,
    deleteUser,
    editUser,
    login,
    verifyUser,
    changePassword,
    requestOTP,
    forgotPassword,
    addProdToDB,
    getProd,
    getProds,
    deleteProd,
    editProd,
    addToCart,
    getUserCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    getSingleOrder,
    cancelOrder,
    getStaffs
}

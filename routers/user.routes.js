const express = require("express")
const { addUserToDB, getUsers, getUser, deleteUser, editUser, login, verifyUser, changePassword, requestOTP, addProdToDB, getProd, getProds, deleteProd, editProd, addToCart, getUserCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, createOrder, getUserOrders, getAllOrders, updateOrderStatus, getSingleOrder, cancelOrder, getStaffs } = require("../controllers/user.controller")
const { verify } = require("jsonwebtoken")
const { authorizeRoles } = require("../middleware/auth")

const router = express.Router()


router.post("/addUserToDB", addUserToDB)
router.get("/getUsers", verifyUser, getUsers)
router.get("/getUser/:id", getUser)
router.get("/staff", verifyUser, authorizeRoles("admin"), getStaffs),
router.delete("/deleteUser/:id", deleteUser)
router.put("/editUser/:id", editUser)
router.post("/login", login)
router.patch("/change-pass", verifyUser, changePassword)
router.post("/request-otp", requestOTP)
router.post("/addProdToDB", verifyUser, authorizeRoles("admin"), addProdToDB)
router.get("/getProd/:id", verifyUser, authorizeRoles("user", "admin"), getProd)
router.get("/getProds", getProds)
router.delete("/deleteProd/:id",verifyUser, authorizeRoles("admin"), deleteProd)
router.patch("/editProd/:id", verifyUser, authorizeRoles("admin"), editProd)
router.post("/addToCart", verifyUser, authorizeRoles("user"), addToCart)
router.get("/getUserCart/:userId", verifyUser, authorizeRoles("user"), getUserCart)
router.patch("/increaseQuantity/:userId/:productId", verifyUser, authorizeRoles("user"), increaseQuantity)
router.patch("/decreaseQuantity/:userId/:productId", verifyUser, authorizeRoles("user"), decreaseQuantity)
router.delete("/removeFromCart/:userId/:productId", verifyUser, authorizeRoles("user"), removeFromCart)
router.delete("/clearCart/:userId", verifyUser, authorizeRoles("user"), clearCart)
router.post("/createOrder", verifyUser, authorizeRoles("user"), createOrder)
router.get("/getUserOrders/:userId", verifyUser, authorizeRoles("user"), getUserOrders)
router.get("/getallOrders", verifyUser, authorizeRoles("admin", "staff"), getAllOrders)
router.patch("/updateOrderStatus/:orderId", verifyUser, authorizeRoles("admin", "staff"), updateOrderStatus)
router.put("/order/cancel/:id", verifyUser, cancelOrder)
router.get("/order/:id", verifyUser, getSingleOrder)


module.exports = router
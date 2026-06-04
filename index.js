require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
app.set('view engine', 'ejs')
const dotenv = require("dotenv")
dotenv.config()
app.use(express.urlencoded({extended:true}))
app.use(express.json({limit:"50mb"}))
app.use(cors())

mongoose.connect(process.env.DB_URI)
.then(()=>{
    console.log("Database connected successfully");
    
})
.catch((err)=>{
    console.log(err);
    console.log("Error connecting to database");
    
})

// MVC-Architecture (Model-View-Controller)
// Model stores Schema
// View stores ejs files
// Controller stores functions
// schema = guideline
// two types of db
// relational db and non-relational db
// non-relational db e.g (MongoDB Firebase)
// CDCD (Clusters, Database, Collections, Documents)
// Clusers = Group of Db's
// Collections = Group of 
// Mongoose = ODM


const UserRouter = require("./routers/user.routes")
app.use("/api/v1", UserRouter)


let compose = {
    name: 'Halimah',
    course: 'Software Engineering',
    gender: "Female",
    complexion: "Dark"
}

let user = "Fasakin Halimah"
let gender = "female"

let products = [
     {
        id: 1,
        name: "Laptop",
        price: 250000,
        category: "Electronics",
        inStock: true
    },
    {
        id: 2,
        name: "Smartphone",
        price: 150000,
        category: "Electronics",
        inStock: true
    },
    {
        id: 3,
        name: "Headphones",
        price: 20000,
        category: "Accessories",
        inStock: false
    },
    {
        id: 4,
        name: "Sneakers",
        price: 35000,
        category: "Fashion",
        inStock: true
    },
    {
        id: 5,
        name: "Backpack",
        price: 18000,
        category: "Fashion",
        inStock: true
    },
    {
        id: 6,
        name: "Smartwatch",
        price: 45000,
        category: "Electronics",
        inStock: true
    },
    {
        id: 7,
        name: "Desk Chair",
        price: 55000,
        category: "Furniture",
        inStock: true
    },
    {
        id: 8,
        name: "Water Bottle",
        price: 5000,
        category: "Home",
        inStock: true
    }
];


// app.get(Path, callback)
app.get("/", (req, res) => {
    res.send(compose)




    console.log(__dirname + "/index.html");
    res.sendFile(__dirname + "/index.html")
})

app.get("/user", (req, res) => {
    res.redirect("/")
})




app.post("/delete/:id", (req, res)=>{
    const {id} = req.params
    
    console.log(id);

    products.splice(id, 1);

    res.render("index", {user, gender, products})
})   

// app.listen(port, callback)

app.get("/edit/:id", (req, res)=>{
    const {id} = req.params

    res.render("editProduct")
})

app.post("/edit/:id", (req,res)=>{
    const {id} = req.params

    products.splice(id, 1, req.body)
    res.render("index", {user, gender, products})
})

app.get("/addProduct", (req, res)=>{
    res.render("addProduct")
})

app.post("/addProduct", (req, res)=>{
    console.log(req.body);

    products.push(req.body)
    
    res.render("index", {user, gender, products})
})

app.post("/", (req, res)=>{
    console.log(id);
    products.push(req.body);
    res.render("index", {user, gender, products})
  
})

app.get("/index", (req, res) => {
    res.render('index', { user, gender, products})
})

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log("Server cannot start");

    } else {
        console.log(`Server started on port ${process.env.PORT}`);

    }
})






import express from "express"
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

mongoose
	.connect("mongodb://127.0.0.1:27017", {
		dbName: "Project1_UserLogin",
	})
	.then(() => console.log("Database connected"))
	.catch((e) => console.log(e))

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
})
const User = mongoose.model("User", userSchema)

const app = express()

//Middlewares
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//Setting up View Engine
app.set("view engine", "ejs")

const isAuthenticate = async (req, res, next) => {
	const { token } = req.cookies
	console.log(token)
	if (token) {
		const decoded = jwt.verify(token, "kuchibhidesaktehai")
		req.user = await User.findById(decoded._id)
		next()
	} else {
		res.redirect("/login")
	}
}

//Routing
app.get("/", isAuthenticate, (req, res) => {
	res.render("logout", { name: req.user.name })
})
app.get("/register", (req, res) => {
	res.render("register")
})
app.post("/register", async (req, res) => {
	const { name, email, password } = req.body

	let user = await User.findOne({ email })
	if (user) {
		return res.redirect("/login")
	}
	const hashedPassword = await bcrypt.hash(password, 10)

	user = await User.create({
		name: name,
		email: email,
		password: hashedPassword,
	})
	const token = jwt.sign({ _id: user._id }, "kuchibhidesaktehai")

	res.cookie("token", token, {
		httpOnly: true,
		maxAge: 60 * 1000, // For 1 minute
	})
	res.redirect("/")
})

app.get("/login", (req, res) => {
	res.render("login")
})
app.post("/login", async (req, res) => {
	const { email, password } = req.body
	let user = await User.findOne({ email })
	if (!user) return res.redirect("/register")
	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch)
		return res.render("login", {
			email: email,
			message: "Invalid Username or Password",
		})
	const token = jwt.sign({ _id: user._id }, "kuchibhidesaktehai")
	res.cookie("token", token, {
		httpOnly: true,
		maxAge: 10 * 1000, // For 1 minute
	})
	res.redirect("/")
})
app.get("/logout", (req, res) => {
	res.cookie("token", null, {
		httpOnly: true,
		maxAge: 0,
	})
	res.redirect("/")
})
app.get("/add", async (req, res) => {
	await Message.create({ name: "Kashyap1", email: "bavadiya2@gmail.com" })
})

//Start the Server
app.listen(5000, () => {
	console.log("Server is running")
})

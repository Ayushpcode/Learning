require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = 3000;
app.use(express.json());

const mongoST = process.env.MONGOSTRING;
mongoose.connect(mongoST);

const DB = mongoose.connection;
DB.on("error", (error) => console.log(error));
DB.once("connected", () => console.log("Connected to MongoDB"));

const User = require("./model");
const { generateToken } = require("./jwt");

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  try {
    await user.save();
    generateToken(user._id, res);
  } catch (error) {
    res.status(400).json({ message: "Error creating user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

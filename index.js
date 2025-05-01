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

const User = require("./models db/model");
const { generateToken } = require("./jwt");

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating user", error: error.message });
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
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
});

const Marks = require("./models db/marks");
app.post("/add-marks", async (req, res) => {
  const marks = req.body;

  if (!Array.isArray(marks) || marks.length === 0) {
    return res.status(400).json({ message: "Marks array is required" });
  }

  for (const mark of marks) {
    if (
      !mark.studentId ||
      !mark.subject ||
      mark.marksObtained == null ||
      mark.totalMarks == null
    ) {
      return res.status(400).json({ message: "All fields are required in each mark entry" });
    }
  }

  try {
    await Marks.insertMany(marks);
    res.status(201).json({ message: "Marks added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding marks", error: error.message });
  }
});

app.get("/get-marks/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const marks = await Marks.find({ studentId })
      .populate("studentId", "name email");

    if (marks.length === 0) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    res.status(200).json({
      message: "Marks retrieved successfully",
      student: marks[0].studentId,
      marks: marks.map(mark => ({
        subject: mark.subject,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        date: mark.date
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving marks",
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

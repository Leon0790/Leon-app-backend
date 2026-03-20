require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("./models/User");
const Student = require("./models/Student");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("MongoDB connection error:", err));

// Middleware to verify JWT
const auth = (req,res,next)=>{
  const token = req.headers["authorization"];
  if(!token) return res.status(401).json({message:"No token provided"});
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch(err){
    return res.status(401).json({message:"Invalid token"});
  }
};

// -------- Auth Routes --------

// Signup
app.post("/signup", async (req,res)=>{
  const {email,password} = req.body;
  try{
    let user = await User.findOne({email});
    if(user) return res.status(400).json({message:"Email already exists"});
    user = new User({email,password});
    await user.save();
    const token = jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET, {expiresIn:"7d"});
    res.json({token});
  }catch(err){res.status(500).json({message:err.message});}
});

// Login
app.post("/login", async(req,res)=>{
  const {email,password} = req.body;
  try{
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:"User not found"});
    const match = await user.comparePassword(password);
    if(!match) return res.status(400).json({message:"Invalid password"});
    const token = jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET, {expiresIn:"7d"});
    res.json({token});
  }catch(err){res.status(500).json({message:err.message});}
});

// -------- Students CRUD --------

// Add student
app.post("/students", auth, async(req,res)=>{
  const s = req.body;
  s.total = Object.values(s.subjects).reduce((a,b)=>a+b,0);
  s.mean = (s.total/9).toFixed(1);

  // CBC Band
  const m = s.mean;
  if(m>=75) s.band="EE";
  else if(m>=60) s.band="ME";
  else if(m>=50) s.band="AE";
  else s.band="BE";

  try{
    const student = new Student(s);
    await student.save();
    res.json(student);
  }catch(err){res.status(500).json({message:err.message});}
});

// Get students
app.get("/students", auth, async(req,res)=>{
  try{
    const students = await Student.find();
    res.json(students);
  }catch(err){res.status(500).json({message:err.message});}
});

// Update student
app.put("/students/:id", auth, async(req,res)=>{
  try{
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {new:true});
    res.json(student);
  }catch(err){res.status(500).json({message:err.message});}
});

// Delete student
app.delete("/students/:id", auth, async(req,res)=>{
  try{
    await Student.findByIdAndDelete(req.params.id);
    res.json({message:"Deleted"});
  }catch(err){res.status(500).json({message:err.message});}
});

// -------- M-Pesa Sandbox Simulation --------
app.post("/mpesa", auth, async(req,res)=>{
  const {amount,phone} = req.body;
  // Simulate a payment for sandbox testing
  console.log(`Received MPESA payment request for KES ${amount} from ${phone}`);
  res.json({message:"Payment request simulated (sandbox)"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));

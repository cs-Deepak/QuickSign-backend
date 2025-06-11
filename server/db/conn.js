const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB = process.env.DATABASE;

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ddeepakkumaryadav9162:ofZTz2iIjzciVjkS@cluster0.bhbmu.mongodb.net/todoapp?retryWrites=true&w=majority&appName=Cluster0',{
            ssl: true
        });  // no extra options needed
        console.log("MongoDB is connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
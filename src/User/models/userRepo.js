import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    } ,  
    solde: {
        type: Number,
        default: 0
    }, 
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    role: {
        type: String,
        enum: ["owner", "admin", "client"],
        default: "client"
    } , 
    inTransaction: {
        type: Boolean,
        default: false
    }, 
    freeze: {
        type: Boolean,
        default: false  
        },
    })

const User = mongoose.model("User", userSchema);

export default User; 
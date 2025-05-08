import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";

const userSchema = new mongoose.Schema({
    _id:{type : String, require:true},
    name:{type : String, require:true},
    email:{type : String, require:true, unique : true},
    imageUrl:{type : String, require:true},
    cartItems:{type : Object, default:{}}
}, {minimize: false} )

const User = mongoose.models.users || mongoose.model('user', userSchema);

export default User;
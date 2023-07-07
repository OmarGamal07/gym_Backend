const mongoose = require('mongoose');
module.exports = mongoose.model("User", new mongoose.Schema({
    username:String,
    home_location: String,
    phone: String,
    email: {
        type: String,
        required:[true,"Please Enter Your Email Address "]
    },
    password: {
        type: String,
        min:6,
        required: [true, "Please Enter Your Password With Minmum length 6"]
    },
    gender: String,
    role: {
        type: String,
        default: "client",
        enum: ["admin", "club","client"]
    },
    code: Number,
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Club"
    },
    wallet:Number,
    token: String,
    photo: String,
}))
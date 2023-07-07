const mongoose = require('mongoose');

module.exports = mongoose.model("Subscriptions", new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Enter Subscription Name"]
    },
    price: {
        type: Number,
        required: [true, "Enter Subscription Name"]
    },
    type: {
        type: String,
        enum: ["سنوي", "شهري", "اسبوعي", "يومي"],
        required: [true,"Please Add a Subscription Date"]
    },
    numberType:{
        type: Number,
        default:0,
        required: [true, "Enter Subscription number for sepcicfic volumn type"]
    }
}, { timestamps: true }))
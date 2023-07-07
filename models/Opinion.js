const mongoose = require('mongoose');

module.exports = mongoose.model("Opinion", new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Blog Name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please Enter Description "]
    },
    images: Array,
    location: {
        type: String,
        trim: true
    },
},{timestamps:true}))
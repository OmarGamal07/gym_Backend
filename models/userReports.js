const mongoose = require("mongoose")

module.exports = mongoose.model("UserReports", new mongoose.Schema({
    name: {
        type: String,
        required:[true,"Plaese Add Your Name"]
    },
    email: {
        type: String,
        required:[true,"Add Email Address "]
    },
    phone: {
        type: String,
        required:[true,"Add Phone Number"]
    },
    message: {
        type: String,
        required:[true," Add Message Text " ]
    }
},{timestamps:true}))
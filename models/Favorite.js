const mongoose = require('mongoose');

module.exports = mongoose.model("Fav", new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
},
    club_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Club"
    },
    club_name:String,
    price: {
        type: String,
        trim: true
    },
    club_logo: String,
}))
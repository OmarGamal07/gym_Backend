const mongoose = require('mongoose');

module.exports = mongoose.model("Club", new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Club Name"],
        trim: true
    },
    gender: {
        type: String,
        required: [true, "Please Enter Gender"],
        enum: ["male", "female", "both"]
    },
    // days: {
    //     type: String,
    //     required:[true,"please add Days"]
    // },
    from: {
        type: String,
        required: function () {
          return this.allDay==false;
        },
      },
      to: {
        type: String,
        required: function () {
          return this.allDay==false;
        },
      },
      allDay: {
        type: Boolean,
        default: false,
      },
    country: {
        type: String,
        required: [true, "Please Enter country Name"],
        trim: true
    },
    city: {
        type: String,
        required: [true, "Please Enter city Name"],
        trim: true
    },
    lat: {
        type: String,
        required:[true,"please add club lat"]
    },
    long: {
        type: String,
        required: [true,"please add club long"]
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
    logo: String,
    commission: {
        type: Number,
        required:[true,"Please Enter Commmission Of Club"]
    }
},{timestamps:true}))
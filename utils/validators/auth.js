const { check } = require("express-validator")
const validator = require("../../middlewares/validator")

exports.LoginValidator = [
    check("email").isEmail().withMessage("Please Enter Valid Email"),
    check("password").notEmpty().isLength({ min: 6 }).withMessage("Please Enter Valid Password With Minmum Characters 6"),
    validator
]

exports.RegisterValidator = [
    check("username").notEmpty().withMessage("Please Enter Valid Username"),
    check("phone").notEmpty().withMessage("Please Enter Valid Phone"),
    check("home_location").notEmpty().withMessage("Please Enter A Valid Location"),
    check("email").isEmail().withMessage("Please Enter Valid Email"),
    check("gender").notEmpty().isIn(["male","female"]).withMessage("Please Enter Valid Gender"),
    check("password").notEmpty().isLength({ min: 6 }).withMessage("Please Enter Valid Password With Minmum Characters 6"),
    validator
]
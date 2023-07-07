const { check } = require("express-validator")

const validator = require("../../middlewares/validator")

exports.addSubscreptionvalidatior = [
    check("name").notEmpty().withMessage("Please Add Valid Name "),
    check("price").notEmpty().withMessage("Please Add Valid Price "),
    // check("type").notEmpty().isIn(["سنوي", "شهري", "اسبوعي", "يومي"]).withMessage("Please Add Valid Type Of Subscription "),
    validator
]
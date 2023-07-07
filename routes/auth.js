const router = require("express").Router()

const { Login, Register } = require("../controllers/auth")

const { LoginValidator, RegisterValidator } = require("../utils/validators/auth")


router.post("/login", LoginValidator , Login)
router.post("/register", RegisterValidator, Register)


module.exports = router
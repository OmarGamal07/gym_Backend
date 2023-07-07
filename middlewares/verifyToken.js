const { verify } = require("jsonwebtoken")
const ApiError = require("../utils/ApiError")
module.exports = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]
    if (!token) return next(new ApiError("Invalid authorization", 401))
    verify(token, process.env.TOKEN, (err, decoded) => {
        if (err) throw new ApiError(err.message, 401)
        req.user = decoded
        next()
    })
}

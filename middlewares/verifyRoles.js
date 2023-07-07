const { verify } = require("jsonwebtoken")
const ApiError = require("../utils/ApiError")
module.exports = (...allowedRoles) => {
    return (req,res,next) => {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1]
        if (!token) return next(new ApiError("Invalid authorization", 401))
        verify(token, process.env.TOKEN, (err, decoded) => {
            if (err) throw new ApiError(err.message, 401)
            if (!allowedRoles.includes(decoded.role)) return next(new ApiError("This User Didn't Have Access To This Api", 401))
            req.user = decoded
            next()
        })
    }
}
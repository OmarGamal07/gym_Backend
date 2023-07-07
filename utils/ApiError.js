module.exports = class ApiError extends Error { 
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith("4") ? 'error' : 'fail'
        this.isOpreational = true
    }
}
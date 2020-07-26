const e = require("express")
const { compareSync } = require("bcrypt")

const error = (err, req, res, next) => {
    let statusCode = 500
    let message = `Internal Error Server`

    if(err.name === `SequelizeUniqueConstraintError`) {
        statusCode = 400
        message = `Email already registered, please use another email.`
    } else if (err.name === `SequelizeValidationError`) {
        message = err.errors.map(e => e.message)
        statusCode = 400
    } else if (err.name === `otherError`) {
        statusCode = err.statusCode
        message = err.message
    } else if (err.name === `JsonWebTokenError`) {
        statusCode = 401
        message = `Please login to access this page.`
    }

    return res.status(statusCode).json({message})
}

module.exports = error
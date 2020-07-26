const {User} = require(`../models`)
const {decode} = require(`../helpers/jwt`)

const authentication = (req, res, next) => {
    let access_token = req.body.access_token
    let userData = decode(access_token)
    req.user = userData
    User.findByPk(userData.id)
    .then(result => {
        if (!result) {
            throw {
                name: 'otherError',
                statusCode: 400,
                message: 'User not listed'
            }
        }
    })
    .catch(err => {
        next(err)
    })
}

const authorization = (req, res, next) => {
    let error = {
        name: `otherError`,
        statusCode: 403,
        message: `You don't have access to this.`
    }
    let userRole = req.user.role
    if (userRole === `admin`) {
        next()
    } else {
        throw error
    }
}

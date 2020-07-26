const {User} = require(`../models`)
const {comparePass} = require(`../helpers/bcrypt`)
const {encode} = require(`../helpers/jwt`)

class UserController {

    static register(req, res, next) {
        const newUser = User.generateForm(req.body)
        
        User.create(newUser)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            next(err)
        })
    }

    static login(req, res, next) {
        const {email, password} = req.body
        const error = {
            name: `otherError`,
            statusCode: 400,
            message: `Invalid Email or Password, please check again!`
        }

        User.findOne({where: {email}})
        .then(result => {
            if (result && comparePass(password, result.password)) {
                let {id, name, email, role} = result
                let access_token = encode({id, name, email, role})
                res.status(201).json({access_token})
            } else {
                throw error
            }
        })
        .catch(err => {
            next(err)
        })
    }
}   

module.exports = UserController
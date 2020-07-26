const bcrypt = require('bcrypt')
const saltRounds = 10

const hashPass = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds)
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

const comparePass = (dataPassword, hash) => {
    return bcrypt.compareSync(dataPassword, hash)
}

module.exports = {hashPass, comparePass}
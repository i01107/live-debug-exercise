const router = require(`express`).Router()
const productRoutes = require(`./product`)
const {authentication} = require(`../middlewares/auth`)
const UserController = require(`../controllers/UserController`)


router.post(`/register`, UserController.register)
router.post(`/login`, UserController.login)
router.use(`/products`, productRoutes)

module.exports = router

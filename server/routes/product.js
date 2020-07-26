const router = require(`express`).Router()
const ProductController = require(`../controllers/ProductController`)

router.get(`/`, ProductController.read)
router.post(`/`, ProductController.new)
router.get(`/:id`, ProductController.find)
router.post(`/:id`, ProductController.edit)
router.delete(`/:id`, ProductController.delete)


module.exports = router
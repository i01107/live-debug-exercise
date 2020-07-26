const {Product} = require(`../models`)

class ProductController {

    static read(req, res, next) {
        Product.findAll({order: [['createdAt', 'ASC']]})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            next(err)
        })
    }

    static new(req, res, next) {
        let newProduct = Product.generateForm(req.headers)
        Product.create(newProduct)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            next(err)
        })
    }

    static find(req, res, next) {
        let ProductId = req.params.id
        let error = {
            name: `otherError`,
            statusCode: 404,
            message: `Can't find the data.`
        }

        Product.findByPk(ProductId)
        .then(result => {
            if(result) {
                res.status(200).json(result)
            } else {
                throw error
            }
        })
        .catch(err => {
            next(err)
        })
    }

    static edit(req, res, next) {
        let editedProduct = Product.generateForm(req.body)
        let ProductId = req.params.id

        Product.update(editedProduct, {where: {id: ProductId}, returning: true})
        .then(result => {
            res.status(200).json(result[1][0])
        })
        .catch(err => {
            next(err)
        })
    }

    static delete(req, res, next) {
        let ProductId = req.params.id
        let error = {
            name: `otherError`,
            statusCode: 404,
            message: `Can't find the data.`
        }
        let deletedData;
        Product.findByPk(ProductId)
        .then(result => {
            if(!result) {
                throw error
            } else {
                deletedData = result
                return Product.destroy({where: {id: ProductId}})
            }
        })
        .then(result => {
            res.status(200).json({message: `Successfully delete product '${deletedData.name}'!`})
        })
        .catch(err => {
            next(err)
        })
    }
}

module.exports = ProductController
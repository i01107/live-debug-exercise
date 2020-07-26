const request = require('supertest')
const app = require(`../app`)
const {sequelize} = require(`../models`)
const {User, Product} = require(`../models`)
const {encode} = require(`../helpers/jwt`)
const {queryInterface} = sequelize

let access_token = ``
let tokenLain = ``
let productId = ``

let newProduct = {
    name: `Item 1`,
    image_url: `https://cdn.iconscout.com/icon/free/png-256/free-item-label-tag-sticker-offer-sale-online-shopping-12957.png`,
    price: 100000,
    stock: 10,
    category: `Elektronik`
}

let editedProduct = {
    name: `Item 2`,
    image_url: `https://cdn.iconscout.com/icon/free/png-256/free-item-label-tag-sticker-offer-sale-online-shopping-12957.png`,
    price: 200000,
    stock: 30,
    category: `Elektronik`
}

beforeAll((done) => {
    
    let user = {
        name: `admin`,
        email: `admin@email.com`,
        password: `12345`,
        role: `admin`
    }

    let user2 = {
        name: `admin`,
        email: `admin2@email.com`,
        password: `12345`,
        role: `no-admin`
    }


    User.create(user) 
    .then(result => {
        let {id, name, email, role} = result
        access_token = encode({id, name, email, role})
        return User.create(user2)
    })
    .then(result => {
        let {id, name, email, role} = result
        tokenLain = encode({id, name, email, role})
        return Product.create(newProduct)
    }) 
    .then(result => {
        productId = result.id
        done()
    })
    .catch(err => {
        done(err)
    })
})

afterAll( async (done) => {
    try {
        await queryInterface.bulkDelete(`Products`, {})
        await queryInterface.bulkDelete(`Users`, {})
        done()
    } catch(err) {
        done(err)
    }
});

describe(`Product routes`, () => {
    
    describe(`GET /products`, () => {
        
        test("401:failed to pass auth, return json with error", (done) => {
            request(app)
            .get('/products')
            .set(`access_token`, ``)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(401)
                expect(body.message).toEqual(expect.stringContaining(`Please login to access this page.`))
                done()
            })
            .catch(err => done(err))
        })
        
        test("403:role is not admin, return json with error", (done) => {
            request(app)
            .get('/products')
            .set(`access_token`, tokenLain)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(403)
                expect(body.message).toEqual(expect.stringContaining(`You don't have access to this.`))
                done()
            })
            .catch(err => done(err))
        })


        test("200:OK, return json with all products data", (done) => {
            request(app)
            .get('/products')
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(200)
                expect(body).toEqual(expect.any(Array))
                done()
            })
            .catch(err => done(err))
        })
    })
    
    describe(`POST /products`, () => {
        
        let productAdd = {
            name: `Laptop Asus ROG+`,
            image_url: `http://image2.com`,
            price: 100000,
            stock: 100,
            category: `Elektronik`
        }

        test("401:failed to pass auth, return json with error", (done) => {
            request(app)
            .post('/products')
            .send(productAdd)
            .set(`access_token`, ``)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(401)
                expect(body.message).toEqual(expect.stringContaining(`Please login to access this page.`))
                done()
            })
            .catch(err => done(err))
        })
        
        test("403:role is not admin, return json with error", (done) => {
            request(app)
            .post('/products')
            .send(productAdd)
            .set(`access_token`, tokenLain)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(403)
                expect(body.message).toEqual(expect.stringContaining(`You don't have access to this.`))
                done()
            })
            .catch(err => done(err))
        })

        test("201:created, return json with product's data", (done) => {
            request(app)
            .post('/products')
            .send(productAdd)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(201)
                expect(body).toHaveProperty(`id`, expect.any(Number))
                expect(body).toHaveProperty(`name`, productAdd.name)
                expect(body).toHaveProperty(`image_url`, productAdd.image_url)
                expect(body).toHaveProperty(`price`, productAdd.price)
                expect(body).toHaveProperty(`stock`, productAdd.stock)
                expect(body).toHaveProperty(`category`, productAdd.category)
                expect(body).toHaveProperty(`createdAt`, expect.anything())
                expect(body).toHaveProperty(`updatedAt`, expect.anything())
                done()
            })
            .catch(err => done(err))
        })

        let nullResult = [
            `Name is required.`,
            `Image is required.`,
            `Category is required.`,
            `Price must be in number format!`,
            `Stock must be in number format!`
        ]

        let emptyResult = [
            `Name must be filled!`,
            `Image must be provided!`,
            `Image must be in URL format!`,
            `Category must be provided!`
        ]

        let zeroValue = [
            `Price must be more than zero!`,
            `Stock can't be less than zero!`
        ]

        let testProductEmpty = {
            name: ``,
            image_url: ``,
            price: ``,
            stock: ``,
            category: ``
        }

        let testProductZero = {
            name: ``,
            image_url: ``,
            price: 0,
            stock: -1,
            category: ``
        }


        test("400:validation errors (empty fields), return json with error", (done) => {
            request(app)
            .post('/products')
            .send(testProductEmpty)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(emptyResult))
                done()
            })
            .catch(err => done(err))
        })

        test("400:validation errors (no data), return json with error", (done) => {
            request(app)
            .post('/products')
            .send()
             .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(nullResult))
                done()
            })
            .catch(err => done(err))
        })

        test("400:validation errors (zero value), return json with error", (done) => {
            request(app)
            .post('/products')
            .send(testProductZero)
             .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(zeroValue))
                done()
            })
            .catch(err => done(err))
        })

    })
    
    describe(`GET /products/:id`, () => {
        
        test("401:failed to pass auth, return json with error", (done) => {
            request(app)
            .get(`/products/${productId}`)
            .set(`access_token`, ``)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(401)
                expect(body.message).toEqual(expect.stringContaining(`Please login to access this page.`))
                done()
            })
            .catch(err => done(err))
        })
        
        test("403:role is not admin, return json with error", (done) => {
            request(app)
            .get(`/products/${productId}`)
            .set(`access_token`, tokenLain)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(403)
                expect(body.message).toEqual(expect.stringContaining(`You don't have access to this.`))
                done()
            })
            .catch(err => done(err))
        })

        test("404:data not found, return json with error", (done) => {
            request(app)
            .get(`/products/0`)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(404)
                expect(body.message).toEqual(expect.stringContaining(`Can't find the data.`))
                done()
            })
            .catch(err => done(err))
        })

        test("200:OK, return json with product's data", (done) => {
            request(app)
            .get(`/products/${productId}`)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(200)
                expect(body).toHaveProperty(`id`, expect.any(Number))
                expect(body).toHaveProperty(`name`, newProduct.name)
                expect(body).toHaveProperty(`image_url`, newProduct.image_url)
                expect(body).toHaveProperty(`price`, newProduct.price)
                expect(body).toHaveProperty(`stock`, newProduct.stock)
                expect(body).toHaveProperty(`category`, newProduct.category)
                expect(body).toHaveProperty(`createdAt`, expect.anything())
                expect(body).toHaveProperty(`updatedAt`, expect.anything())
                done()
            })
            .catch(err => done(err))
        })
    })

    describe(`PUT /products/:id`, () => {
        test("401:failed to pass auth, return json with error", (done) => {
            request(app)
            .put(`/products/${productId}`)
            .send(editedProduct)
            .set(`access_token`, ``)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(401)
                expect(body.message).toEqual(expect.stringContaining(`Please login to access this page.`))
                done()
            })
            .catch(err => done(err))
        })
        
        test("403:role is not admin, return json with error", (done) => {
            request(app)
            .put(`/products/${productId}`)
            .send(editedProduct)
            .set(`access_token`, tokenLain)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(403)
                expect(body.message).toEqual(expect.stringContaining(`You don't have access to this.`))
                done()
            })
            .catch(err => done(err))
        })

        test("200:OK, return json with product's data", (done) => {
            request(app)
            .put(`/products/${productId}`)
            .send(editedProduct)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(200)
                expect(body).toHaveProperty(`id`, expect.any(Number))
                expect(body).toHaveProperty(`name`, editedProduct.name)
                expect(body).toHaveProperty(`image_url`, editedProduct.image_url)
                expect(body).toHaveProperty(`price`, editedProduct.price)
                expect(body).toHaveProperty(`stock`, editedProduct.stock)
                expect(body).toHaveProperty(`category`, editedProduct.category)
                expect(body).toHaveProperty(`createdAt`, expect.anything())
                expect(body).toHaveProperty(`updatedAt`, expect.anything())
                done()
            })
            .catch(err => done(err))
        })

        let emptyResult = [
            `Name must be filled!`,
            `Image must be provided!`,
            `Image must be in URL format!`,
            `Category must be provided!`
        ]

        let zeroValue = [
            `Price must be more than zero!`,
            `Stock can't be less than zero!`
        ]

        let testProductEmpty = {
            name: ``,
            image_url: ``,
            price: ``,
            stock: ``,
            category: ``
        }

        let testProductZero = {
            name: ``,
            image_url: ``,
            price: 0,
            stock: -1,
            category: ``
        }


        test("400:validation errors (empty fields), return json with error", (done) => {
            request(app)
            .put(`/products/${productId}`)
            .send(testProductEmpty)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(emptyResult))
                done()
            })
            .catch(err => done(err))
        })


        test("400:validation errors (zero value), return json with error", (done) => {
            request(app)
            .put(`/products/${productId}`)
            .send(testProductZero)
             .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(zeroValue))
                done()
            })
            .catch(err => done(err))
        })
    })

    describe(`DELETE /products/:id`, () => {

        test("401:failed to pass auth, return json with error", (done) => {
            request(app)
            .delete(`/products/${productId}`)
            .set(`access_token`, ``)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(401)
                expect(body.message).toEqual(expect.stringContaining(`Please login to access this page.`))
                done()
            })
            .catch(err => done(err))
        })
        
        test("403:role is not admin, return json with error", (done) => {
            request(app)
            .delete(`/products/${productId}`)
            .set(`access_token`, tokenLain) 
            .then(result => {
                const {status, body} = result
                expect(status).toBe(403)
                expect(body.message).toEqual(expect.stringContaining(`You don't have access to this.`))
                done()
            })
            .catch(err => done(err))
        })

        test("404:data not found, return json with error", (done) => {
            request(app)
            .delete(`/products/0`)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(404)
                expect(body.message).toEqual(expect.stringContaining(`Can't find the data.`))
                done()
            })
            .catch(err => done(err))
        })

        test("200:OK, return json with product's data", (done) => {
            request(app)
            .delete(`/products/${productId}`)
            .set(`access_token`, access_token)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(200)
                expect(body.message).toEqual(expect.stringContaining(`Successfully delete product '${editedProduct.name}'!`))
                done()
            })
            .catch(err => done(err))
        })
    })

})
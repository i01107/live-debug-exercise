const request = require('supertest')
const app = require(`../app`)
const {sequelize} = require(`../models`)
const {queryInterface} = sequelize

afterAll( async (done) => {
    try {
        await queryInterface.bulkDelete(`Users`, {})
        done()
    } catch(err) {
        done(err)
    }
});

describe(`User routes`, () => {

    let userRegister = {
        name: `admin`,
        email: `admin@email.com`,
        password: `12345`,
        role: `admin`
    }

    let userLogin = {
        email: `admin@email.com`,
        password: `12345`
    }

    describe("POST /register", () => {
    
        test("201:created, return json with registered user's data", (done) => {
            request(app)
            .post('/register')
            .send(userRegister)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(201)
                expect(body).toHaveProperty(`id`, expect.any(Number))
                expect(body).toHaveProperty(`name`, userRegister.name)
                expect(body).toHaveProperty(`email`, userRegister.email)
                expect(body).toHaveProperty(`password`, expect.stringMatching(/[$]/g))
                expect(body).toHaveProperty(`role`, userRegister.role)
                expect(body).toHaveProperty(`createdAt`, expect.anything())
                expect(body).toHaveProperty(`updatedAt`, expect.anything())
                done()
            })
            .catch(err => done(err))
        })

        test("400:unique email error validation, return json with error", (done) => {
            request(app)
            .post('/register')
            .send(userRegister)
            .then(result => {
                // console.log(result)
                const {status, body} = result
                expect(status).toBe(400)
                expect(body).toHaveProperty(`message`, `Email already registered, please use another email.`)
                done()
            })
            .catch(err => done(err))
        })

        let userEmpty = {
            name: ``,
            email: ``,
            password: ``,
            role: ``,
        }

        let userInvalidEmail = {
            name: ``,
            email: `maya`,
            password: ``,
            role: ``,
        }

        const notNull = [
            `Name is required!`,
            `Email is required!`,
            `Password is required!`,
            `Role is required!`
        ]

        const notEmpty = [
            `Name must be filled!`,
            `Email must be filled!`,
            `Password must be filled!`,
            `Role must be filled!`
        ]

        const emailFormat = [
            `Email must be in format yourname@example.com`
        ]

        test("400:validation errors (empty fields), return json with error", (done) => {
            request(app)
            .post('/register')
            .send(userEmpty)
            .then(result => {
                // console.log(result)
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(notEmpty))
                done()
            })
            .catch(err => done(err))
        })

        test("400:validation errors (no data), return json with error", (done) => {
            request(app)
            .post('/register')
            .send()
            .then(result => {
                // console.log(result)
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(notNull))
                done()
            })
            .catch(err => done(err))
        })
        
        test("400:validation errors (invalid email format), return json with error", (done) => {
            request(app)
            .post('/register')
            .send(userInvalidEmail)
            .then(result => {
                // console.log(result)
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.arrayContaining(emailFormat))
                done()
            })
            .catch(err => done(err))
        })
    })

    describe(`POST /login`, () => {

        let loginEmpty = {
            email: ``,
            password: ``
        }

        test("200:OK, return json with login user's data", (done) => {
            request(app)
            .post('/login')
            .send(userLogin)
            .then(result => {
                const {status, body} = result
                expect(status).toBe(200)
                expect(body).toHaveProperty(`access_token`, expect.stringMatching(/[aiueo]/g))
                done()
            })
            .catch(err => done(err))
        })

        test("400:other error (invalid email or password), return json with error", (done) => {
            request(app)
            .post('/login')
            .send(loginEmpty)
            .then(result => {
                // console.log(result)
                const {status, body} = result
                expect(status).toBe(400)
                expect(body.message).toEqual(expect.stringContaining(`Invalid Email or Password, please check again!`))
                done()
            })
            .catch(err => done(err))
        })

    })
})
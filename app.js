const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const jwt = require('jsonwebtoken')
const helmet = require('helmet')
require('dotenv').config()

// Models
const Product = require('./models/Product')
const User = require('./models/User')

// Routers
const usersRouter = require('./routes/users')
const productsRouter = require('./routes/products')
const apiProductsRouter = require('./routes/api/products')
const authRouter = require('./routes/auth')
const apiProductsLoadMore = require('./routes/api/products-api')
const profileRouter = require('./routes/profile')


// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Middleware เพิ่มเติมสำหรับ CRUD Operations
app.use(helmet())
app.use(cookieParser()) 
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.user = req.user || null
    next()
})


// Middleware สำหรับบันทึกข้อมูล (Logger)
const loggerMiddleware = (req, res, next) => {
    console.log(`Request received at: ${new Date().toISOString()}`)
    console.log(`Method: ${req.method}, URL: ${req.url}`)
    next()
}

app.use(loggerMiddleware)

// Use Routers
app.use('/users', usersRouter)
app.use('/products', productsRouter)
app.use('/api/products', apiProductsRouter)
app.use('/auth', authRouter)
app.use('/api/products-loadmore', apiProductsLoadMore)
app.use('/', profileRouter)


app.get('/', async (req, res) => {
    try {

        const token = req.cookies.token
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                const currentUser = await User.findById(decoded._id)
                if (currentUser) {
                    res.locals.user = currentUser
                }
            } catch(jwtError) {
                res.clearCookie('token')
            }
        }

        const latestProducts = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('owner', 'username')

        res.render('index', {
            title: 'Welcome to ProductApp',
            products: latestProducts
        })

    } catch(error) {
        console.error(error)
        res.status(500).send('Server Error')
    }
})

app.get('/search', async (req, res) => {
    try {

        const searchQuery = req.query.q
        let searchResults = []

        if (searchQuery) {
            searchResults = await Product.find({
                name: { $regex: searchQuery, $options: 'i' }
            }).populate('owner', 'username')
        }

        res.render('search-results', {
            products: searchResults,
            searchQuery: searchQuery
        })

    } catch(error) {
        console.error('Search error:', error)
        res.status(500).send('Server error')
    }
})

app.use((req, res, next) => {
    res.status(404).render('404')
})

app.listen(port, () => {
    console.log('Server is running...')
})
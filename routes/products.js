const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const checkOwnership= require('../middleware/checkOwnership')
const fs = require('fs')
const path = require('path')


router.use(auth)

// --------------------
// CREATE (C)
// --------------------
// Route 1: แสดงฟอร์มสำหรับสร้างสินค้าใหม่ (GET)
router.get('/new', (req, res) => {
    res.render('products/new-product')
})

// Route 2: รับข้อมูลจากฟอร์มแล้วสร้างสินค้าใหม่ (POST)
router.post('/', upload.single('productImage'), async (req, res) => {
    try {
        const newProduct = new Product({
            // name: req.body.name,
            // price: req.body.price
            ...req.body,
            owner: req.user._id
        })

        if (req.file) {
            newProduct.imageUrl = `uploads/${req.file.filename}`
        }

        await newProduct.save()
        req.flash('success_msg', 'New product created successfully!')
        res.redirect('/products')
    } catch (error) {
        console.error(error)
        res.status(500).send('Cannot create a new product.')
    }
})

// --------------------
// READ (R)
// --------------------
// Route 3: แสดงสินค้าทั้งหมด (GET)
router.get('/', async (req, res) => {
    try {
        const productsPerPage = 5
        const currentPage = parseInt(req.query.page) || 1

        const [products, totalProducts] = await Promise.all([
            Product.find({ owner: req.user._id })
                .sort({ createdAt: -1 })
                .skip((productsPerPage * currentPage) - productsPerPage)
                .limit(productsPerPage),
            Product.countDocuments({ owner: req.user._id })
        ])

        const totalPages = Math.ceil(totalProducts / productsPerPage)

        res.render('products/index', {
            products: products,
            totalPages: totalPages,
            currentPage: currentPage,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPage: currentPage + 1,
            prevPage: currentPage - 1
        })
    } catch(error) {
        console.error('Error fetching user products:', error)
        res.status(500).send('Something went wrong.')
    }
})

// Route 4: แสดงสินค้าชิ้นเดียว (GET)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('owner', 'username contactLink')
        console.log(product)

        if (!product) {
            return res.redirect('/products')
        }

        res.render('products/show-detail', { product: product })
    } catch(error) {
        res.status(500).send('Something went wrong.')
    }
})

// --------------------
// UPDATE (U)
// --------------------
// Route 5: แสดงฟอร์มสำหรับแก้ไขข้อมูลสินค้า (GET)
router.get('/:id/edit', checkOwnership, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.render('products/edit-product', { product: product })
    } catch(error) {
        res.status(500).send('Something went wrong.')
    }
})

// Route 6: รับข้อมูลจากฟอร์มแล้วอัปเดต (PUT)
router.put('/:id', checkOwnership, upload.single('productImage'), async (req, res) => {
    try {
        const updateData = { ...req.body }

        if (req.file) {
            updateData.imageUrl = `uploads/${req.file.filename}`
        }

        await Product.findByIdAndUpdate(req.params.id, updateData)
        res.redirect(`/products/${req.params.id}`)
    } catch(error) {
        res.status(500).send('Something went wrong.')
    }
})

// --------------------
// DELETE (D)
// --------------------
// Route 7: ลบข้อมูลสินค้า (DELETE)
router.delete('/:id', checkOwnership, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            req.flash('error_msg', 'Product not found.')
            return res.redirect('/products')
        }

        if (product.imageUrl) {
            const imagePath = path.join(__dirname, '..', product.imageUrl)

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image: ${imagePath}`, err)
                } else {
                    console.log(`Successfully deleted image: ${imagePath}`)
                }
            })
        }

        await Product.findByIdAndDelete(req.params.id)

        req.flash('success_msg', 'Product deleted successfully!')
        res.redirect('/products')
    } catch(error) {
        res.status(500).send('Something went wrong.')
    }
})


module.exports = router
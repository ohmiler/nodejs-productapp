const express = require('express')
const router = express.Router()
const Product = require('../../models/Product')
const upload = require('../../middleware/upload')

// --- GET /api/products/ ---
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json(products)
    } catch(error) {
        res.status(500).json({ message: "Server error occured", error: error.message })
    }
})

// --- GET /api/products/:id ---
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(product)
    } catch(error) {
        res.status(500).json({ message: "Server error occured", error: error.message })
    }
})

// --- POST /api/products/ ---
router.post('/', upload.single('productImage'), async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price
        })

        if (req.file) {
            newProduct.imageUrl = `uploads/${req.file.filename}`
        }

        const savedProduct = await newProduct.save()
        res.status(201).json(savedProduct)
    } catch(error) {
        res.status(400).json({ message: "Invalid data submitted", error: error.message })
    }
})

// --- PUT /api/products/:id ---
router.put('/:id', upload.single('productImage'), async (req, res) => {
    try {

        const updateData = { ...req.body }

        if (req.file) {
            updateData.imageUrl = `uploads/${req.file.filename}`
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(updatedProduct)

    } catch(error) {
        res.status(400).json({ message: "Invalid data for update", error: error.message })
    }
})

// --- DELETE /api/products/:id ---
router.delete('/:id', async (req, res) => {
    try {
       const deletedProduct = await Product.findByIdAndDelete(req.params.id)

       if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" })
       }

       res.status(200).json({ message: "Prodcut deleted successfully" })
    } catch(error) {
        res.status(500).json({ message: "Server error occured", error: error.message })
    }
})

module.exports = router
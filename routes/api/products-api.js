const express = require('express')
const router = express.Router()
const Product = require('../../models/Product')

router.get('/', async (req, res) => {
    try {
        const productsPerpage = 8
        const currentPage = parseInt(req.query.page) || 1

        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .skip((productsPerpage * currentPage) - productsPerpage)
            .limit(productsPerpage)
            .populate('owner', 'username')

        const totalProducts = await Product.countDocuments()
        const hasNextPage = (productsPerpage * currentPage) < totalProducts

        res.status(200).json({
            products: products,
            hasNextPage: hasNextPage
        })

    } catch(error) {
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router
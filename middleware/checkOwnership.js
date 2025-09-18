const Product = require('../models/Product')

const checkOwnership = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).send('Product not found')
        }

        if (!product.owner.equals(req.user._id)) {
            console.log('Authorization failed: User is not the owner')
            return res.redirect('/products')
        }

        next()

    } catch(error) {
        console.error(error)
        return res.status(500).send('Server Error.')
    }
}

module.exports = checkOwnership
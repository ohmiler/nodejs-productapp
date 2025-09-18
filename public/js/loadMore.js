document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('load-more-btn')
    const productGrid = document.getElementById('product-grid')
    const loadingSpinner = document.getElementById('loading-spinner')

    let currentPage = 1

    loadMoreBtn.addEventListener('click', async () => {
        currentPage++

        loadingSpinner.style.display = 'block'
        loadMoreBtn.style.display = 'none'

        try {

            const response = await fetch(`/api/products-loadmore?page=${currentPage}`)
            const data = await response.json()

            if (data.products.length > 0) {
                data.products.forEach(product => {
                    const productCardHTML = createProductCard(product)
                    productGrid.insertAdjacentHTML('beforeend', productCardHTML)
                })
            }

            if (!data.hasNextPage) {
                loadMoreBtn.style.display = 'none'
                loadingSpinner.style.display = 'none'
            } else {
                loadMoreBtn.style.display = 'block'
                loadingSpinner.style.display = 'none'
            }
             
        } catch(error) {
            console.error('Failed to load more products', error)
            loadingSpinner.style.display = 'none'
            loadMoreBtn.innerText = 'Failed to load. Try again?'
            loadMoreBtn.style.display = 'block'
        }
    })

    function createProductCard(product) {
        const imageUrl = product.imageUrl ? `/${product.imageUrl}` : 'https://placehold.co/400x300'
        const ownerHTML = product.owner ? `<p class='card-text'><small class='text-muted'>By ${product.owner.username}</small></p>` : ''

        return `
            <div class='col'>
                <div class='card h-100 shadow-sm'>
                    <a href='/products/${product._id}'>
                        <img src='${imageUrl}' class='card-img-top' alt='${product.name}' style='height: 200px object-fit: cover;' >
                    </a>
                    <div class='card-body'>
                        <h5 class='card-title'>${product.name}</h5>
                        <p class='card-text'>฿${product.price} บาท</p>
                        ${ownerHTML}
                    </div>
                    <div class='card-footer bg-transparent border-top-0'>
                        <a href='/products/${product._id}' class='btn btn-primary w-100'>View Details</a>
                    </div>
                </div>
            </div>
        `
    }
})
const productList = document.querySelector('#product-list');
const manufacturerFilter = document.querySelector('#manufacturer');
const addForm = document.querySelector('#modal-form');
const modalElement = document.querySelector('#addProductModal');
const productTemplate = document.querySelector('#product-template');

const renderItem = function (product) {
    const item = productTemplate.content.cloneNode(true);
    const image = item.querySelector('[data-image]');
    image.src = product.img;
    image.alt = product.title;
    item.querySelector('[data-title]').textContent = product.title;
    item.querySelector('[data-price]').textContent = Number(product.price).toLocaleString() + ' so‘m';
    item.querySelector('[data-model]').textContent = product.model;
    item.querySelector('[data-date]').textContent = new Date(product.addedDate).toLocaleDateString();
    const benefits = item.querySelector('[data-benefits]');

    for (let i = 0; i < product.benefits.length; i++) {
        const benefit = document.createElement('li');
        benefit.textContent = product.benefits[i];
        benefit.className = 'badge bg-primary me-1 mb-1';
        benefits.append(benefit);
    }

    const editButton = item.querySelector('[data-edit]');
    editButton.addEventListener('click', function () {
        addForm.dataset.id = product.id;
        addForm.elements['product-title'].value = product.title;
        addForm.elements.price.value = product.price;
        addForm.elements['product-manufacturer'].value = product.model;
        addForm.elements.benefits.value = product.benefits.join(', ');
        document.querySelector('#addProductModalLabel').textContent = 'Edit product';
        addForm.querySelector('[type="submit"]').textContent = 'Save changes';
        bootstrap.Modal.getOrCreateInstance(modalElement).show();
    });

    const deleteButton = item.querySelector('[data-delete]');
    deleteButton.addEventListener('click', function () {
        const index = products.findIndex(function (item) {
            return item.id === product.id;
        });
        products.splice(index, 1);
        renderFilteredProducts();
    });

    return item;
}

const renderProducts = function (productsToShow) {
    productList.innerHTML = '';
    for (let i = 0; i < productsToShow.length; i++) {
        productList.append(renderItem(productsToShow[i]));
    }
    document.querySelector('#product-count').textContent = productsToShow.length;
}

const renderFilteredProducts = function () {
    const search = document.querySelector('#search').value.toLowerCase();
    const minPrice = Number(document.querySelector('#from').value) || 0;
    const maxPrice = Number(document.querySelector('#to').value) || Infinity;
    const selectedManufacturer = manufacturerFilter.value;
    const sort = document.querySelector('#sortby').value;

    const filteredProducts = products.filter(function (product) {
        const text = (product.title + ' ' + product.model + ' ' + product.benefits.join(' ')).toLowerCase();
        return text.includes(search) && product.price >= minPrice && product.price <= maxPrice &&
            (selectedManufacturer === '0' || product.model === selectedManufacturer);
    });

    filteredProducts.sort(function (first, second) {
        if (sort === '2') return first.price - second.price;
        if (sort === '3') return second.price - first.price;
        return first.title.localeCompare(second.title);
    });

    renderProducts(filteredProducts);
}

for (let i = 0; i < manufacturers.length; i++) {
    const option = document.createElement('option');
    option.textContent = manufacturers[i].name;
    option.value = manufacturers[i].name;
    manufacturerFilter.append(option);
    addForm.elements['product-manufacturer'].append(option.cloneNode(true));
}

document.querySelector('#filter-form').addEventListener('submit', function (event) {
    event.preventDefault();
    renderFilteredProducts();
});

document.querySelector('#add-product-button').addEventListener('click', function () {
    addForm.reset();
    addForm.dataset.id = '';
    document.querySelector('#addProductModalLabel').textContent = 'Add product';
    addForm.querySelector('[type="submit"]').textContent = 'Add product';
});

addForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target.elements;
    const productId = addForm.dataset.id;
    const product = {
        id: productId ? Number(productId) : Date.now(),
        title: form['product-title'].value,
        img: productId ? products.find(function (item) { return item.id === Number(productId); }).img : 'https://picsum.photos/300/200',
        price: Number(form.price.value),
        model: form['product-manufacturer'].value,
        addedDate: productId ? products.find(function (item) { return item.id === Number(productId); }).addedDate : new Date().toISOString(),
        benefits: form.benefits.value.split(',').map(function (benefit) { return benefit.trim(); }).filter(Boolean)
    };

    if (productId) {
        const index = products.findIndex(function (item) { return item.id === Number(productId); });
        products[index] = product;
    } else {
        products.push(product);
    }

    renderFilteredProducts();
    addForm.reset();
    addForm.dataset.id = '';
    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
});

renderFilteredProducts();

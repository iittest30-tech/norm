const productList = document.querySelector('#product-list');
const manufacturerFilter = document.querySelector('#manufacturer');
const addForm = document.querySelector('#modal-form');
const modalElement = document.querySelector('#addProductModal');

const createElement = function (tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
}

const renderItem = function (product) {
    const item = createElement('li', '', 'col-12 col-xl-6');
    const card = createElement('div', '', 'card position-relative');
    const image = createElement('img', '', 'card-img-top');
    image.src = product.img;
    image.alt = product.title;

    const body = createElement('div', '', 'card-body');
    const title = createElement('h3', product.title, 'card-title');
    const price = createElement('p', Number(product.price).toLocaleString() + ' so‘m', 'card-text fw-bold');
    const model = createElement('p', product.model, 'badge bg-success');
    const date = createElement('p', new Date(product.addedDate).toLocaleDateString(), 'card-text');
    const benefits = createElement('ul', '', 'd-flex flex-wrap list-unstyled');

    for (let i = 0; i < product.benefits.length; i++) {
        benefits.append(createElement('li', product.benefits[i], 'badge bg-primary me-1 mb-1'));
    }

    const buttons = createElement('div', '', 'position-absolute top-0 end-0 d-flex');
    const editButton = createElement('button', '', 'btn btn-secondary');
    editButton.type = 'button';
    editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
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

    const deleteButton = createElement('button', '', 'btn btn-danger');
    deleteButton.type = 'button';
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.addEventListener('click', function () {
        const index = products.findIndex(function (item) {
            return item.id === product.id;
        });
        products.splice(index, 1);
        renderFilteredProducts();
    });

    buttons.append(editButton, deleteButton);
    body.append(title, price, model, date, benefits, buttons);
    card.append(image, body);
    item.append(card);
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
    const option = createElement('option', manufacturers[i].name, '');
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

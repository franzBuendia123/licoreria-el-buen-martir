document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================
    // 1. LÓGICA DEL CARRUSEL (SLIDER)
    // ====================================================================

    const slides = document.querySelectorAll('.banner-slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Inicia la rotación automática cada 5 segundos
    setInterval(nextSlide, 5000); 


    // ====================================================================
    // 2. LÓGICA DE CARGA DE PRODUCTOS (SIMULADA)
    // ====================================================================
    
    const productGrid = document.getElementById('productGrid');

    // Datos simulados (CRÍTICO: Usamos el ID de ejemplo que el JS buscará)
    const mockProducts = [
        // CRÍTICO: Tienes 4 tarjetas en la imagen, por eso simulo 4 productos.
        { _id: "P001", nombre: "ABUELO 7 AÑOS X 750 ML", precio_regular: 79.00, precio_oferta: 79.00, imagen: "abotella.png", descuento: null },
        { _id: "P002", nombre: "ABADÍA RETUERTA SELECCIÓN ESPECIAL BLEND 2020 X 700 ML", precio_regular: 190.00, precio_oferta: 190.00, imagen: "avinoblend.png", descuento: 12 },
        { _id: "P003", nombre: "ABSOLUT X 1 LITRO", precio_regular: 74.00, precio_oferta: 61.90, imagen: "vodkaabsolut.png", descuento: 16 },
        { _id: "P004", nombre: "ABSOLUT X 700 ML", precio_regular: 51.00, precio_oferta: 46.90, imagen: "vodkaabsolut700.png", descuento: 8 },
    ];

    function fetchAndRenderProducts(productos) {
        
        productGrid.innerHTML = ''; 

        productos.forEach(producto => {
            
            const saleTag = producto.descuento ? `<div class="sale-tag">-${producto.descuento}%</div>` : '';

            const cardHTML = `
                <div class="product-card">
                    ${saleTag}
                    <img src="img/${producto.imagen}" alt="${producto.nombre}" class="product-image">
                    
                    <p class="name">${producto.nombre}</p>
                    
                    <div class="price-container">
                        ${producto.precio_regular && producto.precio_regular !== producto.precio_oferta ? `<p class="price-old">S/ ${producto.precio_regular.toFixed(2)}</p>` : ''}
                        <p class="price-new">S/ ${producto.precio_oferta.toFixed(2)}</p>
                    </div>
                    
                    <button 
                        class="add-to-cart" 
                        data-product-id="${producto._id}" 
                    >
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `;
            productGrid.innerHTML += cardHTML;
        });

        // CRÍTICO: LLAMAR AQUÍ PARA ACTIVAR LOS BOTONES DESPUÉS DE RENDERIZAR
        attachCartListeners(); 
    }

    fetchAndRenderProducts(mockProducts);


    // ====================================================================
    // 3. LÓGICA DEL CARRITO DE COMPRAS (VERSIÓN SIDEBAR)
    // ====================================================================

    // Elementos de la UI
    const cartTotalElement = document.querySelector('.cart span'); 
    const cartIconElement = document.querySelector('.cart'); 
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const sidebarCartTotal = document.getElementById('sidebarCartTotal');

    // Inicializa el carrito
    let cart = JSON.parse(localStorage.getItem('elbuenmartir_cart')) || [];

    // --- FUNCIONES DE UI ---

    function openCartSidebar() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        renderCartItems(); 
    }

    function closeCartSidebar() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
            return;
        }

        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            const cartItemHTML = `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="item-details">
                        <p><strong>${item.name}</strong></p>
                        <p>Cantidad: ${item.quantity}</p>
                    </div>
                    <p class="item-price">S/ ${itemTotal}</p>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });
    }

    // --- LÓGICA DEL CARRITO ---

    function updateCartDisplay() {
        let total = 0;
        
        cart.forEach(item => {
            total += item.price * item.quantity;
        });

        const formattedTotal = total.toFixed(2);
        cartTotalElement.textContent = `${formattedTotal}`; // Cabecera
        sidebarCartTotal.textContent = `S/ ${formattedTotal}`; // Sidebar

        localStorage.setItem('elbuenmartir_cart', JSON.stringify(cart));
    }

    function addToCart(event) {
        const button = event.target;
        const productId = button.dataset.productId; 
        
        if (!productId) {
            console.error("Error: El botón Añadir al Carrito no tiene un 'data-product-id'.");
            return;
        }
        
        const productCard = button.closest('.product-card');
        const priceText = productCard.querySelector('.price-new').textContent;
        const price = parseFloat(priceText.replace('S/ ', '').trim());
        const productName = productCard.querySelector('.name').textContent;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName.trim(),
                price: price,
                quantity: 1,
            });
        }

        updateCartDisplay();
        openCartSidebar(); 
    }

    // -----------------------------------------------------------
    // Inicialización y Event Listeners del Sidebar
    // -----------------------------------------------------------

    function attachCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // Eventos del Sidebar
    cartIconElement.addEventListener('click', openCartSidebar);
    closeCartBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    // Inicializa el total del carrito al cargar la página
    updateCartDisplay();
});

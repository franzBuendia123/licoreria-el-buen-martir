document.addEventListener('DOMContentLoaded', () => {

    // Almacén global para todos los productos REALES de la API
    let allProducts = []; 
    // Almacén global para los productos que están en el carrito
    let cart = []; 

    // ====================================================================
    // 1. LÓGICA DEL CARRUSEL (SLIDER)
    // ====================================================================
    
    const slides = document.querySelectorAll('.banner-slide');
    let currentSlide = 0;

    function nextSlide() {
        if (slides.length === 0) return; 

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        slides[0].classList.add('active');
        // Inicia la rotación automática cada 5 segundos
        setInterval(nextSlide, 5000); 
    }

    // ====================================================================
    // 2. LÓGICA DEL CARRITO (Abrir/Cerrar y Botones)
    // ====================================================================
    
    // Referencias a elementos clave del HTML
    const cartIcon = document.getElementById('cartIconTrigger'); // Usando el ID corregido
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCart');
    const backdrop = document.getElementById('backdrop');
    const checkoutBtn = document.querySelector('.checkout-btn'); 
    
    // Elementos del DOM para renderizado de productos y total
    const productGrid = document.getElementById('productGrid');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalValue = document.getElementById('cartTotalValue');

    function openCart() {
        cartSidebar.classList.add('open');
        backdrop.style.display = 'block';
    }

    function closeCart() {
        cartSidebar.classList.remove('open');
        backdrop.style.display = 'none';
    }

    // Eventos para abrir y cerrar el carrito
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeCart);
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // ====================================================================
    // 3. LÓGICA DE GESTIÓN DE PRODUCTOS (Carga de API y Renderizado)
    // ====================================================================

    async function getProductsFromDatabase() {
        try {
            const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/products'; 
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
            }
            // Guarda los productos en la variable global
            allProducts = await response.json(); 
            return allProducts;
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            if (productGrid) {
                productGrid.innerHTML = `
                    <p style="grid-column: 1 / -1; text-align: center; color: red; padding: 20px;">
                        ERROR DE CONEXIÓN: ${error.message} <br>
                        Verifica que tu servidor de Backend (Render) esté activo y la ruta '/api/products' sea correcta.
                    </p>
                `;
            }
            return [];
        }
    }


    /**
     * Mantiene tu lógica de renderizado de productos intacta.
     */
    function fetchAndRenderProducts(productos) {
        if (!productGrid) return; 
        productGrid.innerHTML = ''; 

        if (productos.length === 0) {
             productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No hay productos disponibles en este momento.</p>';
             return;
        }

        productos.forEach(producto => {
            
            const precioRegular = producto.precio_regular;
            const precioOferta = producto.precio_oferta;
            const descuento = producto.descuento_porcentaje; 
            const imagenUrl = producto.imagen_url || 'placeholder-bottle.png'; 
            
            const saleTag = (descuento && descuento > 0) ? `<div class="sale-tag">-${descuento}%</div>` : '';
            
            const oldPriceHTML = (precioRegular && precioRegular !== precioOferta) 
                                ? `<p class="price-old">S/ ${precioRegular.toFixed(2)}</p>` 
                                : '';

            // Usa el precio de oferta (o regular) como base para el botón
            const finalPrice = precioOferta ? precioOferta : (precioRegular ? precioRegular : 0.00);

            const cardHTML = `
                <div class="product-card">
                    ${saleTag}
                    <img src="img/${imagenUrl}" alt="${producto.nombre}" class="product-image">
                    
                    <p class="name">${producto.nombre}</p>
                    
                    <div class="price-container">
                        ${oldPriceHTML}
                        <p class="price-new">S/ ${finalPrice.toFixed(2)}</p>
                    </div>
                    
                    <button class="add-to-cart" data-product-id="${producto._id}">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `;
            productGrid.innerHTML += cardHTML;
        });

        // Adjuntar listeners a los botones de "Añadir al Carrito"
        attachAddToCartListeners();
    }


    // ====================================================================
    // 4. LÓGICA DE GESTIÓN DEL CARRITO (Añadir, Quitar, Calcular)
    // ====================================================================
    
    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                addProductToCart(productId);
            });
        });
    }

    function addProductToCart(productId) {
        const productToAdd = allProducts.find(p => p._id.toString() === productId);
        
        if (!productToAdd) return;

        const existingItem = cart.find(item => item._id.toString() === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const finalPrice = productToAdd.precio_oferta || productToAdd.precio_regular;
            
            cart.push({
                _id: productToAdd._id,
                name: productToAdd.nombre,
                price: finalPrice,
                image: productToAdd.imagen_url,
                quantity: 1
            });
        }
        
        renderCart(); 
        openCart();
    }

    function renderCart() {
        if (!cartItemsContainer || !cartTotalValue) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p id="emptyCartMessage" style="text-align: center; margin-top: 20px;">Tu carrito está vacío.</p>`;
            cartTotalValue.textContent = '0.00';

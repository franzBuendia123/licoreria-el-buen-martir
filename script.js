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
            // Actualizar el total en la barra de navegación
            const navTotal = document.getElementById('cartTotalValue'); 
            if (navTotal) navTotal.textContent = '0.00'; 
            return;
        }

        cart.forEach(item => {
            const price = parseFloat(item.price);
            const itemTotal = price * item.quantity;
            total += itemTotal;
            
            const cartItemHTML = `
                <div class="cart-item" data-product-id="${item._id}">
                    <img src="img/${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="item-details">
                        <p class="item-name">${item.name}</p>
                        <div class="item-quantity-controls">
                            <button class="quantity-btn decrease" data-id="${item._id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item._id}">+</button>
                        </div>
                    </div>
                    <p class="item-price">S/ ${itemTotal.toFixed(2)}</p>
                    <button class="remove-item-btn" data-id="${item._id}">&times;</button>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });

        // Actualizar el total en el carrito lateral
        cartTotalValue.textContent = total.toFixed(2);
        
        // Actualizar el total en la barra de navegación (se usa el mismo ID)
        const navTotal = document.getElementById('cartTotalValue'); 
        if (navTotal) navTotal.textContent = total.toFixed(2);

        attachCartControlsListeners();
    }
    
    function attachCartControlsListeners() {
        const controls = document.querySelectorAll('.cart-item');
        controls.forEach(item => {
            const productId = item.dataset.productId;
            
            item.querySelector('.remove-item-btn').addEventListener('click', () => removeItemFromCart(productId));
            item.querySelector('.quantity-btn.increase').addEventListener('click', () => updateQuantity(productId, 1));
            item.querySelector('.quantity-btn.decrease').addEventListener('click', () => updateQuantity(productId, -1));
        });
    }

    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item._id.toString() === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity <= 0) {
                removeItemFromCart(productId);
            } else {
                renderCart();
            }
        }
    }

    function removeItemFromCart(productId) {
        cart = cart.filter(item => item._id.toString() !== productId);
        renderCart();
    }
    
    /**
     * Maneja la finalización de la compra.
     */
    function handleCheckout() {
        if (cart.length === 0) {
            alert("Tu carrito está vacío. Añade productos para finalizar la compra.");
            return;
        }

        // 1. Mostrar mensaje de agradecimiento
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 50px 20px;">
                <h3 style="color: #e3001a; font-size: 24px;">¡GRACIAS POR LA COMPRA!</h3>
                <p>Tu pedido será procesado pronto. Recibirás una notificación.</p>
            </div>
        `;

        // 2. Restablecer valores
        cart = []; // Vaciar el carrito
        
        // 3. Cerrar el carrito y restablecer el estado (vacío y 0.00) después del mensaje
        setTimeout(() => {
            renderCart(); // Renderiza el carrito vacío (total S/ 0.00)
            closeCart(); 
        }, 2500);
    }


    // ====================================================================
    // 5. INICIO DE LA APLICACIÓN
    // ====================================================================
    
    // Función principal que inicia la carga de productos.
    async function loadProducts() {
        if (productGrid) {
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Cargando productos de El Buen Mártir...</p>';
        }
        
        const products = await getProductsFromDatabase();
        fetchAndRenderProducts(products);
    }

    // Iniciar la carga de productos al finalizar la carga del DOM
    loadProducts();

});

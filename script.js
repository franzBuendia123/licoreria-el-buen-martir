document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================
    // LÓGICA DE CARGA DE PRODUCTOS DESDE EL BACKEND (API)
    // ====================================================================
    
    const productGrid = document.getElementById('productGrid');

    /**
     * Función que hace la petición GET al servidor de Render.
     */
    async function getProductsFromDatabase() {
        try {
            // URL ABSOLUTA que apunta al endpoint de tu Backend.
            const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/products'; 
            
            const response = await fetch(API_URL);

            if (!response.ok) {
                // Si hay un error HTTP (404, 500, etc.)
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
            }

            return await response.json(); 
            
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            // Muestra un mensaje de error si falla la conexión
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
     * Procesa el arreglo de productos de la API y crea los elementos HTML.
     */
    function fetchAndRenderProducts(productos) {
        
        if (!productGrid) return; 
        productGrid.innerHTML = ''; 

        if (productos.length === 0) {
             productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No hay productos disponibles en este momento.</p>';
             return;
        }

        productos.forEach(producto => {
            
            // **** Mapeo de Campos de MongoDB ****
            const precioRegular = producto.precio_regular;
            const precioOferta = producto.precio_oferta;
            const descuento = producto.descuento_porcentaje; 
            const imagenUrl = producto.imagen_url || 'placeholder-bottle.png'; 
            
            // 1. Tag de Descuento
            const saleTag = (descuento && descuento > 0) ? `<div class="sale-tag">-${descuento}%</div>` : '';
            
            // 2. Precio Anterior
            const oldPriceHTML = (precioRegular && precioRegular !== precioOferta) 
                                ? `<p class="price-old">S/ ${precioRegular.toFixed(2)}</p>` 
                                : '';

            const cardHTML = `
                <div class="product-card">
                    ${saleTag}
                    <img src="img/${imagenUrl}" alt="${producto.nombre}" class="product-image">
                    
                    <p class="name">${producto.nombre}</p>
                    
                    <div class="price-container">
                        ${oldPriceHTML}
                        <p class="price-new">S/ ${precioOferta ? precioOferta.toFixed(2) : (precioRegular ? precioRegular.toFixed(2) : '0.00')}</p>
                    </div>
                    
                    <button class="add-to-cart" data-product-id="${producto._id}">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `;
            productGrid.innerHTML += cardHTML;
        });
    }

    /**
     * Función principal que inicia la carga de productos.
     */
    async function loadProducts() {
        if (productGrid) {
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Cargando productos de El Buen Mártir...</p>';
        }
        
        const products = await getProductsFromDatabase();
        fetchAndRenderProducts(products);
    }
    // ====================================================================
    // 1. LÓGICA DEL CARRUSEL (SLIDER)
    // ====================================================================

    // Selecciona todos los elementos con la clase 'banner-slide' (de tu HTML)
    const slides = document.querySelectorAll('.banner-slide');
    let currentSlide = 0;

    function nextSlide() {
        if (slides.length === 0) return; 

        // 1. Quita la clase 'active' de la diapositiva que se está mostrando.
        slides[currentSlide].classList.remove('active');
        
        // 2. Calcula la siguiente diapositiva. El % slides.length asegura que regrese al inicio.
        currentSlide = (currentSlide + 1) % slides.length;
        
        // 3. Añade la clase 'active' a la nueva diapositiva.
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        // Asegura que la primera diapositiva esté visible al cargar la página.
        slides[0].classList.add('active');
    }
    document.addEventListener('DOMContentLoaded', () => {

    // Almacén global para todos los productos REALES de la API
    let allProducts = []; 
    // Almacén global para los productos que están en el carrito
    let cart = []; 

    // ====================================================================
    // 1. LÓGICA DEL CARRITO (Abrir/Cerrar y Botones)
    // ====================================================================
    
    const cartIcon = document.querySelector('.cart');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCartBtn = document.getElementById('closeCart');
    const backdrop = document.getElementById('backdrop');
    // CRÍTICO: Referencia al botón de Finalizar Compra
    const checkoutBtn = document.querySelector('.checkout-btn'); 

    // Función para abrir el carrito
    function openCart() {
        cartSidebar.classList.add('open');
        backdrop.style.display = 'block';
    }

    // Función para cerrar el carrito
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
    
    // CRÍTICO: Evento para finalizar la compra
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // ====================================================================
    // 2. LÓGICA DE GESTIÓN DE PRODUCTOS (Carga de API y Renderizado)
    // ====================================================================
    
    const productGrid = document.getElementById('productGrid');

    async function getProductsFromDatabase() {
        try {
            const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/products'; 
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
            }
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

            const finalPrice = precioOferta ? precioOferta.toFixed(2) : (precioRegular ? precioRegular.toFixed(2) : '0.00');

            const cardHTML = `
                <div class="product-card">
                    ${saleTag}
                    <img src="img/${imagenUrl}" alt="${producto.nombre}" class="product-image">
                    
                    <p class="name">${producto.nombre}</p>
                    
                    <div class="price-container">
                        ${oldPriceHTML}
                        <p class="price-new">S/ ${finalPrice}</p>
                    </div>
                    
                    <button class="add-to-cart" data-product-id="${producto._id}" data-price="${finalPrice}">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            `;
            productGrid.innerHTML += cardHTML;
        });

        attachAddToCartListeners();
    }


    // ====================================================================
    // 3. LÓGICA DE GESTIÓN DEL CARRITO (Añadir, Quitar, Calcular)
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
        const container = document.getElementById('cartItemsContainer');
        const totalValueSpan = document.getElementById('cartTotalValue');
        
        if (!container || !totalValueSpan) return;

        container.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            container.innerHTML = `<p id="emptyCartMessage" style="text-align: center; margin-top: 20px;">Tu carrito está vacío.</p>`;
            totalValueSpan.textContent = '0.00';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
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
            container.innerHTML += cartItemHTML;
        });

        totalValueSpan.textContent = total.toFixed(2);
        
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
     * Función que maneja la finalización de la compra:
     * 1. Muestra un mensaje de éxito.
     * 2. Vacía el arreglo 'cart'.
     * 3. Restablece el total a 0.00.
     */
    function handleCheckout() {
        if (cart.length === 0) {
            alert("Tu carrito está vacío. Añade productos para finalizar la compra.");
            return;
        }

        const container = document.getElementById('cartItemsContainer');

        // 1. Mostrar mensaje de agradecimiento
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px;">
                <h3 style="color: #e3001a; font-size: 24px;">¡GRACIAS POR LA COMPRA!</h3>
                <p>Tu pedido será procesado pronto. Recibirás una notificación.</p>
            </div>
        `;

        // 2. Restablecer valores
        cart = []; // Vaciar el carrito
        
        // 3. Cerrar el carrito y restablecer el estado después del mensaje
        setTimeout(() => {
            renderCart(); // Renderiza el carrito vacío
            closeCart(); 
        }, 2500); // Muestra el mensaje por 2.5 segundos
    }


    // ====================================================================
    // 4. INICIO DE LA APLICACIÓN
    // ====================================================================
    loadProducts();

});
    // Inicia la rotación automática cada 5 segundos (5000 milisegundos).
    setInterval(nextSlide, 5000);
    
    // Iniciar la carga al terminar de cargar el DOM
    loadProducts();
});



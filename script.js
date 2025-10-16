document.addEventListener('DOMContentLoaded', () => {
    
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
    }
    
    // Inicia la rotación automática cada 5 segundos
    setInterval(nextSlide, 5000); 


    // ====================================================================
    // 2. LÓGICA DE CARGA DE PRODUCTOS DESDE EL BACKEND (API)
    // ====================================================================
    
    const productGrid = document.getElementById('productGrid');

    /**
     * Función que hace la petición GET al servidor de Render.
     */
    async function getProductsFromDatabase() {
        try {
            // CRÍTICO: Usamos la URL ABSOLUTA del servidor de Render.
            const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/products'; 
            
            const response = await fetch(API_URL);

            if (!response.ok) {
                // Si hay un error HTTP (404, 500, etc.)
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
            }

            return await response.json(); 
            
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            // Mostrar error en la UI si falla la conexión o el servidor
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
     * Procesa el arreglo de productos de la API y crea los elementos HTML de las tarjetas.
     */
    function fetchAndRenderProducts(productos) {
        
        if (!productGrid) return; 
        productGrid.innerHTML = ''; 

        if (productos.length === 0) {
             productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No hay productos disponibles en este momento.</p>';
             return;
        }

        productos.forEach(producto => {
            
            // **Mapeo de Campos de MongoDB (ajustado a las estructuras típicas)**
            const precioRegular = producto.precio_regular || producto.precio;
            const precioOferta = producto.precio_oferta || producto.precio;
            const descuento = producto.descuento_porcentaje || producto.descuento_percentage || null; 
            const imagenUrl = producto.imagen_url || producto.imagenUrl || 'placeholder-bottle.png'; // Fallback por si no viene el campo de imagen
            
            // Lógica de generación de HTML de la tarjeta
            const saleTag = descuento ? `<div class="sale-tag">-${descuento}%</div>` : '';
            
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
                        <p class="price-new">S/ ${precioOferta.toFixed(2)}</p>
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
    
    // Iniciar la carga al terminar de cargar el DOM
    loadProducts();
});

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
            // URL ABSOLUTA del servidor de Render.
            const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/products'; 
            
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
            }

            return await response.json(); 
            
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            // Mostrar error si falla la conexión
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
            
            // **** Mapeo FINAL de Campos basado en tu MongoDB (image_6b557e.jpg) ****
            const precioRegular = producto.precio_regular;
            const precioOferta = producto.precio_oferta;
            const descuento = producto.descuento_porcentaje; 
            const imagenUrl = producto.imagen_url || 'placeholder-bottle.png';
            
            // Generación de HTML
            
            // 1. Tag de Descuento (Solo si existe y es mayor a 0)
            const saleTag = (descuento && descuento > 0) ? `<div class="sale-tag">-${descuento}%</div>` : '';
            
            // 2. Precio Anterior (Solo si existe y es diferente al de oferta)
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
                        <p class="price-new">S/ ${precioOferta ? precioOferta.toFixed(2) : '0.00'}</p>
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

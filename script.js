document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================
    // 1. LÓGICA DEL CARRUSEL (SLIDER)
    // ====================================================================

    // Los banners slider1.jpg, slider2.jpg, etc., se cargan desde el CSS
    const slides = document.querySelectorAll('.banner-slide');
    let currentSlide = 0;

    function nextSlide() {
        if (slides.length === 0) return; 

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Muestra el primer slide inmediatamente al cargar
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
     * Hace una petición GET a tu API de Backend para obtener los productos.
     */
    async function getProductsFromDatabase() {
        try {
            // CRÍTICO: Esta es la ruta que tu servidor (Render) debe manejar.
            // Si usas una URL completa (ej: Render), reemplaza: 
            // const API_URL = 'https://tuserver.onrender.com/api/products';
            const API_URL = '/api/products'; 
            
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: Revisa la ruta o el estado del servidor.`);
            }

            return await response.json(); // Devuelve el arreglo de productos
            
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            // Muestra el error en la cuadrícula de productos
            if (productGrid) {
                productGrid.innerHTML = `
                    <p style="grid-column: 1 / -1; text-align: center; color: red; padding: 20px;">
                        ERROR DE CONEXIÓN: ${error.message} <br>
                        Verifica que tu API esté en funcionamiento (MongoDB/Render).
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
            
            // Mapeo de campos basado en la estructura de tu MongoDB/API
            const precioRegular = producto.precio_regular || producto.precio;
            const precioOferta = producto.precio_oferta || producto.precio;
            // Asumiendo que el campo de descuento es 'descuento_percentage'
            const descuento = producto.descuento_percentage || null; 

            const saleTag = descuento ? `<div class="sale-tag">-${descuento}%</div>` : '';
            
            const oldPriceHTML = (precioRegular && precioRegular !== precioOferta) 
                                ? `<p class="price-old">S/ ${precioRegular.toFixed(2)}</p>` 
                                : '';

            const cardHTML = `
                <div class="product-card">
                    ${saleTag}
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="product-image">
                    
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
     * Función que inicia la carga de productos.
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

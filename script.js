document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================
    // 1. LÓGICA DE CARGA DE PRODUCTOS DESDE EL BACKEND (API)
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

            // Devuelve el JSON real de productos
            return await response.json(); 
            
        } catch (error) {
            console.error("Error al cargar productos desde la API:", error);
            // Muestra un mensaje de error si falla la conexión (e.g., servidor dormido)
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
            
            // **** Mapeo de Campos basado en tu estructura de MongoDB (imagen_url, precio_regular, descuento_porcentaje) ****
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
    
    // Iniciar la carga al terminar de cargar el DOM
    loadProducts();
});

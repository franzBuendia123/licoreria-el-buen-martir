// Función principal que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    
    // 🚨 ÚLTIMA CORRECCIÓN: URL PÚBLICA DE RENDER 🚨
    const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/productos'; 
    
    const productGrid = document.getElementById('product-list');

    // Función para obtener los productos del servidor (Backend)
    async function fetchAndRenderProducts() {
        try {
            // Hacemos la petición a la API pública del servidor de Render
            const response = await fetch(API_URL); 
            
            if (!response.ok) {
                // Esto ocurre si el servidor de Render está dormido (plan gratuito) o falló
                throw new Error(`Error ${response.status}: El servidor no respondió.`);
            }

            const productos = await response.json(); 
            productGrid.innerHTML = ''; 

            // Construir el HTML dinámicamente con los productos
            productos.forEach(producto => {
                // Asegúrate de que los datos de MongoDB (precio_nuevo, descuento, etc.) 
                // coincidan con los nombres usados aquí.
                const cardHTML = `
                    <div class="product-card">
                        <span class="sale-tag">-${producto.descuento || '0%'}</span>
                        <img src="${producto.imagen || 'placeholder-bottle.png'}" alt="${producto.nombre}" class="product-image">
                        <p class="name">${producto.nombre}</p>
                        ${producto.precio_antiguo ? `<p class="price-old">S/ ${producto.precio_antiguo.toFixed(2)}</p>` : ''}
                        <p class="price-new">S/ ${producto.precio_nuevo.toFixed(2)}</p>
                        <button class="add-to-cart">AÑADIR AL CARRITO</button>
                    </div>
                `;
                productGrid.innerHTML += cardHTML;
            });

            if (productos.length === 0) {
                 productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No se encontraron productos. ¡Inserta datos en tu MongoDB Atlas!</p>';
            }

        } catch (error) {
            console.error('Error al cargar los productos:', error);
            // Esto se mostrará si hay un problema de red, CORS o la URL es incorrecta
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; color: red; text-align: center;">ERROR: No se pudo conectar a la API. Revisa la consola para más detalles.</p>';
        }
    }

    fetchAndRenderProducts();
});

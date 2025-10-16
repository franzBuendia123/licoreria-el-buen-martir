document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'https://licoreria-el-buen-martir-backend.onrender.com/api/productos';
    
    const productGrid = document.getElementById('product-list');

    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: El servidor no respondió.`);
            }

            const productos = await response.json();
            productGrid.innerHTML = '';

            productos.forEach(producto => {
                const cardHTML = `
                    <div class="product-card">
                        <span class="sale-tag">-${producto.descuento_porcentaje || '0%'}</span>
                        
                        <a href="${productLink}">
                            <img src="img/${producto.imagen_url || 'placeholder-bottle.png'}" alt="${producto.nombre}" class="product-image">
                            <p class="name">${producto.nombre}</p>
                        </a>
                        
                        <div class="price-container">
                            ${producto.precio_regular ? `<p class="price-old">S/ ${producto.precio_regular.toFixed(2)}</p>` : ''}
                            <p class="price-new">S/ ${producto.precio_oferta.toFixed(2)}</p>
                        </div>
                        
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
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; color: red; text-align: center;">ERROR: No se pudo conectar a la API. Revisa la consola para más detalles.</p>';
        }
    }

    fetchAndRenderProducts();
});



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
                
                const productLink = `detalle.html?id=${producto._id}`;

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

    function startBannerRotation() {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length < 2) return; 

        let currentSlideIndex = 0;
        
        // Inicializa el carrusel forzando al primer slide a estar activo
        slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        function showNextSlide() {
            // 1. Oculta el slide actual
            slides[currentSlideIndex].classList.remove('active');
            
            // 2. Mueve al siguiente índice (ciclo)
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            
            // 3. Muestra el nuevo slide
            slides[currentSlideIndex].classList.add('active');
        }
        
        // Inicia la rotación cada 6 segundos
        setInterval(showNextSlide, 6000); 
    }

const cartTotalElement = document.querySelector('.cart span'); 

// Inicializa el carrito (o lo recupera del LocalStorage)
let cart = JSON.parse(localStorage.getItem('elbuenmartir_cart')) || [];

function updateCartDisplay() {
    let total = 0;
    
    // Calcula el total sumando el precio y cantidad de cada item
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    // Actualiza el texto en la cabecera con el total (S/ 150.00)
    cartTotalElement.textContent = `S/ ${total.toFixed(2)}`;
    
    // Guarda el carrito en el navegador para que persista al recargar
    localStorage.setItem('elbuenmartir_cart', JSON.stringify(cart));
}

function addToCart(event) {
    const button = event.target;
    // Obtiene el ID único del producto desde el HTML
    const productId = button.dataset.productId; 
    
    if (!productId) {
        console.error("Error: El botón Añadir al Carrito no tiene un 'data-product-id'.");
        return;
    }
    
    // Obtiene el precio y el nombre de la tarjeta del DOM
    const productCard = button.closest('.product-card');
    const priceText = productCard.querySelector('.price-new').textContent;
    const price = parseFloat(priceText.replace('S/ ', ''));
    const productName = productCard.querySelector('.name').textContent;


    // Revisa si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1; // Si existe, aumenta la cantidad
    } else {
        // Si no existe, lo añade como un nuevo item
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    alert(`¡${productName.trim()} añadido al carrito!`);
    updateCartDisplay(); // Llama a la función para actualizar el total
}

// Función para asignar los listeners a todos los botones 'AÑADIR AL CARRITO'
function attachCartListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

updateCartDisplay();
    fetchAndRenderProducts();
    startBannerRotation();
});


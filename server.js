const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const path = require('path');

const app = express();
// Usa el puerto que te asigne Render o el 3000 si corres localmente
const PORT = process.env.PORT || 3000; 

// 🚨 1. LA CONNECTION STRING VIENE DE LA VARIABLE DE ENTORNO EN RENDER (MONGO_URI) 🚨
const mongoURI = process.env.MONGO_URI; 

// 2. Dominio de GitHub Pages (Frontend)
const allowedOrigin = 'https://franzbuendia123.github.io'; 

// 3. Configurar CORS (Permitir peticiones SOLO desde tu dominio público)
app.use(cors({
    origin: allowedOrigin 
}));

// Conexión a MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Definición del Esquema (Producto)
const ProductSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio_nuevo: { type: Number, required: true },
    precio_antiguo: { type: Number },
    descuento: { type: String },
    imagen: { type: String }
});
const Product = mongoose.model('Product', ProductSchema);

// Servir archivos estáticos (Necesario para que Render sirva el index.html en el futuro si decides usarlo para todo)
app.use(express.static(path.join(__dirname, 'public'))); 

// Ruta para obtener los productos (tu API REST)
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Product.find({});
        res.json(productos); 
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
});
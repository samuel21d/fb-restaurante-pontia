import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Obtener el ID del producto desde la URL
const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');

// Elementos del DOM
const nombreProducto = document.getElementById('nombre-producto');
const descripcionProducto = document.getElementById('descripcion-producto');
const precioProducto = document.getElementById('precio-producto');
const carruselImagenes = document.getElementById('carrusel-imagenes');
const imagenPrincipal = document.getElementById('imagen-principal');
const miniaturas = document.getElementById('miniaturas');
const coloresSelect = document.getElementById('colores');
const tallasSelect = document.getElementById('tallas');
const whatsappBtn = document.getElementById('whatsapp-btn');

// Cargar los detalles del producto
async function cargarDetallesProducto() {
  if (!productoId) {
    alert('Producto no encontrado');
    window.location.href = 'index.html';
    return;
  }

  const productoRef = doc(db, 'productos', productoId);
  const productoSnap = await getDoc(productoRef);

  if (productoSnap.exists()) {
    const producto = productoSnap.data();

    // Mostrar información básica
    nombreProducto.textContent = producto.nombre;
    descripcionProducto.textContent = producto.descripcion;
    precioProducto.textContent = `Precio: $${producto.precio}`;

    // Mostrar colores
    producto.colores.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      coloresSelect.appendChild(option);
    });

    // Mostrar tallas
    producto.tallas.forEach(talla => {
      const option = document.createElement('option');
      option.value = talla;
      option.textContent = talla;
      tallasSelect.appendChild(option);
    });

    // Mostrar imágenes del primer color por defecto
    mostrarImagenes(producto.imagenes[producto.colores[0]]);

    // Cambiar imágenes al seleccionar un color
    coloresSelect.addEventListener('change', (e) => {
      const colorSeleccionado = e.target.value;
      mostrarImagenes(producto.imagenes[colorSeleccionado]);
    });

    // Configurar el botón de WhatsApp
    whatsappBtn.addEventListener('click', () => {
      const colorSeleccionado = coloresSelect.value;
      const tallaSeleccionada = tallasSelect.value;
      const mensaje = `Hola, estoy interesado en el producto ${producto.nombre}, color ${colorSeleccionado}, talla ${tallaSeleccionada}.`;
      const urlWhatsApp = `https://wa.me/+573174653280?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');
    });

  } else {
    alert('Producto no encontrado');
    window.location.href = 'index.html';
  }
}

// Función para mostrar las imágenes en el carrusel
function mostrarImagenes(imagenes) {
  imagenPrincipal.innerHTML = `<img src="${imagenes[0]}" alt="Imagen principal">`;
  miniaturas.innerHTML = '';

  imagenes.forEach((imagen, index) => {
    const miniatura = document.createElement('img');
    miniatura.src = imagen;
    miniatura.addEventListener('click', () => {
      imagenPrincipal.innerHTML = `<img src="${imagen}" alt="Imagen principal">`;
    });
    miniaturas.appendChild(miniatura);
  });
}

// Cargar los detalles del producto al iniciar la página
cargarDetallesProducto();
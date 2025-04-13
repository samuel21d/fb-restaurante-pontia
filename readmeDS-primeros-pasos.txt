Felicidades por desplegar tu proyecto en Firebase Hosting! 🎉 Ahora vamos a proceder con los pasos para crear tu catálogo dinámico. Esto incluye:

Configurar Firestore para almacenar los productos.

Crear un panel de administración para que los dueños del catálogo puedan agregar, editar o eliminar productos.

Mostrar los productos dinámicamente en tu página web.

Paso 1: Configurar Firestore
Ve a Firebase Console y selecciona tu proyecto.

En el menú izquierdo, haz clic en Firestore Database.

Haz clic en Crear base de datos y selecciona el modo de prueba (permite lectura/escritura sin autenticación temporalmente).

Define una colección llamada productos. Esta colección almacenará los documentos de cada producto.

Paso 2: Crear el panel de administración
El panel de administración permitirá a los dueños del catálogo gestionar los productos.

2.1. Crear un archivo admin.html
Dentro de tu carpeta public, crea un archivo llamado admin.html con el siguiente contenido:

html
Copy
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Panel de Administración</h1>
  <form id="form-producto">
    <input type="text" id="nombre" placeholder="Nombre del producto" required>
    <input type="text" id="descripcion" placeholder="Descripción" required>
    <input type="number" id="precio" placeholder="Precio" required>
    <input type="text" id="imagen" placeholder="URL de la imagen" required>
    <button type="submit">Agregar Producto</button>
  </form>
  <div id="lista-productos"></div>
  <script src="firebase-config.js"></script>
  <script src="admin.js"></script>
</body>
</html>
Run HTML
2.2. Crear un archivo admin.js
Dentro de tu carpeta public, crea un archivo llamado admin.js con el siguiente contenido:

javascript
Copy
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const formProducto = document.getElementById('form-producto');
const listaProductos = document.getElementById('lista-productos');

// Agregar producto
formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio = document.getElementById('precio').value;
  const imagen = document.getElementById('imagen').value;

  try {
    await addDoc(collection(db, 'productos'), {
      nombre,
      descripcion,
      precio,
      imagen
    });
    alert('Producto agregado correctamente');
    formProducto.reset();
    cargarProductos();
  } catch (error) {
    console.error('Error al agregar producto: ', error);
  }
});

// Cargar productos
async function cargarProductos() {
  listaProductos.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, 'productos'));
  querySnapshot.forEach((doc) => {
    const producto = doc.data();
    const productoHTML = `
      <div class="producto">
        <h2>${producto.nombre}</h2>
        <p>${producto.descripcion}</p>
        <p>Precio: $${producto.precio}</p>
        <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
        <button onclick="eliminarProducto('${doc.id}')">Eliminar</button>
      </div>
    `;
    listaProductos.innerHTML += productoHTML;
  });
}

// Eliminar producto
window.eliminarProducto = async (id) => {
  try {
    await deleteDoc(doc(db, 'productos', id));
    alert('Producto eliminado correctamente');
    cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto: ', error);
  }
};

// Cargar productos al iniciar
cargarProductos();
Paso 3: Mostrar los productos en la página principal
Ahora vamos a modificar tu archivo index.html y script.js para mostrar los productos dinámicamente.

3.1. Modificar index.html
Asegúrate de que tu index.html tenga un contenedor para los productos:

html
Copy
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Catálogo de Productos</h1>
  <div id="productos-container"></div>
  <script src="firebase-config.js"></script>
  <script src="script.js"></script>
</body>
</html>
Run HTML
3.2. Modificar script.js
Dentro de tu carpeta public, modifica el archivo script.js para cargar los productos desde Firestore:

javascript
Copy
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const productosContainer = document.getElementById('productos-container');

// Cargar productos
async function cargarProductos() {
  productosContainer.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, 'productos'));
  querySnapshot.forEach((doc) => {
    const producto = doc.data();
    const productoHTML = `
      <div class="producto">
        <h2>${producto.nombre}</h2>
        <p>${producto.descripcion}</p>
        <p>Precio: $${producto.precio}</p>
        <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
      </div>
    `;
    productosContainer.innerHTML += productoHTML;
  });
}

// Cargar productos al iniciar
cargarProductos();
Paso 4: Desplegar los cambios
Guarda todos los archivos modificados.

Abre una terminal en la carpeta de tu proyecto.

Ejecuta el siguiente comando para desplegar los cambios:

bash
Copy
firebase deploy
Resultado final
Página principal: https://catalogo-pontia-store.web.app mostrará los productos dinámicamente.

Panel de administración: https://catalogo-pontia-store.web.app/admin.html permitirá agregar, editar o eliminar productos.

¡Y eso es todo! Ahora tienes un catálogo dinámico y un panel de administración funcional. 😊
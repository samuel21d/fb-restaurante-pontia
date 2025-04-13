import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// Verificar si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    cargarCategorias();
  }
});

const listaCategorias = document.getElementById("lista-categorias");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");
const popupCategoria = document.getElementById("popup-categoria");
const popupProducto = document.getElementById("popup-producto");
const cancelarPopupCategoria = document.getElementById("cancelar-popup-categoria");
const cancelarPopupProducto = document.getElementById("cancelar-popup-producto");
const formCategoria = document.getElementById("form-categoria");
const formProducto = document.getElementById("form-producto");
const categoriaProductoSelect = document.getElementById("categoria-producto");
const ingredientePrincipal = document.getElementById("ingrediente-principal");
const btnGestionIngredientes = document.getElementById("btn-gestion-ingredientes");
const acompanantePrincipal = document.getElementById("acompanante-principal");
const btnGestionAcompanantes = document.getElementById("btn-gestion-acompanantes");
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

let categoriaEditando = null;
let productoEditando = null;


document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const dropdownMenu = document.getElementById("dropdown-menu");

  // Toggle dropdown
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== hamburger) {
      dropdownMenu.classList.remove("active");
    }
  });
});

// Función para subir una imagen a Cloudinary
const subirImagen = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "pontia-preset");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dyqxzguo6/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  return data.secure_url;
};

// Mostrar/Ocultar popups
const mostrarPopup = (popupId) => {
  document.getElementById(popupId).style.display = "block";
  if (popupId === "popup-producto") {
    cargarCategoriasEnSelect(); // Cargar categorías en el select al abrir el popup
  }
};

const ocultarPopup = (popupId) => {
  document.getElementById(popupId).style.display = "none";
  formCategoria.reset();
  formProducto.reset();
  document.getElementById("foto-categoria-container").innerHTML = `
    <div class="foto-selector" onclick="document.getElementById('foto-categoria').click()">
      <span class="upload-icon">↑</span>
    </div>
  `;
  document.getElementById("foto-producto-container").innerHTML = `
    <div class="foto-selector" onclick="document.getElementById('foto-producto').click()">
      <span class="upload-icon">↑</span>
    </div>
  `;
  categoriaEditando = null;
  productoEditando = null;
  const botonSubmitCategoria = formCategoria.querySelector('button[type="submit"]');
  const botonSubmitProducto = formProducto.querySelector('button[type="submit"]');
  botonSubmitCategoria.textContent = "Crear Categoría";
  botonSubmitProducto.textContent = "Crear Producto";
  // Restaurar estado inicial de ingredientes y acompañantes
  ingredientePrincipal.disabled = true;
  ingredientePrincipal.value = "";
  btnGestionIngredientes.textContent = "Añadir ingredientes";
  acompanantePrincipal.disabled = true;
  acompanantePrincipal.value = "";
  btnGestionAcompanantes.textContent = "Añadir acompañantes";
};

// Cargar categorías en el select del formulario de productos
async function cargarCategoriasEnSelect() {
  const querySnapshot = await getDocs(collection(db, "categorias"));
  categoriaProductoSelect.innerHTML =
    '<option value="">Seleccionar Categoría</option>';
  querySnapshot.forEach((doc) => {
    const categoria = doc.data();
    categoriaProductoSelect.innerHTML += `<option value="${doc.id}">${categoria.nombre}</option>`;
  });
}

// Gestionar ingredientes
btnGestionIngredientes.addEventListener("click", () => {
  if (btnGestionIngredientes.textContent === "Añadir ingredientes") {
    ingredientePrincipal.disabled = false;
    ingredientePrincipal.focus();
    btnGestionIngredientes.textContent = "Guardar cambios";
  } else if (btnGestionIngredientes.textContent === "Guardar cambios") {
    ingredientePrincipal.disabled = true;
    btnGestionIngredientes.textContent = "Editar ingredientes";
  } else if (btnGestionIngredientes.textContent === "Editar ingredientes") {
    ingredientePrincipal.disabled = false;
    ingredientePrincipal.focus();
    btnGestionIngredientes.textContent = "Guardar cambios";
  }
});

// Gestionar acompañantes
btnGestionAcompanantes.addEventListener("click", () => {
  if (btnGestionAcompanantes.textContent === "Añadir acompañantes") {
    acompanantePrincipal.disabled = false;
    acompanantePrincipal.focus();
    btnGestionAcompanantes.textContent = "Guardar cambios";
  } else if (btnGestionAcompanantes.textContent === "Guardar cambios") {
    acompanantePrincipal.disabled = true;
    btnGestionAcompanantes.textContent = "Editar acompañantes";
  } else if (btnGestionAcompanantes.textContent === "Editar acompañantes") {
    acompanantePrincipal.disabled = false;
    acompanantePrincipal.focus();
    btnGestionAcompanantes.textContent = "Guardar cambios";
  }
});

// Función para cargar las categorías y productos desde Firestore
async function cargarCategorias() {
  listaCategorias.innerHTML = ""; // Limpiar la lista para evitar duplicados
  const querySnapshot = await getDocs(collection(db, "categorias"));

  querySnapshot.forEach(async (doc) => {
    const categoria = doc.data();
    const categoriaId = doc.id;

    // Cargar productos asociados a esta categoría
    const productosSnapshot = await getDocs(collection(db, "producto"));
    const productos = [];
    productosSnapshot.forEach((productoDoc) => {
      const producto = productoDoc.data();
      if (producto.categoriaId === categoriaId) {
        productos.push({ ...producto, id: productoDoc.id });
      }
    });

    // Mostrar todas las categorías en el panel de administración (sin filtrar por visible)
    const categoriaHTML = `
      <div class="categoria-item" data-id="${categoriaId}">
        <div class="categoria-header" onclick="toggleProductos('${categoriaId}')">
          <img src="${categoria.foto}" alt="${categoria.nombre}" class="categoria-img">
          <span class="categoria-nombre">
            ${categoria.nombre} (${productos.length})
            <img src="${
              categoria.visible !== false
                ? "/img/mostrado.png"
                : "/img/ocultado.png"
            }" alt="${
      categoria.visible !== false ? "Visible" : "Oculto"
    }" class="visibilidad-img" onclick="event.stopPropagation(); toggleVisibilidadCategoria('${categoriaId}')">
          </span>
          <span class="expandir">▼ <span class="ver-productos">Ver productos</span></span>
          <div class="acciones">
            <button class="editar-btn" onclick="event.stopPropagation(); editarCategoria('${categoriaId}')">Editar</button>
            <button class="eliminar-btn" onclick="event.stopPropagation(); eliminarCategoria('${categoriaId}')">Eliminar</button>
          </div>
        </div>
        <div class="productos-container" id="productos-${categoriaId}">
          ${productos
            .map(
              (producto) => `
            <div class="producto-item" data-id="${producto.id}">
              <img src="${producto.foto}" alt="${producto.nombre}" class="producto-img">
              <span class="producto-nombre">
                ${producto.nombre}
                <img src="${
                  producto.visible !== false
                    ? "/img/mostrado.png"
                    : "/img/ocultado.png"
                }" alt="${
                producto.visible !== false ? "Visible" : "Oculto"
              }" class="visibilidad-img" onclick="event.stopPropagation(); toggleVisibilidadProducto('${
                producto.id
              }')">
              </span>
              <span class="producto-precio">${producto.precio.toFixed(2)}</span>
              <div class="acciones">
                <button class="editar-btn" onclick="event.stopPropagation(); editarProducto('${
                  producto.id
                }')">Editar</button>
                <button class="eliminar-btn" onclick="event.stopPropagation(); eliminarProducto('${
                  producto.id
                }')">Eliminar</button>
              </div>
            </div>
          `
            )
            .join("")}
          <button class="btn-anadir-producto" onclick="mostrarPopupProducto('${categoriaId}')">+ Añadir producto</button>
        </div>
      </div>
    `;
    listaCategorias.innerHTML += categoriaHTML;
  });
}

// Función para expandir/colapsar productos
window.toggleProductos = (categoriaId) => {
  const container = document.getElementById(`productos-${categoriaId}`);
  const expandir = container.previousElementSibling.querySelector(".expandir");

  // Alternar la visibilidad de los productos
  container.classList.toggle("mostrar");

  // Cambiar el texto y la flecha
  if (container.classList.contains("mostrar")) {
    expandir.innerHTML = '▲ <span class="ver-productos">Ocultar productos</span>';
  } else {
    expandir.innerHTML = '▼ <span class="ver-productos">Ver productos</span>';
  }
};

// Función para mostrar popup de categoría con categoría seleccionada
window.mostrarPopupCategoria = (categoriaId) => {
  document.getElementById("popup-titulo-categoria").textContent =
    "Crear Categoría";
  mostrarPopup("popup-categoria");
};

// Función para mostrar popup de producto con categoría seleccionada
window.mostrarPopupProducto = (categoriaId) => {
  document.getElementById("categoria-producto").value = categoriaId;
  document.getElementById("popup-titulo-producto").textContent =
    "Crear Producto";
  mostrarPopup("popup-producto");
};

// Función para manejar el envío del formulario de categoría
formCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre-categoria").value;
  const descripcion = document.getElementById("descripcion-categoria").value;
  const fotoInput = document.getElementById("foto-categoria");
  const foto = fotoInput.files[0];

  if (!nombre) {
    alert("Por favor, completa el nombre de la categoría.");
    return;
  }

  try {
    let fotoUrl = categoriaEditando
      ? (await getDoc(doc(db, "categorias", categoriaEditando))).data().foto
      : null;

    if (foto) {
      fotoUrl = await subirImagen(foto);
    }

    if (categoriaEditando) {
      await updateDoc(doc(db, "categorias", categoriaEditando), {
        nombre,
        descripcion: descripcion || "",
        foto: fotoUrl,
        visible: true,
      });
      alert("Categoría actualizada correctamente");
    } else {
      await addDoc(collection(db, "categorias"), {
        nombre,
        descripcion: descripcion || "",
        foto: fotoUrl,
        visible: true,
      });
      alert("Categoría agregada correctamente");
    }

    ocultarPopup("popup-categoria");
    cargarCategorias();
  } catch (error) {
    console.error("Error al guardar la categoría:", error);
  }
});

// Función para manejar el envío del formulario de producto
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const categoriaId = document.getElementById("categoria-producto").value;
  const nombre = document.getElementById("nombre-producto").value;
  const precio = document.getElementById("precio-producto").value;
  const foto = document.getElementById("foto-producto")?.files[0];
  const ingredientes = ingredientePrincipal.value.trim()
    ? [ingredientePrincipal.value.trim()]
    : [];
  const acompañantes = acompanantePrincipal.value.trim()
    ? [acompanantePrincipal.value.trim()]
    : [];

  if (!categoriaId || !nombre || !precio || ingredientes.length === 0) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }

  try {
    let fotoUrl = productoEditando?.foto;

    if (foto) {
      fotoUrl = await subirImagen(foto);
    }

    if (productoEditando) {
      await updateDoc(doc(db, "producto", productoEditando.id), {
        nombre,
        precio: parseFloat(precio),
        ingredientes,
        acompañantes,
        categoriaId,
        foto: fotoUrl,
        visible: true,
      });
      alert("Producto actualizado correctamente");
    } else {
      await addDoc(collection(db, "producto"), {
        nombre,
        precio: parseFloat(precio),
        ingredientes,
        acompañantes,
        categoriaId,
        foto: fotoUrl,
        visible: true,
      });
      alert("Producto agregado correctamente");
    }

    ocultarPopup("popup-producto");
    cargarCategorias();
  } catch (error) {
    console.error("Error al guardar el producto:", error);
  }
});

// Función para editar una categoría
window.editarCategoria = async (id) => {
  const categoriaRef = doc(db, "categorias", id);
  const categoriaSnap = await getDoc(categoriaRef);

  if (categoriaSnap.exists()) {
    const categoria = categoriaSnap.data();

    document.getElementById("nombre-categoria").value = categoria.nombre;
    document.getElementById("descripcion-categoria").value =
      categoria.descripción || "";

    if (categoria.foto) {
      const container = document.getElementById("foto-categoria-container");
      container.innerHTML = `
        <img src="${categoria.foto}" alt="Previsualización" class="foto-previa">
        <span class="eliminar-foto" onclick="eliminarImagen('foto-categoria-container', 'foto-categoria')">X</span>
      `;
    }

    categoriaEditando = id;
    document.getElementById("popup-titulo-categoria").textContent =
      "Editar Categoría";
    const botonSubmit = formCategoria.querySelector('button[type="submit"]');
    botonSubmit.textContent = "Guardar Cambios";
    mostrarPopup("popup-categoria");
  } else {
    alert("Categoría no encontrada");
  }
};

// Función para editar un producto
window.editarProducto = async (id) => {
  console.log(`Intentando editar producto con ID: ${id}`); // Depuración
  const productoRef = doc(db, "producto", id);
  const productoSnap = await getDoc(productoRef);

  if (productoSnap.exists()) {
    const producto = productoSnap.data();

    // Depuración: Verificar datos del producto
    console.log("Datos del producto:", producto);

    // Cargar los datos del producto en el formulario
    document.getElementById("nombre-producto").value = producto.nombre || "";
    document.getElementById("precio-producto").value = producto.precio || "";
    document.getElementById("categoria-producto").value =
      producto.categoriaId || "";

    // Limpiar y cargar ingredientes (solo un campo principal, como en el popup actual)
    ingredientePrincipal.value =
      producto.ingredientes && producto.ingredientes.length > 0
        ? producto.ingredientes.join(", ")
        : "";
    ingredientePrincipal.disabled = true;
    btnGestionIngredientes.textContent = "Editar ingredientes";

    // Limpiar y cargar acompañantes (solo un campo principal, como en el popup actual)
    acompanantePrincipal.value =
      producto.acompañantes && producto.acompañantes.length > 0
        ? producto.acompañantes.join(", ")
        : "";
    acompanantePrincipal.disabled = true;
    btnGestionAcompanantes.textContent = "Editar acompañantes";

    // Cargar la imagen existente si la hay
    if (producto.foto) {
      const container = document.getElementById("foto-producto-container");
      container.innerHTML = `
        <img src="${producto.foto}" alt="Previsualización" class="foto-previa">
        <span class="eliminar-foto" onclick="eliminarImagen('foto-producto-container', 'foto-producto')">X</span>
      `;
    }

    // Guardar el ID del producto que se está editando
    productoEditando = { id, ...producto };

    // Cambiar el texto del botón a "Guardar Cambios"
    const botonSubmit = formProducto.querySelector('button[type="submit"]');
    if (botonSubmit) {
      botonSubmit.textContent = "Guardar Cambios";
    } else {
      console.error("No se encontró el botón de envío en formProducto");
    }

    // Mostrar el popup de productos
    document.getElementById("popup-titulo-producto").textContent =
      "Editar Producto";
    mostrarPopup("popup-producto");
  } else {
    alert("Producto no encontrado");
    console.error(`Producto con ID ${id} no encontrado en Firestore`);
  }
};

// Función para eliminar una categoría
window.eliminarCategoria = async (id) => {
  if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
    try {
      await deleteDoc(doc(db, "categorias", id));
      alert("Categoría eliminada correctamente");
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría: ", error);
    }
  }
};

// Función para eliminar un producto
window.eliminarProducto = async (id) => {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      await deleteDoc(doc(db, "producto", id));
      alert("Producto eliminado correctamente");
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar producto: ", error);
    }
  }
};

// Cerrar sesión
cerrarSesionBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Sesión cerrada correctamente");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// Event listeners para cancelar popups
cancelarPopupCategoria.addEventListener("click", () =>
  ocultarPopup("popup-categoria")
);
cancelarPopupProducto.addEventListener("click", () =>
  ocultarPopup("popup-producto")
);

// Función para previsualizar y manejar imágenes
window.previsualizarImagen = (inputId, containerId) => {
  const file = document.getElementById(inputId).files[0];
  const container = document.getElementById(containerId);
  if (file) {
    const url = URL.createObjectURL(file);
    container.innerHTML = `
      <img src="${url}" alt="Previsualización" class="foto-previa">
      <span class="eliminar-foto" onclick="eliminarImagen('${containerId}', '${inputId}')">X</span>
    `;
  }
};

window.eliminarImagen = (containerId, inputId) => {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="foto-selector" onclick="document.getElementById('${inputId}').click()">
      <span class="upload-icon">↑</span>
    </div>
  `;
  document.getElementById(inputId).value = "";
};

// Función para manejar la visibilidad de categorías
window.toggleVisibilidadCategoria = async (id) => {
  const categoriaRef = doc(db, "categorias", id);
  const categoriaSnap = await getDoc(categoriaRef);
  if (categoriaSnap.exists()) {
    const visibilidad = categoriaSnap.data().visible !== false;
    const nuevoEstado = !visibilidad;
    await updateDoc(categoriaRef, { visible: nuevoEstado });
    const imgElement = document.querySelector(
      `.categoria-item[data-id="${id}"] .visibilidad-img`
    );
    imgElement.src = nuevoEstado ? "/img/mostrado.png" : "/img/ocultado.png";
    // No recargamos aquí para mantener las categorías visibles en el panel de administración
  }
};

// Función para manejar la visibilidad de productos
window.toggleVisibilidadProducto = async (id) => {
  const productoRef = doc(db, "producto", id);
  const productoSnap = await getDoc(productoRef);
  if (productoSnap.exists()) {
    const visibilidad = productoSnap.data().visible !== false;
    const nuevoEstado = !visibilidad;
    await updateDoc(productoRef, { visible: nuevoEstado });
    const imgElement = document.querySelector(
      `.producto-item[data-id="${id}"] .visibilidad-img`
    );
    imgElement.src = nuevoEstado ? "/img/mostrado.png" : "/img/ocultado.png";
    // No recargamos aquí para mantener los productos visibles en el panel de administración
  }
};
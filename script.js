import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elemento contenedor de categorías
const categoriasContainer = document.getElementById("categorias-container");

// Bolsa de productos
let bolsa = [];
const barraFlotante = document.getElementById("barra-pedido");
const ventanaBolsa = document.getElementById("ventana-bolsa");
const listaProductos = document.getElementById("lista-productos");
const totalBolsa = document.getElementById("total-bolsa");
const totalBolsaBarra = document.getElementById("total-bolsa-barra");
const contadorBolsaBarra = document.getElementById("contador-bolsa-barra");
const finalizarPedido = document.getElementById("finalizar-pedido");
const hacerPedido = document.getElementById("hacer-pedido");
const cerrarBolsa = document.getElementById("cerrar-bolsa");
const numeroMesa = document.getElementById("numero-mesa");

// Función para formatear números al estilo colombiano (COP 120.000,00)
function formatearMonto(monto) {
  return monto.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Función para animar el producto hacia la barra flotante
function animarProductoABolsa(productoElement, barraFlotante) {
  const productoAnimado = document.createElement("div");
  productoAnimado.classList.add("producto-animado");

  const productoRect = productoElement.getBoundingClientRect();
  const barraRect = barraFlotante.getBoundingClientRect();

  const endX = barraRect.left - productoRect.left + 40;
  const endY = barraRect.top - productoRect.top + 20;

  productoAnimado.style.setProperty("--endX", `${endX}px`);
  productoAnimado.style.setProperty("--endY", `${endY}px`);

  productoAnimado.style.left = `${productoRect.left}px`;
  productoAnimado.style.top = `${productoRect.top}px`;

  document.body.appendChild(productoAnimado);

  productoAnimado.addEventListener("animationend", () => {
    productoAnimado.remove();
  });
}

// Evento para añadir productos a la bolsa
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("añadir-bolsa")) {
    const productoId = e.target.getAttribute("data-producto-id");
    const productoNombre = e.target.getAttribute("data-producto-nombre");
    const productoPrecio = parseFloat(
      e.target.getAttribute("data-producto-precio")
    );

    const productoElement = e.target.closest(".producto");

    animarProductoABolsa(productoElement, barraFlotante);

    añadirProductoABolsa(productoId, productoNombre, productoPrecio);
  }
});

// Función para añadir un producto a la bolsa
function añadirProductoABolsa(productoId, productoNombre, productoPrecio) {
  const idUnico = `${productoId}-${productoNombre}`;
  const productoExistente = bolsa.find((p) => p.id === idUnico);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    bolsa.push({
      id: idUnico,
      nombre: productoNombre,
      precio: productoPrecio,
      cantidad: 1,
    });
  }

  actualizarVentanaBolsa();
}

// Función para aumentar la cantidad de un producto en la bolsa
function aumentarCantidad(index) {
  if (index >= 0 && index < bolsa.length) {
    bolsa[index].cantidad += 1;
    actualizarVentanaBolsa();
  }
}

// Función para eliminar un producto de la bolsa
function eliminarProductoDeBolsa(index) {
  if (index >= 0 && index < bolsa.length) {
    if (bolsa[index].cantidad > 1) {
      bolsa[index].cantidad -= 1;
    } else {
      bolsa.splice(index, 1);
    }
    actualizarVentanaBolsa();
  }
}

// Función para actualizar la ventana de la bolsa y la barra flotante
function actualizarVentanaBolsa() {
  listaProductos.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  if (bolsa.length === 0) {
    listaProductos.innerHTML = `<tr><td colspan="5">Tu bolsa está vacía.</td></tr>`;
  } else {
    const tabla = document.createElement("table");
    tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${bolsa
                  .map((producto, index) => {
                    const subtotal = producto.precio * producto.cantidad;
                    total += subtotal;
                    cantidadTotal += producto.cantidad;
                    return `
                        <tr>
                            <td>${producto.nombre}</td>
                            <td>
                                <button class="flecha-disminuir" data-index="${index}">-</button>
                                ${producto.cantidad}
                                <button class="flecha-aumentar" data-index="${index}">+</button>
                            </td>
                            <td>COP ${formatearMonto(subtotal)}</td>
                        </tr>
                    `;
                  })
                  .join("")}
            </tbody>
        `;
    listaProductos.appendChild(tabla);

    // Añadir eventos a las flechas
    document.querySelectorAll(".flecha-disminuir").forEach((boton) => {
      boton.addEventListener("click", () => {
        const index = parseInt(boton.getAttribute("data-index"));
        eliminarProductoDeBolsa(index);
      });
    });

    document.querySelectorAll(".flecha-aumentar").forEach((boton) => {
      boton.addEventListener("click", () => {
        const index = parseInt(boton.getAttribute("data-index"));
        aumentarCantidad(index);
      });
    });
  }

  totalBolsa.textContent = `COP ${formatearMonto(total)}`;
  totalBolsaBarra.textContent = `COP ${formatearMonto(total)}`;
  contadorBolsaBarra.textContent = cantidadTotal;
}

// Evento para abrir la ventana de la bolsa al hacer clic en la barra flotante
barraFlotante.addEventListener("click", () => {
  ventanaBolsa.style.display = "flex";
});

// Evento para cerrar la ventana de la bolsa
cerrarBolsa.addEventListener("click", () => {
  ventanaBolsa.style.display = "none";
});

// Evento para abrir la ventana de la bolsa al hacer clic en "Ir al pedido"
finalizarPedido.addEventListener("click", () => {
  ventanaBolsa.style.display = "flex";
});

// Evento para hacer el pedido por WhatsApp
hacerPedido.addEventListener("click", () => {
  if (bolsa.length === 0) {
    alert("Tu bolsa está vacía.");
    return;
  }

  const numeroMesaValor = numeroMesa.value || "No especificado";
  const mensaje = bolsa
    .map(
      (producto) =>
        `${producto.nombre} (x${producto.cantidad}) - COP ${formatearMonto(
          producto.precio * producto.cantidad
        )}`
    )
    .join("%0A");
  const total = bolsa.reduce(
    (sum, producto) => sum + producto.precio * producto.cantidad,
    0
  );
  const urlWhatsApp = `https://wa.me/+573174653280?text=Hola, quiero hacer el siguiente pedido para la mesa ${numeroMesaValor}:%0A${mensaje}%0ATotal: COP ${formatearMonto(
    total
  )}`;

  window.open(urlWhatsApp, "_blank");
});

// Función para cargar las categorías y productos desde Firestore
async function cargarMenu() {
  categoriasContainer.innerHTML = "";

  try {
    const categoriasSnapshot = await getDocs(collection(db, "categorias"));
    const productosSnapshot = await getDocs(collection(db, "producto"));
    const productosMap = {};

    productosSnapshot.forEach((productoDoc) => {
      const producto = productoDoc.data();
      if (producto.visible !== false) { // Solo incluir productos visibles
        if (!productosMap[producto.categoriaId]) {
          productosMap[producto.categoriaId] = [];
        }
        productosMap[producto.categoriaId].push(producto);
      }
    });

    categoriasSnapshot.forEach((categoriaDoc) => {
      const categoria = categoriaDoc.data();
      const categoriaId = categoriaDoc.id;
      if (categoria.visible !== false) { // Solo incluir categorías visibles
        const productos = productosMap[categoriaId] || [];

        const contenedorGeneral = document.createElement("div");
        contenedorGeneral.classList.add("contenedor-general");

        contenedorGeneral.innerHTML = `
                <div class="categoria-contenedor">
                    <div class="categoria-imagen">
                        <img src="${categoria.foto}" alt="${
          categoria.nombre
        }" class="categoria-img">
                        <div class="categoria-titulo">${categoria.nombre}</div>
                    </div>
                </div>
                <div class="categoria-productos">
                    <div class="swiper-container">
                        <div class="swiper-wrapper">
                            ${productos
                              .map(
                                (producto) => `
                                    <div class="swiper-slide">
                                        <div class="producto">
                                            <img src="${producto.foto}" alt="${
                                  producto.nombre
                                }" class="foto-producto">
                                            <h3>${producto.nombre}</h3>
                                            <p class="ingredientes">${producto.ingredientes.join(
                                              ", "
                                            )}</p>
                                            <div class="info-final">
                                                <p class="precio">COP ${formatearMonto(
                                                  producto.precio
                                                )}</p>
                                                <button class="añadir-bolsa" 
                                                        data-producto-id="${
                                                          producto.id
                                                        }" 
                                                        data-producto-nombre="${
                                                          producto.nombre
                                                        }" 
                                                        data-producto-precio="${
                                                          producto.precio
                                                        }">
                                                    Añadir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `
                              )
                              .join("")}
                        </div>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>
            `;

        categoriasContainer.appendChild(contenedorGeneral);

        new Swiper(contenedorGeneral.querySelector(".swiper-container"), {
          spaceBetween: 1,
          slidesPerView: 1,
          centeredSlides: true,
          loop: true,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          autoplay: {
            delay: 12000,
            disableOnInteraction: false,
          },
          on: {
            progress: function () {
              const slides = this.slides;
              for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                const progress = slide.progress;
                const scale = 1 - Math.abs(progress) * 0.2;
                const opacity = 1 - Math.abs(progress) * 0.5;
                slide.style.transform = `scale(${scale})`;
                slide.style.opacity = opacity;
              }
            },
            setTransition: function (transition) {
              const slides = this.slides;
              for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                slide.style.transitionDuration = `${transition}ms`;
              }
            },
          },
        });
      }
    });
  } catch (error) {
    console.error("Error al cargar el menú:", error);
  }
}

// Función debounce para optimizar el rendimiento
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para ajustar dinámicamente las alturas
function ajustarAlturasDinamicas() {
  const slides = document.querySelectorAll(".swiper-slide");
  let maxHeight = 0;

  slides.forEach((slide) => {
    const producto = slide.querySelector(".producto");
    if (producto) {
      const height = producto.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    }
  });

  slides.forEach((slide) => {
    slide.style.height = `${maxHeight}px`;
    const producto = slide.querySelector(".producto");
    if (producto) {
      producto.style.height = `${maxHeight}px`;
    }
  });

  const swiperWrapper = document.querySelector(".swiper-wrapper");
  if (swiperWrapper) {
    swiperWrapper.style.height = `${maxHeight}px`;
  }

  const swiperContainer = document.querySelector(".swiper-container");
  if (swiperContainer) {
    swiperContainer.style.height = `${maxHeight + 40}px`;
  }
}

// Ejecutar la función después de cargar el menú y cuando la página esté lista
document.addEventListener("DOMContentLoaded", () => {
  cargarMenu().then(() => {
    ajustarAlturasDinamicas();
    window.addEventListener("resize", debounce(ajustarAlturasDinamicas, 250));
  });
});
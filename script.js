const figurasDisponibles = [
  { clase: "triangulo", categoria: "3 lados" },
  { clase: "cuadrado", categoria: "4 lados" },
  { clase: "pentagono", categoria: "5 lados" },
  { clase: "hexagono", categoria: "6 lados" },
  { clase: "heptagono", categoria: "7 lados" },
  { clase: "octagono", categoria: "8 lados" },
  { clase: "decano", categoria: "10 lados" },
  { clase: "icosagono", categoria: "20 lados" },
  { clase: "circulo", categoria: "curva" }
];

let puntos = 0;
let tiempoRestante = 60;
let temporizador;
let nivel = 1;
const MAX_NIVEL = 5;

let vidas = 2;

const zonaFiguras = document.getElementById("zona-figuras");
const zonasClasificacion = document.getElementById("zonas-clasificacion");
const mensaje = document.getElementById("mensaje");
const score = document.getElementById("score");
const timerNumero = document.getElementById("tiempo-numero");
const barraTiempo = document.getElementById("barra-tiempo");
const reiniciarBtn = document.getElementById("reiniciarBtn");
const mejorPuntajeDiv = document.getElementById("mejor-puntaje");
const nivelDiv = document.getElementById("nivel");
const vidasIconos = document.getElementById("vidas-iconos");

// Sonidos
const sonidoAcertar = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
const sonidoError = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
const sonidoFinal = new Audio('https://actions.google.com/sounds/v1/cartoon/clang.ogg');

function guardarMejorPuntaje(puntos) {
  const mejor = localStorage.getItem("mejorPuntaje");
  if (!mejor || puntos > parseInt(mejor)) {
    localStorage.setItem("mejorPuntaje", puntos);
    return puntos;
  }
  return parseInt(mejor);
}

function cargarMejorPuntaje() {
  const mejor = localStorage.getItem("mejorPuntaje");
  if (mejor) {
    mejorPuntajeDiv.textContent = `Mejor puntaje: ${mejor}`;
  } else {
    mejorPuntajeDiv.textContent = `Mejor puntaje: 0`;
  }
}

function iniciarTemporizador() {
  tiempoRestante = 60;
  timerNumero.textContent = tiempoRestante;
  barraTiempo.firstElementChild.style.width = `100%`;
  clearInterval(temporizador);
  temporizador = setInterval(() => {
    tiempoRestante--;
    timerNumero.textContent = tiempoRestante;
    barraTiempo.firstElementChild.style.width = `${(tiempoRestante / 60) * 100}%`;
    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      mensaje.textContent = "⏳ Tiempo agotado. Fin del juego.";
      mensaje.style.color = "red";
      desactivarFiguras();
      sonidoFinal.play();
      reiniciarBtn.disabled = false;
    }
  }, 1000);
}

function desactivarFiguras() {
  document.querySelectorAll(".figura").forEach(f => f.setAttribute("draggable", false));
}

function getColorRandom() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `rgb(${r},${g},${b})`;
}

function actualizarVidas() {
  vidasIconos.textContent = "❤️".repeat(vidas);
}

function perderVida() {
  vidas--;
  actualizarVidas();
  if (vidas <= 0) {
    mensaje.textContent = "💀 Te quedaste sin vidas. Fin del juego.";
    mensaje.style.color = "red";
    desactivarFiguras();
    clearInterval(temporizador);
    sonidoFinal.play();
    reiniciarBtn.disabled = false;
  }
}

function crearZona(categoria) {
  const div = document.createElement("div");
  div.classList.add("zona");
  div.dataset.categoria = categoria;
  div.textContent = categoria;
  div.addEventListener("dragover", e => {
    e.preventDefault();
    div.classList.add("over");
  });
  div.addEventListener("dragleave", e => {
    div.classList.remove("over");
  });
  div.addEventListener("drop", e => {
    e.preventDefault();
    div.classList.remove("over");
    const id = e.dataTransfer.getData("text/plain");
    const figura = document.getElementById(id);
    if (!figura) return;
    if (figura.dataset.categoria === div.dataset.categoria) {
      puntos++;
      sonidoAcertar.play();
      mensaje.textContent = "✅ Correcto!";
      mensaje.style.color = "green";
      // Remueve figura del DOM para no volver a usarla
      figura.remove();
    } else {
      sonidoError.play();
      mensaje.textContent = "❌ Incorrecto!";
      mensaje.style.color = "red";
      perderVida();
    }
    score.textContent = `Aciertos: ${puntos}`;
    nivelDiv.textContent = `Nivel: ${nivel}`;

    if (puntos > 0 && puntos % 5 === 0 && nivel < MAX_NIVEL) {
      nivel++;
      mensaje.textContent = `🎉 Nivel ${nivel} alcanzado!`;
      generarFiguras(nivel + 2, true); // agregar más figuras con nivel aumentado
    }
  });
  return div;
}

function crearFigura(clase, categoria) {
  const div = document.createElement("div");
  div.classList.add("figura", clase);
  div.dataset.categoria = categoria;
  div.id = `figura-${Math.random().toString(36).substr(2, 9)}`;
  div.style.backgroundColor = getColorRandom();
  div.setAttribute("draggable", true);

  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", div.id);
  });

  return div;
}

function generarFiguras(cantidad, acumular = false) {
  if (!acumular) zonaFiguras.innerHTML = "";
  // Agregar figuras nuevas (puede haber repetidas)
  for (let i = 0; i < cantidad; i++) {
    const idx = Math.floor(Math.random() * figurasDisponibles.length);
    const figuraData = figurasDisponibles[idx];
    const figura = crearFigura(figuraData.clase, figuraData.categoria);
    zonaFiguras.appendChild(figura);
  }
}

function iniciarJuego() {
  puntos = 0;
  nivel = 1;
  vidas = 2;
  actualizarVidas();
  score.textContent = `Aciertos: ${puntos}`;
  nivelDiv.textContent = `Nivel: ${nivel}`;
  mensaje.textContent = "";
  reiniciarBtn.disabled = true;
  zonaFiguras.innerHTML = "";
  generarFiguras(nivel + 2);
  iniciarTemporizador();
}

function setupZonas() {
  zonasClasificacion.innerHTML = "";
  const categorias = [...new Set(figurasDisponibles.map(f => f.categoria))];
  categorias.forEach(cat => {
    const zona = crearZona(cat);
    zonasClasificacion.appendChild(zona);
  });
}

reiniciarBtn.addEventListener("click", () => {
  clearInterval(temporizador);
  iniciarJuego();
});

window.onload = () => {
  cargarMejorPuntaje();
  setupZonas();
  iniciarJuego();
};

window.onload = () => {
  cargarMejorPuntaje();
  setupZonas();
  iniciarJuego();
};

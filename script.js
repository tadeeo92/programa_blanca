const zonaFiguras = document.getElementById("zona-figuras");
const zonasClasificacion = document.getElementById("zonas-clasificacion");
const score = document.getElementById("score");
const nivelDiv = document.getElementById("nivel");
const mensaje = document.getElementById("mensaje");
const reiniciarBtn = document.getElementById("reiniciar");
const vidasIconos = document.getElementById("vidas");
const mejorPuntajeDiv = document.getElementById("mejor-puntaje");
const barraTiempo = document.getElementById("barra-tiempo");
const tiempoTexto = document.getElementById("tiempo-texto");

let puntos = 0;
let nivel = 1;
let vidas = 2;
let mejorPuntaje = 0;
let tiempo = 60;
let temporizador;

const figurasDisponibles = Array.from({ length: 18 }, (_, i) => ({
  clase: `lados-${i + 3}`,
  categoria: `${i + 3} lados`
}));

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
  div.addEventListener("dragleave", () => div.classList.remove("over"));
  div.addEventListener("drop", e => {
    e.preventDefault();
    div.classList.remove("over");
    const id = e.dataTransfer.getData("text/plain");
    const figura = document.getElementById(id);
    if (!figura) return;
    if (figura.dataset.categoria === div.dataset.categoria) {
      puntos++;
      mensaje.textContent = "✅ Correcto!";
      mensaje.style.color = "green";
      figura.remove();
      revisarFinRonda();
    } else {
      mensaje.textContent = "❌ Incorrecto!";
      mensaje.style.color = "red";
      perderVida();
    }
    score.textContent = `Aciertos: ${puntos}`;
    nivelDiv.textContent = `Nivel: ${nivel}`;
    guardarMejorPuntaje();
  });
  return div;
}

function crearFigura(clase, categoria) {
  const div = document.createElement("div");
  div.classList.add("figura");
  div.style.clipPath = generarPoligono(clase);
  div.style.backgroundColor = getColorRandom();
  div.dataset.categoria = categoria;
  div.id = `fig-${Math.random().toString(36).substr(2, 9)}`;
  div.setAttribute("draggable", true);
  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", div.id);
  });
  return div;
}

function generarPoligono(clase) {
  const lados = parseInt(clase.split("-")[1]);
  const puntos = [];
  for (let i = 0; i < lados; i++) {
    const ang = (i * 2 * Math.PI) / lados;
    const x = 50 + 45 * Math.cos(ang);
    const y = 50 + 45 * Math.sin(ang);
    puntos.push(`${x}% ${y}%`);
  }
  return `polygon(${puntos.join(",")})`;
}

function generarFiguras(cantidad) {
  for (let i = 0; i < cantidad; i++) {
    const figura = figurasDisponibles[Math.floor(Math.random() * figurasDisponibles.length)];
    zonaFiguras.appendChild(crearFigura(figura.clase, figura.categoria));
  }
}

function iniciarJuego() {
  puntos = 0;
  nivel = 1;
  vidas = 2;
  actualizarVidas();
  score.textContent = "Aciertos: 0";
  nivelDiv.textContent = "Nivel: 1";
  mensaje.textContent = "";
  zonaFiguras.innerHTML = "";
  generarFiguras(4);
  iniciarTemporizador();
  reiniciarBtn.disabled = true;
}

function revisarFinRonda() {
  if (zonaFiguras.children.length === 0 && vidas > 0) {
    nivel++;
    mensaje.textContent = `🎉 Nivel ${nivel} alcanzado!`;
    generarFiguras(nivel + 3);
    nivelDiv.textContent = `Nivel: ${nivel}`;
  }
}

function setupZonas() {
  zonasClasificacion.innerHTML = "";
  const categorias = [...new Set(figurasDisponibles.map(f => f.categoria))];
  categorias.forEach(cat => {
    zonasClasificacion.appendChild(crearZona(cat));
  });
}

function iniciarTemporizador() {
  tiempo = 60;
  barraTiempo.style.width = "100%";
  tiempoTexto.textContent = tiempo;
  clearInterval(temporizador);
  temporizador = setInterval(() => {
    tiempo--;
    tiempoTexto.textContent = tiempo;
    barraTiempo.style.width = `${(tiempo / 60) * 100}%`;
    if (tiempo <= 0) {
      perderVida();
      tiempo = 60;
    }
  }, 1000);
}

function guardarMejorPuntaje() {
  if (puntos > mejorPuntaje) {
    mejorPuntaje = puntos;
    localStorage.setItem("mejorPuntaje", mejorPuntaje);
    mejorPuntajeDiv.textContent = `Mejor: ${mejorPuntaje}`;
  }
}

function cargarMejorPuntaje() {
  mejorPuntaje = parseInt(localStorage.getItem("mejorPuntaje")) || 0;
  mejorPuntajeDiv.textContent = `Mejor: ${mejorPuntaje}`;
}

function desactivarFiguras() {
  [...zonaFiguras.children].forEach(f => f.setAttribute("draggable", false));
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

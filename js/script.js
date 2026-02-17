/* --- FORZAR SCROLL ARRIBA AL RECARGAR --- */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* Referencias nuevas */
const outroScreen = document.getElementById('outro')
const outroTextElement = document.getElementById('outro-text')
const replayBtn = document.getElementById('replayBtn')

/* Textos que saldrán al final (puedes cambiarlos) */
const OUTRO_MESSAGES = [
  "¡Gracias por ver!",
  "ZOO DAW2"
]

let outroPlayed = false // Para que no se repita cada vez que haces scroll
/* Referencias al DOM */
const scene = document.querySelector(".scene")
const buttons = document.querySelector(".buttons")
const displayName = document.querySelector(".name")
const signature = document.querySelector(".signature")

/* --- CONFIGURACIÓN DE DATOS --- */
const SETS = {
  daw: [13, "", "100, 200, 250"],
  logo: [37, "IES José Mor de Fuentes", "125,219,228"],
  ori: [32, "Abel Oriach - Slowloris", "104,95,184"],
  nes: [22, "Néstor Aísa - Zorro Ártico", "124,189,109"],
  maks: [29, "Maksym Hrynenko - Murciélago", "229,112,240"],
  rana: [30, "Marcos Martel - Rana", "65,211,174"],
  faro: [29, "Alberto Faro - Koala", "214,204,144"],
  uriol: [31, "Javier Uriol - Pingüino", "224,219,168"],
  ezq: [35, "Adrian Ezquerra - Tucán", "125,219,228"],
  jimenez: [35, "Adrián Jiménez - Cocodrilo", "240,241,124"],
  karla: [35, "Karla Gutiérrez- Llamicornio", "104,95,184"],
  fofana: [40, "Founeke Fofana - Camaleón", "141,221,255"],
  ped: [30, "Pedro José Torres - Perro", "141,221,255"],
  mach: [50, "Javier Machado - Colibrí", "141,221,255"],
  suri: [100, "Modesto Sierra - Suricato", "141,221,255"]
}

/* Constantes */
const C = 0, N = 1, B = 2 

const HIDDEN_CLIP = "polygon(50% 50%, 50% 50%, 50% 50%)"
const keys = Object.keys(SETS)
const MAX = Math.max(...Object.values(SETS).map((s) => s[C]))

// Curva de animación elástica (rebote)
const ELASTIC_EASE = "cubic-bezier(0.68, -0.6, 0.32, 1.6)"

/* --- ARREGLO 1: ALTURA DINÁMICA --- */
document.body.style.height = `calc(100vh * ${keys.length})`

let currentSet = null

/* 1. Crear Pool de Triángulos */
const tris = Array.from({ length: MAX }, (_, i) => {
  const t = document.createElement("div")
  t.className = "tri"
  t.dataset.i = i + 1
  t.style.transformOrigin = "center center"
  scene.appendChild(t)
  return t
})

/* 2. Animar Fondo (Gradiente Radial) */
function animateGradient(from, to, steps = 60) {
  const fromArr = from.split(",").map(Number)
  const toArr = to.split(",").map(Number)
  let stepCount = 0

  function step() {
    const t = stepCount / steps
    const color = fromArr.map((v, i) => Math.round(v + (toArr[i] - v) * t))

    document.body.style.background = `radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(${color.join(",")}, 1))`

    stepCount++
    if (stepCount <= steps) requestAnimationFrame(step)
  }

  step()
}

/* 3. Lógica Principal: Aplicar Set */
function applySet(name) {
  if (name === currentSet) return

  const previousColor = currentSet ? SETS[currentSet][B] : "224,219,168"
  currentSet = name
  const set = SETS[name]
  const count = set[C]

  // --- TEXTO LENTO ---
  displayName.style.opacity = 0

  setTimeout(() => {
    displayName.innerText = set[N]
    displayName.style.opacity = 1
  }, 1000)

  // Animar fondo
  animateGradient(previousColor, set[B], 60)

  // --- TRANSICIÓN ESPECTACULAR ---
  tris.forEach((tri) => {
    const i = +tri.dataset.i

    const randomDelay = Math.random() * 400
    const randomDuration = 800 + Math.random() * 600

    tri.style.transition = `
      all ${randomDuration}ms ${ELASTIC_EASE} ${randomDelay}ms,
      opacity ${randomDuration / 2}ms ease ${randomDelay}ms
    `
    if (i <= count) {
      // --- APARECER ---
      const num = String(i).padStart(2, "0")
      tri.style.opacity = "1"
      tri.style.background = `var(--tri${num}-${name}-bg)`
      tri.style.clipPath = `var(--tri${num}-${name}-polygon)`
    } else {
      tri.style.opacity = "0"
      tri.style.background = "transparent"
      tri.style.clipPath = HIDDEN_CLIP
    }
  })
}

/* 4. Auto-Scroll Controlado (CORREGIDO) */
const autoBtn = document.getElementById("autoScrollBtn")
let autoIndex = 0
let autoInterval = null
let isPlaying = false

function startAutoScroll() {
  if (autoInterval) clearInterval(autoInterval)

  if (isPlaying) {
    autoInterval = setInterval(() => {

      // CAMBIO IMPORTANTE: Comprobar si hemos llegado al final
      if (autoIndex < keys.length - 1) {
        // Si NO es el último, avanzamos
        autoIndex++
        window.scrollTo({
          top: window.innerHeight * autoIndex,
          behavior: "smooth",
        })
      } else {
        // Si ES el último, paramos el auto-scroll
        isPlaying = false
        clearInterval(autoInterval)

        // Restauramos el botón a su estado original
        autoBtn.innerText = "▶ REPRODUCIR"
        autoBtn.classList.remove("active")
      }

    }, 4000) // 4 segundos por animal
  }
}

autoBtn.addEventListener("click", () => {
  isPlaying = !isPlaying

  if (isPlaying) {
    // Si estamos en el final y le damos a play, reiniciamos desde el principio
    if (Math.ceil(window.scrollY) >= Math.floor(document.body.scrollHeight - window.innerHeight)) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      autoIndex = 0
    } else {
      autoIndex = Math.min(Math.floor(window.scrollY / window.innerHeight), keys.length - 1)
    }

    autoBtn.innerText = "⏸ PAUSE"
    autoBtn.classList.add("active")
    startAutoScroll()
  } else {
    autoBtn.innerText = "▶ REPRODUCIR"
    autoBtn.classList.remove("active")
    clearInterval(autoInterval)
  }
})


/* Función para reproducir la secuencia final */
async function playOutroSequence() {
  if (outroPlayed) return // Si ya salió, no hacemos nada
  outroPlayed = true

  // 1. Mostrar pantalla oscura
  outroScreen.classList.add('active')

  // 2. Reproducir cada frase con promesas para controlar los tiempos
  for (const text of OUTRO_MESSAGES) {
    // Cambiar texto
    outroTextElement.innerText = text

    // Fade In (Aparece)
    outroTextElement.classList.add('visible')
    await new Promise(r => setTimeout(r, 2000)) // Leer durante 2 segundos

    // Fade Out (Desaparece)
    outroTextElement.classList.remove('visible')
    await new Promise(r => setTimeout(r, 800)) // Esperar 0.8s antes del siguiente
  }

  // 3. Mostrar botón de reiniciar al final
  replayBtn.classList.remove('hidden')
  replayBtn.style.opacity = 0
  setTimeout(() => replayBtn.style.opacity = 1, 100)
}

/* Función para reiniciar */
replayBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  outroScreen.classList.remove('active')
  replayBtn.classList.add('hidden')

  // Reseteamos la variable para que pueda volver a salir si bajan de nuevo
  setTimeout(() => { outroPlayed = false }, 2000)
})


/* 5. Listener de Scroll */
function onScroll() {
  const index = Math.min(Math.floor(window.scrollY / window.innerHeight), keys.length - 1)

  if (keys[index] !== currentSet) {
    applySet(keys[index])
  }

  signature.style.opacity = index === 1 ? 0.9 : 0

  if (isPlaying) {
    autoIndex = index
  }

  /* --- NUEVO: DETECTAR EL FINAL --- */
  if (index === keys.length - 1) {
    setTimeout(() => {
      if (Math.min(Math.floor(window.scrollY / window.innerHeight), keys.length - 1) === keys.length - 1) {
        playOutroSequence()
      }
    }, 4000)
  }
}

window.addEventListener("scroll", onScroll, { passive: true })

/* Inicialización */
/* --- INICIALIZACIÓN CONTROLADA --- */

// Referencias a la intro
const introScreen = document.getElementById('intro')
const startButton = document.getElementById('startBtn')

// Función para iniciar la experiencia
function startExperience() {
  // 1. Ocultar la pantalla de intro
  introScreen.classList.add('hidden')

  // 2. Esperar un poco (500ms) y lanzar el primer animal (DAW)
  setTimeout(() => {
    applySet(keys[0])
  }, 500)
}

// Evento click en el botón
startButton.addEventListener('click', startExperience)
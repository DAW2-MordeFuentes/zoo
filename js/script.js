
/* =========================================================
   CONFIGURACIÓN INICIAL - Restaurar scroll al inicio
   ========================================================= */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

/* =========================================================
   REFERENCIAS AL DOM
   ========================================================= */
const scene       = document.querySelector(".scene")
const buttons     = document.querySelector(".buttons")
const displayName = document.querySelector(".name")
const signature   = document.querySelector(".signature")
const autoBtn     = document.getElementById("autoScrollBtn")
const introScreen = document.getElementById('intro')
const startButton = document.getElementById('startBtn')
const outroScreen = document.getElementById('outro')
const outroTextEl = document.getElementById('outro-text')
const replayBtn   = document.getElementById('replayBtn')

/* =========================================================
   DATOS Y CONSTANTES
   ========================================================= */

/** Mensajes mostrados en la pantalla final */
const OUTRO_MESSAGES = [
  "¡Gracias por ver!",
  "ZOO DAW2"
]

/** Índices semánticos para acceder a los valores de cada set */
const C = 0  // Count  (número de triángulos)
const N = 1  // Name   (nombre a mostrar)
const B = 2  // Bg     (color de fondo en RGB)

/** Clip-path invisible (punto) usado para ocultar triángulos */
const HIDDEN_CLIP = "polygon(50% 50%, 50% 50%, 50% 50%)"

/** Curva de animación elástica con rebote */
const ELASTIC_EASE = "cubic-bezier(0.68, -0.6, 0.32, 1.6)"

/** Definición de cada "set": [nº triángulos, nombre, color RGB fondo] */
const SETS = {
  daw:     [13,  "",                          "100, 200, 250"],
  logo:    [64,  "IES José Mor de Fuentes",   "125,219,228"],
  ori:     [32,  "Abel Oriach - Slowloris",   "104,95,184"],
  nes:     [22,  "Néstor Aísa - Zorro Ártico","124,189,109"],
  maks:    [29,  "Maksym Hrynenko - Murciélago","229,112,240"],
  rana:    [30,  "Marcos Martel - Rana",      "65,211,174"],
  faro:    [29,  "Alberto Faro - Koala",      "214,204,144"],
  uriol:   [31,  "Javier Uriol - Pingüino",   "224,219,168"],
  ezq:     [35,  "Adrian Ezquerra - Tucán",   "125,219,228"],
  jimenez: [35,  "Adrián Jiménez - Cocodrilo","240,241,124"],
  karla:   [35,  "Karla Gutiérrez- Llamicornio","104,95,184"],
  fofana:  [40,  "Founeke Fofana - Camaleón", "141,221,255"],
  ped:     [30,  "Pedro José Torres - Perro", "141,221,255"],
  mach:    [50,  "Javier Machado - Colibrí",  "141,221,255"],
  suri:    [100, "Modesto Sierra - Suricato", "141,221,255"]
}

const keys = Object.keys(SETS)
const MAX  = Math.max(...Object.values(SETS).map(s => s[C]))

/* =========================================================
   ESTADO GLOBAL
   ========================================================= */
let currentSet  = null   // Key del set actualmente visible
let outroPlayed = false  // Evita que el outro se repita en cada scroll
let autoIndex   = 0      // Índice del set actual en el auto-scroll
let autoInterval = null  // Referencia al intervalo del auto-scroll
let isPlaying   = false  // Estado del reproductor automático

/* =========================================================
   INICIALIZACIÓN DE LA PÁGINA
   ========================================================= */

/** Ajusta la altura total del body para que cada set ocupe un viewport completo */
document.body.style.height = `calc(100vh * ${keys.length})`

/* =========================================================
   CREACIÓN DE TRIÁNGULOS
   Genera un pool máximo de triángulos reutilizables en el DOM
   ========================================================= */
const tris = Array.from({ length: MAX }, (_, i) => {
  const t = document.createElement("div")
  t.className = "tri"
  t.dataset.i = i + 1
  t.style.transformOrigin = "center center"
  scene.appendChild(t)
  return t
})

/* =========================================================
   FUNCIONES
   ========================================================= */

/**
 * Anima el fondo del body con un gradiente radial que transiciona
 * suavemente de un color RGB a otro durante un número de pasos.
 *
 * @param {string} from  - Color origen en formato "R,G,B"
 * @param {string} to    - Color destino en formato "R,G,B"
 * @param {number} steps - Número de frames de la transición (default 60)
 */
function animateGradient(from, to, steps = 60) {
  const fromArr = from.split(",").map(Number)
  const toArr   = to.split(",").map(Number)
  let stepCount = 0

  function step() {
    const t     = stepCount / steps
    const color = fromArr.map((v, i) => Math.round(v + (toArr[i] - v) * t))
    document.body.style.background = `radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(${color.join(",")}, 1))`
    stepCount++
    if (stepCount <= steps) requestAnimationFrame(step)
  }

  step()
}

/**
 * Aplica un set de datos al escenario: cambia el nombre mostrado,
 * el color de fondo y activa/desactiva los triángulos correspondientes
 * con una animación elástica aleatoria. Evita re-renderizar si el set
 * ya está activo.
 *
 * @param {string} name - Key del set a aplicar (debe existir en SETS)
 */
function applySet(name) {
  if (name === currentSet) return

  const previousColor = currentSet ? SETS[currentSet][B] : "224,219,168"
  currentSet = name
  const set   = SETS[name]
  const count = set[C]

  // Fade out del nombre, cambia el texto y fade in
  displayName.style.opacity = 0
  setTimeout(() => {
    displayName.innerText  = set[N]
    displayName.style.opacity = 1
  }, 1000)

  animateGradient(previousColor, set[B], 60)

  // Activar/desactivar triángulos con delay y duración aleatorios
  tris.forEach(tri => {
    const i           = +tri.dataset.i
    const randomDelay    = Math.random() * 400
    const randomDuration = 800 + Math.random() * 600

    tri.style.transition = `
      all ${randomDuration}ms ${ELASTIC_EASE} ${randomDelay}ms,
      opacity ${randomDuration / 2}ms ease ${randomDelay}ms
    `

    if (i <= count) {
      const num = String(i).padStart(2, "0")
      tri.style.opacity    = "1"
      tri.style.background = `var(--tri${num}-${name}-bg)`
      tri.style.clipPath   = `var(--tri${num}-${name}-polygon)`
    } else {
      tri.style.opacity    = "0"
      tri.style.background = "transparent"
      tri.style.clipPath   = HIDDEN_CLIP
    }
  })
}

/**
 * Arranca el intervalo del auto-scroll. Cada 4 segundos avanza al
 * siguiente set haciendo scroll suave. Cuando llega al último set,
 * detiene el intervalo y restaura el botón a su estado inicial.
 */
function startAutoScroll() {
  if (autoInterval) clearInterval(autoInterval)

  if (isPlaying) {
    autoInterval = setInterval(() => {
      if (autoIndex < keys.length - 1) {
        autoIndex++
        window.scrollTo({ top: window.innerHeight * autoIndex, behavior: "smooth" })
      } else {
        isPlaying = false
        clearInterval(autoInterval)
        autoBtn.innerText = "▶ REPRODUCIR"
        autoBtn.classList.remove("active")
      }
    }, 4000)
  }
}

/**
 * Reproduce la secuencia de outro: oscurece la pantalla y muestra
 * cada mensaje de OUTRO_MESSAGES con fade in/out. Al terminar,
 * muestra el botón de reinicio. Solo se ejecuta una vez por sesión
 * de scroll (controlado por la flag `outroPlayed`).
 */
async function playOutroSequence() {
  if (outroPlayed) return
  outroPlayed = true

  outroScreen.classList.add('active')

  for (const text of OUTRO_MESSAGES) {
    outroTextEl.innerText = text
    outroTextEl.classList.add('visible')
    await new Promise(r => setTimeout(r, 2000))
    outroTextEl.classList.remove('visible')
    await new Promise(r => setTimeout(r, 800))
  }

  replayBtn.classList.remove('hidden')
  replayBtn.style.opacity = 0
  setTimeout(() => replayBtn.style.opacity = 1, 100)
}

/**
 * Inicia la experiencia: oculta la pantalla de intro y lanza
 * el primer set (daw) tras una pequeña pausa de 500ms.
 */
function startExperience() {
  introScreen.classList.add('hidden')
  setTimeout(() => applySet(keys[0]), 500)
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

/**
 * Controla el botón de auto-scroll: alterna entre play y pause.
 * Si se pulsa play al final del contenido, reinicia desde el principio.
 */
autoBtn.addEventListener("click", () => {
  isPlaying = !isPlaying

  if (isPlaying) {
    const atEnd = Math.ceil(window.scrollY) >= Math.floor(document.body.scrollHeight - window.innerHeight)
    if (atEnd) {
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

/**
 * Vuelve al inicio de la página, oculta la pantalla de outro y
 * resetea la flag `outroPlayed` tras la animación de scroll.
 */
replayBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  outroScreen.classList.remove('active')
  replayBtn.classList.add('hidden')
  setTimeout(() => { outroPlayed = false }, 2000)
})

/**
 * Listener principal de scroll: determina qué set corresponde a la
 * posición actual, lo aplica, controla la visibilidad de la firma y
 * lanza el outro cuando el usuario llega al último set.
 */
window.addEventListener("scroll", () => {
  const index = Math.min(Math.floor(window.scrollY / window.innerHeight), keys.length - 1)

  if (keys[index] !== currentSet) applySet(keys[index])

  signature.style.opacity = index === 1 ? 0.9 : 0

  if (isPlaying) autoIndex = index

  // Lanzar outro si llevamos 4s en el último set
  if (index === keys.length - 1) {
    setTimeout(() => {
      const stillAtEnd = Math.min(Math.floor(window.scrollY / window.innerHeight), keys.length - 1) === keys.length - 1
      if (stillAtEnd) playOutroSequence()
    }, 4000)
  }
}, { passive: true })

/* Iniciar al pulsar el botón de la intro */
startButton.addEventListener('click', startExperience)
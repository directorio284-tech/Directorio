<template>
  <div class="q-pa-md">
    <!-- Modal de Login para Administrador -->
    <q-dialog v-model="mostrarLogin" persistent>
      <Login @close="mostrarLogin = false" />
    </q-dialog>

    <!-- Encabezado -->
  <q-toolbar dense class="bg-primary text-white q-mb-md header-toolbar">
      <q-toolbar-title class="row items-center no-wrap">
        <span class="text-weight-medium">Directorio General</span>
        <q-badge color="secondary" rounded class="q-ml-sm">{{ lugaresFiltrados.length }}</q-badge>
      </q-toolbar-title>
      <q-space />
  <q-btn size="sm" flat round icon="login" @click="mostrarLogin = true" :aria-label="'Abrir login'" />
  <q-btn size="sm" flat round icon="search" @click="toggleBuscador" :aria-label="'Mostrar/ocultar buscador'" />
    </q-toolbar>

    <!-- Hero Banner -->
    <section class="hero-banner q-pa-md q-mb-lg">
      <div class="hero-content">
        <div class="text-subtitle2 text-weight-regular text-white text-uppercase letter-spaced q-mb-xs">
          Tu Directorio de Negocios
        </div>
        <div class="text-h4 text-weight-bold text-white line-tight q-mb-sm">
          Encuentra los mejores negocios cerca de ti
        </div>
        <div class="text-body1 text-white text-weight-regular q-mb-md hero-sub">
          Busca por nombre, tipo o ciudad y descubre opciones confiables.
        </div>

        <div class="row q-col-gutter-sm items-center hero-cta">
          <div class="col-12 col-md">
            <q-input v-model="busqueda" outlined dense color="white" :label="'¿Qué estás buscando?'
              " class="bg-white text-primary rounded-borders">
              <template #prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-btn color="secondary" unelevated icon="travel_explore" label="Explorar negocios" @click="scrollToResultados" />
          </div>
        </div>

  <div class="row q-gutter-xs q-mt-sm no-wrap scroll-x chip-row">
          <q-chip v-for="tipo in tiposNegocio.slice(0, 6)" :key="tipo" dense color="white" text-color="primary" clickable @click="tipoSeleccionado = tipo">
            {{ tipo }}
          </q-chip>
        </div>
      </div>
    </section>

    <!-- Filtros principales: Buscador + Ciudad -->
    <div class="row q-col-gutter-md q-mb-md" v-show="mostrarBuscador">
      <div class="col-12 col-md-7">
        <q-input
          v-model="busqueda"
          outlined
          debounce="300"
          label="Buscar hoteles, tiendas, restaurantes..."
          clearable
          dense
          color="primary"
          class="input-styled"
          :aria-label="'Buscar por texto'"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-5">
        <!-- Filtro por ciudad -->
        <q-select
          v-model="ciudadSeleccionada"
          :options="ciudades"
          label="Filtrar por ciudad"
          dense
          outlined
          color="primary"
          clearable
          use-input
          input-debounce="0"
          :aria-label="'Seleccionar ciudad'"
        >
          <template #prepend>
            <q-icon name="place" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Filtros secundarios: Tipo + Orden + Limpiar -->
    <div class="row q-col-gutter-md q-mb-lg items-center">
      <div class="col-12 col-md-8">
        <div class="row no-wrap scroll-x q-gutter-xs items-center chip-row">
          <div class="text-caption text-grey-7 q-mr-sm">Tipos:</div>
          <q-chip
            clickable
            outline
            color="primary"
            text-color="primary"
            icon="category"
            :selected="!tipoSeleccionado"
            @click="tipoSeleccionado = ''"
            dense
          >
            Todos
          </q-chip>
          <q-chip
            v-for="tipo in tiposNegocio"
            :key="tipo"
            clickable
            :outline="tipoSeleccionado !== tipo"
            color="primary"
            :text-color="tipoSeleccionado === tipo ? 'white' : 'primary'"
            :icon="tipoSeleccionado === tipo ? 'check' : 'sell'"
            :selected="tipoSeleccionado === tipo"
            @click="tipoSeleccionado = tipo"
            class="q-ma-none"
            dense
          >
            {{ tipo }}
          </q-chip>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="row items-center q-gutter-sm justify-end">
          <q-select
            v-model="ordenSeleccionado"
            :options="opcionesOrden"
            dense
            outlined
            label="Ordenar"
            color="primary"
            class="col"
            :aria-label="'Ordenar resultados'"
          />
          <q-btn flat color="negative" icon="restart_alt" label="Limpiar" @click="limpiarFiltros" />
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="cargando" class="row q-col-gutter-md">
      <div v-for="n in 8" :key="n" class="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3">
        <q-card class="fit">
          <q-skeleton height="160px" square />
          <q-card-section>
            <q-skeleton type="text" class="q-mb-sm" />
            <q-skeleton type="text" width="60%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

  <div v-else ref="resultadosRef">
      <div v-if="lugaresOrdenados.length === 0" class="q-pa-xl text-center text-grey-7">
        <q-icon name="travel_explore" size="64px" class="q-mb-md text-grey-5" />
        <div class="text-h6 q-mb-xs">Sin resultados</div>
        <div class="text-body2 q-mb-md">Intenta ajustar la búsqueda o limpia los filtros aplicados.</div>
        <q-btn color="primary" outline icon="filter_alt_off" label="Limpiar filtros" @click="limpiarFiltros" />
      </div>

      <div v-else class="row q-col-gutter-md items-stretch">
        <div
          v-for="lugar in lugaresOrdenados"
          :key="lugar._id"
          class="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3"
        >
          <CardLugar :lugar="lugar" class="fit" />
        </div>
      </div>
    </div>

    <!-- Bottom Banner -->
  <section class="bottom-banner q-pa-md q-mt-xl">
      <div class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <div class="text-subtitle2 text-white text-uppercase letter-spaced q-mb-xs">
            ¿Tienes un negocio?
          </div>
          <div class="text-h5 text-weight-bold text-white line-tight q-mb-sm">
            Súmate al directorio y llega a más clientes
          </div>
          <div class="text-body1 text-white hero-sub q-mb-md">
            Registra tu negocio y hazte visible en tu ciudad. Es rápido y práctico.
          </div>
          <div class="row q-gutter-sm q-mb-md benefits">
            <div class="col-auto text-white"><q-icon name="check_circle" size="20px" class="q-mr-xs" /> Perfil público</div>
            <div class="col-auto text-white"><q-icon name="check_circle" size="20px" class="q-mr-xs" /> Fotos y descripción</div>
            <div class="col-auto text-white"><q-icon name="check_circle" size="20px" class="q-mr-xs" /> Contacto directo</div>
          </div>
          <div class="row q-gutter-sm">
            <div class="col-auto">
              <q-btn
                color="white"
                text-color="primary"
                unelevated
                icon="store"
                label="Registra tu negocio"
                :href="whatsAppLink"
                target="_blank"
                rel="noopener"
                @click="openWhatsApp"
              />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-5 text-center">
          <q-icon name="storefront" size="120px" class="text-white q-mb-sm storefront-icon" />
          <div class="text-white text-italic">Impulsa tu presencia digital hoy</div>
        </div>
      </div>
    </section>

  <!-- Botón volver arriba (simple para evitar dependencia de QLayout) -->
  <q-btn v-show="showBackToTop" class="back-to-top" round color="primary" icon="keyboard_arrow_up" @click="goTop" />
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Notify } from 'quasar'
import Login from '../componentes/Login.vue'
import CardLugar from '../componentes/Card.vue'
import { useNegocioStore } from '../stores/negocio.js'
import { useRouter } from 'vue-router'

const negocioStore = useNegocioStore()
const router = useRouter()

const busqueda = ref('')
const ciudadSeleccionada = ref('')
const tipoSeleccionado = ref('')
const ordenSeleccionado = ref('Relevancia')
const opcionesOrden = [
  'Relevancia',
  'A-Z',
  'Z-A'
]
const mostrarBuscador = ref(true)
const mostrarLogin = ref(false)
const cargando = ref(false)
const resultadosRef = ref(null)
const showBackToTop = ref(false)

// WhatsApp del administrador (formato internacional sin '+', ej: 573001234567)
const adminWhats = (import.meta?.env?.VITE_ADMIN_WHATSAPP || '573044914411').toString().trim()
const whatsAppMessage = 'Hola, quiero registrar mi negocio en el directorio. ¿Me puedes ayudar?'

const whatsDigits = adminWhats.replace(/[^\d]/g, '')
const whatsAppLink = computed(() => `https://wa.me/${whatsDigits}?text=${encodeURIComponent(whatsAppMessage)}`)

function openWhatsApp() {
  if (!/^\d{8,15}$/.test(whatsDigits)) {
    Notify.create({ type: 'negative', message: 'Número de WhatsApp inválido. Revisa VITE_ADMIN_WHATSAPP.' })
    return
  }
  const url = whatsAppLink.value
  console.log('[WA] adminWhats:', adminWhats, 'digits:', whatsDigits, 'url:', url) // debug
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) window.location.href = url
}

onMounted(async () => {
  try {
    cargando.value = true
    await negocioStore.listarNegocios()
  } finally {
    cargando.value = false
  }
  // Listener para mostrar botón volver arriba
  window.addEventListener('scroll', onScroll, { passive: true })
})

function onScroll() {
  showBackToTop.value = window.scrollY > 300
}

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// Opciones únicas de ciudad extraídas de los negocios
const ciudades = computed(() => [
  ...new Set(
    negocioStore.negocios.map(n =>
      n.ciudad || (n.direccion ? n.direccion.split(',')[0]?.trim() : '')
    )
  )
].filter(c => c))

// Tipos únicos de negocio
const tiposNegocio = computed(() => [
  ...new Set(
    negocioStore.negocios
      .map(n => n?.tipoNegocio?.nombre)
      .filter(Boolean)
  )
])

const lugaresFiltrados = computed(() => {
  const text = busqueda.value.toLowerCase().trim()
  return negocioStore.negocios.filter(l => {
    const matchCiudad =
      !ciudadSeleccionada.value ||
      l.ciudad === ciudadSeleccionada.value ||
      (l.direccion && l.direccion.includes(ciudadSeleccionada.value))
    const matchTexto =
      !text ||
      l.nombre?.toLowerCase().includes(text) ||
      l.descripcion?.toLowerCase().includes(text) ||
      l.tipoNegocio?.nombre?.toLowerCase().includes(text)
    const matchTipo =
      !tipoSeleccionado.value ||
      l.tipoNegocio?.nombre === tipoSeleccionado.value
    return matchCiudad && matchTexto && matchTipo
  })
})

// Orden de resultados
const lugaresOrdenados = computed(() => {
  const arr = [...lugaresFiltrados.value]
  if (ordenSeleccionado.value === 'A-Z') {
    return arr.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
  }
  if (ordenSeleccionado.value === 'Z-A') {
    return arr.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''))
  }
  return arr // Relevancia (orden original)
})

function toggleBuscador() {
  mostrarBuscador.value = !mostrarBuscador.value
}

function limpiarFiltros() {
  busqueda.value = ''
  ciudadSeleccionada.value = ''
  tipoSeleccionado.value = ''
  ordenSeleccionado.value = 'Relevancia'
}

function scrollToResultados() {
  const el = resultadosRef.value
  if (el?.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.logo {
  width: 120px;
  height: auto;
  margin-bottom: 10px;
}
.input-styled {
  border-radius: 20px;
}
.full-width {
  width: 100%;
}
.btn-styled {
  background-color: #4CAF50;
  color: white;
  border-radius: 25px;
}

/* Mantener altura y ancho consistentes */
.items-stretch > [class*="col-"] { display: flex; }
.items-stretch > [class*="col-"] > * { width: 100%; }

.header-toolbar {
  border-radius: 10px;
}

.scroll-x {
  overflow-x: auto;
}

.rounded-borders {
  border-radius: 8px;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  border-radius: 14px;
  /* Fondo: primero el gradiente azul, luego la imagen JPG */
  background:
    linear-gradient(135deg, #1d4ed8 0%, #9333ea 70%),
    url('@/assets/banner-bg.jpg') center/cover no-repeat;
  overflow: hidden;
}

.hero-banner:before {
  content: '';
  position: absolute;
  right: -10%;
  top: -20%;
  width: 60%;
  height: 180%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%);
  transform: rotate(15deg);
  pointer-events: none; /* evita bloquear clics */
}
.hero-banner:after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('../assets/IGLESIA.jpg') center/cover no-repeat;
  opacity: 0.7; /* Ajusta la opacidad */
  z-index: 0;
  pointer-events: none;
}
.hero-content {
  position: relative;
  z-index: 1;
  padding: 28px 18px;
}
@media (min-width: 768px) {
  .hero-content { padding: 44px 32px; }
}
.line-tight { line-height: 1.2; }
.letter-spaced { letter-spacing: .14em; }
.hero-sub { opacity: .9; }

.back-to-top {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
}

/* Bottom Banner */
.bottom-banner {
  position: relative;
  border-radius: 14px;
  background: linear-gradient(135deg, #059669 0%, #06b6d4 80%);
  overflow: hidden;
}
.bottom-banner:after {
  content: '';
  position: absolute;
  left: -10%;
  bottom: -30%;
  width: 70%;
  height: 180%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%);
  transform: rotate(-10deg);
  pointer-events: none; /* evita bloquear clics */
  z-index: 0;
}
/* asegura que el contenido quede encima del decorativo */
.bottom-banner > .row {
  position: relative;
  z-index: 1;
}

/* Extra small screens: <= 400px */
@media (max-width: 400px) {
  .header-toolbar { border-radius: 8px; }
  .hero-content { padding: 16px 12px; }
  .hero-banner .text-h4 { font-size: 1.25rem; }
  .bottom-banner .text-h5 { font-size: 1.1rem; }
  .letter-spaced { letter-spacing: .08em; }
  .line-tight { line-height: 1.25; }

  .chip-row .q-chip { font-size: 12px; height: 26px; }
  .hero-cta .q-input, .hero-cta .q-btn { width: 100%; }

  .benefits { display: block; }
  .benefits .col-auto { display: block; margin-bottom: 6px; }

  .back-to-top { right: 10px; bottom: 10px; }
  .storefront-icon { font-size: 72px !important; }
}
</style>

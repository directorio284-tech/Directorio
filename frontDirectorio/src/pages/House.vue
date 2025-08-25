<template>
  <div class="q-pa-md">
    <!-- Modal de Login para Administrador -->
    <q-dialog v-model="mostrarLogin" persistent>
      <Login @close="mostrarLogin = false" />
    </q-dialog>

    <q-toolbar class="bg-primary text-white q-mb-lg">
      <q-toolbar-title>
        Directorio General
      </q-toolbar-title>
      <q-btn flat round icon="login" @click="mostrarLogin = true" />
      <q-btn flat round icon="search" @click="toggleBuscador" />
    </q-toolbar>

    <q-input
      v-show="mostrarBuscador"
      v-model="busqueda"
      outlined
      debounce="300"
      label="Buscar hoteles, tiendas, restaurantes..."
      class="q-mb-lg"
      clearable
      dense
      color="primary"
    />

    <!-- Cambia el filtro por zona a filtro por ciudad -->
    <q-select
      v-model="ciudadSeleccionada"
      :options="ciudades"
      label="Filtrar por ciudad"
      dense
      outlined
      class="q-mb-xl"
      color="primary"
      clearable
    />

    <div class="row q-col-gutter-md items-stretch">
      <div
        v-for="lugar in lugaresFiltrados"
        :key="lugar._id"
        class="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3"
      >
        <CardLugar :lugar="lugar" class="fit" />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import Login from './Login.vue'
import CardLugar from '../componentes/Card.vue'
import { useNegocioStore } from '../stores/negocio.js'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

const negocioStore = useNegocioStore()
const router = useRouter()

const busqueda = ref('')
const ciudadSeleccionada = ref('')
const mostrarBuscador = ref(true)
const mostrarLogin = ref(false)

onMounted(async () => {
  await negocioStore.listarNegocios()
})

// Opciones únicas de ciudad extraídas de los negocios
const ciudades = computed(() => [
  ...new Set(
    negocioStore.negocios.map(n =>
      n.ciudad || (n.direccion ? n.direccion.split(',')[0]?.trim() : '')
    )
  )
].filter(c => c))

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
    return matchCiudad && matchTexto
  })
})

function toggleBuscador() {
  mostrarBuscador.value = !mostrarBuscador.value
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
</style>

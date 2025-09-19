<template>
  <div style="background-color: white;">
    <div style="margin: 45px;">
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <h4 style="color: orange; margin: 0;">Negocios</h4>
        <div style="display: flex; gap: 8px;">
          <q-btn 
            color="grey-7"
            icon="arrow_back"
            label="Volver"
            text-color="white"
            @click="$router.back()"
          />
          <q-btn 
            @click="abrirDialogCrear" 
            color="orange" 
            icon="add" 
            label="CREAR" 
            text-color="white" 
          />
        </div>
      </div>
      <!-- Filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-3">
          <q-select
            v-model="filtroCiudad"
            :options="ciudades"
            label="Ciudad"
            clearable
            dense
            outlined
          />
        </div>
        <!-- <div class="col-12 col-sm-3">
          <q-select
            v-model="filtroTipoNegocio"
            :options="tiposNegocio"
            label="Tipo de Negocio"
            clearable
            dense
            outlined
          />
        </div> -->
        <div class="col-12 col-sm-3">
          <q-select
            v-model="filtroEstado"
            :options="[
              { label: 'Todos', value: '' },
              { label: 'Activo', value: '1' },
              { label: 'Inactivo', value: '0' }
            ]"
            label="Estado"
            map-options
            emit-value
            dense
            outlined
          />
        </div>
        <div class="col-12 col-sm-3">
          <q-input
            v-model="filtroNombre"
            label="Buscar por nombre"
            clearable
            dense
            outlined
          />
        </div>
      </div>
      <q-table
        :rows="negociosFiltrados"
        :columns="columns"
        row-key="_id"
        flat
        bordered
        :dense="true"
      >
        <template v-slot:body-cell-imagenes="props">
          <q-td>
            <img
              v-if="props.row.imagenes && props.row.imagenes.length"
              :src="props.row.imagenes[0]"
              alt="imagen negocio"
              style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-sitioWeb="props">
          <q-td>
            <a v-if="props.row.sitioWeb" :href="props.row.sitioWeb" target="_blank">Web</a>
          </q-td>
        </template>
        
        <template v-slot:body-cell-redes="props">
          <q-td>
            <a v-if="props.row.redes?.facebook" :href="props.row.redes.facebook" target="_blank">Fb</a>
            <a v-if="props.row.redes?.instagram" :href="props.row.redes.instagram" target="_blank" class="q-ml-sm">Ig</a>
            <a v-if="props.row.redes?.twitter" :href="props.row.redes.twitter" target="_blank" class="q-ml-sm">Tw</a>
           <a
          v-if="whHref(props.row.redes?.whatsapp)"
          :href="whHref(props.row.redes?.whatsapp)"
          target="_blank"
          class="q-ml-sm"
        >Whats</a>
          </q-td>
        </template>
        <template v-slot:body-cell-estado="props">
          <q-td>
            <span :class="{'text-positive': props.row.estado === 1, 'text-negative': props.row.estado === 0}">
              {{ props.row.estado === 1 ? 'Activo' : 'Inactivo' }}
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" align="center">
            <q-btn @click.stop="traerDatos(props.row)" color="green" icon="edit" size="sm" />

            <q-btn
              v-if="props.row.estado === 0"
              @click.stop="activarNegocio(props.row._id)"
              class="q-ml-sm"
              color="blue"
              icon="check_circle"
              size="sm"
              :loading="rowLoading[props.row._id]"
              :disable="rowLoading[props.row._id]"
            />

            <q-btn
              v-if="props.row.estado === 1"
              @click.stop="desactivarNegocio(props.row._id)"
              class="q-ml-sm"
              color="orange"
              icon="block"
              size="sm"
              :loading="rowLoading[props.row._id]"
              :disable="rowLoading[props.row._id]"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-ubicacionUrl="props">
          <q-td>
            <a
              v-if="props.row.ubicacionUrl"
              :href="props.row.ubicacionUrl"
              target="_blank"
              rel="noopener"
              title="Ver ubicación en mapa"
            >
              <q-icon name="place" color="primary" />
            </a>
          </q-td>
        </template>
      </q-table>
      <!-- Modal de edición/creación -->
      <q-dialog v-model="fixed" :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ b ? "Editar Negocio" : "Crear Negocio" }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 60vh" class="scroll">
            <q-form ref="formNegocio" class="q-gutter-md">
              <q-input filled v-model="nombre" label="Nombre" :dense="dense" :rules="[req]" />
              <q-input filled v-model="direccion" label="Dirección" :dense="dense" :rules="[req]" />
              <q-input filled v-model="telefono" label="Teléfono" :dense="dense" :rules="[reqTel]" />
              <q-input filled v-model="ciudad" label="Ciudad" :dense="dense" :rules="[req]" />
              <q-input filled v-model="sitioWeb" label="Sitio Web" :dense="dense" :rules="[reqUrl]" />
              <q-input filled v-model="horarios" label="Horarios" :dense="dense" :rules="[req]" />
              <q-input filled v-model="email" label="Email" :dense="dense" :rules="[reqEmail]" />

              <q-select
                v-model="tipoNegocio"
                :options="tiposNegocioOptions"
                label="Tipo de Negocio"
                option-label="nombre"
                option-value="_id"
                emit-value
                map-options
                :dense="dense"
                outlined
                :rules="[req, mongoId]"
              />
              <q-input filled v-model="ubicacionUrl" label="Ubicacion Url" :dense="dense" :rules="[reqUrl]" />
              <q-input filled v-model="redes.facebook" label="Facebook" :dense="dense" />
              <q-input filled v-model="redes.instagram" label="Instagram" :dense="dense" />
              <q-input filled v-model="redes.twitter" label="Twitter" :dense="dense" />
              <q-input filled v-model="redes.whatsapp" label="WhatsApp" :dense="dense" />

              <!-- Imagen mejorada (opcional, no requerida) -->
              <div class="image-field q-mt-md">
                <div class="image-col">
                  <div class="text-caption text-grey-7 q-mb-xs">Imagen actual</div>
                  <q-img v-if="imagenActual" :src="imagenActual" class="image-preview" ratio="1" />
                  <div v-else class="image-preview placeholder">
                    <q-icon name="image_not_supported" size="32px" class="text-grey-5" />
                  </div>
                </div>

                <div class="image-col">
                  <div class="text-caption text-grey-7 q-mb-xs">Nueva imagen</div>
                  <div class="upload-box" @dragover.prevent @drop.prevent="onDropImagen">
                    <!-- input oculto; se abre con abrirFileDialog() -->
                    <input
                      ref="fileInput"
                      class="hidden-input"
                      type="file"
                      accept="image/*"
                      @change="onImagenSeleccionada"
                    />
                    <div v-if="!imagenNueva" class="upload-hint">
                      <q-icon name="image" size="32px" class="text-grey-6" />
                      <div class="q-mt-sm">
                        Arrastra una imagen o
                        <span class="link" @click="abrirFileDialog"> haz clic para seleccionar</span>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        JPG, PNG o WEBP. Máx 5 MB.
                      </div>
                    </div>

                    <div v-else class="preview-wrapper">
                      <q-img :src="imagenNuevaUrl" class="image-preview" ratio="1" />
                      <div class="actions">
                        <q-btn flat dense color="primary" icon="swap_horiz" label="Cambiar" @click="abrirFileDialog" />
                        <q-btn flat dense color="negative" icon="close" label="Quitar" @click="limpiarImagenNueva" />
                      </div>
                      <div class="text-caption ellipsis q-mt-xs">
                        {{ imagenNueva?.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ubicación (opcional) -->
          
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="red" v-close-popup @click="cerrar" />
            <q-btn flat label="Guardar" color="primary" :loading="saving" :disable="saving" @click="guardarNegocio" />
          </q-card-actions>

          <!-- Overlay interno mientras guarda -->
          <q-inner-loading :showing="saving">
            <q-spinner-gears size="50px" color="primary" />
            <div class="q-mt-sm">Guardando...</div>
          </q-inner-loading>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { Notify } from 'quasar'
import { useNegocioStore } from '../stores/negocio.js'
import { useStoreTipoNegocio } from '../stores/tipoNegocio.js'

const filtroCiudad = ref('')
const filtroTipoNegocio = ref('')
const filtroNombre = ref('')
const filtroEstado = ref('')
// const latitud = ref("")
// const longitud = ref("")
const negocioStore = useNegocioStore()
const tipoNegocioStore = useStoreTipoNegocio()

const fixed = ref(false)
const b = ref(false)
const dense = ref(true)
const id = ref("")
const nombre = ref("")
const direccion = ref("")
const ubicacion = ref("")
const telefono = ref("")
const ciudad = ref("")
const sitioWeb = ref("")
const horarios = ref("")
const email = ref("")
const tipoNegocio = ref("")
const ubicacionUrl = ref("")
const imagenActual = ref("")
const imagenNueva = ref(null)
const redes = ref({
  facebook: "",
  instagram: "",
  twitter: "",
  whatsapp: ""
})


const fileInput = ref(null)

// URL de previsualización segura
const imagenNuevaUrl = ref("")
watch(imagenNueva, (file, prev) => {
  if (imagenNuevaUrl.value) URL.revokeObjectURL(imagenNuevaUrl.value)
  imagenNuevaUrl.value = file ? URL.createObjectURL(file) : ""
})
onBeforeUnmount(() => {
  if (imagenNuevaUrl.value) URL.revokeObjectURL(imagenNuevaUrl.value)
})

onMounted(async () => {
  await negocioStore.listarNegocios()
  await tipoNegocioStore.listarTiposNegocio()
})

const negocios = computed(() => negocioStore.negocios)
const tiposNegocioOptions = computed(() => tipoNegocioStore.tiposNegocio)

const ciudades = computed(() => [
  ...new Set(negocios.value.map(n => n.ciudad || (n.direccion ? n.direccion.split(',')[0] : '')))
])

const negociosFiltrados = computed(() => {
  return negocios.value.filter(n => {
    return (
      (!filtroCiudad.value || (n.ciudad === filtroCiudad.value || (n.direccion && n.direccion.includes(filtroCiudad.value)))) &&
      (!filtroTipoNegocio.value || (typeof n.tipoNegocio === 'string' ? n.tipoNegocio === filtroTipoNegocio.value : n.tipoNegocio?._id === filtroTipoNegocio.value)) &&
      (!filtroEstado.value || String(n.estado) === filtroEstado.value) &&
      (!filtroNombre.value || n.nombre?.toLowerCase().includes(filtroNombre.value.toLowerCase()))
    )
  })
})

const columns = [
  { name: 'imagenes', label: 'Imagen', align: 'left', field: 'imagenes' },
  { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true },
  { name: 'direccion', label: 'Dirección', align: 'left', field: 'direccion' },
  { name: 'ciudad', label: 'Ciudad', align: 'left', field: 'ciudad', sortable: true },
  { name: 'ubicacionUrl', label: 'Ubicación url', align: 'left', field: 'ubicacionUrl' },
  { name: 'tipoNegocio', label: 'Tipo', align: 'left', field: row => typeof row.tipoNegocio === 'string' ? row.tipoNegocio : (row.tipoNegocio?.nombre || '') },
  { name: 'telefono', label: 'Teléfono', align: 'left', field: 'telefono' },
  { name: 'sitioWeb', label: 'Sitio Web', align: 'left', field: 'sitioWeb' },
  { name: 'redes', label: 'Redes', align: 'left', field: 'redes' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado', sortable: true },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// Construye href de WhatsApp aceptando número o URL completa
function whHref(val) {
  if (!val) return null;
  const v = String(val).trim();
  if (/^https?:\/\//i.test(v)) return v; // ya es URL
  const digits = v.replace(/\D/g, "");
  if (!digits) return null;
  // Si no trae indicativo, asume CO (+57). Ajusta si necesitas otro país.
  const normalized = digits.length > 10 ? digits : `57${digits}`;
  return `https://wa.me/${normalized}`;
}

// Acciones de la tabla
function traerDatos(row) {
  id.value = row._id
  nombre.value = row.nombre
  direccion.value = row.direccion
  ubicacion.value = row.ubicacion || ""
  telefono.value = row.telefono
  ciudad.value = row.ciudad
  sitioWeb.value = row.sitioWeb
  horarios.value = row.horarios
  email.value = row.email
  tipoNegocio.value = (row.tipoNegocio && typeof row.tipoNegocio === 'object') ? row.tipoNegocio._id : row.tipoNegocio || ""
  redes.value = {
    facebook: row.redes?.facebook || "",
    instagram: row.redes?.instagram || "",
    twitter: row.redes?.twitter || "",
    whatsapp: row.redes?.whatsapp || ""
  }
  ubicacionUrl.value = row.ubicacionUrl
  imagenActual.value = row.imagenes && row.imagenes.length ? row.imagenes[0] : ""
  imagenNueva.value = null

  fixed.value = true
  b.value = true
}

function abrirFileDialog() {
  fileInput.value?.click()
}

function onImagenSeleccionada(e) {
  const f = e?.target?.files?.[0]
  imagenNueva.value = f instanceof File ? f : null
}

function onDropImagen(e) {
  const f = e.dataTransfer?.files?.[0]
  if (f && f.type.startsWith("image/")) {
    imagenNueva.value = f
  }
}

function limpiarImagenNueva() {
  imagenNueva.value = null
  if (fileInput.value) fileInput.value.value = ""
}

function cerrar() {
  b.value = false
  id.value = ""
  nombre.value = ""
  direccion.value = ""
  ubicacion.value = ""
  telefono.value = ""
  ciudad.value = ""
  sitioWeb.value = ""
  horarios.value = ""
  email.value = ""
  tipoNegocio.value = ""
  ubicacionUrl.value = ""
  redes.value = { facebook: "", instagram: "", twitter: "", whatsapp: "" }
  imagenActual.value = ""
  imagenNueva.value = null
  fixed.value = false
}


function abrirDialogCrear() {
  b.value = false
  id.value = ""
  nombre.value = ""
  direccion.value = ""
  ubicacion.value = ""
  telefono.value = ""
  ciudad.value = ""
  sitioWeb.value = ""
  horarios.value = ""
  email.value = ""
  tipoNegocio.value = ""
  redes.value = { facebook: "", instagram: "", twitter: "", whatsapp: "" }
  ubicacionUrl.value = ""
  imagenActual.value = ""
  imagenNueva.value = null
  fixed.value = true
}

const formNegocio = ref(null)
const saving = ref(false)

// Reglas de validación (excepto ubicación)
const req = v => !!String(v ?? '').trim() || 'Requerido'
const reqTel = v => /^\d{7,15}$/.test(String(v ?? '').replace(/\D/g, '')) || 'Teléfono inválido'
const reqEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '')) || 'Email inválido'
const reqUrl = v => {
  const s = String(v ?? '').trim()
  try { new URL(s); return true } catch { return 'URL inválida' }
}

const mongoId = v => /^[a-f\d]{24}$/i.test(String(v ?? '')) || 'Tipo inválido'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function guardarNegocio() {
  const isValid = await formNegocio.value?.validate?.()
  if (!isValid) {
    Notify.create({ type: 'warning', message: 'Completa los campos obligatorios' })
    return
  }

  const payload = new FormData()
  payload.append('nombre', nombre.value.trim())
  payload.append('direccion', direccion.value.trim())
  payload.append('telefono', String(telefono.value).replace(/\D/g, ''))
  payload.append('ciudad', ciudad.value.trim())
  payload.append('sitioWeb', sitioWeb.value.trim())
  payload.append('horarios', horarios.value.trim())
  payload.append('email', email.value.trim())
  payload.append('tipoNegocio', tipoNegocio.value)
  payload.append('ubicacionUrl', ubicacionUrl.value.trim())
  payload.append('redes', JSON.stringify(redes.value || {}))

  if (imagenNueva.value instanceof File) payload.append('imagen', imagenNueva.value)

  try {
    saving.value = true
    const apiPromise = b.value
      ? negocioStore.editarNegocio(id.value, payload)
      : negocioStore.crearNegocio(payload)

    // Garantiza al menos 2s de carga
    await Promise.all([apiPromise, sleep(2000)])

    await negocioStore.listarNegocios()
    fixed.value = false
    Notify.create({ type: 'positive', message: b.value ? 'Negocio actualizado' : 'Negocio creado' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || 'Error'
    })
  } finally {
    saving.value = false
  }
}

// Loading por fila para evitar dobles clics
const rowLoading = ref({}) // { [id]: boolean }
const setRowLoading = (id, val) => {
  rowLoading.value = { ...rowLoading.value, [id]: val }
}

async function activarNegocio(id) {
  if (rowLoading.value[id]) return
  setRowLoading(id, true)
  try {
    await negocioStore.activarNegocio(id)
    await negocioStore.listarNegocios()
    Notify.create({
      group: 'estado-negocio',
      type: 'positive',
      icon: 'check_circle',
      message: 'Negocio activado',
      timeout: 1500
    })
  } catch (e) {
    Notify.create({
      group: 'estado-negocio',
      type: 'negative',
      icon: 'error',
      message: e?.response?.data?.msg || 'Error al activar',
      timeout: 2000
    })
  } finally {
    setRowLoading(id, false)
  }
}

async function desactivarNegocio(id) {
  if (rowLoading.value[id]) return
  setRowLoading(id, true)
  try {
    await negocioStore.desactivarNegocio(id)
    await negocioStore.listarNegocios()
    Notify.create({
      group: 'estado-negocio',
      type: 'negative',
      icon: 'block',
      message: 'Negocio desactivado',
      timeout: 1500
    })
  } catch (e) {
    Notify.create({
      group: 'estado-negocio',
      type: 'negative',
      icon: 'error',
      message: e?.response?.data?.msg || 'Error al desactivar',
      timeout: 2000
    })
  } finally {
    setRowLoading(id, false)
  }
}

</script>

<style scoped>
/* Tabla */
.q-btn { border-radius: 5px; font-size: 14px; }
.q-table { border: 1px solid #ddd; background-color: white; }
.q-td { padding: 8px; }
.q-th, .q-td { text-align: center; }
.text-positive { color: #219653; font-weight: bold; }
.text-negative { color: #b71c1c; font-weight: bold; }

/* Imagen en modal */
.image-field {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}
.image-col { display: flex; flex-direction: column; }
.image-preview {
  width: 112px;
  height: 112px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  background: #fafafa;
}
.image-preview.placeholder {
  display: grid;
  place-items: center;
}

/* Zona de carga amigable */
.upload-box {
  position: relative;
  min-height: 132px;
  border: 1px dashed #c7c7c7;
  border-radius: 8px;
  background: #fbfbfb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  transition: border-color .2s, background-color .2s;
}
.upload-box:hover,
.upload-box:focus-within {
  border-color: #90caf9;
  background-color: #f5faff;
}

/* Input nativo oculto */
.hidden-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none; /* se abre con abrirFileDialog() */
}

/* Texto y acciones */
.upload-hint .link {
  color: #1976d2;
  cursor: pointer;
  text-decoration: underline;
}
.preview-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-wrapper .actions {
  display: flex;
  gap: 4px;
  flex-direction: column;
}

@media (max-width: 640px) {
  .image-field { grid-template-columns: 1fr; }
}
</style>



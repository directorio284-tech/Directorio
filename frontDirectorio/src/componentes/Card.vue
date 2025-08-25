<template>
  <q-card class="hoverable-card">
    <q-img :src="lugar.imagenes?.[0] || 'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="16/9" />

    <q-card-section>
      <div class="text-h6">{{ lugar.nombre }}</div>
      <div class="text-subtitle2">{{ lugar.tipoNegocio?.nombre || 'Sin categoría' }}</div>
      <div class="text-caption text-grey">{{ lugar.direccion }}</div>

      <div v-if="lugar.sitioWeb" class="q-mt-sm">
        <q-btn flat dense color="primary" icon="public" label="Sitio Web"
               @click="openAndCount(lugar.sitioWeb)" />
      </div>
    </q-card-section>

    <q-card-actions align="between">
      <div>
        <q-btn v-if="lugar.redes?.facebook" flat round color="blue-8" icon="fab fa-facebook"
               @click="openAndCount(lugar.redes.facebook)" />
        <q-btn v-if="lugar.redes?.instagram" flat round color="pink-6" icon="fab fa-instagram"
               @click="openAndCount(lugar.redes.instagram)" />
        <q-btn v-if="lugar.redes?.twitter" flat round color="blue-5" icon="fab fa-twitter"
               @click="openAndCount(lugar.redes.twitter)" />
        <q-btn v-if="lugar.redes?.whatsapp" flat round color="green-6" icon="fab fa-whatsapp"
               @click="openAndCount(getWhatsappLink(lugar.redes.whatsapp))" />
        <q-btn v-if="lugar.redes?.youtube" flat round color="red-5" icon="fab fa-youtube"
               @click="openAndCount(lugar.redes.youtube)" />
      </div>

      <div class="row items-center no-wrap">
        <q-chip dense color="grey-3" text-color="dark" icon="visibility" class="q-mr-sm">
          {{ visitasLocal }} visitas
        </q-chip>
        <q-btn flat label="Ver más" color="primary" @click="countAndMaybeNavigate" />
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNegocioStore } from '../stores/negocio.js'

const props = defineProps({ lugar: { type: Object, required: true } })
const store = useNegocioStore()

const visitasLocal = ref(props.lugar?.visitas ?? 0)
watch(() => props.lugar?.visitas, v => { if (typeof v === 'number') visitasLocal.value = v })

const key = `visita:${props.lugar?._id}`
const alreadyCounted = () => sessionStorage.getItem(key) === '1'
const markCounted = () => sessionStorage.setItem(key, '1')

const getWhatsappLink = (v) => {
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  const digits = String(v).replace(/\D/g, '')
  const normalized = digits.length > 10 ? digits : `57${digits}`
  return `https://wa.me/${normalized}`
}

async function countOnce() {
  if (!props.lugar?._id) return
  if (alreadyCounted()) return
  const data = await store.sumarVisita(props.lugar._id) // backend suma +1
  if (typeof data?.visitas === 'number') visitasLocal.value = data.visitas
  markCounted()
}

async function openAndCount(url) {
  if (!url) return
  // Contar primero y luego abrir en nueva pestaña
  await countOnce()
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function countAndMaybeNavigate() {
  await countOnce()
  // Si tienes detalle, navega aquí
  // this.$router.push({ name: 'negocio-detalle', params: { id: props.lugar._id } })
}
</script>

<style scoped>
.hoverable-card { transition: all .3s ease; }
.hoverable-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,.2); }

:deep(form.q-form.q-gutter-md) {
  margin-top: 0 !important; /* o el valor que necesites */
}
</style>

<template>
  <q-card class="hoverable-card directory-card">
    <q-img
      :src="lugar.imagenes?.[0] || 'https://cdn.quasar.dev/img/mountains.jpg'"
      :ratio="16/9"
      class="card-img"
    />

    <q-card-section>
      <div class="text-h5 text-weight-bold q-mb-sm">{{ lugar.nombre }}</div>
      <div class="text-body1 text-grey-7 q-mb-xs">
        <q-icon :name="getTipoIcon(lugar.tipoNegocio)" size="20px" class="q-mr-xs" />
        {{ lugar.tipoNegocio?.nombre || 'Sin categoría' }}
      </div>
      <div class="text-body2 text-grey-8 q-mb-xs">
        <q-icon name="place" size="20px" class="q-mr-xs" />
        {{ lugar.direccion }}
      </div>
      <div v-if="lugar.sitioWeb" class="q-mb-xs">
        <q-icon name="public" size="20px" class="q-mr-xs" />
        <span
          class="text-primary sitio-web-label sitio-web-link"
          @click="openAndCount(normalizeUrl(lugar.sitioWeb))"
          style="cursor:pointer; text-decoration:underline;"
          title="Ir al sitio web"
        >Sitio web</span>
      </div>
      <div v-if="lugar.ubicacionUrl" class="q-mb-xs">
        <q-btn
          flat
          dense
          color="teal"
          icon="place"
          label="Ver ubicación"
          :href="normalizeUrl(lugar.ubicacionUrl)"
          target="_blank"
          rel="noopener"
          style="text-transform: none;"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="between" class="reverse-actions">
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
        <q-chip dense color="grey-3" text-color="dark" icon="visibility" class="q-mr-sm visitas-chip">
          {{ visitasLocal }} visitas
        </q-chip>
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

function normalizeUrl(u) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

async function countAndGoToSite() {
  const url = normalizeUrl(props.lugar?.sitioWeb);
  if (url) {
    await openAndCount(url); // cuenta y abre en nueva pestaña
  } else {
    // si no hay sitio, solo cuenta (opcional) o no hagas nada
    await countOnce();
  }
}

async function countAndMaybeNavigate() {
  await countOnce()
  // Si tienes detalle, navega aquí
  // this.$router.push({ name: 'negocio-detalle', params: { id: props.lugar._id } })
}

// Devuelve el nombre del ícono de Quasar según el tipo de negocio
function getTipoIcon(tipo) {
  if (!tipo) return 'business';
  const nombre = (tipo.nombre || '').toLowerCase();
  if (nombre.includes('electricidad')) return 'bolt'; // rayo
  if (nombre.includes('restaurante') || nombre.includes('comida')) return 'restaurant';
  if (nombre.includes('venta') || nombre.includes('tienda')) return 'storefront';
  if (nombre.includes('salud')) return 'local_hospital';
  if (nombre.includes('belleza')) return 'spa';
  if (nombre.includes('educación')) return 'school';
  if (nombre.includes('tecnología')) return 'devices';
  if (nombre.includes('barbería') || nombre.includes('peluquería')) return 'content_cut';
  if (nombre.includes('farmacia')) return 'local_pharmacy';
  if (nombre.includes('ropa')) return 'checkroom';
  if (nombre.includes('panadería')) return 'bakery_dining';
  if (nombre.includes('hotel')) return 'hotel';
  if (nombre.includes('transporte')) return 'directions_bus';
  if (nombre.includes('automotriz') || nombre.includes('mecánica')) return 'build';
  if (nombre.includes('financiera') || nombre.includes('banco')) return 'account_balance';

  return 'business'; // ícono genérico
}

</script>

<style scoped>
.directory-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: box-shadow .2s, transform .2s;
  min-width: 260px;
}
.directory-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  transform: translateY(-4px) scale(1.02);
}
.card-img {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.q-card-section {
  padding-bottom: 0;
}
.q-card-actions {
  padding-top: 0;
}
.q-card__actions.reverse-actions {
  flex-direction: row-reverse !important;
}
.text-h5 {
  font-size: 1.35rem;
}
.text-body1, .text-body2, .sitio-web-label {
  font-size: 1.08rem;
}
.visitas-chip {
  font-size: 1rem;
}
</style>

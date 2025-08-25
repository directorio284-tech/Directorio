margin: 10px;<template>
  <div class="q-pa-md">
    <!-- Modal para crear negocio usando el componente Negocio.vue -->
    <q-dialog v-model="mostrarCrearNegocio" persistent>
      <Negocio @close="mostrarCrearNegocio = false" modo="crear" />
    </q-dialog>

    <q-toolbar class="bg-primary text-white q-mb-lg">
      <q-toolbar-title>Panel de Administración</q-toolbar-title>
      <div class="text-caption opacity-80">
        Hola, {{ usuario?.nombre || "Admin" }}
      </div>
      <q-space />
      <!-- Botón Cerrar sesión y volver a House -->
      <q-btn
        dense
        flat
        color="white"
        icon="logout"
        label="Cerrar sesión"
        @click="cerrarSesion"
        class="q-ml-sm"
      />
    </q-toolbar>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2">Negocios</div>
            <div class="text-h5">{{ stats.negocios }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              flat
              label="Ver"
              :to="{ name: 'negocio-crear' }"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2">Tipos de Negocio</div>
            <div class="text-h5">{{ stats.tipos }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              flat
              label="Ver"
              :to="{ name: 'tipo-negocio' }"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2">Usuarios</div>
            <div class="text-h5">{{ stats.usuarios }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              flat
              label="Ver"
              :to="{ name: 'usuarios' }"
            />
          </q-card-actions>
        </q-card>
      </div> -->
<!-- 
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2">Pendientes</div>
            <div class="text-h5">{{ stats.pendientes }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              flat
              label="Revisar"
              :to="{ name: 'negocios' }"
            />
          </q-card-actions>
        </q-card>
      </div> -->
    </div>

    <q-card flat bordered>
      <q-card-section class="text-subtitle1">Accesos rápidos</q-card-section>
      <q-separator />
      <q-card-actions class="q-pa-md">
        <q-btn
          color="primary"
          icon="add_business"
           :to="{ name: 'negocio-crear' }"
          label=" Administrar Negocio"
          @click="mostrarCrearNegocio = true"
          class="q-mr-sm"
        />
        <q-btn
          color="secondary"
          icon="category"
          label="Administrar Tipos"
          :to="{ name: 'tipo-negocio' }"
          class="q-mr-sm"
        />
        <!-- <q-btn
          color="dark"
          icon="people"
          label="Gestionar Usuarios"
          :to="{ name: 'usuarios' }"
        /> -->
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'  // <-- agregar
import { useStoreTipoNegocio } from '../stores/tipoNegocio.js'
import { useNegocioStore } from '../stores/negocio.js'
import Negocio from './Negocio.vue'

const router = useRouter()               // <-- agregar

const mostrarCrearNegocio = ref(false)

const stats = reactive({
  negocios: 0,
  tipos: 0,
  pendientes: 0
})

const tipoNegocioStore = useStoreTipoNegocio()
const negocioStore = useNegocioStore() // <-- agrega

onMounted(async () => {
  await Promise.all([
    tipoNegocioStore.listarTiposNegocio(),
    negocioStore.listarNegocios() // <-- trae negocios
  ])
  stats.tipos = tipoNegocioStore.tiposNegocio.length
  stats.negocios = negocioStore.negocios.length
})

// Mantén sincronizados los totales si cambian los stores
watch(() => tipoNegocioStore.tiposNegocio.length, v => (stats.tipos = v), { immediate: true })
watch(() => negocioStore.negocios.length, v => (stats.negocios = v), { immediate: true })

// Cerrar sesión y volver a House.vue
const cerrarSesion = () => {
  try {
    localStorage.removeItem('token')
  } finally {
    router.push({ path: '/' })
  }
}
</script>

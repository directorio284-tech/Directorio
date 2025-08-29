import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";

export const useStoreTipoNegocio = defineStore("tipoNegocio", () => {
  const tiposNegocio = ref([]);

  const listarTiposNegocio = async () => {
    try {
      const res = await axios.get("https://directoriobackend-qn1l.onrender.com/api/tipoNegocio/Listar");
      tiposNegocio.value = res.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: "Error al cargar tipos de negocio"
      });
      console.error(error);
    }
  };




  const token = () => localStorage.getItem("token") || ""; // o toma de tu useUsuarioStore

  const handleListResponse = (res) => {
    // Permite ambas formas de respuesta: {data:[...]} o [...]
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data);
    return Array.isArray(data) ? data : [];
  };


  // ---- LISTAR POR ID ----
  const obtenerTipoPorId = async (id) => {
    try {
      const res = await axios.get(`https://directoriobackend-qn1l.onrender.com/api/tipoNegocio/listar/${id}`);
      // el backend podría responder {data: {...}} o {...}
      return res.data?.data ?? res.data;
    } catch (error) {
      Notify.create({ type: "negative", message: "No se pudo obtener el tipo de negocio" });
      console.error("obtenerTipoPorId:", error);
      return null;
    }
  };

  // ---- CREAR (JWT) ----
  const crearTipoNegocio = async (payload) => {
    try {
      const res = await axios.post(`https://directoriobackend-qn1l.onrender.com/api/tipoNegocio/crear`, payload, {
        headers: { "x-token": token() }
      });
      const nuevo = res.data?.data ?? res.data;
      if (nuevo) {
        // inserta al inicio
        tiposNegocio.value = [nuevo, ...tiposNegocio.value];
      }
      Notify.create({ type: "positive", message: "Tipo de negocio creado" });
      return nuevo;
    } catch (error) {
      const msg = error?.response?.data?.msg || "No se pudo crear el tipo de negocio";
      Notify.create({ type: "negative", message: msg });
      console.error("crearTipoNegocio:", error);
      return null;
    }
  };

  
  // ---- EDITAR (JWT) ----
  const editarTipoNegocio = async (id, payload) => {
    try {
      const res = await axios.put(`https://directoriobackend-qn1l.onrender.com/api/tipoNegocio/editar/${id}`, payload, {
        headers: { "x-token": token() }
      });
      const editado = res.data?.data ?? res.data;
      // sincroniza en memoria
      const idx = tiposNegocio.value.findIndex(t => (t._id || t.id) === id);
      if (idx !== -1) tiposNegocio.value[idx] = { ...tiposNegocio.value[idx], ...editado };
      Notify.create({ type: "positive", message: "Tipo de negocio actualizado" });
      return editado;
    } catch (error) {
      const msg = error?.response?.data?.msg || "No se pudo actualizar el tipo de negocio";
      Notify.create({ type: "negative", message: msg });
      console.error("editarTipoNegocio:", error);
      return null;
    }
  };


  // ---- ELIMINAR (JWT) ----
  const eliminarTipoNegocio = async (id) => {
    try {
      await axios.delete(`https://directoriobackend-qn1l.onrender.com/api/tipoNegocio/eliminar/${id}`, {
        headers: { "x-token": token() }
      });
      tiposNegocio.value = tiposNegocio.value.filter(t => (t._id || t.id) !== id);
      Notify.create({ type: "positive", message: "Tipo de negocio eliminado" });
      return true;
    } catch (error) {
      const msg = error?.response?.data?.msg || "No se pudo eliminar el tipo de negocio";
      Notify.create({ type: "negative", message: msg });
      console.error("eliminarTipoNegocio:", error);
      return false;
    }
  };

  return {
    // lista estado
    tiposNegocio,
    // acciones
    listarTiposNegocio,
    obtenerTipoPorId,
    crearTipoNegocio,
    editarTipoNegocio,
    eliminarTipoNegocio
  };
});

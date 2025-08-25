import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";


const API_URL = "https://directoriobackend-qn1l.onrender.com/api/negocio";

 
export const useNegocioStore = defineStore("negocio", () => {
  const negocios = ref([]);
  const negocio = ref(null);

  
  // Listar todos los negocios
  const listarNegocios = async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.get(`${API_URL}/listar`, {
        headers: { "x-token": token }
      });
      negocios.value = r.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: "Error al cargar negocios",
      });
      console.log(error);
    }
  };

  // Listar negocio por ID
  // const obtenerNegocioPorId = async (id) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const r = await axios.get(`${API_URL}/listar/${id}`, {
  //       headers: { "x-token": token }
  //     });
  //     negocio.value = r.data;
  //     return r.data;
  //   } catch (error) {
  //     Notify.create({
  //       type: "negative",
  //       message: "Error al cargar el negocio",
  //     });
  //     console.log(error);
  //     return null;
  //   }
  // };

  // Listar por ID
  const obtenerNegocioPorId = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.get(`${API_URL}/listar/${id}`, {
        headers: token ? { "x-token": token } : undefined
      });
      negocio.value = r.data;
      // reflejar visitas en la lista (si viene actualizado)
      if (typeof r.data?.visitas === "number") {
        const i = negocios.value.findIndex(n => n._id === id);
        if (i !== -1) negocios.value[i] = { ...negocios.value[i], visitas: r.data.visitas };
      }
      return r.data;
    } catch (error) {
      Notify.create({ type: "negative", message: "Error al cargar el negocio" });
      console.log(error);
      return null;
    }
  };

  // Alias explícito para “sumar visita” reutilizando el GET anterior
  const sumarVisita = async (id) => obtenerNegocioPorId(id);

  // Crear nuevo negocio (con imagen)
  const crearNegocio = async (formData) => {
    try {
      // Usar el FormData que viene del componente
      if (!(formData instanceof FormData)) {
        throw new Error("crearNegocio requiere una instancia de FormData");
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/crear`, formData, {
        headers: { "x-token": token } // No pongas Content-Type, axios lo setea solo
      });

      Notify.create({ type: "positive", message: "Negocio creado exitosamente" });
      return res.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || "Error al crear negocio",
      });
      console.log(error);
      return null;
    }
  };

  // Editar negocio
  const editarNegocio = async (id, payload) => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.put(`${API_URL}/editar/${id}`, payload, {
        headers: { "x-token": token }
      });
      Notify.create({
        type: "positive",
        message: "Negocio editado exitosamente",
      });
      return r.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || "Error al editar negocio",
      });
      console.log(error);
      return null;
    }
  };

  // Activar negocio
  const activarNegocio = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.put(`${API_URL}/activar/${id}`, {}, {
        headers: { "x-token": token }
      });
      // Notify.create({
      //   type: "positive",
      //   message: "Negocio activado",
      // });
      return r.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || "Error al activar negocio",
      });
      console.log(error);
      return null;
    }
  };


  // Desactivar negocio
  const desactivarNegocio = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.put(`${API_URL}/desactivar/${id}`, {}, {
        headers: { "x-token": token }
      });
      // Notify.create({
      //   type: "positive",
      //   message: "Negocio desactivado",
      // });
      return r.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || "Error al desactivar negocio",
      });
      console.log(error);
      return null;
    }
  };

  // Eliminar negocio
  const eliminarNegocio = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.delete(`${API_URL}/eliminar/${id}`, {
        headers: { "x-token": token }
      });

      Notify.create({
        type: "positive",
        message: "Negocio eliminado",
      });
      return r.data;
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.response?.data?.msg || "Error al eliminar negocio",
      });
      console.log(error);
      return null;
    }
  };


  return {
    negocios,
    negocio,
    listarNegocios,
    obtenerNegocioPorId,
    sumarVisita,
    crearNegocio,
    editarNegocio,
    activarNegocio,
    desactivarNegocio,
    eliminarNegocio,
  };

});
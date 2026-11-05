import { onMounted, ref } from 'vue';

import type { Usuarios } from '@/interfaces/usuarios';

const usuarios = ref<Usuarios[]>([]);
const cargandoUsuarios = ref(false);
const errorUsuarios = ref(false);

async function cargarUsuarios() {
  if (cargandoUsuarios.value || usuarios.value.length) return;

  cargandoUsuarios.value = true;
  errorUsuarios.value = false;
  try {
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    usuarios.value = await respuesta.json();
  } catch {
    errorUsuarios.value = true;
  } finally {
    cargandoUsuarios.value = false;
  }
}

const listaUsuarios = { usuarios, cargandoUsuarios, errorUsuarios, cargarUsuarios };

export function useUsuarios(): typeof listaUsuarios {
  onMounted(cargarUsuarios);
  return listaUsuarios;
}

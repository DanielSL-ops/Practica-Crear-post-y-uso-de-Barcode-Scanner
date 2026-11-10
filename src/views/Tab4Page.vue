<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>DS4</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form v-if="!usuario" class="acceso" @submit.prevent="iniciarSesion">
        <h2>Iniciar sesión</h2>

        <label for="correo">Correo</label>
        <input id="correo" v-model.trim="correo" type="email" autocomplete="email" required :disabled="cargando" />

        <label for="clave">Contraseña</label>
        <input
          id="clave"
          v-model="clave"
          type="password"
          autocomplete="current-password"
          required
          :disabled="cargando"
        />

        <ion-button type="submit" expand="block" :disabled="cargando">
          {{ cargando ? 'Ingresando…' : 'Ingresar' }}
        </ion-button>
      </form>

      <template v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ usuario.name || 'Usuario DS4' }}</ion-card-title>
            <ion-card-subtitle>{{ usuario.email || 'Sesión activa' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p v-if="usuario.id !== undefined">ID: {{ usuario.id }}</p>
            <ion-button type="button" expand="block" fill="outline" @click="cerrarSesion">Cerrar sesión</ion-button>
          </ion-card-content>
        </ion-card>

        <div class="encabezado-pedidos">
          <h2>Pedidos</h2>
          <ion-button type="button" fill="clear" size="small" :disabled="cargandoPedidos" @click="cargarPedidos">
            Actualizar
          </ion-button>
        </div>
        <p v-if="cargandoPedidos" role="status">Cargando pedidos…</p>
        <p v-else-if="errorPedidos" role="status">{{ errorPedidos }}</p>
        <p v-else-if="!pedidos.length" role="status">No hay pedidos disponibles.</p>
        <ion-list v-else>
          <ion-item v-for="pedido in pedidos" :key="pedido.id">
            <ion-label>
              <h2>{{ pedido.numero_orden }}</h2>
              <p>{{ pedido.customer?.name || 'Cliente sin nombre' }}</p>
              <p>IVA: {{ pedido.iva }} · Total: {{ pedido.total }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>

      <p v-if="mensaje" class="mensaje" role="status">{{ mensaje }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';

import {
  cargarOrdenesDs4,
  cargarUsuarioDs4,
  cerrarSesionDs4,
  haySesionDs4,
  iniciarSesionDs4,
  type Ds4Order,
  type Ds4User,
} from '@/services/ds4';

const correo = ref('');
const clave = ref('');
const usuario = ref<Ds4User | null>(null);
const cargando = ref(false);
const mensaje = ref('');
const pedidos = ref<Ds4Order[]>([]);
const cargandoPedidos = ref(false);
const errorPedidos = ref('');

async function cargarPedidos() {
  cargandoPedidos.value = true;
  errorPedidos.value = '';
  try {
    pedidos.value = await cargarOrdenesDs4();
  } catch (error) {
    pedidos.value = [];
    errorPedidos.value =
      error instanceof TypeError
        ? 'No se pudo conectar con el servidor DS4.'
        : error instanceof Error
          ? error.message
          : 'No se pudieron cargar los pedidos.';
  } finally {
    cargandoPedidos.value = false;
  }
}

async function ejecutar(carga: () => Promise<Ds4User>) {
  cargando.value = true;
  mensaje.value = '';
  try {
    usuario.value = await carga();
    await cargarPedidos();
  } catch (error) {
    usuario.value = null;
    mensaje.value =
      error instanceof TypeError
        ? 'No se pudo conectar con el servidor DS4.'
        : error instanceof Error
          ? error.message
          : 'No se pudo conectar con DS4.';
  } finally {
    cargando.value = false;
  }
}

async function iniciarSesion() {
  await ejecutar(() => iniciarSesionDs4(correo.value, clave.value));
  if (usuario.value) clave.value = '';
}

function cerrarSesion() {
  cerrarSesionDs4();
  usuario.value = null;
  pedidos.value = [];
  errorPedidos.value = '';
  clave.value = '';
  mensaje.value = '';
}

onMounted(() => {
  if (haySesionDs4()) void ejecutar(cargarUsuarioDs4);
});
</script>

<style scoped>
.acceso {
  display: grid;
  max-width: 36rem;
  margin: 0 auto;
}

h2 {
  margin-top: 0;
}

label {
  margin: 0.75rem 0 0.375rem;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ion-color-medium);
  border-radius: 6px;
  background: var(--ion-background-color, white);
  color: var(--ion-text-color, black);
  font: inherit;
}

.acceso ion-button {
  margin-top: 1.5rem;
}

.mensaje {
  max-width: 36rem;
  margin: 0.75rem auto;
}

.encabezado-pedidos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0 0;
}

.encabezado-pedidos h2 {
  margin: 0;
}
</style>

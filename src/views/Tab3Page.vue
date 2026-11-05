<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva publicación</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form class="formulario" @submit.prevent="publicar" @input="mensaje = ''">
        <div class="lector">
          <ion-button
            v-if="!leyendoQr"
            type="button"
            fill="outline"
            :disabled="enviando || !usuarios.length"
            @click="abrirLector"
          >
            <ion-icon slot="start" :icon="qrCodeOutline" aria-hidden="true" />
            Leer QR
          </ion-button>
          <template v-else>
            <div class="vista-camara">
              <QrcodeStream @detect="rellenarDesdeQr" @error="errorDeCamara" />
            </div>
            <ion-button type="button" fill="outline" @click="cerrarLector">Cancelar lectura</ion-button>
          </template>
        </div>

        <label for="titulo">Título</label>
        <input id="titulo" v-model="titulo" required :disabled="enviando" />

        <label for="contenido">Contenido</label>
        <textarea id="contenido" v-model="contenido" rows="5" required :disabled="enviando"></textarea>

        <label for="usuario">Usuario</label>
        <select id="usuario" v-model="usuarioId" required :disabled="enviando || !usuarios.length">
          <option disabled value="">Selecciona un usuario</option>
          <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.name }}</option>
        </select>
        <p v-if="cargandoUsuarios" role="status">Cargando usuarios…</p>
        <p v-else-if="errorUsuarios" role="status">No se pudieron cargar los usuarios.</p>
        <p v-else-if="!usuarios.length" role="status">No hay usuarios disponibles.</p>
        <ion-button v-if="errorUsuarios" type="button" fill="outline" @click="cargarUsuarios">
          Reintentar carga de usuarios
        </ion-button>

        <ion-button type="submit" expand="block" :disabled="leyendoQr || enviando || usuarioId === ''">
          {{ enviando ? 'Publicando…' : 'Publicar' }}
        </ion-button>
        <p role="status" class="mensaje">{{ mensaje }}</p>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
} from '@ionic/vue';
import { qrCodeOutline } from 'ionicons/icons';
import { QrcodeStream, setZXingModuleOverrides } from 'vue-qrcode-reader';
import wasmLector from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { useUsuarios } from '@/composables/useUsuarios';
import { leerPublicacionQr } from '@/qr/publicacion';

// Sirve el decodificador junto con la app para poder leer el QR sin un CDN.
setZXingModuleOverrides({ locateFile: () => wasmLector });

const { usuarios, cargandoUsuarios, errorUsuarios, cargarUsuarios } = useUsuarios();
const titulo = ref('');
const contenido = ref('');
const usuarioId = ref<number | ''>('');
const enviando = ref(false);
const mensaje = ref('');
const leyendoQr = ref(false);

function abrirLector() {
  mensaje.value = '';
  leyendoQr.value = true;
}

function cerrarLector() {
  leyendoQr.value = false;
}

onIonViewWillLeave(cerrarLector);

function rellenarDesdeQr(codigos: { rawValue: string }[]) {
  if (!leyendoQr.value || !codigos.length) return;
  cerrarLector();
  try {
    const datos = leerPublicacionQr(codigos[0].rawValue, usuarios.value);
    titulo.value = datos.title;
    contenido.value = datos.body;
    usuarioId.value = datos.userId;
    mensaje.value = 'Datos cargados.';
  } catch (error) {
    mensaje.value = error instanceof Error ? error.message : 'El QR no contiene una publicación válida.';
  }
}

function errorDeCamara(error: Error) {
  if (!leyendoQr.value) return;
  cerrarLector();
  switch (error.name) {
    case 'NotAllowedError':
      mensaje.value = 'Permite el acceso a la cámara en los permisos del sitio y vuelve a pulsar Leer QR.';
      break;
    case 'NotFoundError':
      mensaje.value = 'Conecta una cámara y vuelve a pulsar Leer QR.';
      break;
    case 'InsecureContextError':
      mensaje.value = 'Abre la aplicación en localhost o por HTTPS para usar la cámara.';
      break;
    default:
      mensaje.value = 'No se pudo iniciar la cámara. Comprueba que esté disponible y vuelve a intentarlo.';
  }
}

async function publicar() {
  if (enviando.value || leyendoQr.value) return;
  if (!usuarios.value.some((usuario) => usuario.id === usuarioId.value)) {
    mensaje.value = 'Selecciona un usuario de la lista.';
    return;
  }

  const publicacion = { title: titulo.value.trim(), body: contenido.value.trim(), userId: usuarioId.value };
  if (!publicacion.title || !publicacion.body) {
    mensaje.value = 'Escribe un título y un contenido para publicar.';
    return;
  }

  enviando.value = true;
  mensaje.value = '';
  try {
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(publicacion),
    });
    if (!respuesta.ok) throw new Error(String(respuesta.status));

    const creada = await respuesta.json();
    mensaje.value = `Publicación de prueba enviada (ID ${creada.id}).`;
    titulo.value = '';
    contenido.value = '';
  } catch {
    mensaje.value = 'No se pudo enviar la publicación. Inténtalo de nuevo.';
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped>
.formulario {
  display: grid;
  max-width: 36rem;
  margin: 0 auto;
}

label {
  margin: 0.75rem 0 0.375rem;
  font-weight: 600;
}

.lector ion-button {
  margin: 0;
}

.vista-camara {
  aspect-ratio: 4 / 3;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border-radius: 6px;
  background: #161616;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ion-color-medium);
  border-radius: 6px;
  background: var(--ion-background-color, white);
  color: var(--ion-text-color, black);
  font: inherit;
}

textarea {
  resize: vertical;
}

ion-button {
  margin: 1.5rem 0 0;
}

.mensaje {
  margin: 0.75rem 0;
}
</style>

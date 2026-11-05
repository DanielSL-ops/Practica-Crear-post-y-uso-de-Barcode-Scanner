<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Publicaciones</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p v-if="mensaje" class="ion-padding" role="status">{{ mensaje }}</p>
      <ion-list v-else>
        <ion-item v-for="post in posts" :key="post.id">
          <ion-label class="ion-text-wrap">{{ post.title }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

const posts = ref<{ id: number; title: string }[]>([]);
const mensaje = ref('Cargando publicaciones…');

onMounted(async () => {
  try {
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    posts.value = await respuesta.json();
    mensaje.value = posts.value.length ? '' : 'No hay publicaciones.';
  } catch {
    mensaje.value = 'No se pudieron cargar las publicaciones.';
  }
});
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
            <ion-back-button>Back</ion-back-button>
        </ion-buttons>
        <ion-title>Usuario</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
     
    <ion-card>
    <img alt="Silhouette of mountains" src="https://ionicframework.com/docs/img/demos/card-media.png" />
    <ion-card-header>
      <ion-card-title>{{ usuario?.name }}</ion-card-title>
      <ion-card-subtitle>{{ usuario?.email }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
        <p>
            {{ usuario?.username }}
        </p>
        <p>
            {{ usuario?.phone }}
        </p>
        <p>
            {{ usuario?.website }}
        </p>
    </ion-card-content>
  </ion-card>
     
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButtons, IonBackButton } from '@ionic/vue';
import { ref } from 'vue';
import { Usuarios } from '@/interfaces/usuarios';

import { useRoute } from 'vue-router';

const route = useRoute();

const usuario = ref<Usuarios | null>(null);

function cargarUsuario(){

  fetch('https://jsonplaceholder.typicode.com/users/' + route.params.id)
  .then(response => response.json())
  .then(json => {
    console.log(json);
    usuario.value = json;

  })

}
cargarUsuario();

</script>

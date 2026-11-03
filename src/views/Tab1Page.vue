<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Usuarios</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
     

       <ion-list>
        <ion-item v-for="usuario in usuarios" :key="usuario.id" :router-link="`/users/${usuario.id}`">
          <ion-label>
            {{ usuario.name }}
            <small>{{ usuario.email }}</small>
          </ion-label>
        </ion-item>
        
      </ion-list>
     
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Usuarios } from '@/interfaces/usuarios';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/vue';
import { ref } from 'vue';

const usuarios = ref<Usuarios[]>([]);

function cargarUsuarios(){

  fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => response.json())
  .then(json => {
    console.log(json);
    usuarios.value = json;

  })

}
cargarUsuarios();

</script>

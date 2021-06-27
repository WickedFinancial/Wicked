<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6"><h1>App</h1></v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
@Component
export default class App extends Vue {}
</script>

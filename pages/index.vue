<template>
  <v-container>
    <v-row justify="center" align="center" data-testid="index-page">
      <v-col cols="12" sm="8" md="6"></v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator"

@Component
export default class Index extends Vue {}
</script>

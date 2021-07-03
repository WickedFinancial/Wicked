<template>
  <v-img
    id="wicked"
    max-width="120"
    alt="Wicked"
    src="/wicked.svg"
    position="left center"
    role="img"
    aria-label="Site Name"
  />
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator"

@Component
export default class Wicked extends Vue {}
</script>
<style scoped>
#Wicked{
  margin-top: 5px !important;
  margin-left: 5px !important;
}
</style>

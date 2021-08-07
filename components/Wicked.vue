<template>
  <v-img
    id="logo"
    max-width="120"
    alt="Wicked"
    src="/wicked-logo.svg"
    position="left center"
    role="img"
    aria-label="Site Name"
  />
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator"

@Component
export default class WickedLogo extends Vue {}
</script>
<style scoped>
#logo {
  margin-top: 5px !important;
  margin-left: 5px !important;
}
</style>

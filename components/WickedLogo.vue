<template>
  <v-img
    id="Logo"
    max-width="30"
    alt="Wicked Logo"
    src="/wicked-logo.svg"
    position="left center"
    role="img"
    aria-label="Site Logo"
  />
</template>
<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator"

@Component
export default class WickedLogo extends Vue {}
</script>

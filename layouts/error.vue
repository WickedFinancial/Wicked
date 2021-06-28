<template>
  <v-container>
    <h2>Status Code: {{ error.statusCode }}</h2>
    <h3>Message: {{ error.message }}</h3>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator"

interface AppError {
  code: number
  message: string
  stack: string
  statusCode: number
}

@Component
export default class ErrorLayout extends Vue {
  @Prop({ default: null }) error: AppError | undefined
  pageNotFound = "404 Not Found"
  otherError = "An error occurred"

  head() {
    const title =
      this.error?.statusCode === 404 ? this.pageNotFound : this.otherError
    return { title }
  }
}
</script>

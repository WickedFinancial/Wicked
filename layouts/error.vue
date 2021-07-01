<script lang="ts">
import { Component, Prop, Vue } from "nuxt-property-decorator"

interface AppError {
  code: number
  message: string
  stack: string
  statusCode: number
}

@Component<ErrorLayout>({
  head() {
    const title = this.otherError
    return { title }
  },
  mounted() {
    window.location.reload()
  },
})
export default class ErrorLayout extends Vue {
  @Prop({ default: null }) error: AppError | undefined
  otherError = "An error occurred"
}
</script>

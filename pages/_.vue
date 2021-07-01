<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component({
  asyncData({ redirect }) {
    return redirect("/")
  },
})
export default class CatchAll extends Vue {}
</script>

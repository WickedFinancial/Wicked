import Vuetify from "Vuetify"
import {
  ConfigurationCallback,
  render,
  RenderOptions,
  RenderResult,
} from "@testing-library/vue"
import Vue from "vue"

Vue.use(Vuetify)
Vue.component("NuxtLink", { template: "<a></a>" }) // stubbing out nuxt-link

function renderWithVuetify<VueComponent>(
  component: VueComponent,
  options?: RenderOptions<never>,
  callback?: ConfigurationCallback<never>
): RenderResult {
  const root = document.createElement("div")
  root.setAttribute("data-app", "true")
  const mergedOptions = {
    container: document.body.appendChild(root),
    // for Vuetify components that use the $vuetify instance property
    vuetify: new Vuetify({}),
    ...options,
  }

  return render(component, mergedOptions, callback)
}

export { renderWithVuetify }

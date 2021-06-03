import "@testing-library/jest-dom"
import Index from "@/pages/index.vue"
import Vuex, { Store } from "vuex"
import { useAccessor } from "typed-vuex"
import Vue from "vue"
import { storePattern, RootState } from "~/store"
import { renderWithVuetify as render } from "~/test/utils"

describe("Index Page", () => {
  let screen: ReturnType<typeof render>
  let store: Store<RootState>
  Vue.use(Vuex)

  beforeEach(() => {
    store = new Store(storePattern)
    // changes to the default store can be made here.
    useAccessor(store, storePattern)
    screen = render(Index)
  })

  it("should be justified to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("justify-center")
  })

  it("should be aligned to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("align-center")
  })
})

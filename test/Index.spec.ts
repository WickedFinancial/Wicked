import "@testing-library/jest-dom"
import Index from "@/pages/index.vue"
import Vuex, { Store } from "vuex"
import { useAccessor } from "typed-vuex"
import Vue from "vue"
import { storePattern, RootState } from "~/store"
import { renderWithVuetify } from "~/test/utils"

describe("Index Page", () => {
  let screen: ReturnType<typeof renderWithVuetify>
  let store: Store<RootState>

  beforeEach(() => {
    Vue.use(Vuex)
    store = new Store(storePattern)
    useAccessor(store, storePattern)
    screen = renderWithVuetify(Index)
  })

  it("should be justified to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("justify-center")
  })

  it("should be aligned to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("align-center")
  })
})

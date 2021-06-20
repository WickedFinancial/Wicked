import "@testing-library/jest-dom"
import Index from "@/pages/index.vue"
import { renderWithVuetify as render } from "~/test/utils"

describe("Index Page", () => {
  let screen: ReturnType<typeof render>

  beforeEach(() => {
    screen = render(Index)
  })

  it("should be justified to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("justify-center")
  })

  it("should be aligned to the center", () => {
    expect(screen.getByTestId("index-page")).toHaveClass("align-center")
  })
})

import Logo from "~/components/AvowLogo.vue"
import "@testing-library/jest-dom"
import { renderWithVuetify as render } from "~/test/utils"

describe("Logo", () => {
  it("should have an image role", () => {
    expect(render(Logo).getByRole("img")).toBeTruthy()
  })
  it("should match a snapshot", () => {
    expect(render(Logo).getByRole("img")).toMatchSnapshot()
  })
})

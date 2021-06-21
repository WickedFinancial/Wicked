import "@testing-library/jest-dom"
import { screen, fireEvent } from "@testing-library/vue"
import Web3BtnComponent from "~/components/Web3Btn.vue"
import { renderWithVuetify as render } from "~/test/utils"
import web3 from "~/store/web3"

describe("Web3Btn", () => {
  let btn: HTMLElement
  beforeEach(() => {
    btn = render(Web3BtnComponent, { store: { modules: { web3 } } }).getByRole(
      "button"
    )
  })
  it("should be on the screen and accessible by role button", () => {
    expect(btn).toBeInTheDocument()
  })
  it("should match a snapshot", () => {
    expect(btn).toMatchSnapshot()
  })
  it("should be disconnected by default", () => {
    expect(screen.getByText("Connect"))
  })
  it("should toggle status on click", async () => {
    expect(btn).toHaveTextContent("Connect")
    await fireEvent.click(btn)
    expect(btn).toHaveTextContent("Disconnect")
  })
})

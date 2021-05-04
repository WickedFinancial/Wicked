import { render } from '@testing-library/vue'
import Logo from '~/components/Logo.vue'
import '@testing-library/jest-dom'

describe('Logo', () => {
  it('should have an image role', () => {
    expect(render(Logo).getByRole('img')).toBeTruthy()
  })
  it('should have class VueToNuxtLogo', () => {
    expect(render(Logo).getByRole('img')).toHaveClass('VueToNuxtLogo')
  })
})

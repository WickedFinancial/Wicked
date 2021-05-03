import '@testing-library/jest-dom'
import Logo from '@/components/Logo.vue'
import { render } from '@testing-library/vue'

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = render(Logo)
    expect(wrapper).toBeTruthy()
  })
})

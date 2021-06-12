/**
 * @jest-environment node
 */

import { ethers } from "hardhat"
import { waffleJest } from "@ethereum-waffle/jest";
jest.setTimeout(10000);
expect.extend(waffleJest);


describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter")
    const greeter = await Greeter.deploy("Hello, world!")

    await greeter.deployed()
    expect(await greeter.greet()).toBe("Hello, world!")

    await greeter.setGreeting("Hola, mundo!")
    expect(await greeter.greet()).toBe("Hola, mundo!")
  })
})

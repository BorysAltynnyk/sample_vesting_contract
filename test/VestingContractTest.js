const { expect } = require("chai");

describe("Vesting contract", () => {
  it("should init default vesting period", async () => {
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();

    // await contract.deployed();
    // expect(await contract.getVestingPeriod()).to.equal(5 * 24 * 3600);
  });
});
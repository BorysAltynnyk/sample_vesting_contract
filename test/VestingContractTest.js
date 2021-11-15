const { expect } = require("chai");

const DAY_IN_SECONDS = 24 * 3600
const VESTING_PERIOD = 5 * DAY_IN_SECONDS
const NUMBER_OF_TRANSHES = 5
const TOKENS_COUNT = 100

describe("Vesting contract", () => {

  let contract
  beforeEach(async () => {
    const VestingContract = await ethers.getContractFactory("VestingContract");
    contract = await VestingContract.deploy(VESTING_PERIOD, NUMBER_OF_TRANSHES, TOKENS_COUNT);

    await contract.deployed();
  })

  it("should init default vesting period", async () => {
    expect(await contract.getVestingPeriod()).to.equal(VESTING_PERIOD);
  });

  it("should give tokens after first vesting period pasted", async () => {
    const [_, addr1] = await ethers.getSigners();
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD])

    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    const tokensFromSingleTransh = TOKENS_COUNT / NUMBER_OF_TRANSHES;
    expect((newBalance - oldBalance)/Math.pow(10,18)).to.equal(tokensFromSingleTransh);
  })

  it("should give 2 portion of tokens after first claim if 2 periods are pasted", async () => {
    const [_, addr1] = await ethers.getSigners();
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD * 2])
    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    expect((newBalance - oldBalance)/Math.pow(10,18)).to.equal(TOKENS_COUNT / NUMBER_OF_TRANSHES * 2);
  })

  it("should give all assigned tokens after all vesting periods are passed", async () => {
    const [_, addr1] = await ethers.getSigners();
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD * 100])
    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());
    expect((newBalance - oldBalance)/Math.pow(10,18)).to.equal(TOKENS_COUNT);
  })

  it("should allow users to claim token in 5 periods", async () => {
    const [_, addr1] = await ethers.getSigners();

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());
    for (let iteration = 1; iteration <= NUMBER_OF_TRANSHES; iteration++) {
      const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

      await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD])
      await contract.connect(addr1).claim();

      const newBalance = await contract.getTokenBalance(await addr1.getAddress());
      expect((newBalance - oldBalance)/Math.pow(10,18)).to.equal(TOKENS_COUNT / NUMBER_OF_TRANSHES);
    }
  })

  it("should not allow to add recipient with amount that exceed total tokens count", async () => {
    const [_, addr1] = await ethers.getSigners();
    await expect(
      contract.addRecipient(TOKENS_COUNT +1, await addr1.getAddress())
    ).to.be.revertedWith("Not enough tokens to share!");
  })

  it("should not allow to add recipient from not owner address", async () => {
    const [_, addr1] = await ethers.getSigners();
    await expect(
      contract.connect(addr1).addRecipient(TOKENS_COUNT, await addr1.getAddress())
    ).to.be.revertedWith("Only owner can call this function");

  })

  it("should share token correctly between two recipients", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();
    
    await contract.addRecipient(TOKENS_COUNT/5*4, await addr1.getAddress());
    await contract.addRecipient(TOKENS_COUNT/5*1, await addr2.getAddress());
    console.log('super1');
    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD*10]);
    console.log('super2');
    await contract.connect(addr1).claim();
    await contract.connect(addr2).claim();
    
    
    const addr1Balance = await contract.getTokenBalance(await addr1.getAddress());
    
    const addr2Balance = await contract.getTokenBalance(await addr2.getAddress());
    await expect(addr1Balance/Math.pow(10,18)).to.be.equal(TOKENS_COUNT/5*4);
    await expect(addr2Balance/Math.pow(10,18)).to.be.equal(TOKENS_COUNT/5*1);

  })  

});
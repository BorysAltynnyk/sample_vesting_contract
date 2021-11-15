const { expect } = require("chai");

const DAY_IN_SECONDS = 24*3600
const VESTING_PERIOD = 5 * DAY_IN_SECONDS
const NUMBER_OF_TRANSHES = 5
const TOKENS_COUNT = 100

describe("Vesting contract", () => {



  it("should init default vesting period", async () => {
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();

    await contract.deployed();
    expect(await contract.getVestingPeriod()).to.equal(VESTING_PERIOD);
  });

  it("should give tokens after first vesting period pasted", async () => {
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD])

    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    const tokensFromSingleTransh = TOKENS_COUNT / NUMBER_OF_TRANSHES;
    expect(newBalance - oldBalance).to.equal(tokensFromSingleTransh);
  })

  it("should give 2 portion of tokens after first claim if 2 periods are pasted", async()=>{
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD * 2])
    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    expect(newBalance - oldBalance).to.equal(TOKENS_COUNT/NUMBER_OF_TRANSHES * 2);
  })

  it("should give all assigned tokens after all vesting periods are passed", async()=>{
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(TOKENS_COUNT, await addr1.getAddress());

    await ethers.provider.send("evm_increaseTime", [VESTING_PERIOD * 100])
    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());
    expect(newBalance - oldBalance).to.equal(TOKENS_COUNT);
  })
});
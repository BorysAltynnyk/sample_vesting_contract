const { expect } = require("chai");


describe("Vesting contract", () => {
  it("should init default vesting period", async () => {
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();

    await contract.deployed();
    expect(await contract.getVestingPeriod()).to.equal(5 * 24 * 3600);
  });

  it("should give tokens after first vesting period pasted", async () =>{
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(100, await addr1.getAddress());

    //time travel 1 period
    // suppose the current block has a timestamp of 01:00 PM
    await ethers.provider.send("evm_increaseTime", [5*24*3600])
    // await ethers.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp

    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    expect(newBalance - oldBalance).to.equal(100/5);
  })

  it("should give 2 portion if tokens after first claim if 2 periods are pasted", async()=>{
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(100, await addr1.getAddress());

    //time travel 1 period
    // suppose the current block has a timestamp of 01:00 PM
    await ethers.provider.send("evm_increaseTime", [10*24*3600])
    // await ethers.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp

    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    expect(newBalance - oldBalance).to.equal(100/5 * 2);

  })

  it("should NOT give more than 5 portion after all periods are passed", async()=>{
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const contract = await VestingContract.deploy();
    await contract.deployed();

    const [_, addr1] = await ethers.getSigners();  
    const oldBalance = await contract.getTokenBalance(await addr1.getAddress());

    await contract.addRecipient(100, await addr1.getAddress());

    //time travel 1 period
    // suppose the current block has a timestamp of 01:00 PM
    await ethers.provider.send("evm_increaseTime", [25*24*3600])
    // await ethers.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp

    await contract.connect(addr1).claim()

    const newBalance = await contract.getTokenBalance(await addr1.getAddress());

    expect(newBalance - oldBalance).to.equal(100/5 *5);

  })


});
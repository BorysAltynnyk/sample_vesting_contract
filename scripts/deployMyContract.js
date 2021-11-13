async function main() {
  const VestingContract = await ethers.getContractFactory("VestingContract");
  const myContract = await VestingContract.deploy();

  console.log("Vesting contract deployed to:", myContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});
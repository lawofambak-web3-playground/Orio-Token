const hre = require("hardhat");

async function main() {
  // Deplying contracts
  const OrioToken = await hre.ethers.getContractFactory("OrioToken");
  console.log("Deploying OrioToken...");
  const orioToken = await OrioToken.deploy();

  await orioToken.deployed();

  console.log("OrioToken deployed to:", orioToken.address);

  const OrioTokenSale = await hre.ethers.getContractFactory("OrioTokenSale");
  console.log("Deploying OrioTokenSale...");
  const orioTokenSale = await OrioTokenSale.deploy(orioToken.address);

  await orioTokenSale.deployed();

  console.log("OrioTokenSale deployed to:", orioTokenSale.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  // OrioToken deployed to: 0xAbf10038184376Ec49A5DBF47f5cB618896FDfEB
  // https://rinkeby.etherscan.io/address/0xAbf10038184376Ec49A5DBF47f5cB618896FDfEB

  // OrioTokenSale deployed to: 0xDB2b16D0e8b29966A326dB3E9f909bB4005D467f
  // https://rinkeby.etherscan.io/address/0xDB2b16D0e8b29966A326dB3E9f909bB4005D467f
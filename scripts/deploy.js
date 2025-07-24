const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeVote contract...");

  // Get contract factory
  const DeVote = await ethers.getContractFactory("DeVote");
  
  // Deploy contract
  const deVote = await DeVote.deploy();
  
  // Wait for deployment to complete
  await deVote.waitForDeployment();
  
  const contractAddress = await deVote.getAddress();
  console.log("DeVote contract deployed to:", contractAddress);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  
  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Export contract address and ABI to a file that can be used by the frontend
  const fs = require("fs");
  const contractsDir = "./src/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  
  // Export contract address
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ DeVote: contractAddress }, undefined, 2)
  );
  
  // Export contract ABI
  const DeVoteArtifact = await artifacts.readArtifact("DeVote");
  fs.writeFileSync(
    contractsDir + "/DeVote.json",
    JSON.stringify(DeVoteArtifact, null, 2)
  );
  
  console.log("Contract address and ABI exported to src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
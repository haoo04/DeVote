const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeVote contract...");

  // 获取合约工厂
  const DeVote = await ethers.getContractFactory("DeVote");
  
  // 部署合约
  const deVote = await DeVote.deploy();
  
  // 等待部署完成
  await deVote.waitForDeployment();
  
  const contractAddress = await deVote.getAddress();
  console.log("DeVote contract deployed to:", contractAddress);
  
  // 获取部署者地址
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  
  // 获取部署者余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // 导出合约地址和ABI到前端可用的文件
  const fs = require("fs");
  const contractsDir = "./src/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  
  // 导出合约地址
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ DeVote: contractAddress }, undefined, 2)
  );
  
  // 导出合约ABI
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
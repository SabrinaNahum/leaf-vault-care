import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedReflection = await deploy("EncryptedNightlyReflection", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedNightlyReflection contract: `, deployedReflection.address);

  // Verify contract deployment
  if (deployedReflection.newlyDeployed) {
    console.log("✅ Contract deployed successfully");
    console.log(`📋 Contract address: ${deployedReflection.address}`);
    console.log(`🔗 Transaction hash: ${deployedReflection.transactionHash}`);
  } else {
    console.log("ℹ️  Contract already deployed at:", deployedReflection.address);
  }
};
export default func;
func.id = "deploy_reflection"; // id required to prevent reexecution
func.tags = ["EncryptedNightlyReflection"];


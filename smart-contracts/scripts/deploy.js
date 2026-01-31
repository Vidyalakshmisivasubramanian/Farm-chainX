const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying CropTraceability contract...");

    const CropTraceability = await hre.ethers.getContractFactory("CropTraceability");
    const contract = await CropTraceability.deploy();

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log(`✅ CropTraceability deployed to: ${contractAddress}`);
    console.log("\n📋 Next Steps:");
    console.log("1. Copy the contract address above");
    console.log("2. Update backend/src/main/resources/application.properties");
    console.log("3. Set: farmxchain.contract.address=" + contractAddress);
    console.log("4. Restart your Spring Boot backend\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

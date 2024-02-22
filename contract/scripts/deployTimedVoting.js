
// Import Hardhat runtime environment (HRE)
const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    try {
        // Attempt to get the contract factory
        console.log("Fetching contract factory for 'timedVoting'...");
        const TimedVoting = await hre.ethers.getContractFactory("timedVoting");
        console.log("'timedVoting' contract factory fetched successfully.");

        // Attempt to deploy the contract
        console.log("Deploying 'timedVoting'...");
        const timedVotingInstance = await TimedVoting.deploy();
        console.log("'timedVoting' deployed, waiting for it to be mined...");
        
        // Wait for the contract to be deployed
        await timedVotingInstance.deployed();
        console.log("'timedVoting' deployed and mined successfully.");

        // Log the address to which the contract was deployed
        console.log("timedVoting deployed to:", timedVotingInstance.address);
    } catch (error) {
        console.error("An error occurred during the deployment process:", error.message);
        throw error; // Rethrow the error to be caught by the catch block below
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error("Deployment script failed:", error);
    process.exit(1);
});

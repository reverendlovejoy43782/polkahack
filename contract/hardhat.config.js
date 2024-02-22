// Imports 
require("@nomiclabs/hardhat-ethers");

// Load environment variables
require("dotenv").config({ path: "../.env" }); 

// Define your Hardhat configuration
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Specify the version of the Solidity compiler you want to use
  solidity: "0.8.24",
  networks: {
    // Configuration for the Moonbeam network
    moonbeam: {
      // URL to the Moonbeam network via OnFinality, including your API key
      url: process.env.RPC_URL, // Should be a string, not an array
      // List of account private keys to use for transactions on the Moonbeam network
      // Ensure the private key is correctly prefixed with '0x'
      accounts: [process.env.PRIVATE_KEY].filter(Boolean), // Ensure the private key is defined and filter out undefined
    },
  },
};
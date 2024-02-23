// Importing Hardhat plugins using require
require("@nomiclabs/hardhat-ethers");

// Loading environment variables synchronously using dotenv
require("dotenv").config({ path: "../.env" });

// Hardhat configuration
module.exports = {
  solidity: "0.8.24",
  networks: {
    local: {
      url: "http://localhost:8545",
    },
   
    /*
    moonbeam: {
      url: process.env.RPC_URL, // Ensure this environment variable is set
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    */
  },
};

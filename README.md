# Voting Station

*A convenient platform for Web 0-3 groups to conduct recurring and on-demand digital votes.*

## Lack of secure and verifiable digital voting for traditional groups

Groups like works councils in companies, political parties (internal voting), or property owners in large real estate entities face challenges in conducting secure and verifiable digital votes. These "traditional" groups require the capability to conduct either recurring (for instance, monthly) or on-demand voting. The votes are significant enough to necessitate a secure voting tool capable of digitally verifying the outcomes. However, they are not so critical as to attract major security threats, such as those from state-sponsored hackers, which are a concern in regional or national elections.

Currently, many of these groups rely on analog methods due to the lack of digital tools that offer sufficient security and result verification. Additionally, vote management and result tracking are often fragmented, treating each vote as an isolated event rather than part of an ongoing governance process.

## A web2 voting platform with just enough web3 to make it secure, verifiable, trusted

An easy-to-use and modular voting platform is needed that leverages the convenience and speed of Web2, while incorporating just enough of Web3 to infuse trust in digital voting.


# How the App Solves the Problem Specifically

Voting Station acts as a wrapper platform around the technical prototype, Voting App, which is not part of this hackathon entry but is essential for the functionality. Our platform integrates with Voting App to streamline the voting process, ensuring secure, verifiable, and easy-to-manage votes. By treating votes and their results as part of a continuous governance stream, Voting Station simplifies the governance process for groups, moving away from the fragmented, one-by-one vote management approach of the past.

## Architecture

Voting Station utilizes React for the frontend, ethers.js for Ethereum blockchain interactions, and Solidity for smart contract development. This is meant to be deployed to Moonbeam in the future.

### Client-Side Application (React)

- Utilizes React for dynamic user interface management, including state management (useState, useEffect) for controlling web view displays and interaction with Ethereum smart contracts.
- Incorporates ethers.js for Ethereum blockchain interactions, enabling contract interactions via Contract, JsonRpcProvider, and Wallet components.

### Smart contract (EVM)

- Establishes a connection to Ethereum networks (local or Moonbeam) using environmental configurations for contract address, RPC URLs, and private keys.
- Manages voting phases (idle, setup open/close, vote open/close) and web view states through smart contract functions (createGroup, closeGroup, checkAndUpdateExecution) and events (DisplayWebView, CloseWebView).
- Written in Solidity, defines a contract timedVoting with states for voting phases and web views, owner management, and event emissions for UI responses.
- Controls voting process flow, including group creation, voting phase transitions, and time-based execution checks.
- Secures contract operations with onlyOwner modifier, ensuring that only authorized actions are performed.
- Use of Hardhat for Ethereum development, config specifying compiler versions and network settings for local development and potential Moonbeam deployment.


## Restrictions of this app compared to the whole concept


Google Slides Link: INSERT HERE


# User flow
Screenshots 

## Step 1

# Using the code

- Clone the repo
- Create .env file in root/client folder
- In root/contract start the local blockchain (hardhat): npx hardhat node
- Choose an account private key from the list of test accounts and insert in .env: REACT_APP_TEST_PRIVATE_KEY=TEST_PRIVATE_KEY
- In root/contract: npx hardhat run scripts/deployTimedVoting.js --network localhost
- Insert the contract address from deployment in .env: REACT_APP_CONTRACT_ADDRESS=DEPLOYED_CONTRACT_ADDRESS
- in root/client: npm start
(!) Because the voting app is not part of this entry and not public (yet), the iframe will not show the voting app but the process of voting station is functional.
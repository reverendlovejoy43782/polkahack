// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract timedVoting {
    uint256 public nextExecutionTime;
    uint256 public cycleCounter = 0; // Counter to track the number of cycles
    bool public webViewDisplayed = false;
    address public owner;

    event DisplayWebView();
    event CloseWebView();

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to be called by "Create Group" in the React app
    function initializeGroup() public onlyOwner {
        require(cycleCounter == 1, "Cycle already initialized");
        nextExecutionTime = block.timestamp + 2 minutes; // Set to 2 minutes from now
        cycleCounter = 1; // Start the first cycle
    }

    // Adjusted check and update execution logic
    function checkAndUpdateExecution() external {
        require(block.timestamp >= nextExecutionTime, "It is not time yet");
        // Adjusted condition to allow for the cycle to repeat as intended
        require(cycleCounter >= 1 && cycleCounter <= 4, "Cycle limit reached or not started");


        if (!webViewDisplayed) {
            emit DisplayWebView();
            webViewDisplayed = true;
            nextExecutionTime = block.timestamp + 30 seconds; // Display for 30 seconds
        } else {
            emit CloseWebView();
            webViewDisplayed = false;
            nextExecutionTime = block.timestamp + 2 minutes; // Then wait for 2 minutes
            cycleCounter += 1;
        }
    }

    // Function to reset the cycle (could be used for testing or re-initializing)
    function resetCycle() external onlyOwner {
        cycleCounter = 1; // Reset the cycle counter to 1
        webViewDisplayed = false;
        nextExecutionTime = 0; // Resetting the execution time as well
    }
}
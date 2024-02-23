// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract timedVoting {
    uint256 public nextExecutionTime;
    bool public webViewDisplayed = false;
    bool public activeGroup = false;
    address public owner;

    event DisplayWebView(uint256 blockTime, bool activeGroup);
    event CloseWebView(uint256 blockTime, bool activeGroup);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to be called by "Create Group" in the React app
    function createGroup() public onlyOwner {
        nextExecutionTime = block.timestamp + 2 minutes; // Set to 2 minutes from now
        activeGroup = true;
        

    }

    // Function to be called by "Create Group" in the React app
    function closeGroup() public onlyOwner {
        activeGroup = false;
    }

    // Adjusted check and update execution logic
    function checkAndUpdateExecution() external {
        require(block.timestamp >= nextExecutionTime, "It is not time yet");
        require(activeGroup, "Group is not active");

        if (!webViewDisplayed) {
            emit DisplayWebView(block.timestamp, activeGroup);
            webViewDisplayed = true;
            nextExecutionTime = block.timestamp + 30 seconds; // Display for 30 seconds
        } else {
            emit CloseWebView(block.timestamp, activeGroup);
            webViewDisplayed = false;
            nextExecutionTime = block.timestamp + 2 minutes; // Then wait for 2 minutes
        }
    }

}

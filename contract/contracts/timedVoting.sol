// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract timedVoting {

    // votingPhase (no group = idle, setup to open and close, vote to open and close)
    enum VotingPhase {
        Idle,
        SetupOpen,
        SetupClose,
        VoteOpen,
        VoteClose
    }


    // webViewState (no webview, setup webview open, vote webview open)
    enum WebViewState {
        NotDisplayed,
        SetupDisplay,
        VotingDisplay
    }
    
    // at the start of the contract, the voting phase is idle and the webview state is not displayed
    VotingPhase public currentPhase = VotingPhase.Idle;
    WebViewState public currentWebViewState = WebViewState.NotDisplayed;


    // time when the next execution is allowed
    uint256 public nextExecutionTime;

    // owner of the contract
    address public owner;

    // events for the app to listen to
    event DisplayWebView(uint256 blockTime, WebViewState webViewState);
    event CloseWebView(uint256 blockTime, WebViewState webViewState);

    // ensure that only the owner can call the function
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }




    // function for app to retrieve the current phase (used)
    function getCurrentPhase() public view returns (VotingPhase) {
        return currentPhase;
    }

    // function for app to retrieve the current web view state (not used as of now)
    function getCurrentWebViewState() public view returns (WebViewState) {
    return currentWebViewState;
    }


    // Create the group (here switch from idle to first phase which is setup open) and start the automatic setup and voting process, make it possible to start on demand vote, in the future we need a contract that creates contracts for each group
    function createGroup() public onlyOwner {
        require(currentPhase == VotingPhase.Idle, "Process already initiated");
        nextExecutionTime = block.timestamp + 1 minutes; // Setup opens in 1 minute
        currentPhase = VotingPhase.SetupOpen;
        currentWebViewState = WebViewState.SetupDisplay; // Display setup immediately
    }



    // Close group to deactivate (here set to idle) the automatic setup and voting process, in the future we need a contract that creates contracts for each group and deactivates them
    function closeGroup() public onlyOwner {
        currentPhase = VotingPhase.Idle;
    }

    // Push the contract one phase further, this is the main function that is called by the app to move the process forward
    function checkAndUpdateExecution() external {
        require(block.timestamp >= nextExecutionTime, "It is not time yet");
        require(currentPhase != VotingPhase.Idle, "No active process");

        if (currentPhase == VotingPhase.SetupOpen) {
            emit DisplayWebView(block.timestamp, currentWebViewState);
            nextExecutionTime = block.timestamp + 30 seconds;
            currentPhase = VotingPhase.SetupClose;
            currentWebViewState = WebViewState.NotDisplayed; // Assuming setup display is no longer needed
        } else if (currentPhase == VotingPhase.SetupClose) {
            emit CloseWebView(block.timestamp, currentWebViewState);
            nextExecutionTime = block.timestamp + 1 minutes;
            currentPhase = VotingPhase.VoteOpen;
            currentWebViewState = WebViewState.VotingDisplay; // Display voting web view
        } else if (currentPhase == VotingPhase.VoteOpen) {
            emit DisplayWebView(block.timestamp, currentWebViewState);
            nextExecutionTime = block.timestamp + 30 seconds;
            currentPhase = VotingPhase.VoteClose;
            currentWebViewState = WebViewState.NotDisplayed; // Assuming voting display is no longer needed
        } else if (currentPhase == VotingPhase.VoteClose) {
            emit CloseWebView(block.timestamp, currentWebViewState);
            nextExecutionTime = block.timestamp + 1 minutes; // Setup opens in 1 minute
            currentPhase = VotingPhase.SetupOpen; // Reset to Idle or start a new cycle as needed
            currentWebViewState = WebViewState.SetupDisplay; // Display results
        }
    }

}

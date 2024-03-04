// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract timedVoting {

    /// START NEW CODE
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

    /// END NEW CODE


    uint256 public nextExecutionTime;
    //bool public webViewDisplayed = false; // kommt raus
    //bool public activeGroup = false; // kommt raus
    address public owner;

    /// START NEW CODE

    event DisplayWebView(uint256 blockTime, WebViewState webViewState);
    event CloseWebView(uint256 blockTime, WebViewState webViewState);

    /// END NEW CODE

    //event DisplayWebView(uint256 blockTime, bool activeGroup); // kommt raus
    //event CloseWebView(uint256 blockTime, bool activeGroup); // kommt raus

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }



    /// START NEW CODE

    // function for app to retrieve the current phase
    function getCurrentPhase() public view returns (VotingPhase) {
        return currentPhase;
    }

    // function for app to retrieve the current web view state
    function getCurrentWebViewState() public view returns (WebViewState) {
    return currentWebViewState;
    }



    function createGroup() public onlyOwner {
        require(currentPhase == VotingPhase.Idle, "Process already initiated");
        nextExecutionTime = block.timestamp + 1 minutes; // Setup opens in 1 minute
        currentPhase = VotingPhase.SetupOpen;
        currentWebViewState = WebViewState.SetupDisplay; // Display setup immediately
    }

    function closeGroup() public onlyOwner {
        currentPhase = VotingPhase.Idle;
    }


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

    /// END NEW CODE


    /// START KOMMT RAUS
    /*
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
    */
    // END KOMMT RAUS

}

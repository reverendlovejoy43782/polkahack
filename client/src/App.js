// Importing necessary hooks from React
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Importing necessary components from ethers for interacting with Ethereum
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

// Importing the ABI of your smart contract for interaction
import TimedVotingABI from './TimedVotingABI.json';

// Importing CSS for styling
import './App.css';

// START TESTING CONFIG
// Configuration for connecting to the deployed contract
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Deployed contract address
const localRpcUrl = "http://127.0.0.1:8545"; // URL for the local Hardhat network
const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Private key for testing
// END TESTING CONFIG

function App() {
    const [shouldDisplayWebView, setShouldDisplayWebView] = useState(false); // State to control the display of the web view

    // Creating instances for provider, signer, and contract using useMemo for performance optimization
    const provider = useMemo(() => new JsonRpcProvider(localRpcUrl), []);
    const signer = useMemo(() => new Wallet(testPrivateKey, provider), [provider]);
    const contract = useMemo(() => new Contract(contractAddress, TimedVotingABI, signer), [signer]);

    /// START NEW CODE
    const [currentPhase, setCurrentPhase] = useState(0); // Assuming 0 corresponds to the 'Idle' phase
    /// END NEW CODE
    const [activeGroup, setActiveGroup] = useState(false); // State to hold the activeGroup flag
    
    // State to hold the current and next vote times for display
    const [displayCurrentTime, setDisplayCurrentTime] = useState('');
    const [displayNextVoteTime, setDisplayNextVoteTime] = useState('');

    // State to hold the voting URL received from the iframe page
    const [votingUrl, setVotingUrl] = useState(''); // Add this line

    // State to hold the URL for the iframe
    const [iframeSrc, setIframeSrc] = useState('');

    const [pdfUrl, setPdfUrl] = useState(''); // State to hold the PDF URL received from the iframe page
    const [hashValue, setHashValue] = useState(''); // State to hold the hash value received from the iframe page
    const [subscanUrl, setSubscanUrl] = useState(''); // State to hold the Subscan URL received from the iframe page


    /// START NEW CODE
    // New function to fetch the current voting phase and determine the active group status
    const fetchCurrentPhaseActiveGroup = useCallback(async () => {
      try {
          // Correctly call getCurrentPhase as a function
          const phase = await contract.getCurrentPhase();
          const phaseNumber = Number(phase); // Convert BigNumber to a number
          console.log('Current phase:', phaseNumber);
          // Assuming phase '0' corresponds to 'Idle'. Adjust according to your enum in the smart contract
          const isActiveGroup = phaseNumber !== 0;
          console.log('Is group active:', isActiveGroup);
          setActiveGroup(isActiveGroup); // Update activeGroup based on whether the phase is Idle
          setCurrentPhase(phaseNumber); // Update currentPhase with the correct number
      } catch (error) {
          console.error('Error fetching current phase:', error);
      }
    }, [contract]);
    

    // Use the new function in an effect hook to fetch the current phase when the component mounts or when the contract instance changes
    useEffect(() => {
      fetchCurrentPhaseActiveGroup();
    }, [fetchCurrentPhaseActiveGroup]);
    /// END NEW CODE
    // Function to fetch the activeGroup flag from the contract
    /*
    const fetchActiveGroupFlag = useCallback(async () => {
      try {
          const isActiveGroup = await contract.activeGroup();
          console.log('Is group active:', isActiveGroup);
          setActiveGroup(isActiveGroup); // Update the state with the fetched value
      } catch (error) {
          console.error('Error fetching active group flag:', error);
      }
    }, [contract]);
    

    // Call the function to fetch the activeGroup flag when the component mounts and when contract changes
    
    useEffect(() => {
      fetchActiveGroupFlag();
    }, [fetchActiveGroupFlag]); // Dependency array ensures the function is called when needed
    */

    const increaseBlockTimeAndNumber = async () => {
      // Call a function to increase the block time by 30 seconds and the block number by 1
      try {
          // Fetch the current block number
          const blockNumber = await provider.getBlockNumber();
          // Fetch the current block
          const block = await provider.getBlock(blockNumber);
          // Calculate the new timestamp by adding 30 seconds
          const newTimestamp = block.timestamp + 30;
          // Use ethers.provider.send to manipulate the block timestamp
          await provider.send("evm_setNextBlockTimestamp", [newTimestamp]);
          // Use ethers.provider.send to mine a new block, effectively increasing the block number by 1
          await provider.send("evm_mine", []);
      } catch (error) {
          console.error("Error increasing block time and number:", error);
      }
    };

    // Effect hook for setting up and cleaning up event listeners
    useEffect(() => {
        const onDisplayWebView = () => {
            console.log("Displaying web view");
            setShouldDisplayWebView(true); // Update state to show web view
        };

        const onCloseWebView = () => {
            console.log("Closing web view");
            setShouldDisplayWebView(false); // Update state to hide web view
        };

        // Registering event listeners for the contract events
        console.log("Registering event listeners for the contract...");
        contract.on('DisplayWebView', onDisplayWebView);
        contract.on('CloseWebView', onCloseWebView);

        // Returning a cleanup function that removes event listeners upon component unmount
        return () => {
            console.log("Removing event listeners for the contract...");
            contract.off('DisplayWebView', onDisplayWebView);
            contract.off('CloseWebView', onCloseWebView);
        };
    }, [contract]);

    // Function to call the createGroup method on the contract
    const createGroup = async () => {
      try {
        console.log('Attempting to create group with current phase:', currentPhase);
        const tx = await contract.createGroup();
        await tx.wait();
        console.log('Group created successfully');
        await fetchCurrentPhaseActiveGroup();
      } catch (error) {
        console.error('Failed to create group:', error);
        alert(`Failed to create group: ${error.message}`);
      }
    };

    // Function to call the initializeGroup method on the contract
    const closeGroup = async () => {
      try {
        const tx = await contract.closeGroup();
        await tx.wait();
        console.log('Group closed successfully');
        // Fetch the activeGroup flag after the transaction is mined
        await fetchCurrentPhaseActiveGroup(); // Re-fetch the activeGroup state
      } catch (error) {
        console.error('Failed to close group:', error);
        // Display a user-friendly error message or take specific actions based on error type
        alert(`Failed to close group: ${error.message}`);
      }
    };
    
  
    // Function to call the checkAndUpdateExecution method on the contract
    const checkAndUpdate = useCallback(async () => {
      try {
          const tx = await contract.checkAndUpdateExecution();
          await tx.wait();
          console.log('checkAndUpdateExecution called successfully');
    
          // Fetch both the current web view state and current phase from the contract
          const webViewState = await contract.getCurrentWebViewState();
          const currentPhase = await contract.getCurrentPhase(); // Fetch current phase
          console.log('Current web view state:', webViewState, 'Current Phase:', currentPhase);
    
          // Decision logic to determine which URL to display
          if (currentPhase === 2 || currentPhase === 3) { // SetupDisplay state or corresponding phase
              setIframeSrc("http://127.0.0.1:5000/vote_admin");
              console.log('Displaying setup web view with URL:', iframeSrc);
              setShouldDisplayWebView(true);
          } else if (currentPhase === 1 || currentPhase === 4) { // VotingDisplay state or corresponding voting phase
              
              console.log('Displaying voting web view with URL:', votingUrl);
              setIframeSrc(votingUrl);
              setShouldDisplayWebView(true);
          } else {
              console.log('Not displaying any web view.');
              setShouldDisplayWebView(false);
          }
      } catch (error) {
          console.error('Failed to call checkAndUpdateExecution:', error);
          alert(`Failed to call checkAndUpdateExecution: ${error.message}`);
      }
    }, [contract, votingUrl, iframeSrc]);
    


    useEffect(() => {
      const receiveMessage = (event) => {
        console.log("Received message:", event.data);
        // Perform origin check for security purposes
        if (event.origin !== "http://127.0.0.1:5000") return;

        if (event.data.type === "SET_VOTING_URL") {
            console.log("Received voting URL from setup page:", event.data.voteUrl);
            setVotingUrl(event.data.voteUrl); // Set the received URL for later use
        }


        if (event.data && event.data.type === 'VOTE_DATA') {
          const { pdfUrl, hashValue, subscanUrl } = event.data;
    
          // Do something with the received data, such as updating state
          setPdfUrl(pdfUrl);
          setHashValue(hashValue);
          setSubscanUrl(subscanUrl);
          console.log('Received vote data:', pdfUrl, hashValue, subscanUrl);
        }
      };
  
      window.addEventListener("message", receiveMessage);
  
      return () => window.removeEventListener("message", receiveMessage);
    }, []);
  
  

    

    

    // Polling functionality to trigger checkAndUpdateExecution at the correct times
    useEffect(() => {
        if (!activeGroup) return; // Skip polling if activeGroup is false

        const interval = setInterval(async () => {
            try {
                // Fetching the current block time from the blockchain
                const blockNumber = await provider.getBlockNumber();
                console.log('Current block number:', blockNumber);

                const block = await provider.getBlock(blockNumber);
                console.log('Current block timestamp:', block.timestamp);
                
                // Get the current block timestamp from the blockchain
                const currentTime = block.timestamp;


                // Convert current blockchain time to 'mm:ss' format
                const currentTimeFormatted = new Date(currentTime * 1000);
                const currentTimeFormattedmmss = [
                  currentTimeFormatted.getHours().toString().padStart(2, '0'),
                  currentTimeFormatted.getMinutes().toString().padStart(2, '0'),
                  currentTimeFormatted.getSeconds().toString().padStart(2, '0'),
                ].join(':');
                
                setDisplayCurrentTime(currentTimeFormattedmmss);
                console.log('Current time:', currentTimeFormattedmmss);

                // Fetching the next execution time from the contract
                const nextVoteTime = await contract.nextExecutionTime();

                // 

                // Convert next execution time from the contract to 'mm:ss' format
                const nextVoteTimeFormatted = new Date(nextVoteTime.toNumber() * 1000);
                const nextVoteTimeFormattedmmss = [
                  nextVoteTimeFormatted.getHours().toString().padStart(2, '0'),
                  nextVoteTimeFormatted.getMinutes().toString().padStart(2, '0'),
                  nextVoteTimeFormatted.getSeconds().toString().padStart(2, '0'),
                ].join(':');
                
                setDisplayNextVoteTime(nextVoteTimeFormattedmmss);
                console.log('Next execution time:', nextVoteTimeFormattedmmss);

                // If the current time is on or past the next execution time, trigger checkAndUpdateExecution
                if(currentTime >= nextVoteTime.toNumber()) {
                    console.log('Triggering checkAndUpdateExecution...');
                    await checkAndUpdate();
                }
            } catch (error) {
                console.error('Error polling block time or triggering execution:', error);
            }
        }, 10000); // Polling every 10 seconds for demonstration

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, [provider, contract, checkAndUpdate, activeGroup]); // Include checkAndUpdate in the dependencies

    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="flex justify-between items-center text-2xl font-bold p-4 bg-white shadow-md w-full">
          <span>
            Vote robot
          </span>
          

          
            {!shouldDisplayWebView ? (
              <span style={{ fontSize: '18px' }}>
                Next regular vote: {displayNextVoteTime}
              </span>
            ) : (
              <span style={{ fontSize: '18px' }}>
                End of vote: {displayNextVoteTime}
              </span>
            )}

          
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-start pt-10">
          {!shouldDisplayWebView ? (
            <div className="flex flex-col items-center space-y-4">
              
              <button 
                  onClick={currentPhase === 0 ? createGroup : closeGroup} 
                  className="w-40 h-12 rounded-md bg-indigo-600 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center">
                  {currentPhase === 0 ? 'Create Group' : 'Close Group'}
              </button>

              {activeGroup && (
                <button 
                    onClick={() => {/* Implement on demand vote functionality */}} 
                    className="w-40 h-12 rounded-md bg-indigo-600 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center">
                    On Demand Vote
                </button>
              )}

              
              
            </div>


          ) : (

            <iframe 
              src= {iframeSrc} 
              title="Web View" 
              className="w-full flex-1"
              sandbox="allow-scripts allow-forms allow-same-origin allow-downloads"
              loading="lazy"
            />
          )}


          {/* Footer container for the button */}
          <div className="mt-auto">
            <div className="flex justify-start p-4">
              <button 
                onClick={increaseBlockTimeAndNumber} 
                className="w-12 h-12 rounded-md bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
    
  
}

export default App;

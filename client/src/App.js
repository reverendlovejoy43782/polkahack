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
    const [activeGroup, setActiveGroup] = useState(false); // State to hold the activeGroup flag
    
    // State to hold the current and next vote times for display
    const [displayCurrentTime, setDisplayCurrentTime] = useState('');
    const [displayNextVoteTime, setDisplayNextVoteTime] = useState('');


    // Function to fetch the activeGroup flag from the contract
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
        const tx = await contract.createGroup();
        await tx.wait();
        console.log('Group created successfully');
        // Fetch the activeGroup flag after the transaction is mined
        await fetchActiveGroupFlag(); // Re-fetch the activeGroup state
      } catch (error) {
        console.error('Failed to create group:', error);
        // Display a user-friendly error message or take specific actions based on error type
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
        await fetchActiveGroupFlag(); // Re-fetch the activeGroup state
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
            const webViewStatus = await contract.webViewDisplayed();
            setShouldDisplayWebView(webViewStatus);
        } catch (error) {
          console.error('Failed to call checkAndUpdateExecution:', error);
          alert(`Failed to call checkAndUpdateExecution: ${error.message}`)
        }
    }, [contract]);

    

    

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
          <span style={{ fontSize: '18px' }}>
            Current time: {displayCurrentTime}
          </span>

          
            {!shouldDisplayWebView ? (
              <span style={{ fontSize: '18px' }}>
                Next vote: {displayNextVoteTime}
              </span>
            ) : (
              <span style={{ fontSize: '18px' }}>
                End of vote: {displayNextVoteTime}
              </span>
            )}

          <button 
            onClick={increaseBlockTimeAndNumber} 
            className="w-12 h-12 rounded-md bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center">
            +
          </button>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-start pt-10">
          {!shouldDisplayWebView ? (
            <div className="flex flex-col items-center space-y-4">
              
              <button 
                  onClick={activeGroup ? closeGroup : createGroup} 
                  className="w-40 h-12 rounded-md bg-indigo-600 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center">
                  {activeGroup ? 'Close Group' : 'Create Group'}
              </button>
              
            </div>
          ) : (

            <iframe 
              src="http://127.0.0.1:5000/vote/main_heavy_autumn" 
              title="Web View" 
              className="w-full flex-1"
              sandbox="allow-scripts allow-forms allow-same-origin allow-downloads"
              loading="lazy"
            />
          )}
        </div>
      </div>
    );
    
  
}

export default App;

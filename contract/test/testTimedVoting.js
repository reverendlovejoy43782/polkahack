const { ethers } = require("hardhat");
let expect;

describe("TimedVoting Contract", function () {
  let TimedVoting;
  let timedVoting;
  let owner;

  before(async function() {
    const chai = await import('chai');
    expect = chai.expect;
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    TimedVoting = await ethers.getContractFactory("timedVoting");
    timedVoting = await TimedVoting.deploy();
    await timedVoting.deployed();
  });

  it("Should start in Idle phase", async function () {
    const currentPhase = await timedVoting.getCurrentPhase();
    expect(currentPhase).to.equal(0); // Assuming 0 represents the Idle phase
  });

  it("Should transition to SetupOpen phase when creating a group", async function () {
    await timedVoting.createGroup();
    const currentPhase = await timedVoting.getCurrentPhase();
    expect(currentPhase).to.equal(1); // Assuming 1 represents the SetupOpen phase
  });

  it("Should handle transition through phases correctly", async function () {
    // Transition to SetupOpen phase
    await timedVoting.createGroup();
    let currentPhase = await timedVoting.getCurrentPhase();
    expect(currentPhase).to.equal(1); // SetupOpen

    // Simulate time passage and trigger phase transition
    await network.provider.send("evm_increaseTime", [60]); // Adjust time as per your contract logic
    await network.provider.send("evm_mine");
    await timedVoting.checkAndUpdateExecution();
    
    // Check phase transitioned to SetupClose (assuming 2 represents SetupClose)
    currentPhase = await timedVoting.getCurrentPhase();
    expect(currentPhase).to.equal(2); // SetupClose

    // Continue this pattern for other phase transitions as needed
  });

  it("Should reset to Idle phase when closing a group", async function () {
    await timedVoting.createGroup();
    await timedVoting.closeGroup();
    const currentPhase = await timedVoting.getCurrentPhase();
    expect(currentPhase).to.equal(0); // Back to Idle
  });
});

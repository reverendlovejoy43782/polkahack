const { ethers, network } = require("hardhat");
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

  it("Should initialize group correctly", async function () {
    const tx = await timedVoting.initializeGroup();
    await tx.wait();

    const cycleCounter = await timedVoting.cycleCounter();
    expect(cycleCounter.toNumber()).to.equal(1); // Convert BigNumber to number

    const nextExecutionTime = await timedVoting.nextExecutionTime();
    const currentTime = (await ethers.provider.getBlock('latest')).timestamp;
    expect(nextExecutionTime.toNumber()).to.be.closeTo(currentTime + 120, 5); // Use .toNumber() here too
});

it("Should handle a full cycle", async function () {
    await timedVoting.initializeGroup();

    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    await timedVoting.checkAndUpdateExecution();

    const webViewDisplayed = await timedVoting.webViewDisplayed();
    expect(webViewDisplayed).to.be.true;

    await network.provider.send("evm_increaseTime", [30]);
    await network.provider.send("evm_mine");

    await timedVoting.checkAndUpdateExecution();
    const cycleCounter = await timedVoting.cycleCounter();
    expect(cycleCounter.toNumber()).to.equal(2); // Convert BigNumber to number for comparison

    const newWebViewDisplayed = await timedVoting.webViewDisplayed();
    expect(newWebViewDisplayed).to.be.false;
});

});

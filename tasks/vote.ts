import { task } from "hardhat/config";
// import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
// import "@typechain/hardhat";
// import "hardhat-gas-reporter";
// import "solidity-coverage";
// import "@nomiclabs/hardhat-web3";

task("vote", "Voting on the proposals")
  .addParam("proposalid", "Proposal to be voted")
  .addParam("amount", "Amount of tokens to be submitted")
  .addParam("votefor", "Vote For / Against")

  .setAction(async (taskArgs, hre) => {
    const [sender, secondaccount, thirdaccount, fourthaccount] =
      await hre.ethers.getSigners();

    const DAOToken = await hre.ethers.getContractFactory("DAOToken");
    const dAOToken = await DAOToken.deploy();
    await dAOToken.deployed();

    const DAOProject = await hre.ethers.getContractFactory("DAOProject");
    const dAOProject = await DAOProject.deploy(
      sender.address,
      dAOToken.address,
      40,
      100
    );
    await dAOProject.deployed();

    let output = await dAOProject
      .connect(sender)
      .voting(taskArgs.proposalid, taskArgs.amount, taskArgs.votefor);

    console.log(await output);
  });

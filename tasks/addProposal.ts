import { task } from "hardhat/config";
// import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
// import "@typechain/hardhat";
// import "hardhat-gas-reporter";
// import "solidity-coverage";
// import "@nomiclabs/hardhat-web3";

task("addProposal", "Add Proposal to DAO")
  .addParam("calldata", "Call Data for the Function")
  .addParam("recipient", "Address for the Contract to be executed")
  .addParam("description", "Description of the function")

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
      .newProposal(taskArgs.calldata, taskArgs.recipient, taskArgs.description);

    console.log(await output);
  });

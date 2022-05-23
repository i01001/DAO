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
    const MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
    const marketPlace = await MarketPlace.deploy();
    await marketPlace.deployed();

    const MNFT721 = await hre.ethers.getContractFactory("MNFT721");
    const mNFT721 = await MNFT721.deploy();
    await mNFT721.deployed();

    const MNFT1155 = await hre.ethers.getContractFactory("MNFT1155");
    const mNF1155 = await MNFT1155.deploy();
    await mNF1155.deployed();

    await marketPlace.connect(sender).setNFT721ContractAddress(mNFT721.address);
    await marketPlace
      .connect(sender)
      .setNFT1155ContractAddress(mNF1155.address);

    let output = await marketPlace
      .connect(sender)
      .createItem(taskArgs.bool, taskArgs.tokenuri, taskArgs.amountfornft1155);

    console.log(await output);
  });

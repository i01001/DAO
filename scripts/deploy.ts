// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  let owner: SignerWithAddress,
    signertwo: SignerWithAddress,
    signerthree: SignerWithAddress;
  [owner, signertwo, signerthree] = await ethers.getSigners();

  const DAOToken = await ethers.getContractFactory("DAOToken");
  const dAOToken = await DAOToken.deploy();

  await dAOToken.deployed();

  console.log("DAOToken deployed to:", dAOToken.address);

  const DAOProject = await ethers.getContractFactory("DAOProject");
  const dAOProject = await DAOProject.deploy(
    owner.address,
    dAOToken.address,
    40,
    100
  );

  await dAOProject.deployed();

  console.log("DAOProject deployed to:", dAOProject.address);

  const TestCalldata = await ethers.getContractFactory("TestCalldata");
  const testCalldata = await TestCalldata.deploy();

  await testCalldata.deployed();

  console.log("TestCalldata deployed to:", testCalldata.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { expect } from "chai";
import { BigNumber } from "bignumber.js";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DAOProject, DAOToken, TestCalldata } from "../typechain";
import "@nomiclabs/hardhat-web3";

async function getCurrentTime() {
  return (
    await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
  ).timestamp;
}

async function evm_increaseTime(seconds: number) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

describe("Testing the DAO Project Contract", () => {
  let dAO: DAOProject;
  let dAOT: DAOToken;
  let testCall: TestCalldata;
  let clean: any;
  let owner: SignerWithAddress,
    signertwo: SignerWithAddress,
    signerthree: SignerWithAddress;

  before(async () => {
    [owner, signertwo, signerthree] = await ethers.getSigners();

    const DAOT = await ethers.getContractFactory("DAOToken");
    dAOT = <DAOToken>await DAOT.deploy();
    await dAOT.deployed();

    const DAO = await ethers.getContractFactory("DAOProject");
    dAO = <DAOProject>await DAO.deploy(owner.address, dAOT.address, 40, 3600);
    await dAO.deployed();

    const TestCall = await ethers.getContractFactory("TestCalldata");
    testCall = <TestCalldata>await TestCall.deploy();
    await testCall.deployed();
  });

  describe("Checking DAO Token Contract is run correctly", () => {
    it("Checks the setDAOaddress is updated correctly or not", async () => {
      await dAOT.setDAOaddress(dAO.address);
      expect(await dAOT.DAO()).to.be.equal(await dAO.address);
    });

    it("Checks the mint function is minting tokens of the address", async () => {
      await dAOT.connect(owner).mint(owner.address, 10000);
      expect(await dAOT.balanceOf(owner.address)).to.be.equal(10000);
    });

    // it("Checks the mint function of the TNETH Contract is working correctly or not", async () => {
    //   await tNETH.mint(owner.address, 1000);
    //     expect(await tNETH.balanceOf(owner.address)).to.be.equal(1000);
    // })

    // it("Checks the balance function of the TNBSC Contract is correct or not", async () => {
    //     expect(await tNBSC.balanceOf(owner.address)).to.be.equal(0);
    // })

    // it("Checks the updateChainById function of the Bridge Contract is working correctly or not", async () => {
    //     expect(bC.connect(owner).updateChainById(31337, true)).to.be.revertedWith("true");
    // })

    // it("Checks the includeToken function of the Bridge Contract is working correctly or not", async () => {
    //   expect(bC.connect(owner).includeToken(31337, "0x0000000000000000000000000000000000000000")).to.be.reverted;
    //   expect(bC.connect(owner).includeToken(0, signertwo.address)).to.be.reverted;
    //   expect(bC.connect(owner).includeToken(31337, tNETH.address)).to.be.revertedWith("true");
    // })
  });
});

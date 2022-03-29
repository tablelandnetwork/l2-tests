import dotenv from "dotenv"
import { expect, use } from "chai";
import { solidity } from 'ethereum-waffle';
import { BigNumber, Contract, Wallet, Signer } from "ethers";
import hre from "hardhat";
import { ethers } from "hardhat";
import { TableEvents } from "../typechain";

// TODO: we may want to write this file as Typescript
// @ts-ignore
import FakeDatabase from "./generateStatements";

use(solidity);
dotenv.config({path: "../"});

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

interface Network {
  contract: string;
  rpc: string;
};


const fakeDb = new FakeDatabase();

const testFactory = async function (network: Network) {
  const query = fakeDb.generateRandomStatement();

  const provider = new ethers.providers.JsonRpcProvider(network.rpc);
  const artifact = await hre.artifacts.readArtifact("TableEvents");
  const wallet = new ethers.Wallet(
    PRIVATE_KEY,
    provider
  );

  const contract = new ethers.Contract(network.contract, artifact.abi, wallet);

  const transactionResponse = await contract.storeData("fake_table_name", query);

  const result = await transactionResponse.wait();

  // TODO: add a logger that saves this data
  console.log(result);

  await expect(transactionResponse).to.emit(contract, "DataStored").withArgs("fake_table_name", query);
};

describe("Registry", function () {
  before(function () {
    fakeDb.addTable();
  });

  it("log details of transaction on Arbitrum", async function () {
    await testFactory({
      // Arbitrum Rinkeby Testnet
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://rinkeby.arbitrum.io/rpc"
    });
  });

  it("log details of transaction on Optimism", async function () {
    await testFactory({
      // Optimism Rinkeby Testnet
      contract: "0x23C5e9D53CBAf6703839A503f0429C5D01796858",
      rpc: "https://kovan.optimism.io/"
    });
  });

  it("log details of transaction on Polygon", async function () {
    await testFactory({
      // Polygon Rinkeby Testnet
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://matic-mumbai.chainstacklabs.com"
    });
  });

  it("log details of transaction on Avalanche", async function () {
    await testFactory({
      // Avalanche Rinkeby Testnet
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://api.avax-test.network/ext/bc/C/rpc"
    });
  });
});

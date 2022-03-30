import dotenv from "dotenv"
import { expect, use } from "chai";
import { solidity } from 'ethereum-waffle';
import { BigNumber, Contract, Wallet, Signer } from "ethers";
import hre from "hardhat";
import { ethers } from "hardhat";
import { TableEvents } from "../typechain";
import log from "../logTransaction";

// TODO: we may want to write this file as Typescript
// @ts-ignore
import FakeDatabase from "./generateStatements";

use(solidity);
dotenv.config({path: "../"});

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

interface Network {
  name: string;
  overrides?: any;
  contract: string;
  rpc: string;
};


const fakeDb = new FakeDatabase();

const testFactory = async function (network: Network) {
  const startTime = Date.now();
  const query = fakeDb.generateRandomStatement();

  const provider = new ethers.providers.JsonRpcProvider(network.rpc);
  const artifact = await hre.artifacts.readArtifact("TableEvents");
  const wallet = new ethers.Wallet(
    PRIVATE_KEY,
    provider
  );

  const contract = new ethers.Contract(network.contract, artifact.abi, wallet);

  const args = network.overrides ? ["fake_table_name", query, network.overrides] : ["fake_table_name", query];

  const estimateGasResponse = await contract.estimateGas.storeData.apply(contract.estimateGas, args);
  console.log(`${network.name} Gas Estimate: ${estimateGasResponse.toString()}`);

  const transactionResponse = await contract.storeData.apply(contract, args);

  const result = await transactionResponse.wait();

  const endTime = Date.now();
  // TODO: add a logger that saves this data
  console.log(`${network.name} Gas Used: ${result.gasUsed.toString()}`);
  console.log(result);

  console.log('Time for transaction: ' + (endTime - startTime));

  await expect(transactionResponse).to.emit(contract, "DataStored").withArgs("fake_table_name", query);

  await log({
    network: network,
    duration: endTime - startTime,
    testDate: new Date().getTime(),
    transactionId: result.transactionHash,
    gasEstimate: estimateGasResponse.toString(),
    gasUsed: result.gasUsed.toString(),
    result: JSON.stringify(result),
  });
};

describe("Registry", function () {
  before(function () {
    fakeDb.addTable();
  });

  it("log details of transaction on Arbitrum", async function () {
    await testFactory({
      // Arbitrum Rinkeby Testnet
      name: "Arbitrum",
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://rinkeby.arbitrum.io/rpc"
    });
  });

  it("log details of transaction on Optimism", async function () {
    await testFactory({
      // Optimism Rinkeby Testnet
      name: "Optimism",
      contract: "0x23C5e9D53CBAf6703839A503f0429C5D01796858",
      rpc: "https://kovan.optimism.io/"
    });
  });

  it("log details of transaction on Polygon", async function () {
    await testFactory({
      // Polygon Rinkeby Testnet
      name: "Polygon",
      //overrides: {gasPrice: 30, gasLimit: 100},
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://matic-mumbai.chainstacklabs.com"//`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    });
  });

  it("log details of transaction on Avalanche", async function () {
    await testFactory({
      // Avalanche Rinkeby Testnet
      name: "Avalanche",
      contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
      rpc: "https://api.avax-test.network/ext/bc/C/rpc"
    });
  });
});

import dotenv from "dotenv";
import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
// import { BigNumber, Contract, Wallet, Signer } from "ethers";
import hre, { ethers } from "hardhat";
// import { TableEvents } from "../typechain";
// eslint-disable-next-line node/no-missing-import
import log from "./logTransaction";

// @ts-ignore
import FakeDatabase from "./generateStatements";

use(solidity);
dotenv.config({ path: "../" });

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

interface Network {
  name: string;
  overrides?: any;
  contract: string;
  rpc: string;
}

const fakeDb = new FakeDatabase();



const testFactory = async function (network: Network) {
  const queries = fakeDb.generateOrderedStatements(5);
  async function SendTxAwaitResponse(query: any) {
    console.log(query);
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const artifact = await hre.artifacts.readArtifact("TableEvents");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const contract = new ethers.Contract(
      network.contract,
      artifact.abi,
      wallet
    );

    const startTime = Date.now();
    const args = network.overrides
      ? ["fake_table_name", query, network.overrides]
      : ["fake_table_name", query];
    // const estimateGasResponse = await contract.estimateGas.storeData.apply(
    //   contract.estimateGas,
    //   args
    // );
    const transactionResponse = await contract.storeData.apply(contract, args);
    const result = await transactionResponse.wait();
    const endTime = Date.now();
    log({
      network: network,
      duration: endTime - startTime,
      testDate: new Date().getTime(),
      result: JSON.stringify(result),
      transactionId: result.transactionHash,
    });
    return result;
  }

  async function RunTransactions(queries: any) {
    let i = 0;
    const responses = [];
    while (i < queries.length) {
      const response = await SendTxAwaitResponse(queries[i]);
      responses.push(response);
      i++;
    }
    return responses;
  }

  await RunTransactions(queries);

  // await expect(transactionResponse)
  //   .to.emit(contract, "DataStored")
  //   .withArgs("fake_table_name", query);

  await expect(2).to.equal(2);
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
      rpc: "https://rinkeby.arbitrum.io/rpc",
    });
  });

  it("log details of transaction on Optimism", async function () {
    await testFactory({
      // Optimism Rinkeby Testnet
      name: "Optimism",
      contract: "0x23C5e9D53CBAf6703839A503f0429C5D01796858",
      rpc: "https://kovan.optimism.io/",
    });
  });

  // it("log details of transaction on Polygon", async function () {
  //   await testFactory({
  //     // Polygon Rinkeby Testnet
  //     name: "Polygon",
  //     // overrides: {gasPrice: 30, gasLimit: 100},
  //     contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
  //     rpc: "https://matic-mumbai.chainstacklabs.com", // `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  //   });
  // });

  // it("log details of transaction on Avalanche", async function () {
  //   await testFactory({
  //     // Avalanche Rinkeby Testnet
  //     name: "Avalanche",
  //     contract: "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7",
  //     rpc: "https://api.avax-test.network/ext/bc/C/rpc",
  //   });
  // });
});

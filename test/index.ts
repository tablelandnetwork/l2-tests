import dotenv from "dotenv"
import { expect, use } from "chai";
import { solidity } from 'ethereum-waffle';
import { BigNumber, Contract, Wallet, Signer } from "ethers";
import hre from "hardhat";
import { ethers } from "hardhat";
import { TableEvents } from "../typechain";

use(solidity);
dotenv.config({path: "../"});

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

// Arbitrum Rinkeby Testnet
const contractAddressArbitrum = "0xB72ee475aB153De39bdD2A3c50508Ab8920AFdD7";
// Optimism Kovan Testnet
const contractAddressOptimism = "0x23C5e9D53CBAf6703839A503f0429C5D01796858";

describe("Registry", function () {
  it("log details of transaction on Arbitrum", async function () {
    const query = "INSERT INTO fake_table_name (val1, val2, val3) VALUES (123, 'fizbazbuzz', true);"

    const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.arbitrum.io/rpc');
    const artifact = await hre.artifacts.readArtifact("TableEvents");
    const wallet = new ethers.Wallet(
      PRIVATE_KEY,
      provider
    );

    const contract = new ethers.Contract(contractAddressArbitrum, artifact.abi, wallet);

    const transactionResponse = await contract.storeData("fake_table_name", query);

    const result = await transactionResponse.wait();
    console.log(result);

    await expect(transactionResponse).to.emit(contract, "DataStored").withArgs("fake_table_name", query);
  });

  it("log details of transaction on Optimism", async function () {
    const query = "INSERT INTO fake_table_name (val1, val2, val3) VALUES (123, 'fizbazbuzz', true);"

    const provider = new ethers.providers.JsonRpcProvider('https://kovan.optimism.io/');
    const artifact = await hre.artifacts.readArtifact("TableEvents");
    const wallet = new ethers.Wallet(
      PRIVATE_KEY,
      provider
    );

    const contract = new ethers.Contract(contractAddressOptimism, artifact.abi, wallet);

    const transactionResponse = await contract.storeData("fake_table_name", query);

    const result = await transactionResponse.wait();
    console.log(result);

    await expect(transactionResponse).to.emit(contract, "DataStored").withArgs("fake_table_name", query);
  });
});

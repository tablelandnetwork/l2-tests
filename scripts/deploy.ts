// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const Registry = await ethers.getContractFactory("TableEvents");

  // const testnet = await upgrades.deployProxy(
  //   Registry,
  //   ["https://testnet.tableland.network/tables/"],
  //   {
  //     kind: "uups",
  //   }
  // );
  // console.log("Testnet proxy deployed to:", testnet.address);

  // const staging = await upgrades.deployProxy(
  //   Registry,
  //   ["https://staging.tableland.network/tables/"],
  //   {
  //     kind: "uups",
  //   }
  // );

  const registry = await Registry.deploy();
  await registry.deployed();
  console.log("Staging proxy deployed to:", registry.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

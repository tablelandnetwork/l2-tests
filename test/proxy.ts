import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import type { TableEvents } from "../typechain/index";

describe("Proxy", function () {
  it(" Should be callable from deployed proxy contract", async function () {
    const Factory = await ethers.getContractFactory("TableEvents");

    const registry = (await upgrades.deployProxy(
      Factory,
      ["https://fake.com/"],
      {
        kind: "uups",
      }
    )) as TableEvents;
    await registry.deployed();

    const totalSupply = await registry.totalSupply();
    expect(0).to.equal(Number(totalSupply.toString()));
  });

  it(" Should be able to deploy two proxy contracts with different baseURI", async function () {
    const [account] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TableEvents");

    const reg1 = (await upgrades.deployProxy(Factory, ["https://one.com/"], {
      kind: "uups",
    })) as TableEvents;
    await reg1.deployed();

    const reg2 = (await upgrades.deployProxy(Factory, ["https://two.com/"], {
      kind: "uups",
    })) as TableEvents;
    await reg2.deployed();

    expect(reg1.address).to.not.equal(reg2.address);
    const totalSupply = await reg1.totalSupply();
    expect(0).to.equal(Number(totalSupply.toString()));

    const tx = await reg1.safeMint(account.address);
    await tx.wait();

    const tokenURI = await reg1.tokenURI(0);
    expect(tokenURI).to.include("https://one.com/");
  });
});

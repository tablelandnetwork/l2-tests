import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { TableEvents } from "../typechain";

describe("Registry", function () {
  let registry: TableEvents;
  let accounts: SignerWithAddress[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TableEvents");
    registry = await Factory.deploy();
    await registry.deployed();
    // Manually call initialize because we are "deploying" the contract directly.
    await registry.initialize("https://website.com/");

  });

  it("Should mint a new table", async function () {
    const tx = await registry
      .connect(accounts[4]) // Use connect to test that _anyone_ can mint
      .safeMint(accounts[4].address);
    const receipt = await tx.wait();
    // Await for receipt and inspect events for token id etc.
    const [event] = receipt.events ?? [];
    expect(event.args!.tokenId).to.equal(BigNumber.from(0));
    const balance = await registry.balanceOf(accounts[4].address);
    expect(1).to.equal(Number(balance.toString()));
    const totalSupply = await registry.totalSupply();
    expect(1).to.equal(Number(totalSupply.toString()));
  });

  it("Should udpate the base URI", async function () {
    let tx = await registry.setBaseURI("https://fake.com/");
    await tx.wait();

    const target = accounts[4].address;
    tx = await registry.safeMint(target);
    await tx.wait();
    const tokenURI = await registry.tokenURI(0);
    expect(tokenURI).includes("https://fake.com/");
  });

  it("Should be easy to await the transaction", async function () {
    const mintAndReturnId = async (address: string): Promise<BigNumber> => {
      const tx = await registry.safeMint(address);
      const receipt = await tx.wait();
      const [event] = receipt.events ?? [];
      return event.args?.tokenId;
    };

    const target = accounts[4].address;
    // Here's our nice awaitable function
    const tokenId = await mintAndReturnId(target);
    expect(tokenId).to.equal(BigNumber.from(0));
  });
});

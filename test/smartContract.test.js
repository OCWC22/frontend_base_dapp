const { assert } = require("chai");

//import smart contract
const SmartContract = artifacts.require("./SmartContract.sol");

//import chai and use as promised to test
require("chai").use(require("chai-as-promised")).should();

//passes accounts as a function
contract("SmartContract", (accounts) => {
  
  
  let smartContract;

  //before smart contract test is run, check if its deployed
  before(async () => {
    //because of await, it is async 
    smartContract = await SmartContract.deployed();
  });

    describe("deployment", async() => {
      it("deploys successfully", async () => {
        const address = await smartContract.address;
        assert.notEqual(address, "");
        assert.notEqual(address, 0x0);
      });
    });

    describe("minting", async() => {
      it("minted successfully", async () => {
        const uri = "https://example.com";
        await smartContract.mint(accounts[0], uri);
        const tokenUri = await smartContract.tokenURI(0);
        const balanceOfOwner = await smartContract.balanceOf(accounts[0]);

        //tests if token uri is the uri that is mitnign taken place
        assert.equal(tokenUri, uri);

        //test if balance of owners nft count is 1
        assert.equal(balanceOfOwner, 1);
      });
    });
  // describe("smartContract deployment", async () => {
  //   it("deploys successfully", async () => {
  //     const address = await smartContract.address;
  //     assert.notEqual(address, 0x0);
  //     assert.notEqual(address, "");
  //   });

  //   it("has correct name", async () => {
  //     const name = await smartContract.name();
  //     assert.equal(name, "Smart Contract");
  //   });
  // });
});


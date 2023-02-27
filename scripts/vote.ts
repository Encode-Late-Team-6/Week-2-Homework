import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const CONTRACT = "0x1A69cfd82FF050737EA1C20895698EAE3907745b";

async function main() {
  //--WALLET + CONTRACT SETUP
  const provider = new ethers.providers.InfuraProvider('goerli', process.env.INFURA_API_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) {
    throw new Error("No private key provided");
  }
  const wallet = new ethers.Wallet(privateKey); // using our actual metamask wallet
  const signer = wallet.connect(provider);
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = await ballotContractFactory.attach(CONTRACT);
  
  //--CALL CONTRACT FUNCTION
  const txn = await ballotContract.vote(1)
  const txReceipt = await txn.wait();
  
  console.log('Vote successfully cast!');
  console.log('The transaction hash is: ', txReceipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
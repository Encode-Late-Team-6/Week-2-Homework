import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32Array = (stringArray: string[]) => {
    return stringArray.map(prop => ethers.utils.formatBytes32String(prop));
}

async function main() {
    //--WALLET + CONTRACT SETUP
    const provider = new ethers.providers.InfuraProvider('goerli', process.env.INFURA_API_KEY);
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key provided");
    }
    const wallet = new ethers.Wallet(privateKey); // using our actual metamask wallet
    const signer = wallet.connect(provider);
    
    //--CALL CONTRACT FUNCTION
    const proposals = PROPOSALS;
    if (proposals.length <= 0) {
        throw new Error("No proposals provided");
    }
    
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.deploy(
        convertStringArrayToBytes32Array(proposals)
    );
    
    const txReceipt = await ballotContract.deployTransaction.wait();

    console.log('The ballot contract was deployed at address: ', ballotContract.address);
    console.log('The transaction hash is: ', txReceipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

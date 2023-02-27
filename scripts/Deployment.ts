import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32Array = (stringArray: string[]) => {
    return stringArray.map(prop => ethers.utils.formatBytes32String(prop));
}

async function main() {
    const provider = new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY);
    const privateKey = process.env.PRIVATE_WALLET_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key provided");
    }

    const wallet = new ethers.Wallet(privateKey); // By passing the key we are using our actual metamask wallet
    const signer = wallet.connect(provider);
    console.log("🚀 ~ file: Deployment.ts:14 ~ main ~ privateKey:", privateKey)
    console.log( {provider} );

    const lastBlock = await provider.getBlock('latest');
    console.log({lastBlock});


    const balance = await signer.getBalance();
    console.log('The balance of the signer is: ', balance.toString());
 
    const proposals = PROPOSALS;
    if (proposals.length <= 0) {
        throw new Error("No proposals provided");
    }

    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.deploy(
        convertStringArrayToBytes32Array(proposals)
    );
    const txReceipt = await ballotContract.deployTransaction.wait(); // similar to ballotContract.deployed() in truffle

    console.log('The ballot contract was deployed at address: ', ballotContract.address);
    console.log('The transaction hash is: ', txReceipt.transactionHash);
  // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

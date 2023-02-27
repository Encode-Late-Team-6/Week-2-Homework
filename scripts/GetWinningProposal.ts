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
    const proposals = PROPOSALS;
    if (proposals.length <= 0) {
        throw new Error("No proposals provided");
    }

    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.deploy(
        convertStringArrayToBytes32Array(proposals)
    );
    await ballotContract.deployTransaction.wait(); // similar to ballotContract.deployed() in truffle

    try {
        const winningProposalNumber = await ballotContract.winningProposal();
        console.log(`Proposal results transaction completed successfully. Proposal number: ${winningProposalNumber}`);
    } catch(error) {
        console.log('Error occured', error);
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

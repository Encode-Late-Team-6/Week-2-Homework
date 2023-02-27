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
        // You may also pass the signer's address by passing arguments to CLI command
        // yarn run ts-node --files .\scripts\GiveRightToVote.ts "address"
        const args = process.argv;
        const anotherSigner = args[2] || '0x048056c66D42A86b42e4e3D6c8Ba25Ec3C4eD77C';
        
        const delegateTxn = await ballotContract.delegate(anotherSigner);
        const receipt = await delegateTxn.wait();
        console.log(`Delegate transaction completed successfully. Receipt: ${receipt}`);
    } catch(error) {
        console.log('Error occured', error);
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

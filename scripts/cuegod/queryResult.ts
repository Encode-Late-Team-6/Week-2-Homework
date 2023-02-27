import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { Ballot__factory } from '../typechain-types';
dotenv.config()

async function main() {

    const args = process.argv.slice(2);
    const contractAddress = "0x1A69cfd82FF050737EA1C20895698EAE3907745b"

    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY)
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey) {
        console.log("private key is missing");
        return
    }
    const wallet = new ethers.Wallet(privateKey)
    const signer = wallet.connect(provider)
    const contract = new Ballot__factory(signer);
    const deployedContract = contract.attach(contractAddress);
    const result = await deployedContract.winnerName();
    console.log(`The winning proposal is ${ethers.utils.parseBytes32String(result)}`)
}

main().catch(error => {
    console.error(error)
    process.exitCode=1;
})

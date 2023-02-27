import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { Ballot__factory } from '../typechain-types';
dotenv.config()

async function main() {

  const args = process.argv.slice(2);
  const contractAddress = "0x1A69cfd82FF050737EA1C20895698EAE3907745b"
  const delegateTo = args[0]

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
  try {
    const receipt = await (await deployedContract.delegate(delegateTo)).wait();
    console.log(receipt);
  } catch (e) {
    console.log("delegating failed.")
    console.log(e)
  }

}

main().catch(error => {
  console.error(error)
  process.exitCode=1;
})

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const provider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.INFURA_API_KEY
  );

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing environment: PRIVATE_KEY");

    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
  console.log(`The account ${signer.address} has a balance of ${balance}`);

  const args = process.argv;
  const proposals = args.slice(2);
  if (proposals.length <= 0) throw new Error("missing argument: Proposals");

  console.log("Deploying Contracts");
  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Awaiting for confirmations...");
  await ballotContract.deployed();
  const txReceipt = await ballotContract.deployTransaction.wait();
  console.log(
    `the ballot is deployed at address ${ballotContract.address} in the block number ${txReceipt.blockNumber}`
  );

  //   console.log({ proposals });
  //   console.log("Deploying Ballot contract");
  //   console.log("Proposals: ");
  //   PROPOSALS.forEach((element, index) => {
  //     console.log(`Proposal N. ${index + 1}: ${element}`);
  //   });
  //   // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

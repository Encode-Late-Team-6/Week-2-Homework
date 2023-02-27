// Main Function

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  // import your pkey / seed
  const provider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.INFURA_API_KEY
  );

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing environment: PRIVATE_KEY");

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);

  //const args = process.argv;
  //const proposals = args.slice(2);
  //if (proposals.length <= 0) throw new Error("missing argument: Proposals");

  console.log("attaching to Contract");
  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = ballotFactory.attach(
    String(process.env.CONTRACT_ADDRESS)
  );
  const voter = await ballotContract.voters(signer.address);
  // if (voter.weight === 0) throw new Error("Voter has no weight to vote");
  //if (voter.voted) throw new Error("Voter has already voted.");

  //const contractProposals = ballotContract.proposals;
  //const proposalChonsen = contractProposals[1];
  const txReceipt = await ballotContract.vote(0);
  console.log(`You voted succesfully in tx blocknum ${txReceipt}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// receive the address of the ballot as ArgumentType
// receive the index of the proposal on

// attach the factory to the address

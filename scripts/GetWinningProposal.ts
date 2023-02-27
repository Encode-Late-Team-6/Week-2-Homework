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
  console.log("attaching to Contract");
  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = ballotFactory.attach(
    String(process.env.CONTRACT_ADDRESS)
  );

  const winnerName = await ballotContract.winnerName();
  console.log(
    `Winning Proposal is: ${ethers.utils.parseBytes32String(winnerName)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// Main Function
// Import your pkey / seed

// -> you need to be the chairperson

// Assemble a signer

// receive the address of the ballot contract as a parameter

// Attache the factory to the address
// contractFactory.attach (address) => contract
// ballotContractFactory.attach("address")

// receuve the address of the vvoter as argument

// Call the function to give right to vote
// Pass the address of the voter as parameter

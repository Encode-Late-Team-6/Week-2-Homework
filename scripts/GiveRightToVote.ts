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
  const voter = await ballotContract.voters(signer.address);
    try {
        const receipt = await (await ballotContract.giveRightToVote(
            "0xcA010A9746ce98D7E7c7Baf20cFfFC812FF3eBc4"
          )).wait();
          console.log(`tx receipt is ${receipt}`);
    } catch (Error) {
        console.log(`Giving right to Vote failed because: ${Error}`);
    }

  
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

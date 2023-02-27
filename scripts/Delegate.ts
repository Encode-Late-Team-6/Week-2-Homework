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
  const delegateTo = "0xcA010A9746ce98D7E7c7Baf20cFfFC812FF3eBc4";
  try {
    const receipt = await (await ballotContract.delegate(delegateTo)).wait();
    console.log(`tx receipt is ${receipt}`);
  } catch (Error) {
    console.log(`Delegation failed. ${Error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types/factories";
dotenv.config();

const BallotContractAddress = "0x1A69cfd82FF050737EA1C20895698EAE3907745b";

async function main() {
  const provider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.ALCHEMY_API_KEY
  );
  const privateKey = process.env.PRIVATE_WALLET_KEY;
  if (!privateKey || privateKey.length <= 0) {
    throw new Error("No private key provided");
  }

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  const lastBlock = await provider.getBlock("latest");
  console.log({ lastBlock }); // To test if the setup is working properly

  // Create an instance of the contract
  const contract = new ethers.Contract(
    BallotContractAddress,
    Ballot__factory.abi,
    signer
  );

  //   Testing voting
  try {
    const receipt = await contract.vote(0);
    await receipt.wait();
    console.log("Voting Successful!", receipt);
  } catch (error) {
    console.log("Failed to vote", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

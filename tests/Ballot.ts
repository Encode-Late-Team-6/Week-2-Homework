import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Prop_A", "Prop_B", "Prop_C"];

describe("Ballot", () => {
    let ballotContract: Ballot;
    let signers: SignerWithAddress[] = [];
    
    beforeEach(async () => {
        signers = await ethers.getSigners();
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        const proposals = PROPOSALS.map(prop => ethers.utils.formatBytes32String(prop));
        ballotContract = await ballotContractFactory.deploy(
            proposals
        );
        await ballotContract.deployTransaction.wait(); // similar to ballotContract.deployed() in truffle
    });

    describe("when the contract is deployed", () => {
        it('has the provided proposals', async () => {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposal = await ballotContract.proposals(index);
                expect(ethers.utils.parseBytes32String(proposal.name)).is.eq(
                    PROPOSALS[index]
                    );
            }
        });
        it('has zero votes for all proposals', async () => {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposal = await ballotContract.proposals(index);
                expect(proposal.voteCount).is.eq(0);
            }
        });
        it('sets the deployer address as chairperson', async () => {
            const chairperson = await ballotContract.chairperson();
            const deployerAddress = await signers[0].getAddress();
            expect(chairperson).is.eq(deployerAddress);
        });
        it('sets the voting weigth for the chairperson as 1', async () => {
            const chairPerson = await ballotContract.chairperson();
            const chairPersonVoter = await ballotContract.voters(chairPerson);
            expect(chairPersonVoter.weight).is.eq(1);
        });
    });

    describe("when the chairperson interact with the giveRightToVote function in the contract", () => {
        it("gives right to vote for another address", async () => {
            const commonVoterAddress = signers[1].address;
            
            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoterAddress);
            await giveVotingRightsTxn.wait();

            const voter = await ballotContract.voters(commonVoterAddress);
            expect(voter.weight).to.eq(1);
        });

        it("can not give right to vote for someone that has voted", async () => {
            const commonVoter = signers[1];
            const commonVoterAddress = signers[1].address;
            
            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoterAddress);
            await giveVotingRightsTxn.wait();

            const voteTxn = await ballotContract.connect(commonVoter).vote(0);
            await voteTxn.wait();
            
            await expect(ballotContract.giveRightToVote(commonVoterAddress))
                .to.be.revertedWith('The voter already voted.');
        });

        it("can not give right to vote for someone that has already voting rights", async () => {
            const commonVoterAddress = signers[1].address;
            
            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoterAddress);
            await giveVotingRightsTxn.wait();
            
            await expect(ballotContract.giveRightToVote(commonVoterAddress))
                .to.be.reverted;
        })
    });

    describe("when the voter interact with the vote function in the contract", function () {
        it("should register the vote", async () => {
            const commonVoter = signers[1];
            const commonVoterAddress = signers[1].address;
            
            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoterAddress);
            await giveVotingRightsTxn.wait();

            const voteTxn = await ballotContract.connect(commonVoter).vote(0);
            await voteTxn.wait();

            const voter = await ballotContract.voters(commonVoterAddress);
            expect(voter.vote).to.eq(0);
            expect(voter.voted).to.eq(true);
        });
      });
    
      describe("when the voter interact with the delegate function in the contract", function () {
        it("should transfer voting power", async () => {
            const anotherVoter = signers[1];

            const giveVotingRightsTxn = await ballotContract.giveRightToVote(anotherVoter.address);
            await giveVotingRightsTxn.wait();

            let anotherVoterInContract = await ballotContract.voters(anotherVoter.address);
            expect(anotherVoterInContract.weight).to.eq(1);
            
            const delegateTxn = await ballotContract.delegate(anotherVoter.address);
            await delegateTxn.wait();

            anotherVoterInContract = await ballotContract.voters(anotherVoter.address);
            expect(anotherVoterInContract.weight).to.eq(2);
        });
      });
    
      describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
        it("should revert", async () => {
            const attacker = signers[1];

            await expect(ballotContract.connect(attacker).giveRightToVote(attacker.address))
                .to.be.revertedWith('Only chairperson can give right to vote.');
        });
      });
    
      describe("when the an attacker interact with the vote function in the contract", function () {
        it("should revert", async () => {
            const attacker = signers[1];

            await expect(ballotContract.connect(attacker).vote(0))
                .to.be.revertedWith('Has no right to vote');
        });
      });
    
      describe("when the an attacker interact with the delegate function in the contract", function () {
        it("should revert", async () => {
            const attacker = signers[1];

            const giveVotingRightsTxn = await ballotContract.giveRightToVote(attacker.address);
            await giveVotingRightsTxn.wait();

            await expect(ballotContract.connect(attacker).delegate(attacker.address))
                .to.be.revertedWith('Self-delegation is disallowed.');
        });
      });
    
      describe("when someone interact with the winningProposal function before any votes are cast", function () {
        it("should return 0", async () => {
            const winningProposalCnt = await ballotContract.winningProposal();
            expect(winningProposalCnt).to.eq(0);
        });
      });
    
      describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
        it("should return 0", async () => {
            const commonVoter = signers[1];

            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoter.address);
            await giveVotingRightsTxn.wait();

            const voteTxn = await ballotContract.connect(commonVoter).vote(0);
            await voteTxn.wait();

            const winningProposalCnt = await ballotContract.winningProposal();
            expect(winningProposalCnt).to.eq(0);
        });
      });
    
      describe("when someone interact with the winnerName function before any votes are cast", function () {
        it("should return name of proposal 0", async () => {
            const winnerName = await ballotContract.winnerName();
            expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[0]);
        });
      });
    
      describe("when someone interact with the winnerName function after one vote is cast for the second proposal", function () {
        it("should return name of proposal 0", async () => {
            const commonVoter = signers[1];

            const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoter.address);
            await giveVotingRightsTxn.wait();

            const voteTxn = await ballotContract.connect(commonVoter).vote(1);
            await voteTxn.wait();

            const winningProposalCnt = await ballotContract.winningProposal();
            expect(winningProposalCnt).to.eq(1);
            
            const winnerName = await ballotContract.winnerName();
            expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[1]);
        });
      });
    
      describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
        it("should return the name of the winner proposal", async () => {
            const proposalCount: Record<string,number> = {};
            for (let i = 0; i <= 2; i++) {
                proposalCount[PROPOSALS[i]] = 0;
            }

            for (let i = 1; i <= 5; i++) {
                const randProposal = Math.floor(Math.random() * 3);
                proposalCount[PROPOSALS[randProposal]]++;
                const commonVoter = signers[i];
    
                const giveVotingRightsTxn = await ballotContract.giveRightToVote(commonVoter.address);
                await giveVotingRightsTxn.wait();
    
                const voteTxn = await ballotContract.connect(commonVoter).vote(randProposal);
                await voteTxn.wait();
            }

            let maxPropIdx = 0;
            if (proposalCount[PROPOSALS[1]] > proposalCount[PROPOSALS[maxPropIdx]]) {
                maxPropIdx = 1;
            }
            if (proposalCount[PROPOSALS[2]] > proposalCount[PROPOSALS[maxPropIdx]]) {
                maxPropIdx = 2;
            }
    
            const winningProposalCnt = await ballotContract.winningProposal();
            expect(winningProposalCnt).to.eq(maxPropIdx);
            
            const winnerName = await ballotContract.winnerName();
            expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[maxPropIdx]);
        });
      });
});

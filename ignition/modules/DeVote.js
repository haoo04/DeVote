const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeVoteModule = buildModule("DeVoteModule", (m) => {
  const deVote = m.contract("DeVote");

  return { deVote };
});

module.exports = DeVoteModule; 
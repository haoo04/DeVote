const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeVote", function () {
  let DeVote;
  let deVote;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 获取合约工厂和签名者
    DeVote = await ethers.getContractFactory("DeVote");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约
    deVote = await DeVote.deploy();
    await deVote.waitForDeployment();
  });

  describe("部署", function () {
    it("应该设置正确的拥有者", async function () {
      expect(await deVote.owner()).to.equal(owner.address);
    });

    it("应该初始化投票计数为0", async function () {
      expect(await deVote.voteCount()).to.equal(0);
    });
  });

  describe("创建投票", function () {
    it("应该成功创建投票", async function () {
      const title = "测试投票";
      const description = "这是一个测试投票";
      const options = ["选项1", "选项2", "选项3"];
      const voteType = 0; // SingleChoice
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600; // 1小时后结束
      const isPrivate = false;
      const allowedVoters = [];

      const tx = await deVote.createVote(
        title,
        description,
        options,
        voteType,
        startTime,
        endTime,
        isPrivate,
        allowedVoters
      );

      await expect(tx)
        .to.emit(deVote, "VoteCreated")
        .withArgs(0, title, owner.address, startTime, endTime);

      expect(await deVote.voteCount()).to.equal(1);
    });

    it("应该拒绝空标题", async function () {
      const title = "";
      const description = "这是一个测试投票";
      const options = ["选项1", "选项2"];
      const voteType = 0;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600;
      const isPrivate = false;
      const allowedVoters = [];

      await expect(
        deVote.createVote(
          title,
          description,
          options,
          voteType,
          startTime,
          endTime,
          isPrivate,
          allowedVoters
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("应该拒绝少于2个选项", async function () {
      const title = "测试投票";
      const description = "这是一个测试投票";
      const options = ["选项1"];
      const voteType = 0;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600;
      const isPrivate = false;
      const allowedVoters = [];

      await expect(
        deVote.createVote(
          title,
          description,
          options,
          voteType,
          startTime,
          endTime,
          isPrivate,
          allowedVoters
        )
      ).to.be.revertedWith("At least 2 options required");
    });
  });

  describe("投票", function () {
    beforeEach(async function () {
      const title = "测试投票";
      const description = "这是一个测试投票";
      const options = ["选项1", "选项2", "选项3"];
      const voteType = 0;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600;
      const isPrivate = false;
      const allowedVoters = [];

      await deVote.createVote(
        title,
        description,
        options,
        voteType,
        startTime,
        endTime,
        isPrivate,
        allowedVoters
      );
    });

    it("应该允许用户投票", async function () {
      const choices = [1];
      
      const tx = await deVote.connect(addr1).castVote(0, choices);
      
      await expect(tx)
        .to.emit(deVote, "VoteCast")
        .withArgs(0, addr1.address, choices);

      expect(await deVote.hasUserVoted(0, addr1.address)).to.be.true;
    });

    it("应该拒绝重复投票", async function () {
      const choices = [1];
      
      await deVote.connect(addr1).castVote(0, choices);
      
      await expect(
        deVote.connect(addr1).castVote(0, choices)
      ).to.be.revertedWith("Already voted");
    });

    it("应该正确更新投票计数", async function () {
      const choices = [1];
      
      await deVote.connect(addr1).castVote(0, choices);
      
      const results = await deVote.getVoteResults(0);
      expect(results[0]).to.equal(0);
      expect(results[1]).to.equal(1);
      expect(results[2]).to.equal(0);
    });
  });

  describe("获取投票信息", function () {
    beforeEach(async function () {
      const title = "测试投票";
      const description = "这是一个测试投票";
      const options = ["选项1", "选项2", "选项3"];
      const voteType = 0;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600;
      const isPrivate = false;
      const allowedVoters = [];

      await deVote.createVote(
        title,
        description,
        options,
        voteType,
        startTime,
        endTime,
        isPrivate,
        allowedVoters
      );
    });

    it("应该返回正确的投票信息", async function () {
      const voteInfo = await deVote.getVoteInfo(0);
      
      expect(voteInfo.title).to.equal("测试投票");
      expect(voteInfo.description).to.equal("这是一个测试投票");
      expect(voteInfo.options).to.deep.equal(["选项1", "选项2", "选项3"]);
      expect(voteInfo.creator).to.equal(owner.address);
    });

    it("应该返回正确的投票结果", async function () {
      const choices = [1];
      await deVote.connect(addr1).castVote(0, choices);
      
      const results = await deVote.getVoteResults(0);
      expect(results[0]).to.equal(0);
      expect(results[1]).to.equal(1);
      expect(results[2]).to.equal(0);
    });
  });

  describe("管理投票", function () {
    beforeEach(async function () {
      const title = "测试投票";
      const description = "这是一个测试投票";
      const options = ["选项1", "选项2", "选项3"];
      const voteType = 0;
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 3600;
      const isPrivate = false;
      const allowedVoters = [];

      await deVote.createVote(
        title,
        description,
        options,
        voteType,
        startTime,
        endTime,
        isPrivate,
        allowedVoters
      );
    });

    it("应该允许创建者结束投票", async function () {
      const tx = await deVote.endVote(0);
      
      await expect(tx)
        .to.emit(deVote, "VoteEnded")
        .withArgs(0);
    });

    it("应该拒绝非创建者结束投票", async function () {
      await expect(
        deVote.connect(addr1).endVote(0)
      ).to.be.revertedWith("Only vote creator can call this function");
    });

    it("应该允许创建者取消投票", async function () {
      const tx = await deVote.cancelVote(0);
      
      await expect(tx)
        .to.emit(deVote, "VoteCancelled")
        .withArgs(0);
    });
  });
}); 
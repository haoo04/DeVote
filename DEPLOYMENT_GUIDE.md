# DeVote 部署指南

## 项目概述
DeVote是一个基于以太坊的去中心化投票平台，支持创建、管理和参与投票。

## 前置要求

1. **Node.js** (v16 或更高版本)
2. **npm** 或 **yarn**
3. **MetaMask** 浏览器扩展

## 快速开始

### 1. 启动本地区块链节点

```bash
# 启动Hardhat本地节点
npx hardhat node
```

这将启动一个本地以太坊节点，运行在 `http://127.0.0.1:8545`，并提供20个测试账户。

### 2. 编译智能合约

```bash
# 编译合约
npm run hardhat:compile
```

### 3. 部署智能合约

```bash
# 部署到本地网络
npm run hardhat:deploy
```

部署成功后，合约地址和ABI将自动导出到 `src/contracts/` 目录。

### 4. 启动前端应用

```bash
# 启动React应用
npm start
```

应用将在 `http://localhost:3000` 启动。

## 配置MetaMask

### 1. 添加本地网络

在MetaMask中添加以下网络配置：

- **网络名称**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **链ID**: 1337
- **货币符号**: ETH

### 2. 导入测试账户

使用Hardhat提供的测试账户私钥导入账户：

```
测试助记词: test test test test test test test test test test test junk
```

或者使用具体的私钥（从hardhat node输出中获取）。

## 智能合约功能

### 核心功能

1. **创建投票**
   - 单选或多选投票
   - 设置开始和结束时间
   - 支持公开或私有投票
   - 权限控制

2. **参与投票**
   - 实时投票
   - 防重复投票
   - 投票验证

3. **投票管理**
   - 查看投票详情
   - 获取投票结果
   - 结束或取消投票

### 主要函数

- `createVote()`: 创建新投票
- `castVote()`: 参与投票
- `getVoteInfo()`: 获取投票信息
- `getVoteResults()`: 获取投票结果
- `endVote()`: 结束投票
- `cancelVote()`: 取消投票

## 前端集成

### 钱包连接

应用支持通过MetaMask连接钱包，并自动检测网络。

### 合约交互

通过 `src/utils/contractUtils.js` 提供的工具函数与智能合约交互。

### 状态管理

使用 `src/contexts/WalletContext.js` 管理钱包状态和合约操作。

## 开发命令

```bash
# 编译合约
npm run hardhat:compile

# 启动本地节点
npm run hardhat:node

# 部署合约到本地网络
npm run hardhat:deploy

# 运行合约测试
npm run hardhat:test

# 启动前端应用
npm start
```

## 测试

### 智能合约测试

```bash
# 运行所有测试
npm run hardhat:test

# 运行特定测试文件
npx hardhat test test/DeVote.js
```

### 功能测试流程

1. 连接MetaMask钱包
2. 切换到本地测试网络
3. 创建测试投票
4. 使用不同账户参与投票
5. 查看投票结果

## 常见问题

### Q: 合约未部署错误
A: 确保已运行 `npm run hardhat:deploy` 部署合约

### Q: MetaMask连接失败
A: 检查是否已安装MetaMask并连接到正确的网络

### Q: 交易失败
A: 确保账户有足够的ETH用于gas费用

### Q: 网络错误
A: 确保Hardhat节点正在运行并且MetaMask连接到正确的网络

## 安全注意事项

1. 本项目仅用于学习和测试
2. 不要在生产环境中使用测试私钥
3. 部署到主网前请进行充分测试
4. 考虑实施额外的安全措施
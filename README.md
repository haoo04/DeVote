# DeVote 

<div align="center">

![DeVote Logo](public/logo192.png)

**基于以太坊的去中心化投票平台 | Decentralized Voting Platform on Ethereum**

[English](#english) | [中文](#中文)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-orange.svg)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-black.svg)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Compatible-purple.svg)](https://ethereum.org/)

</div>

---

## 中文

DeVote 是一个基于以太坊区块链的去中心化投票平台，提供透明、安全、不可篡改的投票解决方案。通过智能合约技术，确保投票过程的公正性和结果的可信度。

### 核心特性

- **去中心化投票**: 基于以太坊智能合约，确保投票透明可信
- **多种投票类型**: 支持单选、多选投票模式
- **隐私保护**: 支持公开和私有投票
- **时间控制**: 灵活设置投票开始和结束时间
- **权限管理**: 管理员可控制投票参与者
- **响应式设计**: 完美适配桌面端和移动端
- **主题切换**: 支持明暗主题模式
- **钱包集成**: 支持 MetaMask 和 WalletConnect

### 技术栈

**前端技术**
- React 19 + React Router
- Ant Design UI 框架
- Ethers.js Web3 库
- Lucide React 图标

**区块链技术**
- Solidity 0.8.28
- Hardhat 开发框架
- OpenZeppelin 安全库

**开发工具**
- Node.js 16+
- npm/yarn 包管理器
- ESLint 代码规范

### 快速开始

#### 环境要求

- Node.js (v16.0.0 或更高版本)
- npm 或 yarn
- MetaMask 浏览器扩展

#### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/de-vote.git
cd de-vote
```

2. **安装依赖**
```bash
npm install
```

3. **启动本地区块链**
```bash
npm run hardhat:node
```

4. **编译和部署智能合约**
```bash
npm run hardhat:compile
npm run hardhat:deploy
```

5. **启动前端应用**
```bash
npm start
```

6. **配置 MetaMask**
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链ID: 1337
   - 货币符号: ETH

### 主要功能

#### 投票创建
- 设置投票标题和描述
- 添加多个投票选项
- 选择单选或多选模式
- 设置投票时间范围
- 配置公开或私有投票

#### 投票参与
- 实时查看投票列表
- 参与活跃投票
- 查看投票详情和结果
- 防重复投票机制

#### 数据管理
- 实时投票统计
- 投票结果可视化
- 投票历史记录
- 用户投票行为追踪

#### 用户系统
- 钱包地址身份验证
- 个人投票历史
- 创建的投票管理
- 个人资料设置

#### 管理功能
- 投票状态管理
- 结束/取消投票
- 权限控制
- 系统监控

### 项目结构

```
de-vote/
├── contracts/                 # 智能合约
│   ├── DeVote.sol            # 主投票合约
│   └── Lock.sol              # 示例合约
├── src/
│   ├── components/           # React 组件
│   │   ├── Header.js         # 头部导航
│   │   └── Sidebar.js        # 侧边栏
│   ├── contexts/             # React Context
│   │   └── WalletContext.js  # 钱包状态管理
│   ├── pages/                # 页面组件
│   │   ├── Dashboard.js      # 仪表盘
│   │   ├── CreateVote.js     # 创建投票
│   │   ├── VoteList.js       # 投票列表
│   │   ├── VoteDetail.js     # 投票详情
│   │   ├── Admin.js          # 管理页面
│   │   └── Profile.js        # 用户资料
│   ├── utils/                # 工具函数
│   │   ├── contractUtils.js  # 合约工具
│   │   └── errorHandler.js   # 错误处理
│   └── contracts/            # 编译后的合约
├── scripts/                  # 部署脚本
├── test/                     # 测试文件
├── hardhat.config.js         # Hardhat 配置
└── package.json              # 项目配置
```

### API 文档

#### 智能合约主要方法

**创建投票**
```solidity
function createVote(
    string memory _title,
    string memory _description,
    string[] memory _options,
    VoteType _voteType,
    uint256 _startTime,
    uint256 _endTime,
    bool _isPrivate,
    address[] memory _allowedVoters
) public returns (uint256)
```

**参与投票**
```solidity
function castVote(uint256 _voteId, uint256[] memory _choices) public
```

**获取投票信息**
```solidity
function getVoteInfo(uint256 _voteId) public view returns (...)
```

**获取投票结果**
```solidity
function getVoteResults(uint256 _voteId) public view returns (uint256[] memory)
```

### 部署指南

查看详细部署指南: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**主网部署**
1. 配置环境变量
2. 设置网络参数
3. 部署智能合约
4. 配置前端环境
5. 构建生产版本

### 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## English

DeVote is a decentralized voting platform built on the Ethereum blockchain, providing transparent, secure, and immutable voting solutions. Through smart contract technology, it ensures fairness in the voting process and credibility of results.

### Key Features

- **Decentralized Voting**: Built on Ethereum smart contracts for transparent and trustworthy voting
- **Multiple Vote Types**: Support for single-choice and multi-choice voting modes
- **Privacy Protection**: Support for both public and private voting
- **Time Control**: Flexible setting of voting start and end times
- **Permission Management**: Admin control over voting participants
- **Responsive Design**: Perfect adaptation for desktop and mobile
- **Theme Toggle**: Support for light and dark theme modes
- **Wallet Integration**: Support for MetaMask and WalletConnect

### Tech Stack

**Frontend**
- React 19 + React Router
- Ant Design UI Framework
- Ethers.js Web3 Library
- Lucide React Icons

**Blockchain**
- Solidity 0.8.28
- Hardhat Development Framework
- OpenZeppelin Security Libraries

**Development Tools**
- Node.js 16+
- npm/yarn Package Manager
- ESLint Code Standards

### Quick Start

#### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- MetaMask browser extension

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/de-vote.git
cd de-vote
```

2. **Install dependencies**
```bash
npm install
```

3. **Start local blockchain**
```bash
npm run hardhat:node
```

4. **Compile and deploy smart contracts**
```bash
npm run hardhat:compile
npm run hardhat:deploy
```

5. **Start frontend application**
```bash
npm start
```

6. **Configure MetaMask**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
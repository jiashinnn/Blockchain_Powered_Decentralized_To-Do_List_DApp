# 📝 Blockchain Powered Decentralized_To-Do List DApp

A simple yet modern decentralized to-do list application built on the Ethereum blockchain using **Solidity**, **Hardhat**, **React.js**, and **Ethers.js**. Tasks are stored on-chain and can be created, completed, and deleted by interacting with a smart contract deployed to the **Sepolia Testnet**.

---

## 📦 Features

- ✅ Add new tasks (with timestamp)
- ☑️ Toggle task completion status
- 🗑️ Delete tasks
- 🔐 Connect via MetaMask
- 🌐 Real-time interactions with Ethereum smart contracts
- 📅 Track the date each task was added
- 📢 Confirmation prompts for each user action

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| **Smart Contract** | Solidity, Hardhat, Sepolia Testnet |
| **Frontend** | React.js, Ethers.js, HTML, CSS |
| **Wallet & Network** | MetaMask, Alchemy (RPC Provider) |

---

## Detailed Technologies Used

| Layer | Tech/Tool |Purpose|
|-------|------|------|
| Blockchain	| Ethereum Sepolia	| Decentralized data storage| 
| Smart Contract	| Solidity	| Define task logic (add, toggle, delete, timestamp)| 
| Dev Framework	| Hardhat	| Compile, test, deploy contracts| 
| Node Provider	| Alchemy / Infura	| Connect frontend to Sepolia | 
| Frontend	| React.js	| Build UI| 
| Web3 Interaction	| Ethers.js	| Talk to the contract| 
| Wallet Integration	| MetaMask	| Sign transactions| 
| UI Styling	| HTML + CSS	| Layout and modern styles| 

---

## 🧭 System User Workflow

### 👣 Step-by-Step Flow:

| Step	| Description | 
|-----|-----|
| 1️⃣	| User opens the DApp in their browser| 
| 2️⃣	| DApp connects to MetaMask, prompting user to approve| 
| 3️⃣	| On success, user sees task input, task list, and UI buttons| 
| 4️⃣	| User types a task, clicks "Add" → confirmation alert shows| 
| 5️⃣	| If confirmed, DApp shows "⏳ Waiting" message, sends transaction| 
| 6️⃣	| After MetaMask confirms and transaction is mined, task appears in list with date| 
| 7️⃣	| User can tick checkbox to mark as done → confirmation prompt shows| 
| 8️⃣	| DApp shows "⏳ Updating...", then task gets updated and UI refreshes| 
| 9️⃣	| User can delete any task, prompted with confirmation alert first| 
| 🔁	| User continues interacting or reloads page → tasks are fetched/loaded from blockchain| 
| 🔒	| If wallet is not connected, DApp shows message to connect MetaMask| 

## 🔧 Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/todo-dapp.git
cd todo-dapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Deploy contract to Sepolia

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔐 MetaMask Setup

1. Install MetaMask extension: https://metamask.io
2. Add the Sepolia Testnet in your MetaMask network list
3. Get Sepolia ETH from https://sepoliafaucet.com/
4. Connect your wallet when prompted

---

## 🧪 Available Scripts
```bash
npx hardhat compile          # Compile smart contracts
npx hardhat run scripts/deploy.js --network sepolia
npm start                    # Start React frontend
```

---

## 📷 Screenshots

 <p align="center"><img src="https://github.com/user-attachments/assets/148e3aff-a604-417f-b309-781301ef4b61" alt="b4 connect wallet" width="50%"> 

 <p align="center"><img src="https://github.com/user-attachments/assets/f1af93a1-1933-46f8-88c5-a08e6435c859" alt="after connect wallet" width="50%"> 

 <p align="center"><img src="https://github.com/user-attachments/assets/abd45102-4ca0-4676-b75a-eacd56f52611" alt="b4 add task" width="50%">
 
 <p align="center"><img src="https://github.com/user-attachments/assets/c8e227ff-4418-48a5-b002-4f67f2a80726" alt="after add task" width="50%">

 ---

 ## 📜 License

 MIT © 2025 jiashinnn

 ---

 ## 🙌 Acknowledgments

- [Ethereum](https://ethereum.org/)
- [Ethers.js](https://docs.ethers.org/)
- [Hardhat](https://hardhat.org/)
- [MetaMask](https://metamask.io/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

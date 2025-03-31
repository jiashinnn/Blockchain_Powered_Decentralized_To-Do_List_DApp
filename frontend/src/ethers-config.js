import { ethers } from "ethers";
import TodoListAbi from "./TodoList.json";

// Replace with your deployed contract address from Sepolia
const contractAddress = "0xF36F5D413D0B2E448411C71A3b899A9f9b8957aA";

export const getContract = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, TodoListAbi.abi, signer);
};

import { ethers } from "ethers";
import TodoListAbi from "./TodoList.json";

// Replace with your deployed contract address from Sepolia
const contractAddress = "0x209098904445FBfFede09D61BcB9F33801c4fd5F";

export const getContract = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, TodoListAbi.abi, signer);
};

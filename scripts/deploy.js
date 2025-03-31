const hre = require("hardhat");

async function main() {
  const TodoList = await hre.ethers.getContractFactory("TodoList");
  const todoList = await TodoList.deploy();

  await todoList.waitForDeployment();


  console.log("✅ TodoList deployed to:", await todoList.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

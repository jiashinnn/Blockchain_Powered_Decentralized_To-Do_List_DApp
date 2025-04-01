import React, { useEffect, useState } from "react";
import { getContract } from "./ethers-config";
import TaskList from "./components/TaskList.js"; // ✅ using TaskList
import "./styles.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          await loadTasks();
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress("");
          setTasks([]);
        } else {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          loadTasks();
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  async function handleConnectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        await loadTasks();
      } catch (err) {
        alert("❌ Wallet connection was rejected.");
      }
    } else {
      alert("🦊 Please install MetaMask to use this DApp.");
    }
  }

  async function loadTasks() {
    try {
      const contract = getContract();
      const count = await contract.taskCount();
      const loaded = [];
  
      for (let i = 1; i <= count; i++) {
        const task = await contract.tasks(i);
        if (task.content) {
          loaded.push({
            ...task,
            displayOrder: Number(task.order), // ✅ set order from contract
            formattedDate: new Date(task.createdAt * 1000).toLocaleString()
          });
        }
      }
  
      // ✅ Sort using order from smart contract
      loaded.sort((a, b) => a.displayOrder - b.displayOrder);
  
      setTasks(loaded);
    } catch (error) {
      console.error("❌ Error loading tasks:", error);
    }
  }
  

  async function createTask() {
    if (!input.trim()) return alert("⚠️ Please fill in the task.");
    if (!window.confirm(`Add new task: "${input}"?`)) return;

    try {
      setProcessing(true);
      setMessage("⏳ Waiting for task to be processed...");
      const tx = await getContract().createTask(input);
      await tx.wait();
      setInput("");
      await loadTasks();
      setMessage("✅ Task added successfully!");
    } catch {
      setMessage("❌ Failed to add task.");
    } finally {
      setProcessing(false);
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((t) => t.id.toString() === id.toString());
    if (!task) return;
    if (!window.confirm(`Mark as ${task.completed ? "incomplete" : "complete"}?`)) return;

    try {
      setProcessing(true);
      setMessage("⏳ Updating task...");
      const tx = await getContract().toggleCompleted(id);
      await tx.wait();
      await loadTasks();
      setMessage(`✅ Task "${task.content}" updated!`);
    } catch {
      setMessage("❌ Failed to update task.");
    } finally {
      setProcessing(false);
    }
  }

  async function deleteTask(id) {
    const task = tasks.find((t) => t.id.toString() === id.toString());
    if (!task || !window.confirm(`Delete task: "${task.content}"?`)) return;

    try {
      setProcessing(true);
      setMessage("🗑️ Deleting task...");
      const tx = await getContract().deleteTask(id);
      await tx.wait();
      await loadTasks();
      setMessage("✅ Task deleted!");
    } catch {
      setMessage("❌ Failed to delete task.");
    } finally {
      setProcessing(false);
    }
  }



  return (
    <div className="app-container">
      <h1>📝 Decentralized To-Do List</h1>

      {walletConnected && (
        <div className="wallet-address">
          Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {walletConnected ? (
        <>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="task-input"
            />
            <button className="add-button" onClick={createTask}>➕ Add</button>
          </div>

          {/* ✅ Now rendering task list from the component */}
          <TaskList tasks={tasks} setTasks={setTasks} onToggle={toggleTask} onDelete={deleteTask} />
        </>
      ) : (
        <div className="wallet-message">
          🔒 Please connect your MetaMask wallet to begin.
          <br />
          <button onClick={handleConnectWallet} className="connect-wallet-button">
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

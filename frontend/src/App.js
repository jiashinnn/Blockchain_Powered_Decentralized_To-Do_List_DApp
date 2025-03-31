import React, { useEffect, useState } from "react";
import { getContract } from "./ethers-config";
import TaskList from "./components/TaskList";
import "./styles.css"; // Make sure to create or update styles

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    (async () => {
      const connected = await connectWallet();
      if (connected) {
        await loadTasks();
      }
    })();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletConnected(true);
        return true;
      } catch (err) {
        alert("⚠️ Please connect your wallet to use the DApp");
        return false;
      }
    } else {
      alert("🦊 Please install MetaMask to use this DApp");
      return false;
    }
  }

  async function loadTasks() {
    try {
      const contract = getContract();
      const count = await contract.taskCount();
      console.log("📦 Task count:", count.toString());

      const loaded = [];
      for (let i = 1; i <= count; i++) {
        const task = await contract.tasks(i);
        console.log("🔍 Task", i, ":", task);
        loaded.push(task);
      }

      setTasks(loaded);
    } catch (error) {
      console.error("❌ Error loading tasks:", error);
    }
  }



  async function createTask() {
    if (!input.trim()) return;

    const confirmAdd = window.confirm(`Add new task: "${input}"?`);
    if (!confirmAdd) return;

    try {
      setProcessing(true);
      setMessage("⏳ Waiting for task to be processed...");

      const contract = getContract();
      const tx = await contract.createTask(input);
      await tx.wait();

      setInput("");
      await loadTasks();
      setMessage("✅ Task added successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      setMessage("❌ Failed to add task.");
    } finally {
      setProcessing(false);
    }
  }




  async function toggleTask(id) {
    const toggled = tasks.find((task) => task.id.toString() === id.toString());
    const status = toggled.completed ? "mark as incomplete" : "mark as complete";

    const confirmToggle = window.confirm(`Are you sure you want to ${status} task: "${toggled.content}"?`);
    if (!confirmToggle) return;

    try {
      setProcessing(true);
      setMessage("⏳ Updating task status...");

      const contract = getContract();
      const tx = await contract.toggleCompleted(id);
      await tx.wait();

      await loadTasks();
      setMessage(`✅ Task "${toggled.content}" status updated!`);
    } catch (error) {
      console.error("Error toggling task:", error);
      setMessage("❌ Failed to update task.");
    } finally {
      setProcessing(false);
    }
  }


  async function deleteTask(id) {
    const task = tasks.find((task) => task.id.toString() === id.toString());

    const confirmDelete = window.confirm(`Are you sure you want to delete task: "${task.content}"?`);
    if (!confirmDelete) return;

    try {
      console.log("🛠 deleteTask() called for ID:", id);
      setProcessing(true);
      setMessage("🗑️ Deleting task...");

      const contract = getContract();
      const tx = await contract.deleteTask(id);
      await tx.wait();

      await loadTasks();
      setMessage("✅ Task deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("❌ Failed to delete task.");
    } finally {
      setProcessing(false);
    }
  }


  return (
    <div className="app-container">
      <h1>📝 Decentralized To-Do List</h1>
      {processing && (
        <div style={{ marginBottom: "10px", color: "#1e88e5" }}>
          {message}
        </div>
      )}

      {!processing && message && (
        <div style={{ marginBottom: "10px", color: "#43a047" }}>
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
            <button className="add-button" onClick={createTask}>
              ➕ Add
            </button>
          </div>

          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />

        </>
      ) : (
        <div className="wallet-message">
          🔒 Please connect your MetaMask wallet to begin.
        </div>
      )}
    </div>

  );
}

export default App;

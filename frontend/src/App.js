import React, { useEffect, useState, useRef } from "react";
import { getContract } from "./ethers-config";
import "./styles.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const taskRefs = useRef({});

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

  // Listen for wallet/account/network changes
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

      const handleChainChanged = () => {
        window.location.reload();
      };

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
        console.error("Wallet connection failed:", err);
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
      console.log("📦 Task count:", count.toString());

      const loaded = [];
      for (let i = 1; i <= count; i++) {
        const task = await contract.tasks(i);
        console.log("🔍 Task", i, ":", task);
        
        // Format creation date from timestamp if available
        let creationDate = null;
        if (task.createdAt) {
          const timestamp = Number(task.createdAt);
          if (!isNaN(timestamp) && timestamp > 0) {
            creationDate = new Date(timestamp * 1000).toLocaleString();
          }
        }
        
        loaded.push({
          ...task,
          displayOrder: i,
          formattedDate: creationDate || "Unknown date"
        });
      }

      setTasks(loaded);
    } catch (error) {
      console.error("❌ Error loading tasks:", error);
    }
  }

  async function createTask() {
    if (!input.trim()) {
      alert("⚠️ Please fill in the task before adding.");
      return;
    }

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

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    // This helps with Firefox drag-and-drop
    e.dataTransfer.setData("text/plain", index);
    
    // Add dragging class to the task element
    if (taskRefs.current[index]) {
      taskRefs.current[index].classList.add("task-dragging");
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    // Update the dragged-over item
    setDraggedOverItem(index);
    
    // Add visual indication for drop target
    if (taskRefs.current[index]) {
      taskRefs.current[index].classList.add("task-dragover");
    }
  };

  const handleDragLeave = (e, index) => {
    e.preventDefault();
    
    // Remove visual indication
    if (taskRefs.current[index]) {
      taskRefs.current[index].classList.remove("task-dragover");
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    
    // If the item was dropped onto itself, do nothing
    if (draggedItem === index) {
      resetDragState();
      return;
    }
    
    // Reorder the tasks
    handleTaskReorder(draggedItem, index);
    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    // Remove all visual classes
    Object.values(taskRefs.current).forEach(ref => {
      if (ref) {
        ref.classList.remove("task-dragging");
        ref.classList.remove("task-dragover");
      }
    });
    
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  // Save task element references
  const setTaskRef = (index, element) => {
    taskRefs.current[index] = element;
  };

  // Function to handle task reordering
  function handleTaskReorder(startIndex, endIndex) {
    if (startIndex === endIndex) return;
    
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update display order for all items
    const updatedTasks = result.map((task, index) => ({
      ...task,
      displayOrder: index + 1
    }));
    
    setTasks(updatedTasks);
    setMessage("✅ Tasks reordered successfully!");
  }

  // Sort tasks by displayOrder
  const sortedTasks = [...tasks].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="app-container">
      <h1>📝 Decentralized To-Do List</h1>
      {/* 🔌 Wallet connect button block */}
      {walletConnected && (
        <div style={{ marginBottom: "16px", fontSize: "12px", color: "#555" }}>
          Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}

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
          {/* <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} /> */}
          {/* Task List Component (now directly integrated) */}
          <div className="task-list">
            {sortedTasks.length === 0 ? (
              <div className="empty-list">No tasks yet. Add one above!</div>
            ) : (
              sortedTasks.map((task, index) => (
                <div
                  key={task.id.toString()}
                  ref={el => setTaskRef(index, el)}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={(e) => handleDragLeave(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="drag-handle" title="Drag to reorder">
                    <span>≡</span>
                  </div>
                  
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  
                  <div className="task-content">
                    <div className="task-text">{task.content}</div>
                    <div className="task-date">{task.formattedDate}</div>
                  </div>
                  
                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="wallet-message">
          🔒 Please connect your MetaMask wallet to begin.
          <br />
          <button
            onClick={handleConnectWallet}
            style={{
              marginTop: "10px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            🔌 Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
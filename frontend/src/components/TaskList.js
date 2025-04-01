import React, { useRef, useState } from "react";
import "../styles.css";
import { getContract } from "../ethers-config";


function TaskList({ tasks, setTasks, onToggle, onDelete }) {
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOverItem, setDraggedOverItem] = useState(null);
    const taskRefs = useRef({});
    const [message, setMessage] = useState("");

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.setData("text/plain", index);

        if (taskRefs.current[index]) {
            taskRefs.current[index].classList.add("task-dragging");
        }
    };


    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDraggedOverItem(index);

        if (taskRefs.current[index]) {
            taskRefs.current[index].classList.add("task-dragover");
        }
    };


    const handleDragLeave = (e, index) => {
        if (taskRefs.current[index]) {
            taskRefs.current[index].classList.remove("task-dragover");
        }
    };


    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedItem === index) return resetDragState();

        handleTaskReorder(draggedItem, index);
        resetDragState();
    };


    const handleDragEnd = () => resetDragState();

    const resetDragState = () => {
        Object.values(taskRefs.current).forEach((el) => {
            if (el) {
                el.classList.remove("task-dragging", "task-dragover");
            }
        });
        setDraggedItem(null);
        setDraggedOverItem(null);
    };

    async function handleTaskReorder(startIndex, endIndex) {
        if (startIndex === endIndex) return;

        const result = Array.from(tasks);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        const updatedTasks = result.map((task, index) => ({
            ...task,
            displayOrder: index + 1
        }));

        setTasks(updatedTasks);
        setMessage("✅ Tasks reordered!");

        // ✅ Save new order to smart contract
        await saveTaskOrder(updatedTasks);
    }

    async function saveTaskOrder(updatedTasks) {
        try {
            setMessage("⏳ Saving order to blockchain...");
            const contract = getContract();

            for (let i = 0; i < updatedTasks.length; i++) {
                const task = updatedTasks[i];
                await contract.updateTaskOrder(task.id, task.displayOrder);
            }

            setMessage("✅ Tasks reordered!");
        } catch (error) {
            console.error("❌ Failed to update task order:", error);
            setMessage("❌ Failed to save task order on-chain.");
        }
    }



    if (!tasks.length) {
        return <div className="empty-list">No tasks yet. Add one above!</div>;
    }

    const sorted = [...tasks].sort((a, b) => a.displayOrder - b.displayOrder);

    return (

        <>
            {message && (
                <div style={{ marginBottom: "10px", fontStyle: "italic", color: message.startsWith("✅") ? "#2e7d32" : message.startsWith("❌") ? "#c62828" : "#555" }}>
                    {message}
                </div>
            )}
            <div className="task-list">
                {sorted.map((task, index) => (
                    <div
                        key={task.id.toString()}
                        ref={el => taskRefs.current[index] = el}
                        className={`task-item ${task.completed ? "completed" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={(e) => handleDragLeave(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="drag-handle">≡</div>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task.id)}
                        />
                        <div className="task-content">
                            <div className="task-text">{task.content}</div>
                            <div className="task-date">Created on {task.formattedDate}</div>
                        </div>
                        <button className="delete-button" onClick={() => onDelete(task.id)}>
                            ❌
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}

export default TaskList;

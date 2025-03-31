import React from "react";
import "../styles.css";

function TaskList({ tasks, onToggle, onDelete }) {
    if (!tasks.length) {
        return <p className="no-task">No tasks found. Add one above ⬆️</p>;
    }

    return (
        <div className="task-list">
            {tasks.map((task) =>
                task.content ? (
                    <div key={task.id.toString()} className="task-card">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task.id)}
                        />
                        <div style={{ flexGrow: 1 }}>
                            <span className={task.completed ? "completed-task" : ""}>
                                {task.content}
                            </span>
                            <div className="task-date">
                                🗓️ Added: {new Date(task.createdAt * 1000).toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(task.id)}
                            style={{
                                marginLeft: "auto",
                                background: "transparent",
                                border: "none",
                                color: "#d32f2f",
                                cursor: "pointer",
                                fontSize: "18px",
                            }}
                            title="Delete task"
                        >
                            🗑️
                        </button>
                    </div>
                ) : null
            )}
        </div>
    );
}

export default TaskList;

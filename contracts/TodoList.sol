// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
        uint createdAt;
    }

    uint public taskCount;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, uint createdAt);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content required");
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, block.timestamp);
        emit TaskCreated(taskCount, _content, block.timestamp);

    }

    function toggleCompleted(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }

    function deleteTask(uint _id) public {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        require(bytes(tasks[_id].content).length > 0, "Task does not exist");

        delete tasks[_id];
        taskCount--;
    }


}

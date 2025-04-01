// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        uint id;
        string content;
        bool completed;
        uint createdAt;
        uint order;
    }

    uint public taskCount;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, uint createdAt, uint order);
    event TaskCompleted(uint id, bool completed);
    event TaskOrderUpdated(uint id, uint newOrder);

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content required");
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, block.timestamp, taskCount);
        emit TaskCreated(taskCount, _content, block.timestamp, taskCount);

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

    function updateTaskOrder(uint _id, uint _newOrder) public {
        require(bytes(tasks[_id].content).length > 0, "Task does not exist");
        tasks[_id].order = _newOrder;
        emit TaskOrderUpdated(_id, _newOrder);
    }

}

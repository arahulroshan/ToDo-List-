
// TASKFLOW - TASK MANAGER

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
let currentFilter = "all";


// SAVE TASKS

function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// ADD TASK

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (!taskName) {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskName,
        completed: false,
        date: taskDate.value,
        time: taskTime.value
    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();

    renderTasks();

    taskInput.focus();

});


// COMPLETE TASK

function toggleTask(taskId) {

    tasks = tasks.map(task => {

        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;

    });

    saveTasks();
    renderTasks();

}


// DELETE TASK

function deleteTask(taskId) {

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();

}


// FORMAT DEADLINE

function getDeadline(task) {

    if (!task.date && !task.time) {
        return "";
    }

    let deadline = "";

    if (task.date) {
        deadline += "📅 " + task.date;
    }

    if (task.time) {
        deadline += " ⏰ " + task.time;
    }

    return deadline;

}


// CHECK OVERDUE

function isOverdue(task) {

    if (!task.date || task.completed) {
        return false;
    }

    const deadline = new Date(
        task.date + "T" + (task.time || "23:59")
    );

    return deadline < new Date();

}


// FILTER TASKS

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();

    });

});


// DISPLAY TASKS

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }


    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        if (isOverdue(task)) {
            li.classList.add("overdue");
        }


        // CHECKBOX

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });


        // TASK DETAILS

        const details = document.createElement("div");
        details.className = "task-details";

        const span = document.createElement("span");

        span.className = "task-text";
        span.textContent = task.text;

        details.appendChild(span);


        // DEADLINE

        const deadlineText = getDeadline(task);

        if (deadlineText) {

            const deadline = document.createElement("p");

            deadline.className = "task-deadline";
            deadline.textContent = deadlineText;

            if (isOverdue(task)) {
                deadline.textContent += " • OVERDUE";
            }

            details.appendChild(deadline);

        }


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });


        li.appendChild(checkbox);
        li.appendChild(details);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });


    // EMPTY MESSAGE

    emptyMessage.classList.toggle(
        "hidden",
        filteredTasks.length !== 0
    );


    // STATISTICS

    const completedCount = tasks.filter(
        task => task.completed
    ).length;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completedCount;
    pendingTasks.textContent = tasks.length - completedCount;

}


// INITIALIZE

renderTasks();


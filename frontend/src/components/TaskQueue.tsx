"use client";

import { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, dispatchTask, type Task } from "@/lib/api";

const agentEmojis: Record<string, string> = {
  dev: "🛠️",
  infra: "🔧",
  research: "🔬",
  writer: "✍️",
  designer: "🎨",
  qa: "🧪",
  social: "📣",
  finance: "💵",
  accounts: "🔐"
};

const statusLabels = {
  queued: { label: "Queued", color: "bg-zinc-700 text-zinc-300" },
  in_progress: { label: "In Progress", color: "bg-blue-900 text-blue-300" },
  review: { label: "Review", color: "bg-yellow-900 text-yellow-300" },
  done: { label: "Done", color: "bg-green-900 text-green-300" },
};

const priorityColors = {
  low: "border-zinc-700",
  medium: "border-yellow-700",
  high: "border-orange-700",
  critical: "border-red-700",
};

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState<{ title: string; description: string; assignee: string; priority: Task["priority"] }>({
    title: "",
    description: "",
    assignee: "dev",
    priority: "medium"
  });

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title) return;
    
    try {
      await createTask(newTask);
      setNewTask({ title: "", description: "", assignee: "dev", priority: "medium" });
      setShowNewTask(false);
      fetchTasks();
    } catch (e) {
      console.error("Failed to create task:", e);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTask(taskId, { status });
      fetchTasks();
    } catch (e) {
      console.error("Failed to update task:", e);
    }
  };

  const handleDispatch = async (task: Task) => {
    try {
      await dispatchTask(task.assignee, task.title);
      await updateTask(task.id, { status: "in_progress" });
      fetchTasks();
    } catch (e) {
      console.error("Failed to dispatch task:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        <span className="w-3 h-3 bg-zinc-600 rounded-full animate-pulse mr-2"></span>
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Task Queue</h2>
        <button
          onClick={() => setShowNewTask(true)}
          className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200 transition"
        >
          + New Task
        </button>
      </div>

      {showNewTask && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 space-y-4">
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 h-20 resize-none"
          />
          <div className="flex gap-4">
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="bg-black border border-zinc-700 rounded px-4 py-2 text-white"
            >
              <option value="dev">🛠️ Dev</option>
              <option value="infra">🔧 Infra</option>
              <option value="qa">🧪 QA</option>
              <option value="research">🔬 Research</option>
              <option value="social">📣 Social</option>
              <option value="writer">✍️ Writer</option>
              <option value="designer">🎨 Designer</option>
              <option value="finance">💵 Finance</option>
              <option value="accounts">🔐 Accounts</option>
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
              className="bg-black border border-zinc-700 rounded px-4 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <button
              onClick={handleCreateTask}
              className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-zinc-200"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewTask(false)}
              className="text-zinc-500 hover:text-white px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 rounded-lg border border-zinc-800">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No tasks in queue. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 hover:bg-zinc-800/50 transition border-l-2 ${priorityColors[task.priority]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{agentEmojis[task.assignee] || "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-zinc-500 mt-1 truncate">{task.description}</p>
                      )}
                      <p className="text-xs text-zinc-600 mt-1">
                        Assigned to {task.assignee} • {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.status === 'queued' && (
                      <button
                        onClick={() => handleDispatch(task)}
                        className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded hover:bg-green-800 transition"
                      >
                        ▶ Start
                      </button>
                    )}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
                      className={`px-3 py-1 rounded text-xs ${statusLabels[task.status].color} bg-opacity-50 border-none cursor-pointer`}
                    >
                      <option value="queued">Queued</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

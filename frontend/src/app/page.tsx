"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AgentMap from "@/components/AgentMap";
import Treasury from "@/components/Treasury";
import Projects from "@/components/Projects";
import Settings from "@/components/Settings";
import ActivityFeed from "@/components/ActivityFeed";
import TaskQueue from "@/components/TaskQueue";
import AgentLogs from "@/components/AgentLogs";

const PASSWORD = "4844";

export default function Home() {
  const [activeView, setActiveView] = useState<string>("agents");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("cc_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("cc_auth", "true");
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 w-96">
          <h1 className="text-2xl font-bold text-white mb-2">AGI Holdings</h1>
          <p className="text-zinc-500 mb-6">Command Center Access</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              className="w-full bg-black border border-zinc-700 rounded px-4 py-3 text-white mb-4 focus:outline-none focus:border-zinc-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-white text-black py-3 rounded font-medium hover:bg-zinc-200 transition"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-normal text-white">AGI Holdings</h1>
            <p className="text-zinc-500 italic">Command Center</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("cc_auth");
              setIsAuthenticated(false);
            }}
            className="text-zinc-500 hover:text-white text-sm"
          >
            Logout
          </button>
        </header>

        {activeView === "agents" && <AgentMap />}
        {activeView === "activity" && <ActivityFeed />}
        {activeView === "tasks" && <TaskQueue />}
        {activeView === "logs" && <AgentLogs />}
        {activeView === "treasury" && <Treasury />}
        {activeView === "projects" && <Projects />}
        {activeView === "settings" && <Settings />}
      </main>
    </div>
  );
}

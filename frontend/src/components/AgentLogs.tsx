"use client";

import { useState, useEffect } from "react";
import { getAgents, getAgentLogs, type Agent, type LogEntry } from "@/lib/api";

const levelColors = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-zinc-500",
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  busy: "bg-yellow-500 animate-pulse",
  offline: "bg-zinc-600",
};

export default function AgentLogs() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("dev");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents().then(setAgents);
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    
    setLoading(true);
    getAgentLogs(selectedAgent)
      .then(setLogs)
      .finally(() => setLoading(false));
    
    const interval = setInterval(() => {
      getAgentLogs(selectedAgent).then(setLogs);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const selected = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Agent Logs</h2>
        <span className="text-xs text-zinc-500">Real-time execution logs</span>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Agent List */}
        <div className="col-span-3">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 divide-y divide-zinc-800">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full p-4 text-left hover:bg-zinc-800/50 transition flex items-center gap-3 ${
                  selectedAgent === agent.id ? "bg-zinc-800" : ""
                }`}
              >
                <span className="text-xl">{agent.emoji?.replace(/\*\*/g, '')}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{agent.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{agent.status || 'offline'}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${statusColors[agent.status || 'offline']}`}></span>
              </button>
            ))}
          </div>
        </div>

        {/* Log Output */}
        <div className="col-span-9">
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 h-[500px] overflow-hidden">
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center gap-3">
              <span className="text-xl">{selected?.emoji?.replace(/\*\*/g, '')}</span>
              <span className="text-white font-medium">{selected?.name}</span>
              <span className={`w-2 h-2 rounded-full ${statusColors[selected?.status || 'offline']}`}></span>
              <span className="text-xs text-zinc-500 capitalize">{selected?.status || 'offline'}</span>
              <span className="ml-auto text-xs text-zinc-600">{logs.length} entries</span>
            </div>
            
            <div className="p-4 font-mono text-sm overflow-y-auto h-[calc(100%-48px)]">
              {loading ? (
                <div className="text-zinc-600 text-center py-8">
                  <span className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse inline-block mr-2"></span>
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-zinc-600 text-center py-8">
                  No logs available. Logs appear when the agent performs tasks.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-4 py-1 hover:bg-zinc-900/50">
                    <span className="text-zinc-600 select-none">{log.timestamp}</span>
                    <span className={`uppercase text-xs w-12 ${levelColors[log.level] || 'text-zinc-500'}`}>
                      [{log.level}]
                    </span>
                    <span className="text-zinc-300">{log.message}</span>
                  </div>
                ))
              )}
              
              <div className="flex items-center gap-2 mt-4 text-zinc-600">
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse"></span>
                <span className="text-xs">Waiting for activity...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

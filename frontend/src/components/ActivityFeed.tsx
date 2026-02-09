"use client";

import { useState, useEffect } from "react";
import { getActivity, type Activity } from "@/lib/api";

const actionIcons: Record<string, string> = {
  task_assigned: "📋",
  task_created: "✨",
  task_started: "▶️",
  task_status: "🔄",
  config_updated: "⚙️",
  memory_updated: "🧠",
  status_changed: "📡",
  dispatched: "🚀",
  project_created: "📁",
  default: "📌"
};

const agentEmojis: Record<string, string> = {
  john: "🏛️",
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

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const data = await getActivity(50);
      setActivities(data);
    } catch (e) {
      console.error("Failed to fetch activities:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        <span className="w-3 h-3 bg-zinc-600 rounded-full animate-pulse mr-2"></span>
        Loading activity...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-zinc-500">Live • {activities.length} events</span>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No activity yet. Tasks and agent actions will appear here.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-zinc-800/50 transition">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {agentEmojis[activity.agent] || "🤖"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white capitalize">{activity.agent}</span>
                      <span className="text-zinc-500">→</span>
                      <span className="text-zinc-300">{activity.action.replace(/_/g, ' ')}</span>
                      <span>{actionIcons[activity.action] || actionIcons.default}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{activity.details}</p>
                  </div>
                  <span className="text-xs text-zinc-600 whitespace-nowrap">
                    {timeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const navItems = [
  { id: "agents", label: "Agent Swarm", icon: "◉" },
  { id: "activity", label: "Activity Feed", icon: "◈" },
  { id: "tasks", label: "Task Queue", icon: "▣" },
  { id: "logs", label: "Agent Logs", icon: "▤" },
  { id: "treasury", label: "Treasury", icon: "◇" },
  { id: "projects", label: "Projects", icon: "△" },
  { id: "settings", label: "Settings", icon: "◎" },
];

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 min-h-screen p-6 relative">
      <div className="mb-8">
        <div className="text-2xl mb-1">🏛️</div>
        <div className="text-sm font-medium text-white">John</div>
        <div className="text-xs text-zinc-500 italic">CEO Agent</div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-3 transition-colors ${
              activeView === item.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-xs text-zinc-600 border-t border-zinc-800 pt-4">
          <div className="text-zinc-400 font-medium">AGI Holdings</div>
          <div className="text-zinc-500 mt-0.5">johnagent.bond</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>System Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getProjects, createProject, updateProject, type Project } from "@/lib/api";

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

const statusColors = {
  active: "bg-green-900 text-green-300",
  planning: "bg-blue-900 text-blue-300",
  completed: "bg-zinc-700 text-zinc-300",
  paused: "bg-yellow-900 text-yellow-300",
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", lead: "dev" });

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newProject.name) return;
    try {
      await createProject(newProject);
      setNewProject({ name: "", description: "", lead: "dev" });
      setShowNew(false);
      fetchProjects();
    } catch (e) {
      console.error("Failed to create project:", e);
    }
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    try {
      await updateProject(id, { progress });
      fetchProjects();
    } catch (e) {
      console.error("Failed to update project:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        <span className="w-3 h-3 bg-zinc-600 rounded-full animate-pulse mr-2"></span>
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <button 
          onClick={() => setShowNew(true)}
          className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200 transition"
        >
          + New Project
        </button>
      </div>

      {showNew && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 space-y-4">
          <input
            type="text"
            placeholder="Project name..."
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500"
            autoFocus
          />
          <textarea
            placeholder="Description..."
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full bg-black border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-zinc-500 h-20 resize-none"
          />
          <div className="flex gap-4">
            <select
              value={newProject.lead}
              onChange={(e) => setNewProject({ ...newProject, lead: e.target.value })}
              className="bg-black border border-zinc-700 rounded px-4 py-2 text-white"
            >
              <option value="dev">🛠️ Dev</option>
              <option value="infra">🔧 Infra</option>
              <option value="research">🔬 Research</option>
              <option value="writer">✍️ Writer</option>
              <option value="designer">🎨 Designer</option>
            </select>
            <button onClick={handleCreate} className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-zinc-200">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="text-zinc-500 hover:text-white px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
            No projects yet. Create one to get started.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{project.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{project.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs capitalize ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span>{agentEmojis[project.lead] || "🤖"}</span>
                  <span>Led by {project.lead}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{project.progress}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={project.progress}
                      onChange={(e) => handleProgressUpdate(project.id, parseInt(e.target.value))}
                      className="w-20 h-1 bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

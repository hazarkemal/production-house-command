"use client";

import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { getAgents, getAgent, updateAgentSoul, updateAgentMemory, type Agent } from "@/lib/api";

// Custom node component for agents
function AgentNode({ data }: { data: any }) {
  const levelColors: Record<string, string> = {
    "—": "bg-zinc-700",
    L1: "bg-zinc-600",
    L2: "bg-blue-600",
    L3: "bg-green-600",
    L4: "bg-purple-600",
  };

  const statusColors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-yellow-500 animate-pulse",
    offline: "bg-zinc-600",
  };

  const emoji = data.emoji?.replace(/\*\*/g, '').trim() || '🤖';
  const level = data.level?.replace(/\*\*/g, '').trim() || 'L1';
  const status = data.status || 'offline';
  
  return (
    <div
      className={`px-4 py-3 bg-zinc-900 border-2 rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${
        data.selected ? "border-green-500 shadow-green-500/20" : "border-zinc-700"
      }`}
      style={{ minWidth: 150 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
          <span className={`px-2 py-0.5 rounded text-xs text-white ${levelColors[level] || 'bg-zinc-600'}`}>
            {level}
          </span>
        </div>
      </div>
      
      <div className="font-medium text-white">{data.name}</div>
      <div className="text-xs text-zinc-400 italic mt-1">{data.role?.replace(/\*\*/g, '').trim()}</div>
      
      <div className="mt-2 text-xs text-zinc-500 truncate max-w-[130px]">
        {data.model?.replace(/\*\*/g, '').split('(')[0].trim()}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

function buildNodesAndEdges(agents: Agent[]): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: "hazar",
      type: "agent",
      position: { x: 400, y: 0 },
      data: { name: "Hazar", role: "Human", emoji: "👤", level: "—", model: "—", status: "online" },
    },
    {
      id: "john",
      type: "agent",
      position: { x: 400, y: 130 },
      data: { name: "John", role: "CEO Agent", emoji: "🏛️", level: "L4", model: "Opus 4.5", status: "online" },
    },
  ];
  
  const row1 = agents.filter(a => ['dev', 'infra', 'research', 'writer', 'designer'].includes(a.id));
  const row2 = agents.filter(a => ['finance', 'qa', 'social', 'accounts'].includes(a.id));
  
  row1.forEach((agent, i) => {
    nodes.push({
      id: agent.id,
      type: "agent",
      position: { x: 80 + i * 165, y: 300 },
      data: {
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        level: agent.level,
        model: agent.model,
        status: "offline",
      },
    });
  });
  
  row2.forEach((agent, i) => {
    nodes.push({
      id: agent.id,
      type: "agent",
      position: { x: 160 + i * 165, y: 470 },
      data: {
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        level: agent.level,
        model: agent.model,
        status: "offline",
      },
    });
  });
  
  const edges: Edge[] = [
    { id: "e-hazar-john", source: "hazar", target: "john", animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
    { id: "e-john-dev", source: "john", target: "dev", style: { stroke: '#52525b' } },
    { id: "e-john-infra", source: "john", target: "infra", style: { stroke: '#52525b' } },
    { id: "e-john-research", source: "john", target: "research", style: { stroke: '#52525b' } },
    { id: "e-john-writer", source: "john", target: "writer", style: { stroke: '#52525b' } },
    { id: "e-john-designer", source: "john", target: "designer", style: { stroke: '#52525b' } },
    { id: "e-dev-finance", source: "dev", target: "finance", style: { stroke: '#3f3f46' } },
    { id: "e-dev-qa", source: "dev", target: "qa", style: { stroke: '#3f3f46' } },
    { id: "e-writer-social", source: "writer", target: "social", style: { stroke: '#3f3f46' } },
    { id: "e-infra-accounts", source: "infra", target: "accounts", style: { stroke: '#3f3f46' } },
  ];
  
  return { nodes, edges };
}

export default function AgentMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentDetail, setAgentDetail] = useState<{ soul: string; memory: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'soul' | 'memory'>('soul');

  useEffect(() => {
    getAgents().then(agents => {
      const { nodes, edges } = buildNodesAndEdges(agents);
      setNodes(nodes);
      setEdges(edges);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load agents:', err);
      setLoading(false);
    });
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (selectedAgent && selectedAgent !== 'hazar' && selectedAgent !== 'john') {
      getAgent(selectedAgent).then(detail => {
        setAgentDetail({
          soul: detail.soul || '',
          memory: detail.memory || ''
        });
      });
    } else {
      setAgentDetail(null);
    }
  }, [selectedAgent]);

  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedAgent(node.id);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: n.id === node.id },
      }))
    );
  }, [setNodes]);

  const handleSave = async () => {
    if (!selectedAgent || !agentDetail) return;
    setSaving(true);
    try {
      if (activeTab === 'soul') {
        await updateAgentSoul(selectedAgent, agentDetail.soul);
      } else {
        await updateAgentMemory(selectedAgent, agentDetail.memory);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-zinc-600 rounded-full animate-pulse"></span>
          Loading agents...
        </div>
      </div>
    );
  }

  const selectedNode = nodes.find(n => n.id === selectedAgent);

  return (
    <div className="flex gap-6">
      <div className="flex-1 h-[600px] border border-zinc-800 rounded-lg bg-zinc-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#27272a" gap={20} />
          <Controls className="bg-zinc-900 border-zinc-700 fill-white" />
        </ReactFlow>
      </div>

      {selectedNode && selectedAgent !== 'hazar' && (
        <div className="w-96 border border-zinc-800 rounded-lg p-6 bg-zinc-900 flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedNode.data.emoji?.replace(/\*\*/g, '')}</span>
            <div>
              <div className="font-medium text-lg text-white">{selectedNode.data.name}</div>
              <div className="text-sm text-zinc-400">{selectedNode.data.role?.replace(/\*\*/g, '')}</div>
            </div>
            <span className="ml-auto px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
              {selectedNode.data.level?.replace(/\*\*/g, '')}
            </span>
          </div>

          {selectedAgent === 'john' ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              CEO Agent — That's me!
            </div>
          ) : agentDetail ? (
            <>
              <div className="flex border-b border-zinc-800 mb-4">
                <button
                  onClick={() => setActiveTab('soul')}
                  className={`px-4 py-2 text-sm ${activeTab === 'soul' ? 'border-b-2 border-white text-white font-medium' : 'text-zinc-500'}`}
                >
                  SOUL.md
                </button>
                <button
                  onClick={() => setActiveTab('memory')}
                  className={`px-4 py-2 text-sm ${activeTab === 'memory' ? 'border-b-2 border-white text-white font-medium' : 'text-zinc-500'}`}
                >
                  MEMORY.md
                </button>
              </div>

              <textarea
                className="flex-1 w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono text-zinc-300 resize-none focus:outline-none focus:border-zinc-600"
                value={activeTab === 'soul' ? agentDetail.soul : agentDetail.memory}
                onChange={(e) => setAgentDetail({
                  ...agentDetail,
                  [activeTab]: e.target.value
                })}
              />

              <button 
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full bg-white text-black py-2 rounded text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Push to Git'}
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

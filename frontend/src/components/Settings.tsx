"use client";

import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSpawn, setAutoSpawn] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-white">Settings</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
        {/* System Info */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-white mb-4">System Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Domain</dt>
              <dd className="text-zinc-300">johnagent.bond</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Dashboard</dt>
              <dd className="text-zinc-300">dash.johnagent.bond</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">API</dt>
              <dd className="text-zinc-300">api.johnagent.bond</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">VPS</dt>
              <dd className="text-zinc-300">138.68.74.56</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Active Agents</dt>
              <dd className="text-zinc-300">9</dd>
            </div>
          </dl>
        </div>

        {/* Preferences */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm text-zinc-300">Telegram Notifications</div>
                <div className="text-xs text-zinc-500">Send alerts to Telegram</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm text-zinc-300">Auto-spawn Agents</div>
                <div className="text-xs text-zinc-500">Automatically start agents on task</div>
              </div>
              <input
                type="checkbox"
                checked={autoSpawn}
                onChange={(e) => setAutoSpawn(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700"
              />
            </label>
          </div>
        </div>

        {/* Wallet */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-white mb-4">Wallet</h3>
          <div className="bg-black rounded p-3 font-mono text-xs text-zinc-400 break-all">
            0xFE8f6EB2E980F1C68E8286A5F602a737e02FA814
          </div>
          <div className="text-xs text-zinc-600 mt-2">Master wallet on Base chain</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200 transition">
          Save Changes
        </button>
        <button className="text-zinc-500 hover:text-white px-4 py-2 text-sm transition">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

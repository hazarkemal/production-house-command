"use client";

import { useEffect, useState } from "react";

const WALLET = "0xFE8f6EB2E980F1C68E8286A5F602a737e02FA814";

interface Balance {
  chain: string;
  native: number;
  nativeSymbol: string;
  usdc: number;
  usdValue: number;
}

export default function Treasury() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchBalances = async () => {
    setLoading(true);
    const ethPrice = 2100;
    
    const chains = [
      { name: "Base", rpc: "https://mainnet.base.org", symbol: "ETH" },
      { name: "Ethereum", rpc: "https://eth.llamarpc.com", symbol: "ETH" },
    ];

    const results: Balance[] = [];
    let totalUsd = 0;

    for (const chain of chains) {
      try {
        const res = await fetch(chain.rpc, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [WALLET, "latest"],
            id: 1,
          }),
        });
        const data = await res.json();
        const native = data.result ? parseInt(data.result, 16) / 1e18 : 0;
        const usdValue = native * ethPrice;
        totalUsd += usdValue;

        results.push({
          chain: chain.name,
          native,
          nativeSymbol: chain.symbol,
          usdc: 0,
          usdValue,
        });
      } catch (e) {
        results.push({
          chain: chain.name,
          native: 0,
          nativeSymbol: chain.symbol,
          usdc: 0,
          usdValue: 0,
        });
      }
    }

    setBalances(results);
    setTotal(totalUsd);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Treasury</h2>
        <button
          onClick={fetchBalances}
          className="text-sm text-zinc-500 hover:text-white transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-light text-white">${total.toFixed(2)}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide mt-2">
            Total Value
          </div>
        </div>
        {balances.map((b) => (
          <div key={b.chain} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
              {b.chain}
            </div>
            <div className="text-xl text-white">
              {b.native.toFixed(4)} {b.nativeSymbol}
            </div>
            <div className="text-sm text-zinc-500">≈ ${b.usdValue.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="text-xs text-zinc-500 mb-2">Master Wallet</div>
        <div className="font-mono text-sm text-zinc-300">{WALLET}</div>
        <div className="text-xs text-zinc-600 mt-2">Last updated: {lastUpdate}</div>
      </div>
    </div>
  );
}

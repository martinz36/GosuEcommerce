"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface SalesPoint {
  date: string;
  formattedDate: string;
  amountPEN: number;
  amountUSD: number;
}

interface SalesChartProps {
  data: SalesPoint[];
  currency: "PEN" | "USD";
  currencySymbol: string;
}

export default function SalesChart({ data, currency, currencySymbol }: SalesChartProps) {
  const isPEN = currency === "PEN";
  const dataKey = isPEN ? "amountPEN" : "amountUSD";

  const strokeColor = isPEN ? "#10b981" : "#06b6d4";
  const fillColor = isPEN ? "#10b981" : "#06b6d4";

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            dy={5}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(val) => `${currencySymbol}${val}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const val = Number(payload[0].value || 0);
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono border border-slate-800">
                    <p className="text-slate-400 text-[11px] font-sans font-bold">{label}</p>
                    <p className="text-emerald-400 font-extrabold text-sm">
                      {currencySymbol}
                      {val.toFixed(2)} {currency}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

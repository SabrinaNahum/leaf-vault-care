"use client";

import React, { useMemo } from "react";
import { Card } from "./BaseComponents";

interface ReflectionEntry {
  id: number;
  stressLevel: number;
  achievementLevel: number;
  mindsetPositive: boolean;
  timestamp: number;
}

interface DataVisualizationProps {
  entries: ReflectionEntry[];
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ entries }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (entries.length === 0) return null;

    const stressLevels = entries.map(e => e.stressLevel);
    const achievementLevels = entries.map(e => e.achievementLevel);

    return {
      totalEntries: entries.length,
      avgStress: Math.round(stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length),
      avgAchievement: Math.round(achievementLevels.reduce((a, b) => a + b, 0) / achievementLevels.length),
      positiveMindsetCount: entries.filter(e => e.mindsetPositive).length,
      positiveMindsetPercentage: Math.round((entries.filter(e => e.mindsetPositive).length / entries.length) * 100),
      stressTrend: entries.length >= 2 ?
        (entries[entries.length - 1].stressLevel > entries[0].stressLevel ? 'increasing' :
         entries[entries.length - 1].stressLevel < entries[0].stressLevel ? 'decreasing' : 'stable') : 'stable'
    };
  }, [entries]);

  if (!stats) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-400">No data available for visualization</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overview Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Reflections:</span>
            <span className="font-medium text-white">{stats.totalEntries}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Positive Mindset:</span>
            <span className="font-medium text-green-400">{stats.positiveMindsetPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Stress Trend:</span>
            <span className={`font-medium ${
              stats.stressTrend === 'decreasing' ? 'text-green-400' :
              stats.stressTrend === 'increasing' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {stats.stressTrend === 'decreasing' ? '↓ Improving' :
               stats.stressTrend === 'increasing' ? '↑ Increasing' : '→ Stable'}
            </span>
          </div>
        </div>
      </Card>

      {/* Average Levels */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Average Levels</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Stress Level</span>
              <span className="font-medium text-white">{stats.avgStress}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.avgStress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Achievement Level</span>
              <span className="font-medium text-white">{stats.avgAchievement}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.avgAchievement}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
        <div className="space-y-3">
          {entries.slice(-3).reverse().map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  entry.mindsetPositive ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">Entry #{entry.id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">S:{entry.stressLevel} A:{entry.achievementLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Mindset Distribution */}
      <Card className="p-6 md:col-span-2 lg:col-span-1">
        <h3 className="text-lg font-semibold mb-4 text-white">Mindset Distribution</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-green-400">Positive</span>
              <span className="text-sm text-white">{stats.positiveMindsetCount}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.positiveMindsetPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.positiveMindsetPercentage}%</div>
        </div>
      </Card>
    </div>
  );
};

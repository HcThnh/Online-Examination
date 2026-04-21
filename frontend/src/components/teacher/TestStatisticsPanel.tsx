import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, TrendingUp, ArrowUpCircle, ArrowDownCircle, Award, Users, AlertCircle } from 'lucide-react';
import { TestService, type TestStatistics } from '../../services/teacherTestService';

interface TestStatisticsPanelProps {
  testId: string;
  useMockData?: boolean;
}

const TestStatisticsPanel: React.FC<TestStatisticsPanelProps> = ({ testId, useMockData = false }) => {
  const [stats, setStats] = useState<TestStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);

      if (useMockData) {
        setTimeout(() => {
          setStats({
            totalAttempts: 124,
            averageScore: 78.5,
            highestScore: 100,
            lowestScore: 35,
            averagePercentage: 78.5,
            passRate: 85,
            passThreshold: 50,
            distribution: [
              { range: "0-10%", count: 2 },
              { range: "10-20%", count: 1 },
              { range: "20-30%", count: 3 },
              { range: "30-40%", count: 5 },
              { range: "40-50%", count: 8 },
              { range: "50-60%", count: 15 },
              { range: "60-70%", count: 25 },
              { range: "70-80%", count: 35 },
              { range: "80-90%", count: 20 },
              { range: "90-100%", count: 10 }
            ]
          });
          setIsLoading(false);
        }, 800);
        return;
      }

      try {
        const data = await TestService.getTestStatistics(testId);
        setStats(data);
      } catch (err: any) {
        setError('Failed to load statistics.');
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (testId) {
      fetchStatistics();
    }
  }, [testId, useMockData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center text-red-600 gap-3">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm font-medium">{error || 'Failed to load statistics'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.averageScore.toFixed(1)}</span>
            <span className="text-sm text-slate-500 ml-1">pts</span>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.highestScore}</span>
            <span className="text-sm text-slate-500 ml-1">pts</span>
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lowest</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.lowestScore}</span>
            <span className="text-sm text-slate-500 ml-1">pts</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.passRate}%</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalAttempts}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-900">Score Distribution</h3>
          <p className="text-sm text-slate-500">Distribution of student scores across 10 buckets.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-primary, #0056D2)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TestStatisticsPanel;

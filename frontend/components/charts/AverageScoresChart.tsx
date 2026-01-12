'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateForChart } from '@/lib/date-utils';

interface ScoreData {
  date: string;
  security: number;
  quality: number;
  tech_debt: number;
}

interface AverageScoresChartProps {
  data: ScoreData[];
  periodDays: number;
}

export default function AverageScoresChart({ data, periodDays }: AverageScoresChartProps) {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: formatDateForChart(item.date)
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Average Scores Over Time</h3>
        <p className="text-sm text-gray-500">Score trends over the last {periodDays} days</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dateLabel" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="security" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
            name="Security"
          />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            name="Quality"
          />
          <Line 
            type="monotone" 
            dataKey="tech_debt" 
            stroke="#eab308" 
            strokeWidth={2}
            dot={{ fill: '#eab308', r: 3 }}
            name="Tech Debt"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


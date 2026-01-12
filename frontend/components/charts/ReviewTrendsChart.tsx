'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateForChart } from '@/lib/date-utils';

interface TrendData {
  date: string;
  count: number;
}

interface ReviewTrendsChartProps {
  data: TrendData[];
  periodDays: number;
}

export default function ReviewTrendsChart({ data, periodDays }: ReviewTrendsChartProps) {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    dateLabel: formatDateForChart(item.date)
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Review Trends</h3>
        <p className="text-sm text-gray-500">Reviews created over the last {periodDays} days</p>
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
            dataKey="count" 
            stroke="#4f46e5" 
            strokeWidth={3}
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
            name="Reviews"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


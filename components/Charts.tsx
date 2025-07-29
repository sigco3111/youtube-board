import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, CartesianGrid } from 'recharts';

interface VideoViewsChartProps {
  data: { title: string; viewCount: number }[];
  title: string;
}

export const VideoViewsChart: React.FC<VideoViewsChartProps> = ({ data, title }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-64 sm:h-80">
      <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            type="number" 
            stroke="#94a3b8" 
            fontSize={12}
            tickFormatter={(value) => new Intl.NumberFormat('ko-KR', { notation: 'compact' }).format(value as number)}
          />
          <YAxis type="category" dataKey="title" width={100} stroke="#94a3b8" fontSize={10} tick={{ fill: '#cbd5e1' }} />
          <Tooltip
            cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              color: '#cbd5e1',
            }}
            formatter={(value) => [`${(value as number).toLocaleString()} 회`, '조회수']}
          />
          <Bar dataKey="viewCount" name="조회수" fill="#22d3ee" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
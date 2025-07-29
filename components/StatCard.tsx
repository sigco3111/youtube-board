import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  className?: string;
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, className, tooltip }) => {
  return (
    <div className={`relative bg-slate-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all duration-300 hover:bg-slate-700/50 hover:shadow-cyan-500/10 group ${className}`}>
      <div className="bg-slate-700 p-4 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-3 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <h4 className="font-bold mb-1 text-white">분석 근거</h4>
          <p className="leading-relaxed">{tooltip}</p>
           <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
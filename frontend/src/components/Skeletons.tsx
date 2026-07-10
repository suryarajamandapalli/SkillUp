import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 w-full animate-pulse">
      <div className="h-4 bg-[#E5E7EB] rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-[#E5E7EB] rounded w-1/2 mb-6"></div>
      <div className="space-y-2">
        <div className="h-3 bg-[#E5E7EB] rounded w-full"></div>
        <div className="h-3 bg-[#E5E7EB] rounded w-5/6"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 h-84 animate-pulse">
        <div className="h-4 bg-[#E5E7EB] rounded w-1/4 mb-6"></div>
        <div className="h-full bg-[#F8FAFC] rounded w-full flex items-center justify-center">
          <span className="text-[#94A3B8] text-xs">Computing recommendations...</span>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white animate-pulse">
      <div className="bg-[#F8FAFC] h-10 border-b border-[#E5E7EB]"></div>
      <div className="divide-y divide-[#E5E7EB]">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="p-4 flex justify-between">
            <div className="h-4 bg-[#E5E7EB] rounded w-1/4"></div>
            <div className="h-4 bg-[#E5E7EB] rounded w-1/6"></div>
            <div className="h-4 bg-[#E5E7EB] rounded w-1/12"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

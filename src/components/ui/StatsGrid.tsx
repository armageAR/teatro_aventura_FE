import React from 'react';

import StatCard from '@/components/StatCard';

export type StatColor = 'red' | 'orange' | 'blue' | 'green' | 'purple';

export type StatItem = {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color?: StatColor;
};

export type StatsGridProps = {
  items: StatItem[];
  className?: string;
};

const StatsGrid: React.FC<StatsGridProps> = ({ items, className }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ${className ?? ''}`}
    >
      {items.map((item, idx) => (
        <StatCard
          key={`${item.title}-${idx}`}
          icon={item.icon}
          title={item.title}
          value={item.value}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default StatsGrid;

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import type { Category } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ExpenseChartsProps {
  categoryTotals: Record<Category, number>;
  expenses: { date: string; amount: number }[];
}

const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#fb923c',        // Orange/Amber
  Transport: '#38bdf8',   // Sky Blue
  Bills: '#f43f5e',       // Rose
  Entertainment: '#a855f7', // Purple
  Other: '#9ca3af'        // Gray
};

export default function ExpenseCharts({ categoryTotals, expenses }: ExpenseChartsProps) {
  // 1. Prepare Pie Chart Data
  const pieData = useMemo(() => {
    const data = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
    
    // If empty, return dummy data for styling placeholder
    if (data.length === 0) {
      return [{ name: 'No Expenses logged', value: 1 }];
    }
    return data;
  }, [categoryTotals]);

  const totalSpent = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

  // 2. Prepare Bar Chart Data (Last 10 Days Spending)
  const barData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    
    // Initialize last 8 calendar days with 0 to ensure continuous timeline representation
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = dateStr.substring(8, 10) + '/' + dateStr.substring(5, 7); // DD/MM format
      dateMap[displayDate] = 0;
    }

    // Accumulate amounts
    expenses.forEach(e => {
      const expenseDate = new Date(e.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - expenseDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Only include last 14 days of spending history in trend
      if (diffDays <= 14) {
        const displayDate = e.date.substring(8, 10) + '/' + e.date.substring(5, 7);
        // Only override if date exists or aggregate
        dateMap[displayDate] = (dateMap[displayDate] || 0) + e.amount;
      }
    });

    return Object.entries(dateMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        return monthA !== monthB ? monthA - monthB : dayA - dayB;
      });
  }, [expenses]);

  // Custom tooltips for nice formatting
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (totalSpent === 0) return null;
      const percent = ((data.value / totalSpent) * 100).toFixed(1);
      return (
        <div className="glass-card" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{data.name}</p>
          <p style={{ color: 'var(--primary)' }}>{formatCurrency(data.value)} ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  const renderBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Date: {payload[0].payload.date}</p>
          <p style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid">
      {/* Bar Chart Card */}
      <div className="glass-card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Daily Spending Trend (Last 8 Days)
        </h2>
        <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip content={renderBarTooltip} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar
                dataKey="amount"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              >
                {barData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.amount > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="glass-card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Category Distribution (This Month)
        </h2>
        <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => {
                  const categoryName = entry.name as Category;
                  const cellColor = totalSpent > 0
                    ? (CATEGORY_COLORS[categoryName] || 'rgba(255,255,255,0.1)')
                    : 'rgba(255,255,255,0.05)';
                  return <Cell key={`cell-${index}`} fill={cellColor} />;
                })}
              </Pie>
              <Tooltip content={renderPieTooltip} />
              <Legend
                verticalAlign="bottom"
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {totalSpent === 0 && (
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>No Spending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

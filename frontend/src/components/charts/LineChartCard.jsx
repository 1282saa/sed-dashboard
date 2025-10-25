import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../common/Card';

/**
 * 라인 차트 카드 컴포넌트
 */
const LineChartCard = ({
  title,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  tooltip,
  color = '#8B5CF6',
  height = 300,
}) => {
  return (
    <Card title={title} tooltip={tooltip}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6B7280"
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              color: '#111827',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color }}
            fill="url(#colorGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LineChartCard;

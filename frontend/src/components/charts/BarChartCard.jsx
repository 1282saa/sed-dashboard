import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../common/Card';

/**
 * 바 차트 카드 컴포넌트
 */
const BarChartCard = ({
  title,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  tooltip,
  color = '#8B5CF6',
}) => {
  return (
    <Card title={title} tooltip={tooltip}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
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
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BarChartCard;

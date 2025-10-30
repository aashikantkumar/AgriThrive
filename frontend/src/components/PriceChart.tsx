import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChartProps {
  data: {
    state: string;
    commodity: string;
    period: string;
    currentAvgPrice: number;
    priceChange: string;
    trend: string;
    history: Array<{
      date: string;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      marketCount: number;
    }>;
    summary: {
      highest: string;
      lowest: string;
      average: string;
    };
  };
}

export default function PriceChart({ data }: PriceChartProps) {
  const getTrendIcon = () => {
    if (data.trend === 'Rising') return <TrendingUp className="w-5 h-5 text-primary" />;
    if (data.trend === 'Falling') return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (data.trend === 'Rising') return 'text-primary';
    if (data.trend === 'Falling') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const chartData = data.history.map((item) => ({
    date: item.date,
    'Avg Price': item.avgPrice,
    'Min Price': item.minPrice,
    'Max Price': item.maxPrice,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Avg Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{data.currentAvgPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">per quintal</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              {getTrendIcon()}
              <span className="ml-1">Price Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor()}`}>
              {data.trend}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.priceChange} change</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Highest Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{data.summary.highest}</div>
            <p className="text-xs text-muted-foreground mt-1">in period</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/30 bg-accent/5 hover:border-accent/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lowest Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">₹{data.summary.lowest}</div>
            <p className="text-xs text-muted-foreground mt-1">in period</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Price History - {data.period}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.commodity} prices in {data.state}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ 
                  value: 'Price (₹/quintal)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Line
                type="monotone"
                dataKey="Avg Price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="Min Price"
                stroke="hsl(var(--primary) / 0.5)"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Max Price"
                stroke="hsl(var(--accent))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Area Chart for Price Range */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Price Range Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Max Price"
                stackId="1"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent) / 0.2)"
              />
              <Area
                type="monotone"
                dataKey="Avg Price"
                stackId="2"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="Min Price"
                stackId="3"
                stroke="hsl(var(--primary) / 0.5)"
                fill="hsl(var(--primary) / 0.1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NetworkChartProps {
  data: Array<{ time: string; normal: number; threats: number }>;
}

export const NetworkChart = ({ data = [] }: NetworkChartProps) => {
  const displayData = data && data.length > 0 ? data : [
    { time: '00:00', normal: 0, threats: 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={displayData}>
        <defs>
          <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="time" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Area
          type="monotone"
          dataKey="normal"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#normalGradient)"
          name="Normal Traffic"
        />
        <Area
          type="monotone"
          dataKey="threats"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          fill="url(#threatGradient)"
          name="Threats"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

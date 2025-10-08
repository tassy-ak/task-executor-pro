import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const generateData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${String(Math.floor((Date.now() / 1000 - (20 - i) * 60) / 3600) % 24).padStart(2, '0')}:${String(Math.floor((Date.now() / 1000 - (20 - i) * 60) / 60) % 60).padStart(2, '0')}`,
    normal: Math.floor(Math.random() * 3000 + 2000),
    threats: Math.floor(Math.random() * 500 + 100),
  }));
};

export const NetworkChart = () => {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          normal: Math.floor(Math.random() * 3000 + 2000),
          threats: Math.floor(Math.random() * 500 + 100),
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
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

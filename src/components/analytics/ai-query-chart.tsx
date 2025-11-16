
"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useChatHistory } from "@/context/chat-history-context";
import { useMemo } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";

const chartConfig = {
  queries: {
    label: "AI Queries",
    color: "hsl(var(--primary))",
  },
}

export function AiQueryChart() {
  const { messages, loading } = useChatHistory();

  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const queriesByDay = last7Days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      queries: 0,
    }));

    if (!loading && messages) {
        messages.forEach(message => {
            // Only count user messages as "queries"
            if (message.role === 'user' && message.createdAt) {
                const messageDate = format(message.createdAt.toDate(), 'yyyy-MM-dd');
                const dayData = queriesByDay.find(d => d.date === messageDate);
                if (dayData) {
                    dayData.queries++;
                }
            }
        });
    }

    return queriesByDay;
  }, [messages, loading]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <YAxis allowDecimals={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="queries"
          type="monotone"
          stroke="var(--color-queries)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  )
}

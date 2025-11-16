
"use client"

import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { useSummaryHistory } from "@/context/summary-history-context";
import { summaryTypes } from "@/components/document/summary-generator";

const chartColors = [
  "hsl(195, 91%, 31%)", // primary
  "hsl(210, 89%, 64%)",
  "hsl(25, 95%, 53%)",
  "hsl(160, 84%, 39%)",
  "hsl(48, 96%, 53%)",
  "hsl(0, 72%, 51%)",
  "hsl(310, 80%, 55%)", 
];

export function SummaryTypesChart() {
  const { summaries, loading } = useSummaryHistory();

  const { chartData, chartConfig } = useMemo(() => {
    const typeCounts = new Map<string, number>();
    summaries.forEach(summary => {
      typeCounts.set(summary.format, (typeCounts.get(summary.format) || 0) + 1);
    });

    const data = Array.from(typeCounts.entries()).map(([type, count], index) => ({
      type,
      count,
      fill: chartColors[index % chartColors.length],
    }));

    const config = data.reduce((acc, item) => {
        const typeDetails = summaryTypes.find(st => st.value === item.type);
        acc[item.type] = {
            label: typeDetails ? typeDetails.label.replace(' Summary', '').replace(' of the paper', '') : item.type,
            color: item.fill,
        };
        return acc;
    }, {} as any);
    
    config.count = { label: "Count" };

    return { chartData: data, chartConfig: config };

  }, [summaries]);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="type"
            innerRadius={60}
            strokeWidth={5}
          >
             {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
           <ChartLegend
            content={<ChartLegendContent nameKey="type" layout="vertical" align="right" verticalAlign="middle" />}
            className="[&_.recharts-legend-item-text]:capitalize"
          />
        </PieChart>
    </ChartContainer>
  )
}

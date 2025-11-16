
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDocumentContext } from "@/context/document-context";
import { format, subDays, eachDayOfInterval } from "date-fns";

const chartConfig = {
  uploads: {
    label: "Uploads",
    color: "hsl(var(--primary))",
  },
}

export function DocumentUploadsChart() {
  const { documents, loading } = useDocumentContext();

  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const uploadsByDay = last7Days.map(day => ({
        day: format(day, 'EEE'),
        date: format(day, 'yyyy-MM-dd'),
        uploads: 0,
    }));

    if (!loading && documents) {
        documents.forEach(doc => {
            if (doc.uploadedAt) {
                const uploadDate = format(doc.uploadedAt.toDate(), 'yyyy-MM-dd');
                const dayData = uploadsByDay.find(d => d.date === uploadDate);
                if (dayData) {
                    dayData.uploads++;
                }
            }
        });
    }
    
    return uploadsByDay;

  }, [documents, loading]);


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="uploads" fill="var(--color-uploads)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}


import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentDetailLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Document Content Skeleton */}
      <Card className="flex flex-col">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2 items-center pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </CardContent>
      </Card>
      
      {/* Right Column: AI Tools Skeleton */}
      <Card className="flex flex-col h-full">
        <Tabs defaultValue="chat" className="flex flex-col h-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </TabsList>
          </CardHeader>
          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
            <div className="flex flex-col h-full p-4 pt-0">
                <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-16 w-3/4" />
                    </div>
                     <div className="flex items-start gap-3 justify-end">
                        <Skeleton className="h-12 w-1/2" />
                        <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                </div>
                <div className="mt-4 relative">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

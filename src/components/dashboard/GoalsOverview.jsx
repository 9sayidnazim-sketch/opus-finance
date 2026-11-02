import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const iconMap = {
  Plane, Car, Home, GraduationCap, Heart, ShoppingBag, Palmtree, Sparkles
};

export default function GoalsOverview({ goals, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'em_progresso');

  if (activeGoals.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No active goals</p>
          <Link to={createPageUrl("Goals")}>
            <Button variant="outline" size="sm">
              Create Goals
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const topGoals = activeGoals.slice(0, 3);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Financial Goals</CardTitle>
          <Link to={createPageUrl("Goals")}>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {topGoals.map((goal) => {
            const Icon = iconMap[goal.icon] || Sparkles;
            const percentage = ((goal.current_amount || 0) / goal.target_amount) * 100;
            const colorClass = goal.color || 'bg-purple-500';
            const textColorClass = colorClass.includes('bg-') ? colorClass.replace('bg-', 'text-') : 'text-purple-500';
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                    <Icon className={`w-4 h-4 ${textColorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {goal.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(goal.current_amount || 0).toFixed(2)} of {goal.target_amount.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
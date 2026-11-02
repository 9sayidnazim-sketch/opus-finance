import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCard({ title, value, icon: Icon, bgColor, trend }) {
  return (
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${bgColor} rounded-full opacity-10`} />
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
              {value}
            </CardTitle>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <span className="text-sm text-slate-600">{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  gradient?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  gradient = false,
}: StatsCardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`shadow-card ${gradient ? 'bg-gradient-card' : ''}`}>
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {value}
              </p>
              {change && (
                <span
                  className={`text-xs font-medium ${getChangeColor(
                    change.type
                  )}`}
                >
                  {change.value}
                </span>
              )}
            </div>
          </div>
          <div
            className={`p-2 sm:p-3 rounded-full ${
              gradient ? 'bg-primary/10' : 'bg-primary/5'
            } shrink-0`}
          >
            <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

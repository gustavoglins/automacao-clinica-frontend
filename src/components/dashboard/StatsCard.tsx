import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  gradient?: boolean
}

export function StatsCard({ title, value, icon: Icon, change, gradient = false }: StatsCardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-success'
      case 'decrease':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={`shadow-card hover:shadow-hover transition-all duration-300 ${gradient ? 'bg-gradient-card' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">
                {value}
              </p>
              {change && (
                <span className={`text-xs font-medium ${getChangeColor(change.type)}`}>
                  {change.value}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${gradient ? 'bg-primary/10' : 'bg-primary/5'}`}>
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
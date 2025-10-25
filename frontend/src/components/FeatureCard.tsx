import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  path: string;
}

export const FeatureCard = ({ title, description, icon: Icon, color, path }: FeatureCardProps) => {
  const colorMap: Record<string, string> = {
    "bg-blue-500": "hsl(var(--feature-blue))",
    "bg-green-500": "hsl(var(--feature-green))",
    "bg-purple-500": "hsl(var(--feature-purple))",
    "bg-orange-500": "hsl(var(--feature-orange))",
    "bg-red-500": "hsl(var(--feature-red))",
    "bg-yellow-500": "hsl(var(--feature-yellow))",
    "bg-cyan-500": "hsl(var(--feature-cyan))",
    "bg-pink-500": "hsl(var(--feature-pink))",
  };

  return (
    <Link to={path} className="group">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: colorMap[color] }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrentPriceResponse } from '@/hooks/useMarketData';

interface PriceOverviewProps {
  data: CurrentPriceResponse;
}

export default function PriceOverview({ data }: PriceOverviewProps) {
  const getTrendIcon = () => {
    const diff = parseFloat(data.priceSpread.percentageDiff);
    if (diff > 10) return <TrendingUp className="w-5 h-5 text-primary" />;
    if (diff < -10) return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Average Price Card */}
      <Card className="border-2 hover:border-primary/50 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatPrice(data.averagePrice)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">per quintal</p>
          <p className="text-xs text-muted-foreground mt-2">
            {data.totalMarkets} markets
          </p>
        </CardContent>
      </Card>

      {/* Best Price Card */}
      <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            Best Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatPrice(data.bestPrice.price)}
          </div>
          <p className="text-xs text-primary/80 mt-1">per quintal</p>
          <p className="text-xs text-foreground mt-2 font-medium">
            {data.bestPrice.market}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.bestPrice.district} • {data.bestPrice.date}
          </p>
        </CardContent>
      </Card>

      {/* Worst Price Card */}
      <Card className="border-2 border-accent/30 bg-accent/5 hover:border-accent/50 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-accent flex items-center">
            <ArrowDownIcon className="w-4 h-4 mr-1" />
            Lowest Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatPrice(data.worstPrice.price)}
          </div>
          <p className="text-xs text-accent/80 mt-1">per quintal</p>
          <p className="text-xs text-foreground mt-2 font-medium">
            {data.worstPrice.market}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.worstPrice.district} • {data.worstPrice.date}
          </p>
        </CardContent>
      </Card>

      {/* Price Spread Card */}
      <Card className="border-2 hover:border-primary/50 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            {getTrendIcon()}
            <span className="ml-1">Price Spread</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {data.priceSpread.percentageDiff}
          </div>
          <p className="text-xs text-muted-foreground mt-1">variation</p>
          <p className="text-xs text-foreground mt-2 font-medium">
            ₹{data.priceSpread.difference} difference
          </p>
          <p className="text-xs text-muted-foreground">
            between best & lowest
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import { Award, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface MarketComparisonProps {
  data: {
    state: string;
    commodity: string;
    totalMarkets: number;
    stateAvgPrice: number;
    bestMarket: {
      name: string;
      district: string;
      price: number;
      advantage: string;
      lastUpdated: string;
    };
    worstMarket: {
      name: string;
      district: string;
      price: number;
    };
    markets: Array<{
      market: string;
      district: string;
      avgPrice: number;
      latestDate: string;
      dataPoints: number;
    }>;
    comparison: {
      highest: number;
      lowest: number;
      difference: string;
      percentageDiff: string;
    };
  };
}

export default function MarketComparison({ data }: MarketComparisonProps) {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const getProgressPercentage = (price: number) => {
    const range = data.comparison.highest - data.comparison.lowest;
    if (range === 0) return 50;
    return ((price - data.comparison.lowest) / range) * 100;
  };

  const getPriceColor = (price: number) => {
    const diff = ((price - data.stateAvgPrice) / data.stateAvgPrice) * 100;
    if (diff > 5) return 'text-primary';
    if (diff < -5) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State Average */}
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              State Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(data.stateAvgPrice)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per quintal</p>
            <p className="text-xs text-muted-foreground mt-2">
              Across {data.totalMarkets} markets
            </p>
          </CardContent>
        </Card>

        {/* Best Market */}
        <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-1">
              <Award className="w-4 h-4" />
              Best Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(data.bestMarket.price)}
            </div>
            <p className="text-xs text-primary/80 mt-1">per quintal</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {data.bestMarket.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {data.bestMarket.district}
              </div>
              <Badge className="bg-primary/20 text-primary text-xs border-primary/30">
                {data.bestMarket.advantage}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Price Spread */}
        <Card className="border-2 hover:border-primary/50 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Price Spread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {data.comparison.percentageDiff}
            </div>
            <p className="text-xs text-muted-foreground mt-1">variation</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Highest:</span> {formatPrice(data.comparison.highest)}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Lowest:</span> {formatPrice(data.comparison.lowest)}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Difference:</span> ₹{data.comparison.difference}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets Comparison Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-foreground">Market-wise Price Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparing {data.commodity} prices across {data.totalMarkets} markets in {data.state}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-foreground">Rank</TableHead>
                  <TableHead className="text-foreground">Market</TableHead>
                  <TableHead className="text-foreground">District</TableHead>
                  <TableHead className="text-right text-foreground">Average Price</TableHead>
                  <TableHead className="hidden md:table-cell text-foreground">Price Range</TableHead>
                  <TableHead className="text-right text-foreground">vs State Avg</TableHead>
                  <TableHead className="text-right hidden lg:table-cell text-foreground">Data Points</TableHead>
                  <TableHead className="text-right hidden lg:table-cell text-foreground">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.markets.map((market, index) => {
                  const priceVsAvg = market.avgPrice - data.stateAvgPrice;
                  const percentVsAvg = ((priceVsAvg / data.stateAvgPrice) * 100).toFixed(2);
                  
                  return (
                    <TableRow key={`${market.market}-${market.district}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {index === 0 && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            #{index + 1}
                          </Badge>
                        )}
                        {index !== 0 && (
                          <span className="text-muted-foreground">#{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{market.market}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {market.district}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${getPriceColor(market.avgPrice)}`}>
                          {formatPrice(market.avgPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="w-full">
                          <Progress 
                            value={getProgressPercentage(market.avgPrice)} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {priceVsAvg >= 0 ? (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            +{percentVsAvg}%
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                            {percentVsAvg}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden lg:table-cell">
                        {market.dataPoints}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden lg:table-cell">
                        {market.latestDate}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-foreground">Market Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Best Price Opportunity</p>
              <p className="text-sm text-muted-foreground">
                {data.bestMarket.name} in {data.bestMarket.district} offers the highest price at{' '}
                <span className="font-semibold text-foreground">{formatPrice(data.bestMarket.price)}</span>, which is{' '}
                <span className="font-semibold text-foreground">{data.bestMarket.advantage}</span>.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Price Variation</p>
              <p className="text-sm text-muted-foreground">
                There's a {data.comparison.percentageDiff} price difference between the highest and lowest 
                markets. Consider selling at markets offering above-average prices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Location Strategy</p>
              <p className="text-sm text-muted-foreground">
                Markets in {data.bestMarket.district} district are showing better prices. 
                Consider transportation costs when choosing distant markets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
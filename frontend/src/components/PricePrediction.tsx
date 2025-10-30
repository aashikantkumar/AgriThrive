import { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Calendar, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePricePrediction, PredictionData } from '@/hooks/useMarketData';

interface PricePredictionProps {
  state: string;
  commodity: string;
  district?: string;
}

export default function PricePrediction({ state, commodity, district }: PricePredictionProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const predictMutation = usePricePrediction();

  const handlePredict = () => {
    predictMutation.mutate(
      { state, commodity, district },
      {
        onSuccess: (data) => {
          setPrediction(data);
        },
      }
    );
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'medium':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'low':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.toLowerCase().includes('sell')) return 'bg-primary/20 text-primary border-primary/30';
    if (action.toLowerCase().includes('wait')) return 'bg-accent/20 text-accent border-accent/30';
    return 'bg-muted text-muted-foreground';
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility.toLowerCase()) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-accent';
      case 'low':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Prediction Button */}
      {!prediction && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">AI Price Prediction</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get AI-powered price predictions and recommendations for the next 7, 15, and 30 days
              based on historical data and market trends.
            </p>
            <Button
              onClick={handlePredict}
              disabled={predictMutation.isPending}
              size="lg"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {predictMutation.isPending ? 'Analyzing...' : 'Generate AI Prediction'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {predictMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to generate prediction. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Prediction Results */}
      {prediction && (
        <>
          {/* Current Price & Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Average Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  ₹{prediction.analysis.currentPrice.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">per quintal</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {prediction.dataPoints} market data points
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div className="text-3xl font-bold text-foreground">
                    {prediction.analysis.trend}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Overall market direction</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Predictions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5" />
                Price Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 7 Days */}
                <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">7 Days</h4>
                    <Badge className={getConfidenceBadgeColor(prediction.analysis.predictions['7days'].confidence)}>
                      {prediction.analysis.predictions['7days'].confidence}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    ₹{prediction.analysis.predictions['7days'].price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prediction.analysis.predictions['7days'].change > '0' ? '+' : ''}
                    {prediction.analysis.predictions['7days'].change}% change
                  </p>
                </div>

                {/* 15 Days */}
                <div className="border-2 border-accent/30 bg-accent/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">15 Days</h4>
                    <Badge className={getConfidenceBadgeColor(prediction.analysis.predictions['15days'].confidence)}>
                      {prediction.analysis.predictions['15days'].confidence}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-accent mb-1">
                    ₹{prediction.analysis.predictions['15days'].price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prediction.analysis.predictions['15days'].change > '0' ? '+' : ''}
                    {prediction.analysis.predictions['15days'].change}% change
                  </p>
                </div>

                {/* 30 Days */}
                <div className="border-2 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">30 Days</h4>
                    <Badge className={getConfidenceBadgeColor(prediction.analysis.predictions['30days'].confidence)}>
                      {prediction.analysis.predictions['30days'].confidence}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    ₹{prediction.analysis.predictions['30days'].price.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prediction.analysis.predictions['30days'].change > '0' ? '+' : ''}
                    {prediction.analysis.predictions['30days'].change}% change
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lightbulb className="w-5 h-5 text-primary" />
                AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={`${getActionBadgeColor(prediction.analysis.recommendation.action)} text-base px-4 py-1`}>
                  {prediction.analysis.recommendation.action}
                </Badge>
              </div>
              <p className="text-foreground leading-relaxed">
                {prediction.analysis.recommendation.reason}
              </p>
              <div className="bg-card border-2 rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground mb-1">Best Time to Sell:</p>
                <p className="text-sm text-muted-foreground">
                  {prediction.analysis.recommendation.bestTimeToSell}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Market Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Factors */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Positive Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.analysis.factors.positive.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-sm text-foreground">{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Negative Factors */}
            <Card className="border-2 border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  Negative Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.analysis.factors.negative.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-accent mt-1">!</span>
                      <span className="text-sm text-foreground">{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Impact */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Seasonal Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prediction.analysis.factors.seasonal}
              </p>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="border-2 border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-accent" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Market Volatility:</p>
                <p className={`text-lg font-bold ${getVolatilityColor(prediction.analysis.riskAnalysis.volatility)}`}>
                  {prediction.analysis.riskAnalysis.volatility}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Identified Risks:</p>
                <ul className="space-y-2">
                  {prediction.analysis.riskAnalysis.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Regenerate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePredict}
              disabled={predictMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Regenerate Prediction
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
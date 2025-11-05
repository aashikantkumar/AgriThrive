import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import FilterBar from '@/components/FilterBar';
import PriceOverview from '@/components/PriceOverview';
import MarketTable from '@/components/MarketTable';
import PriceChart from '@/components/PriceChart';
import PricePrediction from '@/components/PricePrediction';
import MarketComparison from '@/components/MarketComparison';
import {
  useCurrentPrices,
  usePriceHistory,
  useMarketComparison,
} from '@/hooks/useMarketData';

const MarketPrice = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    state: 'Bihar',
    district: '',
    commodity: 'Wheat',
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch data using React Query
  const currentPricesQuery = useCurrentPrices(
    filters.state,
    filters.district,
    filters.commodity,
    hasSearched
  );
  const historyQuery = usePriceHistory(filters.state, filters.commodity, 90, hasSearched);
  const comparisonQuery = useMarketComparison(filters.state, filters.commodity, hasSearched);

  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setHasSearched(true);

    // Show success toast
    toast({
      title: 'Fetching market data',
      description: `Loading prices for ${newFilters.commodity} in ${newFilters.state}`,
    });
  };

  const isLoading = currentPricesQuery.isLoading || historyQuery.isLoading || comparisonQuery.isLoading;
  const hasError = currentPricesQuery.isError || historyQuery.isError || comparisonQuery.isError;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Market Prices</h1>
            <p className="text-muted-foreground mt-2">
              Real-time agricultural commodity prices across India
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar onSearch={handleSearch} isLoading={isLoading} />

          {/* Loading State */}
          {isLoading && hasSearched && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading market data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && hasSearched && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-semibold mb-2">Failed to load market data</p>
              <p className="text-destructive/80 text-sm mb-4">
                Please check your filters and try again. Make sure the state and commodity names are correct.
              </p>
              <button 
                onClick={() => handleSearch(filters)} 
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Data Display */}
          {!isLoading && !hasError && hasSearched && currentPricesQuery.data && (
            <>
              {/* Overview Cards */}
              <PriceOverview data={currentPricesQuery.data} />

              {/* Tabbed Content */}
              <Tabs defaultValue="current" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="current">Current Prices</TabsTrigger>
                  <TabsTrigger value="history">Price History</TabsTrigger>
                  <TabsTrigger value="prediction">AI Predict</TabsTrigger>
                  <TabsTrigger value="comparison">Market Compare</TabsTrigger>
                </TabsList>

                {/* Current Prices Tab */}
                <TabsContent value="current" className="space-y-4">
                  <MarketTable markets={currentPricesQuery.data.markets} />
                </TabsContent>

                {/* Price History Tab */}
                <TabsContent value="history" className="space-y-4">
                  {historyQuery.data ? (
                    <PriceChart data={historyQuery.data} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No historical data available
                    </div>
                  )}
                </TabsContent>

                {/* AI Prediction Tab */}
                <TabsContent value="prediction" className="space-y-4">
                  <PricePrediction
                    state={filters.state}
                    commodity={filters.commodity}
                    district={filters.district}
                  />
                </TabsContent>

                {/* Market Comparison Tab */}
                <TabsContent value="comparison" className="space-y-4">
                  {comparisonQuery.data ? (
                    <MarketComparison data={comparisonQuery.data} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No comparison data available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Initial State - No Search */}
          {!hasSearched && (
            <div className="bg-card rounded-lg border p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">
                  Search Market Prices
                </h3>
                <p className="text-muted-foreground mb-6">
                  Select a state, commodity, and optionally a district to view current market prices,
                  historical trends, AI predictions, and market comparisons.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-1">📊 Current Prices</p>
                    <p className="text-muted-foreground">Live market rates</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-1">📈 Price History</p>
                    <p className="text-muted-foreground">90-day trends</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-1">🤖 AI Predict</p>
                    <p className="text-muted-foreground">Future forecasts</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-1">🪙 Compare Markets</p>
                    <p className="text-muted-foreground">Best opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPrice;
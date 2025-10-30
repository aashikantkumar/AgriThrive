import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MarketPrice } from '@/hooks/useMarketData';

interface MarketTableProps {
  markets: MarketPrice[];
}

type SortField = 'market' | 'modalPrice' | 'date';
type SortOrder = 'asc' | 'desc';

export default function MarketTable({ markets }: MarketTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const sortedMarkets = [...markets].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'market') {
      comparison = a.market.localeCompare(b.market);
    } else if (sortField === 'modalPrice') {
      comparison = a.modalPrice - b.modalPrice;
    } else if (sortField === 'date') {
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      };
      comparison = parseDate(a.date).getTime() - parseDate(b.date).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedMarkets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMarkets = sortedMarkets.slice(startIndex, endIndex);

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-4 h-4 ml-1 inline ${
        sortField === field ? 'text-primary' : 'text-muted-foreground'
      }`}
    />
  );

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('market')}
                  className="flex items-center font-semibold hover:text-primary transition-colors"
                >
                  Market
                  <SortIcon field="market" />
                </button>
              </TableHead>
              <TableHead className="text-foreground">District</TableHead>
              <TableHead className="text-foreground">Variety</TableHead>
              <TableHead className="text-foreground">Grade</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('modalPrice')}
                  className="flex items-center justify-end w-full font-semibold hover:text-primary transition-colors"
                >
                  Modal Price
                  <SortIcon field="modalPrice" />
                </button>
              </TableHead>
              <TableHead className="text-right text-foreground">Min Price</TableHead>
              <TableHead className="text-right text-foreground">Max Price</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center justify-end w-full font-semibold hover:text-primary transition-colors"
                >
                  Date
                  <SortIcon field="date" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMarkets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No market data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedMarkets.map((market, index) => (
                <TableRow key={`${market.market}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{market.market}</TableCell>
                  <TableCell className="text-muted-foreground">{market.district}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                      {market.variety}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {market.grade}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {formatPrice(market.modalPrice)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {formatPrice(market.minPrice)}
                  </TableCell>
                  <TableCell className="text-right text-accent">
                    {formatPrice(market.maxPrice)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {market.date}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedMarkets.length)} of{' '}
            {sortedMarkets.length} markets
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
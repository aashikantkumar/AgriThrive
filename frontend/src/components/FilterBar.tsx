import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterBarProps {
  onSearch: (filters: {
    state: string;
    district: string;
    commodity: string;
  }) => void;
  isLoading?: boolean;
}

const STATES = [
  'Bihar',
  'Jharkhand',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
];

const COMMODITIES = [
  'Wheat',
  'Rice',
  'Paddy(Dhan)(Common)',
  'Maize',
  'Onion',
  'Potato',
  'Tomato',
  'Cotton',
  'Soyabean',
  'Mustard',
  'Groundnut',
  'Bajra',
];

export default function FilterBar({ onSearch, isLoading }: FilterBarProps) {
  const [state, setState] = useState('Bihar');
  const [district, setDistrict] = useState('');
  const [commodity, setCommodity] = useState('Wheat');

  const handleSearch = () => {
    if (!state || !commodity) {
      return;
    }
    onSearch({ state, district, commodity });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-foreground">State *</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="state" className="bg-background border-input">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Input */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-foreground">District (Optional)</Label>
          <Input
            id="district"
            placeholder="e.g., Patna, Ludhiana"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-background border-input"
          />
          <p className="text-xs text-muted-foreground">
            Format: District Name (e.g., Patna)
          </p>
        </div>

        {/* Commodity Selection */}
        <div className="space-y-2">
          <Label htmlFor="commodity" className="text-foreground">Commodity *</Label>
          <Select value={commodity} onValueChange={setCommodity}>
            <SelectTrigger id="commodity" className="bg-background border-input">
              <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
              {COMMODITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <Label className="invisible">Search</Label>
          <Button
            onClick={handleSearch}
            disabled={isLoading || !state || !commodity}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search Prices'}
          </Button>
        </div>
      </div>
    </div>
  );
}
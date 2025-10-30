import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, Search } from "lucide-react";
import { SchemeFilters } from "@/types/scheme";
import { useState } from "react";

interface FilterSidebarProps {
  filters: SchemeFilters;
  onFiltersChange: (filters: SchemeFilters) => void;
  onReset: () => void;
}

const FilterSidebar = ({ filters, onFiltersChange, onReset }: FilterSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Indian States
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Common crops
  const crops = [
    "wheat", "rice", "cotton", "maize", "pulses", 
    "sugarcane", "tea", "coffee", "jute", "tobacco",
    "oilseeds", "millets", "vegetables", "fruits"
  ];

  const handleStateChange = (state: string) => {
    onFiltersChange({
      ...filters,
      state: filters.state === state ? undefined : state
    });
  };

  const handleSchemeTypeChange = (type: 'central' | 'state' | '') => {
    onFiltersChange({
      ...filters,
      scheme_type: filters.scheme_type === type ? '' : type
    });
  };

  const handleCropChange = (crop: string) => {
    onFiltersChange({
      ...filters,
      crop: filters.crop === crop ? undefined : crop
    });
  };

  const filteredStates = states.filter(state => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrops = crops.filter(crop => 
    crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simple Radio Button Component
  const RadioButton = ({ checked, label, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors">
      <div className="relative flex items-center">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 cursor-pointer accent-primary"
        />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );

  // Simple Checkbox Component
  const Checkbox = ({ checked, label, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 cursor-pointer accent-primary rounded"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  const hasActiveFilters = filters.state || filters.scheme_type || filters.crop;

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                className="h-8 gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Scheme Type Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Scheme Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <RadioButton
            checked={filters.scheme_type === ''}
            label="All Schemes"
            onChange={() => handleSchemeTypeChange('')}
          />
          <RadioButton
            checked={filters.scheme_type === 'central'}
            label="🇮🇳 Central Schemes"
            onChange={() => handleSchemeTypeChange('central')}
          />
          <RadioButton
            checked={filters.scheme_type === 'state'}
            label="📍 State Schemes"
            onChange={() => handleSchemeTypeChange('state')}
          />
        </CardContent>
      </Card>

      {/* State Filter */}
      {filters.scheme_type !== 'central' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">State</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-60 overflow-y-auto space-y-1">
            <Checkbox
              checked={!filters.state}
              label="All States"
              onChange={() => onFiltersChange({ ...filters, state: undefined })}
            />
            {filteredStates.map((state) => (
              <Checkbox
                key={state}
                checked={filters.state === state}
                label={state}
                onChange={() => handleStateChange(state)}
              />
            ))}
            {filteredStates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No states found
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Crop Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Applicable Crops</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto space-y-1">
          <Checkbox
            checked={!filters.crop}
            label="All Crops"
            onChange={() => onFiltersChange({ ...filters, crop: undefined })}
          />
          {filteredCrops.map((crop) => (
            <Checkbox
              key={crop}
              checked={filters.crop === crop}
              label={crop.charAt(0).toUpperCase() + crop.slice(1)}
              onChange={() => handleCropChange(crop)}
            />
          ))}
          {filteredCrops.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No crops found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.scheme_type && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  {filters.scheme_type === 'central' ? 'Central' : 'State'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleSchemeTypeChange('')}
                  />
                </span>
              )}
              {filters.state && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  {filters.state}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleStateChange(filters.state!)}
                  />
                </span>
              )}
              {filters.crop && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  {filters.crop}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleCropChange(filters.crop!)}
                  />
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FilterSidebar;
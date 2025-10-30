import Navigation from "@/components/Navigation";
import SchemeCard from "@/components/schemes/SchemeCard";
import FilterSidebar from "@/components/schemes/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Loader2,
  AlertCircle,
  BookmarkCheck,
  Filter,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { schemeService } from "@/services/schemeService";
import { Scheme, SchemeFilters, EligibilityAnalysis, SavedScheme } from "@/types/scheme";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SchemeNavigator = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<SchemeFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  // AI Eligibility
  const [showEligibilityResults, setShowEligibilityResults] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<EligibilityAnalysis | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Fetch all schemes
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      console.log('Fetching schemes with filters:', filters);
      const data = await schemeService.getAllSchemes(filters);
      console.log('Received schemes data:', data);
      setSchemes(data.schemes);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch schemes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved schemes
// Fetch saved schemes
const fetchSavedSchemes = async () => {
  try {
    const data = await schemeService.getSavedSchemes();
    setSavedSchemes(data.savedSchemes || []);
    
    // Create a set of saved scheme IDs for quick lookup - FIX HERE
    const ids = new Set<string>(
      data.savedSchemes?.map((s: SavedScheme) => s.scheme_id) || []
    );
    setSavedSchemeIds(ids);
  } catch (error: any) {
    console.error('Error fetching saved schemes:', error);
  }
};
  // Check AI Eligibility
  const handleCheckEligibility = async () => {
    if (!profile) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile to check eligibility",
        variant: "destructive"
      });
      return;
    }

    try {
      setCheckingEligibility(true);
      const data = await schemeService.checkEligibility();
      setEligibilityData(data);
      setShowEligibilityResults(true);
      
      toast({
        title: "✅ Eligibility Check Complete",
        description: `Found ${data.analysis.eligible_schemes.length} eligible schemes for you!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check eligibility",
        variant: "destructive"
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Save scheme
  const handleSaveScheme = async (schemeId: string) => {
    try {
      await schemeService.saveScheme(schemeId);
      setSavedSchemeIds(prev => new Set([...prev, schemeId]));
      await fetchSavedSchemes();
      
      toast({
        title: "✅ Scheme Saved",
        description: "Scheme added to your saved list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save scheme",
        variant: "destructive"
      });
    }
  };

  // Unsave scheme
  const handleUnsaveScheme = async (schemeId: string) => {
    try {
      await schemeService.unsaveScheme(schemeId);
      setSavedSchemeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(schemeId);
        return newSet;
      });
      await fetchSavedSchemes();
      
      toast({
        title: "Scheme Removed",
        description: "Scheme removed from your saved list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unsave scheme",
        variant: "destructive"
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSchemes();
    fetchSavedSchemes();
  }, [filters]);

  // Filter schemes by search query
  const getFilteredSchemes = (schemesToFilter: Scheme[]) => {
    if (!searchQuery) return schemesToFilter;
    
    return schemesToFilter.filter(scheme =>
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.benefits.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get schemes to display based on tab and eligibility
  const getDisplaySchemes = () => {
    if (activeTab === 'saved') {
      return getFilteredSchemes(savedSchemes.map(s => s.schemes));
    }
    
    if (showEligibilityResults && eligibilityData) {
      // Show only eligible and partially eligible schemes
      const eligibleIds = [
        ...eligibilityData.analysis.eligible_schemes.map(s => s.scheme_id),
        ...eligibilityData.analysis.partially_eligible.map(s => s.scheme_id)
      ];
      
      return getFilteredSchemes(
        schemes.filter(scheme => eligibleIds.includes(scheme.id))
      );
    }
    
    return getFilteredSchemes(schemes);
  };

  const displaySchemes = getDisplaySchemes();

  // Get match score for eligible schemes
  const getMatchScore = (schemeId: string): number | undefined => {
    if (!eligibilityData) return undefined;
    
    const eligible = eligibilityData.analysis.eligible_schemes.find(s => s.scheme_id === schemeId);
    if (eligible) return eligible.match_score;
    
    const partial = eligibilityData.analysis.partially_eligible.find(s => s.scheme_id === schemeId);
    if (partial) return partial.match_score;
    
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Government Scheme Navigator</h1>
              <p className="text-muted-foreground">
                Discover schemes tailored to your agricultural needs
              </p>
            </div>
            <Button 
              onClick={handleCheckEligibility}
              disabled={checkingEligibility}
              className="gap-2"
              size="lg"
            >
              {checkingEligibility ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI Eligibility Check
                </>
              )}
            </Button>
          </div>

          {/* AI Results Banner */}
          {showEligibilityResults && eligibilityData && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">AI Eligibility Results</p>
                      <p className="text-sm text-muted-foreground">
                        {eligibilityData.analysis.eligible_schemes.length} fully eligible • 
                        {' '}{eligibilityData.analysis.partially_eligible.length} partially eligible
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowEligibilityResults(false)}
                  >
                    <X className="w-4 h-4" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Schemes ({schemes.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Saved Schemes ({savedSchemes.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search schemes by title, description, or benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 lg:hidden"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Only show in "All Schemes" tab */}
          {activeTab === 'all' && (
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters({})}
              />
            </div>
          )}

          {/* Schemes Grid */}
          <div className={activeTab === 'all' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : displaySchemes.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Schemes Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'saved' 
                      ? "You haven't saved any schemes yet. Browse all schemes and save the ones you're interested in!"
                      : searchQuery
                      ? "Try adjusting your search or filters"
                      : "No schemes match your current filters"}
                  </p>
                  {activeTab === 'saved' && (
                    <Button onClick={() => setActiveTab('all')}>
                      Browse All Schemes
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displaySchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    isSaved={savedSchemeIds.has(scheme.id)}
                    onSave={handleSaveScheme}
                    onUnsave={handleUnsaveScheme}
                    matchScore={getMatchScore(scheme.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeNavigator; 
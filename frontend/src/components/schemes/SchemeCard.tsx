import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Users, 
  Wheat,
  TrendingUp,
  X
} from "lucide-react";
import { Scheme } from "@/types/scheme";
import { useState } from "react";

interface SchemeCardProps {
  scheme: Scheme;
  isSaved?: boolean;
  onSave?: (schemeId: string) => void;
  onUnsave?: (schemeId: string) => void;
  matchScore?: number;
}

const SchemeCard = ({ scheme, isSaved = false, onSave, onUnsave, matchScore }: SchemeCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await onUnsave?.(scheme.id);
        setSaved(false);
      } else {
        await onSave?.(scheme.id);
        setSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSchemeTypeColor = (type: string) => {
    return type === 'central' ? 'bg-blue-500' : 'bg-green-500';
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return '';
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Simple Badge Component
  const Badge = ({ children, className = '', variant = 'default' }: any) => {
    const baseClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
    const variants = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input bg-background"
    };
    return (
      <div className={`${baseClass} ${variants[variant] || variants.default} ${className}`}>
        {children}
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`${getSchemeTypeColor(scheme.scheme_type)} text-white`}>
                  {scheme.scheme_type === 'central' ? '🇮🇳 Central' : '📍 State'}
                </Badge>
                
                {scheme.state && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {scheme.state}
                  </Badge>
                )}

                {matchScore !== undefined && (
                  <Badge className={`${getMatchScoreColor(matchScore)} text-white`}>
                    {matchScore}% Match
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-xl line-clamp-2">{scheme.title}</CardTitle>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveToggle}
              disabled={loading}
              className="shrink-0"
            >
              {saved ? (
                <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <CardDescription className="line-clamp-2 mt-2">
            {scheme.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-3">
            {/* Applicable User Types */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">For:</span>
              <div className="flex gap-1 flex-wrap">
                {scheme.applicable_user_types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type === 'farmer' ? '👨‍🌾 Farmer' : '🚀 Startup'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Applicable Crops */}
            {scheme.applicable_crops && scheme.applicable_crops.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Wheat className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Crops:</span>
                <div className="flex gap-1 flex-wrap">
                  {scheme.applicable_crops.slice(0, 3).map((crop) => (
                    <Badge key={crop} variant="outline" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                  {scheme.applicable_crops.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{scheme.applicable_crops.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Benefits Preview */}
            <div className="flex items-start gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Benefits:</span>
                <p className="text-sm line-clamp-2 mt-1">{scheme.benefits}</p>
              </div>
            </div>

            {/* Deadline */}
            {scheme.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">{formatDeadline(scheme.deadline)}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>

          {scheme.application_link && (
            <Button 
              className="flex-1 gap-2" 
              onClick={() => window.open(scheme.application_link!, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Apply
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Simple Modal for Details */}
      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{scheme.title}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`${getSchemeTypeColor(scheme.scheme_type)} text-white`}>
                      {scheme.scheme_type === 'central' ? 'Central Scheme' : 'State Scheme'}
                    </Badge>
                    {scheme.state && <Badge variant="outline">{scheme.state}</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">{scheme.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Benefits</h3>
                  <p className="text-muted-foreground">{scheme.benefits}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Eligibility Details</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{scheme.eligibility_details}</p>
                </div>

                {scheme.how_to_apply && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">How to Apply</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{scheme.how_to_apply}</p>
                  </div>
                )}

                {scheme.deadline && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Application Deadline</h3>
                    <p className="text-muted-foreground">{formatDeadline(scheme.deadline)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {scheme.application_link && (
              <div className="p-6 border-t">
                <Button 
                  className="w-full gap-2" 
                  onClick={() => window.open(scheme.application_link!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply Now
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SchemeCard;
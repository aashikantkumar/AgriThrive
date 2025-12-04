import { useState } from 'react';
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionState } from "@/hooks/usePersistedState";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Loader2,
  Bug,
  Lightbulb,
  MessageCircle,
  AlertTriangle,
  Heart
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
  { id: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'general', label: 'General Feedback', icon: MessageCircle, color: 'text-blue-500' },
  { id: 'complaint', label: 'Complaint', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'appreciation', label: 'Appreciation', icon: Heart, color: 'text-pink-500' },
];

const Feedback = () => {
  // Use sessionStorage for form draft - clears when tab closes
  const [rating, setRating] = useSessionState('agrithrive-feedback-rating', 0);
  const [category, setCategory] = useSessionState('agrithrive-feedback-category', 'general');
  const [comments, setComments] = useSessionState('agrithrive-feedback-comments', '');

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleSubmit = async () => {
    if (!comments.trim()) {
      toast({
        variant: "destructive",
        title: "Comments Required",
        description: "Please provide your feedback comments.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          rating: rating || null,
          comments: comments.trim(),
          category
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve AgriThrive.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setCategory('general');
    setComments('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your feedback has been submitted successfully. We appreciate you taking the time to help us improve AgriThrive.
                </p>
                <Button onClick={resetForm}>
                  Submit Another Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-lg">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Share Your Feedback</h1>
              <p className="text-muted-foreground">Help us improve AgriThrive with your valuable insights</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>We'd Love to Hear From You</CardTitle>
              <CardDescription>
                Your feedback helps us build better tools for farmers and agro-entrepreneurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">How would you rate your experience?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                          }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && "We're sorry to hear that. Please tell us how we can improve."}
                    {rating === 2 && "Thanks for your feedback. We'd like to do better."}
                    {rating === 3 && "Thank you! We appreciate your honest feedback."}
                    {rating === 4 && "Great! We're glad you had a good experience."}
                    {rating === 5 && "Excellent! We're thrilled you love AgriThrive!"}
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Feedback Category</Label>
                <RadioGroup value={category} onValueChange={setCategory}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className="flex items-center">
                          <RadioGroupItem value={cat.id} id={cat.id} className="peer sr-only" />
                          <Label
                            htmlFor={cat.id}
                            className="flex items-center gap-3 w-full p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            <Icon className={`w-5 h-5 ${cat.color}`} />
                            <span className="font-medium">{cat.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <Label htmlFor="comments" className="text-base font-semibold">
                  Your Feedback <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Please share your thoughts, suggestions, or concerns..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {comments.length} characters • Minimum 10 characters recommended
                </p>
              </div>

              {/* Privacy Notice */}
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {session
                    ? "Your feedback will be associated with your account. We may reach out to you for follow-up."
                    : "You're submitting anonymous feedback. Consider logging in if you'd like us to follow up with you."}
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !comments.trim()}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  size="lg"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">How We Use Your Feedback</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Identify and fix bugs to improve platform stability</li>
              <li>• Prioritize new features based on user requests</li>
              <li>• Understand user needs and pain points</li>
              <li>• Enhance overall user experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  BookOpen,
  Scale,
  TrendingUp,
  Camera,
  Library,
  MessageCircle,
  MessageSquare,
  Sprout,
  ArrowRight,
  Loader2,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  // Redirect logic
  useEffect(() => {
    if (!loading && user && profile) {
      // User is logged in AND has complete profile - redirect to Home
      navigate("/");
    }
  }, [user, profile, loading, navigate]);

  const features = [
    { icon: User, title: "User Profile", description: "Manage your personal information", link: "/profile", gradient: "from-primary/20 to-primary/5" },
    { icon: BookOpen, title: "Government Scheme Navigator", description: "Find relevant schemes", link: "/schemes", gradient: "from-accent/20 to-accent/5" },
    { icon: Scale, title: "Legal Toolkit", description: "Access legal resources", link: "/legal", gradient: "from-primary/20 to-primary/5" },
    { icon: TrendingUp, title: "Market Price Submission", description: "Submit and track prices", link: "/market-price", gradient: "from-accent/20 to-accent/5" },
    { icon: Camera, title: "Instant Crop Disease Diagnosis", description: "AI-powered diagnosis", link: "/crop-diagnosis", gradient: "from-primary/20 to-primary/5" },
    { icon: Library, title: "Knowledge Base", description: "Learn best practices", link: "/knowledge-base", gradient: "from-accent/20 to-accent/5" },
    { icon: MessageCircle, title: "Chatbot", description: "24/7 AI assistance", link: "/chatbot", gradient: "from-primary/20 to-primary/5" },
    { icon: MessageSquare, title: "Feedback System", description: "Share your experience", link: "/feedback", gradient: "from-accent/20 to-accent/5" },
  ];

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in with profile, this page won't show (redirected above)
  // This is the landing page for non-logged-in users

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Sprout className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            🌾 Transforming Agriculture with<br />
            <span className="text-primary">Knowledge, Technology & Opportunity</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            AgriThrive bridges the gap between farmers, agri-startups, and government initiatives — 
            helping rural communities access the right resources, schemes, and sustainable practices to thrive.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              // User logged in but no profile - show complete profile button
              !profile ? (
                <Link to="/profile">
                  <Button size="lg" className="text-lg">
                    Complete Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : null // If profile exists, they'll be redirected anyway
            ) : (
              // Not logged in - show register and login
              <>
                <Link to="/register">
                  <Button size="lg" className="text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to succeed in modern agriculture
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index} className="group">
                <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardContent className="pt-6 relative z-10">
                    <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-6">🌱 About AgriThrive</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-center text-lg leading-relaxed mb-6">
              At AgriThrive, we believe that agriculture is more than a livelihood — it's a legacy. 
              Our mission is to empower every farmer and agri-entrepreneur with access to:
            </p>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">Smart Schemes</h3>
                  <p className="text-sm text-muted-foreground">
                    Government schemes tailored to your profile
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">Modern Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Agri-tech insights and financial literacy
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Better productivity and income guidance
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-lg leading-relaxed">
              Whether you are a small farmer or a rural innovator, AgriThrive helps you 
              make informed decisions and unlock new opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-12">💬 What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "AgriThrive helped me find the right subsidy for my dairy farm — I got approved in just two weeks!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Ravi Sharma</p>
                    <p className="text-sm text-muted-foreground">Dairy Farmer, Uttar Pradesh</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "As a startup founder, I discovered new government programs I never knew existed. The platform is a game-changer."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Neha Singh</p>
                    <p className="text-sm text-muted-foreground">AgriTech Innovator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">🌻 Ready to Transform Your Farming Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the movement toward sustainable and informed farming. Start your journey with AgriThrive today.
          </p>
          {user ? (
            !profile ? (
              <Link to="/profile">
                <Button size="lg" className="text-lg">
                  Complete Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : null
          ) : (
            <Link to="/register">
              <Button size="lg" className="text-lg">
                Join AgriThrive Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 AgriThrive. Empowering Growth, One Farmer at a Time. 🌿</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
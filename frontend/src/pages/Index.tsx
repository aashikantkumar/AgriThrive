import { ThreeBackground } from "@/components/ThreeBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  Scale,
  TrendingUp,
  Leaf,
  BookOpen,
  MessageSquare,
  LogIn,
} from "lucide-react";

const features = [
  {
    title: "User Profile",
    description: "Manage your profile, saved schemes, and articles",
    icon: User,
    color: "bg-blue-500",
    path: "/profile",
  },
  {
    title: "Government Schemes",
    description: "Browse and save relevant agricultural schemes",
    icon: FileText,
    color: "bg-green-500",
    path: "/schemes",
  },
  {
    title: "Legal Toolkit",
    description: "Upload and manage legal documents",
    icon: Scale,
    color: "bg-purple-500",
    path: "/legal",
  },
  {
    title: "Market Prices",
    description: "Submit and view crop market prices",
    icon: TrendingUp,
    color: "bg-orange-500",
    path: "/market",
  },
  {
    title: "Crop Disease Diagnosis",
    description: "AI-powered disease detection and treatment",
    icon: Leaf,
    color: "bg-red-500",
    path: "/diagnosis",
  },
  {
    title: "Knowledge Base",
    description: "Read and save agricultural articles",
    icon: BookOpen,
    color: "bg-yellow-500",
    path: "/articles",
  },
  {
    title: "Chatbot Assistant",
    description: "Get instant answers in multiple languages",
    icon: MessageSquare,
    color: "bg-cyan-500",
    path: "/chatbot",
  },
  {
    title: "Feedback",
    description: "Share your experience and suggestions",
    icon: MessageSquare,
    color: "bg-pink-500",
    path: "/feedback",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <ThreeBackground />
      <ThemeToggle />
      
      {/* Header with Login */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <Button 
          variant="outline" 
          onClick={() => navigate('/auth')}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </header>
      
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AgriThrive
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-foreground">
              The Digital Edge for Agro-Startups and Farmers
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Your all-in-one web platform, specifically created to empower nascent agro-startups 
              and farmers by providing critical information, innovative tools, and robust resources. 
              We leverage technology, including AI, to streamline access to essential agricultural 
              knowledge and support.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-4 py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Unlock Your Agricultural Potential
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of features designed to support every 
              step of your agricultural journey—from legal compliance and funding to crop health 
              and market strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Our Key Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Access all these powerful tools directly from your dashboard
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.path}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">AI-Powered</div>
              <p className="text-muted-foreground">
                Intelligent tools for disease detection, scheme discovery, and document analysis
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">Multilingual</div>
              <p className="text-muted-foreground">
                Access information and support in your preferred language
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">All-in-One</div>
              <p className="text-muted-foreground">
                Everything you need for sustainable agricultural growth in one platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>© 2025 AgriThrive. Empowering agriculture through technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

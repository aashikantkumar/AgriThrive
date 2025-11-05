import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Sprout, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        // Store the email for display
        setRegisteredEmail(formData.email);
        
        // Show success alert with email verification info
        setShowVerificationAlert(true);
        
        toast({
          title: "Account Created! 🎉",
          description: "Check your email inbox to verify your account.",
          variant: "success",
          duration: 8000,
        });
        
        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sprout className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Join AgriThrive</CardTitle>
            <CardDescription>
              Create your account to start your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showVerificationAlert && (
              <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">
                  Verify Your Email Address
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200 mt-2">
                  <div className="space-y-2">
                    <p className="font-medium">
                      We've sent a verification link to <strong>{registeredEmail}</strong>
                    </p>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Click the link in your email to activate your account</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Check your spam folder if you don't see it</span>
                    </div>
                    <Button 
                      onClick={() => navigate("/login")} 
                      className="mt-3 w-full bg-green-600 hover:bg-green-700"
                    >
                      Go to Login
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || showVerificationAlert}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || showVerificationAlert}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || showVerificationAlert}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || showVerificationAlert}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || showVerificationAlert}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
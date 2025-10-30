import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { User, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

// Indian States
const INDIAN_STATES = [
"Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
"Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
"Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
"Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
"Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Farm Sizes
const FARM_SIZES = [
"Small (< 2 hectares)",
"Medium (2-10 hectares)",
"Large (> 10 hectares)"
];

// Annual Income Ranges
const INCOME_RANGES = [
"Below 1 Lakh",
"1-3 Lakhs",
"3-5 Lakhs",
"5-10 Lakhs",
"Above 10 Lakhs"
];

// Common Indian Crops
const CROPS_LIST = [
"Wheat", "Rice", "Cotton", "Maize", "Pulses", "Sugarcane", "Jowar",
"Bajra", "Barley", "Groundnut", "Soybean", "Sunflower", "Mustard",
"Potato", "Onion", "Tomato", "Tea", "Coffee", "Rubber", "Coconut",
"Cashew", "Spices", "Fruits", "Vegetables"
];

const UserProfile = () => {
const { toast } = useToast();
const navigate = useNavigate();
const { user, session, profile, loading: authLoading, refreshProfile } = useAuth();

// Form state
const [formData, setFormData] = useState({
user_type: "farmer",
full_name: "",
phone: "",
state: "",
district: "",
crops: [] as string[],
farm_size: "",
annual_income: ""
});

const [saving, setSaving] = useState(false);

// Load profile data when component mounts or profile changes
useEffect(() => {
if (!authLoading && !user) {
// User not logged in, redirect to login
navigate("/login");
return;
}



if (profile) {
  // Populate form with existing profile data
  setFormData({
    user_type: profile.user_type || "farmer",
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    state: profile.state || "",
    district: profile.district || "",
    crops: profile.crops || [],
    farm_size: profile.farm_size || "",
    annual_income: profile.annual_income || ""
  });
}
}, [profile, authLoading, user, navigate]);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();



// Validation
if (!formData.full_name || !formData.state || !formData.district || 
    formData.crops.length === 0 || !formData.farm_size || !formData.annual_income) {
  toast({
    title: "Validation Error",
    description: "Please fill in all required fields",
    variant: "destructive"
  });
  return;
}

try {
  setSaving(true);
  
  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch("http://localhost:5000/api/profile", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  const data = await response.json();
  
  // Refresh profile in AuthContext
  await refreshProfile();
  
  toast({
    title: "Success!",
    description: data.message || "Profile updated successfully",
  });
  
  navigate("/");
  
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message || "Failed to update profile",
    variant: "destructive"
  });
} finally {
  setSaving(false);
}
};

const handleInputChange = (field: string, value: any) => {
setFormData(prev => ({ ...prev, [field]: value }));
};

const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const value = e.target.value;
// Capitalize first letter
const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
handleInputChange("district", capitalized);
};

const toggleCrop = (crop: string) => {
setFormData(prev => ({
...prev,
crops: prev.crops.includes(crop)
? prev.crops.filter(c => c !== crop)
: [...prev.crops, crop]
}));
};

const removeCrop = (crop: string) => {
setFormData(prev => ({
...prev,
crops: prev.crops.filter(c => c !== crop)
}));
};

if (authLoading) {
return (
<div className="min-h-screen bg-background">
<Navigation />
<div className="flex items-center justify-center h-[80vh]">
<Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>
</div>
);
}

return (
<div className="min-h-screen bg-background">
<Navigation />
<div className="container mx-auto px-4 pt-24 pb-12">
<div className="max-w-4xl mx-auto">
{/* Header */}
<div className="flex items-center gap-4 mb-8">
<div className="p-4 bg-primary/10 rounded-lg">
<User className="w-8 h-8 text-primary" />
</div>
<div>
<h1 className="text-4xl font-bold">User Profile</h1>
<p className="text-muted-foreground">Manage your personal information</p>
</div>
</div>



      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={user?.email || ""} 
                disabled 
                className="bg-muted"
              />
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <Label>User Type *</Label>
              <Select 
                value={formData.user_type}
                onValueChange={(value) => handleInputChange("user_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="agro_startup">Agro Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                maxLength={10}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label>State *</Label>
              <Select 
                value={formData.state}
                onValueChange={(value) => handleInputChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label>District *</Label>
              <Input
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Enter district name"
                required
              />
            </div>

            {/* Crops Multi-Select */}
            <div className="space-y-2">
              <Label>Crops *</Label>
              <div className="space-y-2">
                <Select 
                  onValueChange={(value) => {
                    if (!formData.crops.includes(value)) {
                      toggleCrop(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crops" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROPS_LIST.map(crop => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Selected Crops */}
                {formData.crops.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                    {formData.crops.map(crop => (
                      <Badge key={crop} variant="secondary" className="gap-1">
                        {crop}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeCrop(crop)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Farm Size */}
            <div className="space-y-2">
              <Label>Farm Size *</Label>
              <Select 
                value={formData.farm_size}
                onValueChange={(value) => handleInputChange("farm_size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select farm size" />
                </SelectTrigger>
                <SelectContent>
                  {FARM_SIZES.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Annual Income */}
            <div className="space-y-2">
              <Label>Annual Income *</Label>
              <Select 
                value={formData.annual_income}
                onValueChange={(value) => handleInputChange("annual_income", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select annual income" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_RANGES.map(income => (
                    <SelectItem key={income} value={income}>
                      {income}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  </div>
</div>
);
};
export default UserProfile;



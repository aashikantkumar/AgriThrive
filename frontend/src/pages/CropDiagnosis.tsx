import { useState, useCallback } from 'react';
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Leaf,
  Bug,
  Droplet,
  Shield,
  AlertCircle,
  FileImage,
  Activity
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CropDiagnosis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      });
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch(`${API_URL}/api/diagnosis/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      
      toast({
        title: "Analysis Complete",
        description: "Your crop has been analyzed successfully!",
      });
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      none: 'bg-green-500',
      mild: 'bg-yellow-500',
      moderate: 'bg-orange-500',
      severe: 'bg-red-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getConfidenceBadge = (confidence) => {
    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[confidence] || 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Instant Crop Disease Diagnosis</h1>
              <p className="text-muted-foreground">AI-powered disease detection with treatment recommendations</p>
            </div>
          </div>

          {!result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Crop Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!preview ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Drag and drop your crop image here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse (Max 5MB, JPEG/PNG)
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={preview}
                        alt="Selected crop"
                        className="w-full max-h-96 object-contain bg-muted"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={resetAnalysis}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="flex-1"
                        size="lg"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 mr-2" />
                            Analyze Crop
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetAnalysis}
                        disabled={analyzing}
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <img
                      src={preview}
                      alt="Analyzed crop"
                      className="w-full md:w-48 h-48 object-cover rounded-lg border"
                    />
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            {result.analysis.crop_identified}
                          </h2>
                          <p className="text-muted-foreground">
                            {result.image_info.filename} • {(result.image_info.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button onClick={resetAnalysis} variant="outline">
                          <Camera className="w-4 h-4 mr-2" />
                          New Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.analysis.is_plant_image ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="flex items-center gap-2">
                          {result.analysis.diagnosis.disease_detected ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          Diagnosis Results
                        </span>
                        <Badge variant={getConfidenceBadge(result.analysis.diagnosis.confidence)}>
                          {result.analysis.diagnosis.confidence} confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {result.analysis.diagnosis.disease_name}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Severity</span>
                            <span className="font-medium capitalize">{result.analysis.diagnosis.severity}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getSeverityColor(result.analysis.diagnosis.severity)}`}
                              style={{
                                width: result.analysis.diagnosis.severity === 'severe' ? '100%' :
                                       result.analysis.diagnosis.severity === 'moderate' ? '66%' :
                                       result.analysis.diagnosis.severity === 'mild' ? '33%' : '0%'
                              }}
                            />
                          </div>
                        </div>

                        {result.analysis.diagnosis.affected_parts?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {result.analysis.diagnosis.affected_parts.map((part, idx) => (
                              <Badge key={idx} variant="secondary">
                                <Leaf className="w-3 h-3 mr-1" />
                                {part}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bug className="w-5 h-5" />
                          Symptoms Observed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.analysis.symptoms_observed?.map((symptom, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                              <span className="text-sm">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Possible Causes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.analysis.possible_causes?.map((cause, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                              <span className="text-sm">{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplet className="w-5 h-5" />
                        Treatment Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="immediate" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                          <TabsTrigger value="immediate">Immediate</TabsTrigger>
                          <TabsTrigger value="chemical">Chemical</TabsTrigger>
                          <TabsTrigger value="organic">Organic</TabsTrigger>
                          <TabsTrigger value="preventive">Preventive</TabsTrigger>
                        </TabsList>

                        <TabsContent value="immediate" className="space-y-3 mt-4">
                          {result.analysis.treatment_recommendations.immediate_actions?.map((action, idx) => (
                            <Alert key={idx}>
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>{action}</AlertDescription>
                            </Alert>
                          ))}
                        </TabsContent>

                        <TabsContent value="chemical" className="mt-4">
                          <div className="space-y-4">
                            {result.analysis.treatment_recommendations.chemical_treatments?.map((treatment, idx) => (
                              <Card key={idx}>
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-2">{treatment.name}</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Application:</span> {treatment.application}</p>
                                    <p><span className="font-medium">Dosage:</span> {treatment.dosage}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="organic" className="mt-4">
                          <div className="space-y-4">
                            {result.analysis.treatment_recommendations.organic_treatments?.map((treatment, idx) => (
                              <Card key={idx}>
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-2">{treatment.name}</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Preparation:</span> {treatment.preparation}</p>
                                    <p><span className="font-medium">Application:</span> {treatment.application}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="preventive" className="space-y-2 mt-4">
                          {result.analysis.treatment_recommendations.preventive_measures?.map((measure, idx) => (
                            <Alert key={idx}>
                              <Shield className="h-4 w-4" />
                              <AlertDescription>{measure}</AlertDescription>
                            </Alert>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {result.analysis.additional_notes && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {result.analysis.additional_notes}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The uploaded image does not appear to be a plant or crop. Please upload a valid crop image for analysis.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDiagnosis;
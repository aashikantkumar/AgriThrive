import { useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  Scale,
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { legalService, ParsedDocument, LegalTemplate } from "@/services/legalService";

const LegalToolkit = () => {
  const [activeTab, setActiveTab] = useState("parser");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  // Persist parsed result and templates to localStorage
  const [parsedResult, setParsedResult] = usePersistedState<ParsedDocument | null>('agrithrive-legal-parsed', null);
  const [templates, setTemplates] = usePersistedState<LegalTemplate[]>('agrithrive-legal-templates', []);
  const hasFetchedTemplatesRef = useRef(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const { toast } = useToast();

  // Load templates when switching to templates tab (only if not already fetched)
  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    // Only fetch if templates are empty AND we haven't fetched before
    if (value === "templates" && templates.length === 0 && !hasFetchedTemplatesRef.current) {
      hasFetchedTemplatesRef.current = true;
      await fetchTemplates();
    }
  };

  // Fetch legal templates
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await legalService.getTemplates();
      setTemplates(data.templates);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setParsedResult(null);
  };

  // Parse document
  const handleParseDocument = async () => {
    if (!selectedFile) return;

    setParsing(true);
    try {
      const result = await legalService.parseDocument(selectedFile);
      setParsedResult(result);
      toast({
        title: "Document Analyzed Successfully! 🎉",
        description: "Your legal document has been parsed and analyzed.",
      });
    } catch (error: any) {
      toast({
        title: "Parsing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  // Download template
  const handleDownloadTemplate = (template: LegalTemplate) => {
    window.open(template.download_url, '_blank');
    toast({
      title: "Download Started",
      description: `Downloading ${template.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Legal Toolkit</h1>
              <p className="text-muted-foreground">
                Parse legal documents with AI and access legal templates
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="parser" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Document Parser
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Templates Library
              </TabsTrigger>
            </TabsList>

            {/* Parser Tab */}
            <TabsContent value="parser" className="mt-6">
              <div className="grid gap-6">
                {/* Upload Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Legal Document</CardTitle>
                    <CardDescription>
                      Upload a PDF document to get AI-powered legal analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                        disabled={parsing}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : "Click to upload PDF (Max 10MB)"}
                        </span>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(selectedFile.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button
                          onClick={handleParseDocument}
                          disabled={parsing}
                          size="sm"
                        >
                          {parsing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            "Analyze Document"
                          )}
                        </Button>
                      </div>
                    )}

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Our AI will extract parties, dates, obligations, risks, and provide a plain language summary.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Analysis Result */}
                {parsedResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Analysis</CardTitle>
                      <CardDescription>
                        {parsedResult.filename} • {parsedResult.pages} pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Plain Summary */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Summary
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {parsedResult.analysis.plain_summary}
                        </p>
                      </div>

                      {/* Contract Type & Parties */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2">Contract Type</h4>
                          <p className="text-sm capitalize">{parsedResult.analysis.contract_type}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2">Parties Involved</h4>
                          {parsedResult.analysis.parties_and_dates.parties.map((party, idx) => (
                            <p key={idx} className="text-sm">{party}</p>
                          ))}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Start Date</h4>
                          <p className="text-sm">{parsedResult.analysis.parties_and_dates.start_date || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">End Date</h4>
                          <p className="text-sm">{parsedResult.analysis.parties_and_dates.end_date || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Signing Date</h4>
                          <p className="text-sm">{parsedResult.analysis.parties_and_dates.signing_date || "N/A"}</p>
                        </div>
                      </div>

                      {/* Key Clauses */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Key Clauses
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(parsedResult.analysis.key_clauses).map(([key, value]) => (
                            value && (
                              <div key={key} className="p-3 bg-muted rounded-lg">
                                <h4 className="font-semibold text-sm mb-1 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-sm text-muted-foreground">{value}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Obligations */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-3">
                            {parsedResult.analysis.parties_and_dates.parties[0]}'s Obligations
                          </h3>
                          <ul className="space-y-2">
                            {parsedResult.analysis.obligations.party1_obligations.map((ob, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{ob}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-3">
                            {parsedResult.analysis.parties_and_dates.parties[1]}'s Obligations
                          </h3>
                          <ul className="space-y-2">
                            {parsedResult.analysis.obligations.party2_obligations.map((ob, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{ob}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Risks & Missing Terms */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Identified Risks
                          </h3>
                          <ul className="space-y-2">
                            {parsedResult.analysis.risks_and_missing_terms.identified_risks.map((risk, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <XCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Missing Clauses
                          </h3>
                          <ul className="space-y-2">
                            {parsedResult.analysis.risks_and_missing_terms.missing_important_clauses.map((clause, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span>{clause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Templates</CardTitle>
                  <CardDescription>
                    Download pre-made legal document templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : templates.length > 0 ? (
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <h4 className="font-semibold">Land Lease Agreement</h4>
                              <p className="text-xs text-muted-foreground">
                                {(template.size / 1024).toFixed(2)} KB • PDF
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownloadTemplate(template)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No templates available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LegalToolkit;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Calculator, Shield, AlertTriangle, CheckCircle, Zap, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskFactor {
  id: string;
  name: string;
  inputValue: string;
  riskScore: number;
  weight: number;
  weightedScore: number;
  options?: { value: string; score: number }[];
}

interface ClientInfo {
  name: string;
  assessmentDate: string;
}

const defaultRiskFactors: RiskFactor[] = [
  {
    id: 'facility_amount',
    name: 'Facility Amount',
    inputValue: '',
    riskScore: 1,
    weight: 0.08,
    weightedScore: 0,
    options: [
      { value: 'Under $500K', score: 1 },
      { value: '$500K - $2M', score: 2 },
      { value: '$2M - $10M', score: 3 },
      { value: 'Over $10M', score: 4 }
    ]
  },
  {
    id: 'business_relationship',
    name: 'Nature of Business Relationship',
    inputValue: '',
    riskScore: 1,
    weight: 0.03,
    weightedScore: 0,
    options: [
      { value: 'Long-standing (>5 years)', score: 1 },
      { value: 'Established (2-5 years)', score: 2 },
      { value: 'New (<2 years)', score: 3 },
      { value: 'First-time client', score: 4 }
    ]
  },
  {
    id: 'operating_history',
    name: 'Company Operating History',
    inputValue: '',
    riskScore: 1,
    weight: 0.03,
    weightedScore: 0,
    options: [
      { value: '>5 years', score: 1 },
      { value: '3-5 years', score: 2 },
      { value: '1-3 years', score: 3 },
      { value: '<1 year', score: 4 }
    ]
  },
  {
    id: 'legal_entity',
    name: 'Legal Entity Type',
    inputValue: '',
    riskScore: 2,
    weight: 0.05,
    weightedScore: 0,
    options: [
      { value: 'Public Company', score: 1 },
      { value: 'Private Company', score: 2 },
      { value: 'Partnership', score: 3 },
      { value: 'Trust/Foundation', score: 4 }
    ]
  },
  {
    id: 'industry_sector',
    name: 'Industry / Sector Risk',
    inputValue: '',
    riskScore: 1,
    weight: 0.05,
    weightedScore: 0,
    options: [
      { value: 'Low Risk (Tech, Manufacturing)', score: 1 },
      { value: 'Medium Risk (Construction, Trading)', score: 2 },
      { value: 'High Risk (Gaming, Crypto)', score: 3 },
      { value: 'Very High Risk (MSB, Cash Intensive)', score: 4 }
    ]
  },
  {
    id: 'travel_destination',
    name: 'Travel Destination Risk',
    inputValue: '',
    riskScore: 2,
    weight: 0.08,
    weightedScore: 0,
    options: [
      { value: 'Low risk regions only', score: 1 },
      { value: 'Mixed travel including moderate-risk regions', score: 2 },
      { value: 'Frequent high-risk region travel', score: 3 },
      { value: 'Sanctioned/High-risk countries', score: 4 }
    ]
  },
  {
    id: 'sanctions_check',
    name: 'Sanctions & Whitelist Checks',
    inputValue: '',
    riskScore: 1,
    weight: 0.25,
    weightedScore: 0,
    options: [
      { value: 'No Hits', score: 1 },
      { value: 'Minor/Historical Hits', score: 2 },
      { value: 'Moderate Concerns', score: 3 },
      { value: 'Active Sanctions/Serious Hits', score: 4 }
    ]
  },
  {
    id: 'pep_check',
    name: 'Politically Exposed Persons (PEPs) & Related Parties',
    inputValue: '',
    riskScore: 1,
    weight: 0.25,
    weightedScore: 0,
    options: [
      { value: 'No PEP involvement', score: 1 },
      { value: 'Former PEP (>2 years)', score: 2 },
      { value: 'Current PEP or close associate', score: 3 },
      { value: 'High-risk PEP', score: 4 }
    ]
  },
  {
    id: 'media_check',
    name: 'Negative Media & Reputation Check',
    inputValue: '',
    riskScore: 1,
    weight: 0.10,
    weightedScore: 0,
    options: [
      { value: 'Clean media profile', score: 1 },
      { value: 'Minor negative coverage', score: 2 },
      { value: 'Significant negative coverage', score: 3 },
      { value: 'Serious criminal/regulatory issues', score: 4 }
    ]
  },
  {
    id: 'ubo_transparency',
    name: 'UBO Transparency',
    inputValue: '',
    riskScore: 1,
    weight: 0.10,
    weightedScore: 0,
    options: [
      { value: 'UBOs fully disclosed and verified', score: 1 },
      { value: 'UBOs disclosed with minor gaps', score: 2 },
      { value: 'UBOs partially disclosed', score: 3 },
      { value: 'UBOs unclear or undisclosed', score: 4 }
    ]
  },
  {
    id: 'ownership_structure',
    name: 'Ownership Structure Complexity',
    inputValue: '',
    riskScore: 1,
    weight: 0.05,
    weightedScore: 0,
    options: [
      { value: 'Simple direct ownership', score: 1 },
      { value: 'Moderate complexity', score: 2 },
      { value: 'Complex multi-layered structure', score: 3 },
      { value: 'Highly complex/offshore structures', score: 4 }
    ]
  }
];

export default function Index() {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    assessmentDate: new Date().toISOString().split('T')[0]
  });
  
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(defaultRiskFactors);
  const [editingFactor, setEditingFactor] = useState<RiskFactor | null>(null);
  const [isAddingFactor, setIsAddingFactor] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [newFactor, setNewFactor] = useState<Partial<RiskFactor>>({
    name: '',
    weight: 0.05,
    options: [{ value: '', score: 1 }]
  });
  
  const { toast } = useToast();

  // Calculate weighted scores and total
  useEffect(() => {
    const updatedFactors = riskFactors.map(factor => ({
      ...factor,
      weightedScore: factor.riskScore * factor.weight
    }));
    setRiskFactors(updatedFactors);
  }, []);

  const totalWeightedScore = riskFactors.reduce((sum, factor) => sum + factor.weightedScore, 0);
  const riskPercentage = (totalWeightedScore / 4) * 100;

  const getRiskLevel = (score: number) => {
    if (score <= 1.5) return { level: 'LOW SDD', color: 'bg-green-500', icon: CheckCircle };
    if (score <= 2.5) return { level: 'MEDIUM CDD', color: 'bg-yellow-500', icon: AlertTriangle };
    return { level: 'HIGH EDD', color: 'bg-red-500', icon: Shield };
  };

  const riskAssessment = getRiskLevel(totalWeightedScore);

  const updateFactorValue = (factorId: string, value: string) => {
    setRiskFactors(prev => prev.map(factor => {
      if (factor.id === factorId) {
        const selectedOption = factor.options?.find(opt => opt.value === value);
        const newRiskScore = selectedOption ? selectedOption.score : 1;
        return {
          ...factor,
          inputValue: value,
          riskScore: newRiskScore,
          weightedScore: newRiskScore * factor.weight
        };
      }
      return factor;
    }));
  };

  const clearAllInputs = () => {
    setRiskFactors(prev => prev.map(factor => ({
      ...factor,
      inputValue: '',
      riskScore: 1,
      weightedScore: factor.weight
    })));
    setClientInfo({ name: '', assessmentDate: new Date().toISOString().split('T')[0] });
    toast({
      title: "Inputs Cleared",
      description: "All input fields have been reset.",
    });
  };

  const deleteFactor = (factorId: string) => {
    setRiskFactors(prev => prev.filter(factor => factor.id !== factorId));
    toast({
      title: "Factor Deleted",
      description: "Risk factor has been removed from the assessment.",
    });
  };

  const updateFactorWeight = (factorId: string, newWeight: number) => {
    setRiskFactors(prev => prev.map(factor => {
      if (factor.id === factorId) {
        return {
          ...factor,
          weight: newWeight,
          weightedScore: factor.riskScore * newWeight
        };
      }
      return factor;
    }));
  };

  const addNewFactor = () => {
    if (!newFactor.name || !newFactor.options?.length) {
      toast({
        title: "Invalid Factor",
        description: "Please provide a name and at least one option.",
        variant: "destructive"
      });
      return;
    }

    const factor: RiskFactor = {
      id: `custom_${Date.now()}`,
      name: newFactor.name!,
      inputValue: '',
      riskScore: 1,
      weight: newFactor.weight || 0.05,
      weightedScore: 0,
      options: newFactor.options as { value: string; score: number }[]
    };

    setRiskFactors(prev => [...prev, factor]);
    setNewFactor({ name: '', weight: 0.05, options: [{ value: '', score: 1 }] });
    setIsAddingFactor(false);
    
    toast({
      title: "Factor Added",
      description: "New risk factor has been added to the assessment.",
    });
  };

  const startEditingFactor = (factor: RiskFactor) => {
    setEditingFactor({ ...factor });
    setIsEditingExisting(true);
  };

  const saveEditedFactor = () => {
    if (!editingFactor) return;

    setRiskFactors(prev => prev.map(factor => 
      factor.id === editingFactor.id ? editingFactor : factor
    ));
    
    setEditingFactor(null);
    setIsEditingExisting(false);
    
    toast({
      title: "Factor Updated",
      description: "Risk factor has been successfully updated.",
    });
  };

  const cancelEditingFactor = () => {
    setEditingFactor(null);
    setIsEditingExisting(false);
  };

  const updateEditingFactorName = (name: string) => {
    if (editingFactor) {
      setEditingFactor({ ...editingFactor, name });
    }
  };

  const updateEditingFactorWeight = (weight: number) => {
    if (editingFactor) {
      setEditingFactor({ ...editingFactor, weight });
    }
  };

  const updateEditingFactorOption = (index: number, field: 'value' | 'score', newValue: string | number) => {
    if (editingFactor && editingFactor.options) {
      const updatedOptions = [...editingFactor.options];
      if (field === 'value') {
        updatedOptions[index] = { ...updatedOptions[index], value: newValue as string };
      } else {
        updatedOptions[index] = { ...updatedOptions[index], score: newValue as number };
      }
      setEditingFactor({ ...editingFactor, options: updatedOptions });
    }
  };

  const addEditingFactorOption = () => {
    if (editingFactor) {
      const newOptions = [...(editingFactor.options || []), { value: '', score: 1 }];
      setEditingFactor({ ...editingFactor, options: newOptions });
    }
  };

  const removeEditingFactorOption = (index: number) => {
    if (editingFactor && editingFactor.options && editingFactor.options.length > 1) {
      const updatedOptions = editingFactor.options.filter((_, i) => i !== index);
      setEditingFactor({ ...editingFactor, options: updatedOptions });
    }
  };

  const RiskIcon = riskAssessment.icon;

  return (
    <div className="min-h-screen bg-background cyber-grid p-6 relative overflow-hidden">
      {/* Ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <div className="flex items-center justify-center gap-4">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold gradient-text tracking-tight">AML Risk Assessment</h1>
            <Shield className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Advanced Anti-Money Laundering Risk Scoring System</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
        </div>

        {/* Client Information */}
        <Card className="glass-card glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter client name"
                className="glow-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessmentDate">Assessment Date</Label>
              <Input
                id="assessmentDate"
                type="date"
                value={clientInfo.assessmentDate}
                onChange={(e) => setClientInfo(prev => ({ ...prev, assessmentDate: e.target.value }))}
                className="glow-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment Results */}
        <Card className="glass-card orange-glow pulse-orange">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RiskIcon className="h-6 w-6" />
                Risk Assessment Results
              </span>
              <Badge className={`${riskAssessment.color} text-white text-lg px-4 py-2`}>
                {riskAssessment.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Total Weighted Score</p>
                <p className="text-3xl font-bold text-primary">{totalWeightedScore.toFixed(2)}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Risk Percentage</p>
                <p className="text-3xl font-bold text-accent">{riskPercentage.toFixed(1)}%</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Due Diligence Level</p>
                <p className="text-xl font-bold">{riskAssessment.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={clearAllInputs} variant="outline" className="glow-border">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Inputs
          </Button>
          
          <Dialog open={isAddingFactor} onOpenChange={setIsAddingFactor}>
            <DialogTrigger asChild>
              <Button className="orange-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Risk Factor
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Risk Factor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Factor Name</Label>
                  <Input
                    value={newFactor.name || ''}
                    onChange={(e) => setNewFactor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter factor name"
                  />
                </div>
                <div>
                  <Label>Weight (0-1)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={newFactor.weight || 0.05}
                    onChange={(e) => setNewFactor(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Options</Label>
                  {newFactor.options?.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        placeholder="Option text"
                        value={option.value}
                        onChange={(e) => {
                          const updatedOptions = [...(newFactor.options || [])];
                          updatedOptions[index] = { ...option, value: e.target.value };
                          setNewFactor(prev => ({ ...prev, options: updatedOptions }));
                        }}
                      />
                      <Input
                        type="number"
                        min="1"
                        max="4"
                        placeholder="Score"
                        value={option.score}
                        onChange={(e) => {
                          const updatedOptions = [...(newFactor.options || [])];
                          updatedOptions[index] = { ...option, score: parseInt(e.target.value) };
                          setNewFactor(prev => ({ ...prev, options: updatedOptions }));
                        }}
                        className="w-20"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setNewFactor(prev => ({
                        ...prev,
                        options: [...(prev.options || []), { value: '', score: 1 }]
                      }));
                    }}
                  >
                    Add Option
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addNewFactor} className="flex-1">Add Factor</Button>
                  <Button variant="outline" onClick={() => setIsAddingFactor(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit Existing Factor Dialog */}
          <Dialog open={isEditingExisting} onOpenChange={setIsEditingExisting}>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Risk Factor</DialogTitle>
              </DialogHeader>
              {editingFactor && (
                <div className="space-y-4">
                  <div>
                    <Label>Factor Name</Label>
                    <Input
                      value={editingFactor.name}
                      onChange={(e) => updateEditingFactorName(e.target.value)}
                      placeholder="Enter factor name"
                    />
                  </div>
                  <div>
                    <Label>Weight (0-1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editingFactor.weight}
                      onChange={(e) => updateEditingFactorWeight(parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Options</Label>
                    {editingFactor.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          placeholder="Option text"
                          value={option.value}
                          onChange={(e) => updateEditingFactorOption(index, 'value', e.target.value)}
                        />
                        <Input
                          type="number"
                          min="1"
                          max="4"
                          placeholder="Score"
                          value={option.score}
                          onChange={(e) => updateEditingFactorOption(index, 'score', parseInt(e.target.value))}
                          className="w-20"
                        />
                        {editingFactor.options && editingFactor.options.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeEditingFactorOption(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addEditingFactorOption}
                    >
                      Add Option
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEditedFactor} className="flex-1">Save Changes</Button>
                    <Button variant="outline" onClick={cancelEditingFactor}>Cancel</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Risk Factors */}
        <div className="grid gap-4">
          {riskFactors.map((factor) => (
            <Card key={factor.id} className="glass-card glow-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  <div className="lg:col-span-2">
                    <Label className="text-sm font-medium">{factor.name}</Label>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <Select
                      value={factor.inputValue}
                      onValueChange={(value) => updateFactorValue(factor.id, value)}
                    >
                      <SelectTrigger className="glow-border">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {factor.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.value} (Score: {option.score})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={factor.weight}
                        onChange={(e) => updateFactorWeight(factor.id, parseFloat(e.target.value))}
                        className="w-20 text-center"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Weighted Score</p>
                      <p className="text-lg font-bold text-primary">{factor.weightedScore.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingFactor(factor)}
                        className="text-primary hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFactor(factor.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Risk Level Guide */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Risk Level Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <h3 className="font-semibold text-green-500">LOW SDD</h3>
                <p className="text-sm text-muted-foreground">Score: 0.0 - 1.5</p>
                <p className="text-xs">Simplified Due Diligence</p>
              </div>
              <div className="text-center space-y-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
                <h3 className="font-semibold text-yellow-500">MEDIUM CDD</h3>
                <p className="text-sm text-muted-foreground">Score: 1.5 - 2.5</p>
                <p className="text-xs">Customer Due Diligence</p>
              </div>
              <div className="text-center space-y-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <Shield className="h-8 w-8 text-red-500 mx-auto" />
                <h3 className="font-semibold text-red-500">HIGH EDD</h3>
                <p className="text-sm text-muted-foreground">Score: 2.5+</p>
                <p className="text-xs">Enhanced Due Diligence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
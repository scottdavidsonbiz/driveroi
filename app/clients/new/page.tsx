'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { StepBasicInfo } from '@/components/clients/intake/step-basic-info'
import { StepMaterials } from '@/components/clients/intake/step-materials'
import { StepAnalysis } from '@/components/clients/intake/step-analysis'
import { StepReview } from '@/components/clients/intake/step-review'

export interface ClientIntakeData {
  // Step 1: Basic Info
  name: string
  website: string
  industry: string

  // Step 2: Materials
  materials: {
    type: 'transcript' | 'notes' | 'website'
    content: string
    filename?: string
  }[]

  // Step 3: AI Analysis Results
  analysis: {
    icp: {
      buyerPersona: string
      companySize: string
      industry: string
      geography: string
      triggers: string[]
    }
    painPoints: string[]
    positioning: string
    emailAngles: {
      name: string
      subject: string
      preview: string
    }[]
  } | null
}

const steps = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Materials' },
  { id: 3, name: 'Analysis' },
  { id: 4, name: 'Review' },
]

export default function NewClientPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [data, setData] = useState<ClientIntakeData>({
    name: '',
    website: '',
    industry: '',
    materials: [],
    analysis: null,
  })

  const updateData = (updates: Partial<ClientIntakeData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length > 0
      case 2:
        return data.materials.length > 0 || data.website.trim().length > 0
      case 3:
        return data.analysis !== null
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep === 2) {
      // Trigger AI analysis
      setIsAnalyzing(true)
      setCurrentStep(3)

      try {
        const response = await fetch('/api/clients/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            website: data.website,
            industry: data.industry,
            materials: data.materials,
          }),
        })

        const result = await response.json()

        if (result.analysis) {
          updateData({ analysis: result.analysis })
        }
      } catch (error) {
        console.error('Analysis failed:', error)
      } finally {
        setIsAnalyzing(false)
      }
    } else if (currentStep === 4) {
      // Save client and redirect
      // TODO: Save to Supabase when connected
      router.push('/clients')
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="page-enter max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > step.id
                      ? 'gradient-accent text-white'
                      : currentStep === step.id
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-muted text-muted-foreground'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepBasicInfo data={data} updateData={updateData} />
          )}
          {currentStep === 2 && (
            <StepMaterials data={data} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <StepAnalysis
              data={data}
              updateData={updateData}
              isAnalyzing={isAnalyzing}
            />
          )}
          {currentStep === 4 && (
            <StepReview data={data} updateData={updateData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isAnalyzing}
          className={currentStep === 4 ? 'gradient-accent border-0' : ''}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : currentStep === 4 ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Client
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { FileText, Upload, X, Plus, Globe } from 'lucide-react'
import type { ClientIntakeData } from '@/app/clients/new/page'

interface StepMaterialsProps {
  data: ClientIntakeData
  updateData: (updates: Partial<ClientIntakeData>) => void
}

export function StepMaterials({ data, updateData }: StepMaterialsProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteName, setPasteName] = useState('')

  const addMaterial = (type: 'transcript' | 'notes', content: string, filename?: string) => {
    if (!content.trim()) return

    const newMaterial = {
      type,
      content: content.trim(),
      filename: filename || `${type}-${data.materials.length + 1}`,
    }

    updateData({
      materials: [...data.materials, newMaterial],
    })

    // Clear inputs
    setPasteContent('')
    setPasteName('')
  }

  const removeMaterial = (index: number) => {
    updateData({
      materials: data.materials.filter((_, i) => i !== index),
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const content = await file.text()
      addMaterial('transcript', content, file.name)
    }

    // Reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Add Materials</h2>
        <p className="text-sm text-muted-foreground">
          Add call transcripts, notes, or other materials to help build the ICP.
        </p>
      </div>

      {/* Website indicator */}
      {data.website && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Website will be analyzed:</span>
            <span className="font-medium">{data.website}</span>
          </div>
        </Card>
      )}

      {/* Tab buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'paste' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('paste')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Paste Text
        </Button>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Paste content */}
      {activeTab === 'paste' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="paste-name">Label (optional)</Label>
            <input
              id="paste-name"
              type="text"
              placeholder="e.g., Discovery Call Notes"
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="paste-content">Content *</Label>
            <Textarea
              id="paste-content"
              placeholder="Paste your transcript, call notes, or other relevant content here..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              className="mt-1.5 min-h-[200px]"
            />
          </div>
          <Button
            size="sm"
            onClick={() => addMaterial('notes', pasteContent, pasteName || undefined)}
            disabled={!pasteContent.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </div>
      )}

      {/* File upload */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".txt,.md,.srt,.vtt"
              multiple
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <span className="text-sm font-medium">Drop files here or click to upload</span>
              <span className="text-xs text-muted-foreground mt-1">
                Supports .txt, .md, .srt, .vtt
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Added materials */}
      {data.materials.length > 0 && (
        <div className="space-y-2">
          <Label>Added Materials ({data.materials.length})</Label>
          <div className="space-y-2">
            {data.materials.map((material, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {material.filename || `${material.type}-${index + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({material.content.length.toLocaleString()} chars)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      {data.materials.length === 0 && !data.website && (
        <p className="text-sm text-muted-foreground">
          Add at least one material or provide a website URL to continue.
        </p>
      )}
    </div>
  )
}

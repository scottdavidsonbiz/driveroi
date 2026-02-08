'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Loader2,
  ArrowLeft,
  Globe,
  Building2,
  Users,
  Mail,
  FileText,
  BarChart3,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Settings,
  Plus,
  X,
  Pencil,
  Save,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

interface ClientDetail {
  id: string
  name: string
  website: string | null
  industry: string | null
  created_at: string
  client_icp: {
    id: string
    buyer_persona: string | null
    company_size: string | null
    industry: string | null
    geography: string | null
    triggers: string[] | null
    pain_points: string[] | null
    positioning: string | null
    email_angles: {
      name: string
      subject: string
      preview: string
    }[] | null
  }[] | null
  client_materials: {
    id: string
    type: string
    filename: string | null
    content: string | null
    created_at: string
  }[] | null
  leads: {
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    title: string | null
    company: string | null
    created_at: string
  }[]
  campaigns: {
    id: string
    platform: string
    campaign_name: string | null
    sent: number
    opened: number
    replied: number
    meetings: number
    snapshot_date: string
    raw_data?: Record<string, any>
  }[]
  integrations: {
    id: string
    platform: string
    external_campaign_id: string
    campaign_name: string | null
    active: boolean
  }[]
  latest_update: ClientUpdateRecord | null
}

interface ClientUpdateRecord {
  id: string
  client_id: string
  period_start: string
  period_end: string
  metrics_snapshot: {
    heyreach: { campaigns: any[]; totals: any }
    instantly: { campaigns: any[]; totals: any }
    totals: {
      leadsContacted: number
      connectionsSent: number
      connectionsAccepted: number
      emailsSent: number
      emailsOpened: number
      totalReplies: number
      meetings: number
    }
    snapshot_date: string
  }
  previous_snapshot: any | null
  narrative: string
  recommendations: string[]
  markdown_path: string | null
  created_at: string
}

function DeltaBadge({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined || previous === null) return null
  const diff = current - previous
  if (diff === 0) {
    return (
      <span className="inline-flex items-center text-xs text-muted-foreground ml-1">
        <Minus className="h-3 w-3" />
      </span>
    )
  }
  if (diff > 0) {
    return (
      <span className="inline-flex items-center text-xs text-green-600 ml-1">
        <TrendingUp className="h-3 w-3 mr-0.5" />
        +{diff}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs text-red-600 ml-1">
      <TrendingDown className="h-3 w-3 mr-0.5" />
      {diff}
    </span>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateStatus, setGenerateStatus] = useState('')
  const [updates, setUpdates] = useState<ClientUpdateRecord[]>([])
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null)
  const [showAddIntegration, setShowAddIntegration] = useState(false)
  const [addPlatform, setAddPlatform] = useState<'heyreach' | 'instantly'>('heyreach')
  const [availableCampaigns, setAvailableCampaigns] = useState<{ id: string; name: string; status: string }[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [addingIntegration, setAddingIntegration] = useState(false)
  const [removingIntegrationId, setRemovingIntegrationId] = useState<string | null>(null)
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
  const [editNarrative, setEditNarrative] = useState('')
  const [editRecommendations, setEditRecommendations] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null)
  // Create Campaign state
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [createCampaignPrefix, setCreateCampaignPrefix] = useState('')
  const [createCampaignCount, setCreateCampaignCount] = useState(3)
  const [createCampaignOffers, setCreateCampaignOffers] = useState('')
  const [createCampaignSocialProof, setCreateCampaignSocialProof] = useState('')
  const [creatingCampaigns, setCreatingCampaigns] = useState(false)
  const [createCampaignStatus, setCreateCampaignStatus] = useState('')
  const [createdCampaigns, setCreatedCampaigns] = useState<{ id: string; name: string }[]>([])

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm('Delete this update? The markdown file will also be removed.')) return
    setDeletingUpdateId(updateId)
    try {
      const res = await fetch(`/api/clients/${params.id}/updates`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_id: updateId }),
      })
      if (res.ok) {
        await fetchClient()
        await fetchUpdates()
      } else {
        const data = await res.json()
        alert(`Failed to delete: ${data.error}`)
      }
    } catch (err) {
      console.error('Delete update error:', err)
      alert('Failed to delete update')
    } finally {
      setDeletingUpdateId(null)
    }
  }

  const handleStartEdit = (update: ClientUpdateRecord) => {
    setEditingUpdateId(update.id)
    setEditNarrative(update.narrative || '')
    setEditRecommendations((update.recommendations || []).join('\n'))
  }

  const handleSaveEdit = async () => {
    if (!editingUpdateId) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/clients/${params.id}/updates`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: editingUpdateId,
          narrative: editNarrative,
          recommendations: editRecommendations.split('\n').filter(r => r.trim()),
        }),
      })
      if (res.ok) {
        setEditingUpdateId(null)
        await fetchClient()
        await fetchUpdates()
      } else {
        const data = await res.json()
        alert(`Failed to save: ${data.error}`)
      }
    } catch (err) {
      console.error('Save edit error:', err)
      alert('Failed to save changes')
    } finally {
      setSavingEdit(false)
    }
  }

  const fetchAvailableCampaigns = useCallback(async (platform: 'heyreach' | 'instantly') => {
    setLoadingCampaigns(true)
    setAvailableCampaigns([])
    setSelectedCampaignId('')
    try {
      const res = await fetch(`/api/integrations/campaigns?platform=${platform}`)
      const data = await res.json()
      if (data.campaigns) {
        setAvailableCampaigns(data.campaigns)
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    } finally {
      setLoadingCampaigns(false)
    }
  }, [])

  const handleAddIntegration = async () => {
    if (!selectedCampaignId) return
    setAddingIntegration(true)
    try {
      const campaign = availableCampaigns.find(c => c.id === selectedCampaignId)
      const res = await fetch(`/api/clients/${params.id}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: addPlatform,
          external_campaign_id: selectedCampaignId,
          campaign_name: campaign?.name || null,
        }),
      })
      if (res.ok) {
        setShowAddIntegration(false)
        setSelectedCampaignId('')
        setAvailableCampaigns([])
        await fetchClient()
      } else {
        const data = await res.json()
        alert(`Failed to add: ${data.error}`)
      }
    } catch (err) {
      console.error('Failed to add integration:', err)
      alert('Failed to add integration')
    } finally {
      setAddingIntegration(false)
    }
  }

  const handleRemoveIntegration = async (integrationId: string) => {
    if (!confirm('Remove this campaign integration?')) return
    setRemovingIntegrationId(integrationId)
    try {
      const res = await fetch(`/api/clients/${params.id}/integrations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integrationId }),
      })
      if (res.ok) {
        await fetchClient()
      } else {
        alert('Failed to remove integration')
      }
    } catch (err) {
      console.error('Failed to remove integration:', err)
    } finally {
      setRemovingIntegrationId(null)
    }
  }

  const handleCreateCampaigns = async () => {
    setCreatingCampaigns(true)
    setCreateCampaignStatus('Generating campaigns with Claude...')
    setCreatedCampaigns([])

    try {
      const offers = createCampaignOffers
        .split('\n')
        .map(o => o.trim())
        .filter(o => o.length > 0)

      const res = await fetch(`/api/clients/${params.id}/campaigns/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name_prefix: createCampaignPrefix || undefined,
          num_campaigns: createCampaignCount,
          offers: offers.length > 0 ? offers : undefined,
          social_proof: createCampaignSocialProof || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateCampaignStatus(`Failed: ${data.error}`)
        setCreatingCampaigns(false)
        return
      }

      setCreatedCampaigns(data.campaigns || [])
      setCreateCampaignStatus(
        `${data.campaigns_created} campaign(s) created${data.errors ? ` (${data.errors.length} failed)` : ''}!`
      )

      await fetchClient()

      setTimeout(() => setCreateCampaignStatus(''), 5000)
    } catch (err) {
      console.error('Create campaigns error:', err)
      setCreateCampaignStatus('Failed to create campaigns')
    } finally {
      setCreatingCampaigns(false)
    }
  }

  const fetchClient = useCallback(async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setClient(data.client)
      }
    } catch (err) {
      setError('Failed to load client')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchUpdates = useCallback(async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}/updates`)
      const data = await response.json()
      if (data.updates) {
        setUpdates(data.updates)
      }
    } catch (err) {
      console.error('Failed to fetch updates:', err)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchClient()
      fetchUpdates()
    }
  }, [params.id, fetchClient, fetchUpdates])

  const handleGenerateUpdate = async () => {
    setGenerating(true)
    setGenerateStatus('Syncing campaign data...')

    try {
      // Step 1: Sync
      const syncRes = await fetch(`/api/clients/${params.id}/sync`, { method: 'POST' })
      const syncData = await syncRes.json()

      if (!syncRes.ok) {
        setGenerateStatus(`Sync failed: ${syncData.error}`)
        setGenerating(false)
        return
      }

      setGenerateStatus(`Synced ${syncData.campaigns_synced} campaigns. Generating narrative...`)

      // Step 2: Generate
      const updateRes = await fetch(`/api/clients/${params.id}/updates`, { method: 'POST' })
      const updateData = await updateRes.json()

      if (!updateRes.ok) {
        setGenerateStatus(`Generation failed: ${updateData.error}`)
        setGenerating(false)
        return
      }

      setGenerateStatus('Update generated successfully!')

      // Refresh data
      await fetchClient()
      await fetchUpdates()

      setTimeout(() => setGenerateStatus(''), 3000)
    } catch (err) {
      console.error('Generate error:', err)
      setGenerateStatus('Failed to generate update')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/clients')
      } else {
        alert('Failed to delete client')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete client')
    }
  }

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="page-enter">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error || 'Client not found'}</p>
            <Button variant="link" onClick={() => router.push('/clients')}>
              Back to clients
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const icp = Array.isArray(client.client_icp) ? client.client_icp[0] : client.client_icp ?? null
  const latestUpdate = client.latest_update
  const prevTotals = latestUpdate?.previous_snapshot?.totals
  const currTotals = latestUpdate?.metrics_snapshot?.totals

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center text-white font-bold text-xl">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {client.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {client.website}
                </span>
              )}
              {client.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {client.industry}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Updates
          </TabsTrigger>
          <TabsTrigger value="icp" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            ICP
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-6 mt-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly Updates</h2>
              {latestUpdate && (
                <p className="text-sm text-muted-foreground">
                  Last update: {new Date(latestUpdate.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {generateStatus && (
                <p className="text-sm text-muted-foreground">{generateStatus}</p>
              )}
              <Button
                onClick={handleGenerateUpdate}
                disabled={generating}
                className="gradient-accent text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Weekly Update
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          {currTotals && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.leadsContacted}</p>
                  <p className="text-xs text-muted-foreground">Leads Contacted</p>
                  <DeltaBadge current={currTotals.leadsContacted} previous={prevTotals?.leadsContacted} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.connectionsSent}</p>
                  <p className="text-xs text-muted-foreground">Connections Sent</p>
                  <DeltaBadge current={currTotals.connectionsSent} previous={prevTotals?.connectionsSent} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.connectionsAccepted}</p>
                  <p className="text-xs text-muted-foreground">Accepted</p>
                  <DeltaBadge current={currTotals.connectionsAccepted} previous={prevTotals?.connectionsAccepted} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.emailsSent}</p>
                  <p className="text-xs text-muted-foreground">Emails Sent</p>
                  <DeltaBadge current={currTotals.emailsSent} previous={prevTotals?.emailsSent} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.emailsOpened}</p>
                  <p className="text-xs text-muted-foreground">Opened</p>
                  <DeltaBadge current={currTotals.emailsOpened} previous={prevTotals?.emailsOpened} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.totalReplies}</p>
                  <p className="text-xs text-muted-foreground">Replies</p>
                  <DeltaBadge current={currTotals.totalReplies} previous={prevTotals?.totalReplies} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-2xl font-bold">{currTotals.meetings}</p>
                  <p className="text-xs text-muted-foreground">Meetings</p>
                  <DeltaBadge current={currTotals.meetings} previous={prevTotals?.meetings} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaign Breakdown */}
          {latestUpdate?.metrics_snapshot && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Campaign Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Platform</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Campaign</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Sent</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Accepted/Opened</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Replies</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUpdate.metrics_snapshot.heyreach.campaigns.map((c: any, i: number) => (
                      <tr key={`hr-${i}`} className="border-b last:border-0">
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">HeyReach</Badge>
                        </td>
                        <td className="p-3 text-sm">{c.campaign_name}</td>
                        <td className="p-3 text-sm text-right">{c.connectionsSent}</td>
                        <td className="p-3 text-sm text-right">{c.connectionsAccepted}</td>
                        <td className="p-3 text-sm text-right">{c.messageReplies}</td>
                        <td className="p-3 text-sm text-right">
                          {(c.connectionAcceptanceRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    {latestUpdate.metrics_snapshot.instantly.campaigns.map((c: any, i: number) => (
                      <tr key={`inst-${i}`} className="border-b last:border-0">
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">Instantly</Badge>
                        </td>
                        <td className="p-3 text-sm">{c.campaign_name}</td>
                        <td className="p-3 text-sm text-right">{c.emailsSent}</td>
                        <td className="p-3 text-sm text-right">{c.emailsOpened}</td>
                        <td className="p-3 text-sm text-right">{c.replied}</td>
                        <td className="p-3 text-sm text-right">
                          {c.emailsSent > 0 ? ((c.replied / c.emailsSent) * 100).toFixed(1) : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Narrative + Recommendations (with edit/delete) */}
          {latestUpdate && (
            <>
              {/* Action buttons for latest update */}
              <div className="flex items-center justify-end gap-2">
                {editingUpdateId === latestUpdate.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUpdateId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={savingEdit}
                      onClick={handleSaveEdit}
                      className="gradient-accent text-white"
                    >
                      {savingEdit ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(latestUpdate)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingUpdateId === latestUpdate.id}
                      onClick={() => handleDeleteUpdate(latestUpdate.id)}
                    >
                      {deletingUpdateId === latestUpdate.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Delete
                    </Button>
                  </>
                )}
              </div>

              {/* Narrative */}
              {editingUpdateId === latestUpdate.id ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Analysis (Editing)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                      value={editNarrative}
                      onChange={(e) => setEditNarrative(e.target.value)}
                    />
                  </CardContent>
                </Card>
              ) : latestUpdate.narrative ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {latestUpdate.narrative}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              ) : null}

              {/* Recommendations */}
              {editingUpdateId === latestUpdate.id ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Recommendations (one per line)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editRecommendations}
                      onChange={(e) => setEditRecommendations(e.target.value)}
                    />
                  </CardContent>
                </Card>
              ) : latestUpdate.recommendations && latestUpdate.recommendations.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {latestUpdate.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-5 w-5 rounded border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                            {i + 1}
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}

          {/* History */}
          {updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Update History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {updates.map((update) => (
                  <div key={update.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <button
                        className="flex items-center gap-3 text-left flex-1"
                        onClick={() =>
                          setExpandedUpdate(expandedUpdate === update.id ? null : update.id)
                        }
                      >
                        {expandedUpdate === update.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(update.period_end).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {update.metrics_snapshot?.totals?.leadsContacted || 0} leads contacted
                            {update.markdown_path && ` | ${update.markdown_path}`}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            if (editingUpdateId === update.id) {
                              setEditingUpdateId(null)
                            } else {
                              handleStartEdit(update)
                              setExpandedUpdate(update.id)
                            }
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={deletingUpdateId === update.id}
                          onClick={() => handleDeleteUpdate(update.id)}
                        >
                          {deletingUpdateId === update.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {expandedUpdate === update.id && (
                      <div className="border-t p-4">
                        {editingUpdateId === update.id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Narrative (markdown)</label>
                              <textarea
                                className="w-full min-h-[200px] mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                value={editNarrative}
                                onChange={(e) => setEditNarrative(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Recommendations (one per line)</label>
                              <textarea
                                className="w-full min-h-[100px] mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editRecommendations}
                                onChange={(e) => setEditRecommendations(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => setEditingUpdateId(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" disabled={savingEdit} onClick={handleSaveEdit} className="gradient-accent text-white">
                                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {update.narrative || 'No narrative available'}
                            </ReactMarkdown>
                            {update.recommendations && update.recommendations.length > 0 && (
                              <div className="mt-4">
                                <h4>Recommendations</h4>
                                <ul>
                                  {update.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!latestUpdate && updates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No updates yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure campaign integrations are configured, then generate your first weekly update.
                </p>
                <Button
                  onClick={handleGenerateUpdate}
                  disabled={generating}
                  className="gradient-accent text-white"
                >
                  Generate First Update
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ICP Tab */}
        <TabsContent value="icp" className="space-y-4 mt-4">
          {icp ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Buyer Persona
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{icp.buyer_persona || 'Not set'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Company Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{icp.company_size || 'Not set'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Industry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{icp.industry || 'Not set'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Geography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{icp.geography || 'Not set'}</p>
                  </CardContent>
                </Card>
              </div>

              {icp.positioning && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Positioning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{icp.positioning}</p>
                  </CardContent>
                </Card>
              )}

              {icp.triggers && icp.triggers.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Buying Triggers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {icp.triggers.map((trigger, i) => (
                        <Badge key={i} variant="secondary">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {icp.pain_points && icp.pain_points.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pain Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {icp.pain_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {icp.email_angles && icp.email_angles.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Email Angles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {icp.email_angles.map((angle, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{angle.name}</Badge>
                        </div>
                        <p className="font-medium text-sm">Subject: {angle.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">{angle.preview}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No ICP data yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4 mt-4">
          {client.client_materials && client.client_materials.length > 0 ? (
            client.client_materials.map((material) => (
              <Card key={material.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {material.filename || material.type}
                    </CardTitle>
                    <Badge variant="secondary">{material.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-64 overflow-auto">
                    {material.content}
                  </pre>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No materials uploaded</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-4">
          {client.leads && client.leads.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.leads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0">
                        <td className="p-4">
                          {lead.first_name} {lead.last_name}
                        </td>
                        <td className="p-4 text-sm">{lead.email}</td>
                        <td className="p-4 text-sm text-muted-foreground">{lead.title}</td>
                        <td className="p-4 text-sm text-muted-foreground">{lead.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No leads yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the Leads API to import from Clay
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Campaign Integrations</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!icp}
                title={!icp ? 'Add ICP data first' : 'Generate campaigns with AI'}
                onClick={() => {
                  setShowCreateCampaign(!showCreateCampaign)
                  setShowAddIntegration(false)
                  if (!showCreateCampaign && client) {
                    setCreateCampaignPrefix(client.name)
                  }
                }}
              >
                {showCreateCampaign ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Create Campaign
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddIntegration(!showAddIntegration)
                  setShowCreateCampaign(false)
                  if (!showAddIntegration) {
                    fetchAvailableCampaigns(addPlatform)
                  }
                }}
              >
                {showAddIntegration ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Campaign
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Create Campaign Form */}
          {showCreateCampaign && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Campaign Name Prefix</label>
                    <input
                      type="text"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={createCampaignPrefix}
                      onChange={(e) => setCreateCampaignPrefix(e.target.value)}
                      placeholder={client?.name || 'Client Name'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Number of Campaigns</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={createCampaignCount}
                      onChange={(e) => setCreateCampaignCount(Number(e.target.value))}
                    >
                      <option value={1}>1 campaign</option>
                      <option value={2}>2 campaigns</option>
                      <option value={3}>3 campaigns</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Offers (one per line, optional)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={createCampaignOffers}
                    onChange={(e) => setCreateCampaignOffers(e.target.value)}
                    placeholder="Leave empty to auto-generate from ICP"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Social Proof (optional)</label>
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={createCampaignSocialProof}
                    onChange={(e) => setCreateCampaignSocialProof(e.target.value)}
                    placeholder="e.g. Helped 50+ oilfield companies increase pipeline by 3x"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCreateCampaigns}
                    disabled={creatingCampaigns}
                    className="gradient-accent text-white"
                  >
                    {creatingCampaigns ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate & Create
                      </>
                    )}
                  </Button>
                  {createCampaignStatus && (
                    <p className="text-sm text-muted-foreground">{createCampaignStatus}</p>
                  )}
                </div>
                {createdCampaigns.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Created Campaigns:</p>
                    {createdCampaigns.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Instantly</Badge>
                        <span>{c.name}</span>
                        <a
                          href={`https://app.instantly.ai/app/campaign/${c.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Add Integration Form */}
          {showAddIntegration && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Platform</label>
                    <select
                      className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={addPlatform}
                      onChange={(e) => {
                        const p = e.target.value as 'heyreach' | 'instantly'
                        setAddPlatform(p)
                        fetchAvailableCampaigns(p)
                      }}
                    >
                      <option value="heyreach">HeyReach</option>
                      <option value="instantly">Instantly</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-sm font-medium">Campaign</label>
                    {loadingCampaigns ? (
                      <div className="flex items-center h-9 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading campaigns...
                      </div>
                    ) : (
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                      >
                        <option value="">Select a campaign...</option>
                        {availableCampaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <Button
                    size="sm"
                    disabled={!selectedCampaignId || addingIntegration}
                    onClick={handleAddIntegration}
                    className="gradient-accent text-white"
                  >
                    {addingIntegration ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
                {availableCampaigns.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {availableCampaigns.length} campaigns available from {addPlatform}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {client.integrations && client.integrations.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Platform</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.integrations.map((integration) => (
                      <tr key={integration.id} className="border-b last:border-0">
                        <td className="p-4">
                          <Badge variant="outline">{integration.platform}</Badge>
                        </td>
                        <td className="p-4 text-sm">{integration.campaign_name || 'Unnamed'}</td>
                        <td className="p-4 text-sm font-mono text-muted-foreground">
                          {integration.external_campaign_id}
                        </td>
                        <td className="p-4">
                          <Badge variant={integration.active ? 'default' : 'secondary'}>
                            {integration.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={removingIntegrationId === integration.id}
                            onClick={() => handleRemoveIntegration(integration.id)}
                          >
                            {removingIntegrationId === integration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No integrations configured</p>
                <p className="text-sm text-muted-foreground">
                  Click "Add Campaign" above to connect HeyReach or Instantly campaigns.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Campaign Stats (existing data) */}
          {client.campaigns && client.campaigns.length > 0 && (
            <>
              <h3 className="text-md font-semibold mt-6">Synced Campaign Stats</h3>
              <div className="grid gap-4">
                {client.campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {campaign.campaign_name || 'Unnamed Campaign'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{campaign.platform}</Badge>
                          <span className="text-xs text-muted-foreground">{campaign.snapshot_date}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{campaign.sent}</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.opened}</p>
                          <p className="text-xs text-muted-foreground">Opened</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.replied}</p>
                          <p className="text-xs text-muted-foreground">Replied</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.meetings}</p>
                          <p className="text-xs text-muted-foreground">Meetings</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Reply Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

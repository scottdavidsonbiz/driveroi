import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="page-enter max-w-2xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Configure your integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Instantly API Key</label>
              <Input type="password" placeholder="Enter your Instantly API key" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">HeyReach API Key</label>
              <Input type="password" placeholder="Enter your HeyReach API key" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Claude API Key</label>
              <Input type="password" placeholder="Enter your Anthropic API key" />
            </div>
            <Button className="gradient-accent border-0">Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
            <CardDescription>Database configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not connected. Add Supabase credentials to .env.local to enable database features.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

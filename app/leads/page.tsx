import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LeadsPage() {
  return (
    <div className="page-enter">
      <Card>
        <CardHeader>
          <CardTitle>Lead Database</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lead storage and deduplication coming soon. Connect Supabase to enable this feature.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

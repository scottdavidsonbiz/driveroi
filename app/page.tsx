export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto page-enter">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            <span className="gradient-accent-text">DriveROI</span> Ops
          </h1>
          <p className="text-muted-foreground">
            Internal operations platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 stagger-children">
          <StatCard label="Active Clients" value="3" />
          <StatCard label="Leads Enriched" value="1,247" />
          <StatCard label="Emails Sent" value="4,892" />
          <StatCard label="Meetings Booked" value="23" />
        </div>

        {/* Client Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            <ClientCard
              name="IVS"
              industry="Property Tax Assessment"
              campaigns={3}
              meetings={12}
            />
            <ClientCard
              name="CharterUP"
              industry="Charter Bus Marketplace"
              campaigns={1}
              meetings={0}
            />
            <ClientCard
              name="WithCoverage"
              industry="Commercial Insurance"
              campaigns={0}
              meetings={0}
            />
            <NewClientCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="gradient-accent text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            + New Client
          </button>
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors">
            View SOPs
          </button>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border rounded-xl p-5 card-hover">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function ClientCard({
  name,
  industry,
  campaigns,
  meetings
}: {
  name: string
  industry: string
  campaigns: number
  meetings: number
}) {
  return (
    <div className="bg-card border rounded-xl p-5 card-hover cursor-pointer">
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{industry}</p>
      <div className="flex gap-4 text-sm">
        <span><strong>{campaigns}</strong> campaigns</span>
        <span><strong>{meetings}</strong> meetings</span>
      </div>
    </div>
  )
}

function NewClientCard() {
  return (
    <div className="border border-dashed rounded-xl p-5 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
      <span className="text-muted-foreground text-sm font-medium">+ Add Client</span>
    </div>
  )
}

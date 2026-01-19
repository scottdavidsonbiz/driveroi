import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowRight } from 'lucide-react'

const sops = [
  {
    slug: 'mailpool-client-email-setup',
    title: 'Client Email Account Setup (MailPool + Instantly)',
    category: 'Client Setup',
    description: 'Set up new email domains and inboxes for client outbound campaigns.',
  },
]

export default function SOPsPage() {
  return (
    <div className="page-enter">
      <div className="grid gap-4">
        {sops.map((sop) => (
          <Link key={sop.slug} href={`/sops/${sop.slug}`}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sop.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{sop.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

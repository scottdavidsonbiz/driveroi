import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/clients - List all clients, optionally filtered by ?status=client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('clients')
      .select(`
        *,
        client_icp (*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('[Clients API] Error fetching clients:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('[Clients API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

// POST /api/clients - Create a new client with ICP and materials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, website, industry, materials, analysis } = body

    // 1. Create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name,
        website: website || null,
        industry: industry || null,
      })
      .select()
      .single()

    if (clientError) {
      console.error('[Clients API] Error creating client:', clientError)
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // 2. Save the ICP if analysis was provided
    if (analysis) {
      const { error: icpError } = await supabase
        .from('client_icp')
        .insert({
          client_id: client.id,
          buyer_persona: analysis.icp.buyerPersona,
          company_size: analysis.icp.companySize,
          industry: analysis.icp.industry,
          geography: analysis.icp.geography,
          triggers: analysis.icp.triggers,
          pain_points: analysis.painPoints,
          positioning: analysis.positioning,
          email_angles: analysis.emailAngles,
        })

      if (icpError) {
        console.error('[Clients API] Error saving ICP:', icpError)
        // Don't fail the whole request, client was created
      }
    }

    // 3. Save materials if provided
    if (materials && materials.length > 0) {
      const materialsToInsert = materials.map((m: { type: string; content: string; filename?: string }) => ({
        client_id: client.id,
        type: m.type,
        filename: m.filename || null,
        content: m.content,
      }))

      const { error: materialsError } = await supabase
        .from('client_materials')
        .insert(materialsToInsert)

      if (materialsError) {
        console.error('[Clients API] Error saving materials:', materialsError)
        // Don't fail the whole request
      }
    }

    return NextResponse.json({ client, success: true })
  } catch (error) {
    console.error('[Clients API] Error:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

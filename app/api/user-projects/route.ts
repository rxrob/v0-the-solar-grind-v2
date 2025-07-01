import { type NextRequest, NextResponse } from "next/server"

// Safe Supabase initialization
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const { createClient } = require("@supabase/supabase-js")
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    const { data: projects, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_email", userEmail)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching projects:", error)
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error("Error in user-projects API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    const {
      userEmail,
      customerName,
      projectName,
      propertyAddress,
      systemSizeKw,
      annualProductionKwh,
      systemCost,
      netCost,
      annualSavings,
      status = "active",
      notes,
      installationDate,
    } = body

    if (!userEmail || !customerName || !projectName || !propertyAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from("user_projects")
      .insert({
        user_email: userEmail,
        customer_name: customerName,
        project_name: projectName,
        property_address: propertyAddress,
        system_size_kw: systemSizeKw || 0,
        annual_production_kwh: annualProductionKwh || 0,
        system_cost: systemCost || 0,
        net_cost: netCost || 0,
        annual_savings: annualSavings || 0,
        status,
        notes,
        installation_date: installationDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating project:", error)
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error in user-projects POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    const { id, userEmail, ...updates } = body

    if (!id || !userEmail) {
      return NextResponse.json({ error: "Project ID and user email required" }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from("user_projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_email", userEmail)
      .select()
      .single()

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error in user-projects PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userEmail = searchParams.get("email")

    if (!id || !userEmail) {
      return NextResponse.json({ error: "Project ID and user email required" }, { status: 400 })
    }

    const { error } = await supabase.from("user_projects").delete().eq("id", id).eq("user_email", userEmail)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user-projects DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

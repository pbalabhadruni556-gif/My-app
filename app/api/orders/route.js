import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  let query = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  if (phone) query = query.eq("phone", phone);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: body.customer_name,
      phone: body.phone,
      items: body.items,
      total: body.total,
      status: "New",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, status } = body;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

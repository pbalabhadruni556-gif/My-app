import { NextResponse } from "next/server";

export async function POST(req) {
  const { pin } = await req.json();
  const correct = pin === (process.env.OWNER_PIN || "1234");
  return NextResponse.json({ ok: correct });
}

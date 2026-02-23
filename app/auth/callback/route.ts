import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchanges the Resend recovery/auth code for a secure session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If a 'next' param exists (e.g. for password resets), follow it
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Fail-safe: Return to login on invalid/expired codes
  return NextResponse.redirect(`${origin}/login?error=Security handshake expired. Please retry.`)
}
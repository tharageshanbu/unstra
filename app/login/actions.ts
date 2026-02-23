'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // --- SERVER-SIDE PRODUCTION GATE ---
  if (password !== confirmPassword) {
    redirect(`/login?error=${encodeURIComponent("Passwords do not match.")}`)
  }

  // Basic regex check for server-side strength enforcement
  const isStrong = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
  if (!isStrong) {
    redirect(`/login?error=${encodeURIComponent("Security Policy: Password must include Uppercase, Number, and Symbol.")}`)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { full_name: email.split('@')[0] },
      // Redirect back to our callback route
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    },
  })

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  // Resend will handle the delivery of this confirmation email
  revalidatePath('/', 'layout')
  redirect('/login?message=Check your inbox to authorize Vault access.')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: { prompt: 'select_account' }
    },
  })

  if (error) redirect('/login?error=Google authentication failed')
  if (data.url) redirect(data.url)
}
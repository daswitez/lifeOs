'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const username = formData.get('username') as string;

  // 1. Sign up the user via Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
     email,
     password,
     // Opcionalmente podemos enviar metadata, aunque el trigger no lo lea, no hace daño
     options: {
       data: {
         full_name: fullName,
         username: username,
       }
     }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // 2. The database trigger `handle_new_user` just fired and inserted id and email to `public.profiles`.
  // Wait a fraction of a second just to ensure trigger transaction closed if needed, 
  // though usually synchronous in the DB perspective, from the API call perspective it's already done.
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
      })
      .eq('id', authData.user.id);
      
    if (profileError) {
      console.error("Profile update error during signup:", profileError);
      // We don't fail the complete signup flow if only profile update fails, but we could.
    }
  }

  // Ensure layouts refresh with new auth state
  revalidatePath('/', 'layout')
  redirect('/')
}

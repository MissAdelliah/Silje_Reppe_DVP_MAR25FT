import { supabase } from '../supabase.js';

export async function register(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

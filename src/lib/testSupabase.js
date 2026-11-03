import { supabase } from './supabaseClient'

async function testConnection() {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.log('Supabase response:', error.message)
  } else {
    console.log('Supabase connected successfully!', data)
  }
}

testConnection()
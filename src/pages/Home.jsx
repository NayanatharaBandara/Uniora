
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function Home() {

  useEffect(() => {
    async function testConnection() {

      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        console.error('Supabase connection test failed:', error.message)
      } else {
        console.log('SUCCESS! UNIORA is connected to Supabase.')
        console.log('Products from database:', data)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="module-page">
      <h1>Welcome to UNIORA</h1>
      <p>Supabase connection testing...</p>
    </div>
  )
}

export default Home

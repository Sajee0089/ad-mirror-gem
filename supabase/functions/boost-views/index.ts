import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    const { data: ads, error } = await supabase
      .from('ads')
      .select('id')
      .eq('status', 'approved')

    if (error) throw error
    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify({ boosted: 0 }), { 
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }

    let boosted = 0
    for (const ad of ads) {
      const rand = Math.random()
      let views
      if (rand < 0.6) {
        views = Math.floor(Math.random() * 80) + 20
      } else if (rand < 0.9) {
        views = Math.floor(Math.random() * 200) + 100
      } else {
        views = Math.floor(Math.random() * 200) + 300
      }
      await supabase.rpc('increment_view_count_by', {
        _ad_id: ad.id,
        _count: views
      })
      boosted++
    }

    return new Response(JSON.stringify({ boosted }), { 
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})

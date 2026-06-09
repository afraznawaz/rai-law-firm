import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://utsywqriqdwongxqktpo.supabase.co',
  'sb_secret_56qYb1s3EJ_-wtT5X2xEzQ_WxWHqRIa'
)

async function main() {
  // Add cover_image column
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;'
  })
  
  if (error && !error.message?.includes('already exists')) {
    console.log('Error:', error)
    // Try direct approach
    const { data, err2 } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1)
    console.log('Table exists:', !!data, err2)
  }
  
  console.log('Done')
}

main()

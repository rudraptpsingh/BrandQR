import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  destinationUrl: string;
  qrCodeId?: string;
  userId?: string;
  qrContent?: string;
  qrType?: string;
  qrColor?: string;
  logoData?: string;
  title?: string;
}

// Generate cryptographically secure random slug using Web Crypto API
function generateSecureSlug(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars[randomValues[i] % chars.length];
  }
  return slug;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { destinationUrl, qrCodeId, userId, qrContent, qrType, qrColor, logoData, title }: RequestBody = await req.json();

    if (!destinationUrl) {
      return new Response(
        JSON.stringify({ error: 'destinationUrl is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate unique slug with collision prevention (max 5 attempts)
    let slug = '';
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      slug = generateSecureSlug(8);
      
      // Check for collision using indexed query
      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_url_slug', slug)
        .maybeSingle();
      
      if (!existing) {
        break; // Unique slug found
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique slug after maximum attempts' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert or update QR code with the slug
    if (qrCodeId) {
      // Update existing QR code
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({
          short_url_slug: slug,
          is_dynamic: true,
          destination_url: destinationUrl,
        })
        .eq('id', qrCodeId);

      if (updateError) throw updateError;
    } else {
      // Create new QR code
      const { data: newQRCode, error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          short_url_slug: slug,
          is_dynamic: true,
          destination_url: destinationUrl,
          user_id: userId || null,
          qr_content: qrContent || '',
          qr_type: qrType || 'url',
          qr_color: qrColor || '#000000',
          logo_data: logoData || '',
          title: title || '',
          slug: slug, // Also set the slug field for backwards compatibility
        })
        .select()
        .single();

      if (insertError) throw insertError;
    }

    // Return the short URL
    const shortUrl = `https://brandqr.io/${slug}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        slug,
        shortUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating short URL:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

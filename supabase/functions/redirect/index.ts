import { createClient } from 'npm:@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Extract IP address from request
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Parse user agent for device/browser info
function parseUserAgent(userAgent: string): { device: string; browser: string } {
  const ua = userAgent.toLowerCase();
  
  let device = 'Desktop';
  if (/(mobile|android|iphone|ipad|ipod)/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet/i.test(ua)) {
    device = 'Tablet';
  }
  
  let browser = 'Other';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';
  
  return { device, browser };
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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract slug from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === 'redirect') {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing slug' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Look up the QR code by slug using indexed query
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, destination_url, is_dynamic')
      .eq('short_url_slug', slug)
      .maybeSingle();

    if (fetchError || !qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract analytics data
    const ipAddress = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    const { device, browser } = parseUserAgent(userAgent);

    // Log the scan event asynchronously (non-blocking)
    // Using setTimeout to ensure redirect happens immediately
    setTimeout(async () => {
      try {
        await supabase
          .from('scan_analytics')
          .insert({
            qr_code_id: qrCode.id,
            short_url_slug: slug,
            ip_address: ipAddress,
            user_agent: `${device} - ${browser}`,
            referer,
            country: '', // Can be enhanced with IP geolocation service
            city: '',
          });
      } catch (logError) {
        console.error('Failed to log scan event:', logError);
      }
    }, 0);

    // Also increment the scan_count on qr_codes table
    setTimeout(async () => {
      try {
        await supabase.rpc('increment_scan_count', { qr_id: qrCode.id });
      } catch (countError) {
        console.error('Failed to increment scan count:', countError);
      }
    }, 0);

    // Perform HTTP 302 redirect (no caching)
    const destinationUrl = qrCode.destination_url || 'https://brandqr.io';
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': destinationUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in redirect function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

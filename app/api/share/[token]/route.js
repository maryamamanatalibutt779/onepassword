import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabaseWithAuth';
import { decryptPassword } from '@/lib/encryption';

// GET /api/share/[token] — Fetch shared password details
export async function GET(request, { params }) {
  try {
    const { token } = await params;

    // Use the service client to bypass RLS, because the viewer is unauthenticated
    const supabase = createServiceClient();

    // 1. Fetch the share link details
    const { data: shareData, error: shareError } = await supabase
      .from('shared_links')
      .select('*, password:passwords(site_name, site_url, username, encrypted_password, iv)')
      .eq('token', token)
      .single();

    if (shareError || !shareData) {
      return NextResponse.json({ error: 'Link not found or invalid.' }, { status: 404 });
    }

    // 2. Check if expired
    const now = new Date();
    const expiresAt = new Date(shareData.expires_at);
    if (now > expiresAt || shareData.view_count >= shareData.max_views) {
      // It's expired, we could delete it, but let's just return 410 Gone
      return NextResponse.json({ error: 'This share link has expired.' }, { status: 410 });
    }

    // 3. Increment view count
    await supabase
      .from('shared_links')
      .update({ view_count: shareData.view_count + 1 })
      .eq('id', shareData.id);

    // 4. Decrypt password
    const passwordData = shareData.password;
    const decryptedPassword = decryptPassword(passwordData.encrypted_password, passwordData.iv);

    // 5. Return safe data to the client
    return NextResponse.json({
      site_name: passwordData.site_name,
      site_url: passwordData.site_url,
      username: passwordData.username,
      password: decryptedPassword,
      expires_at: shareData.expires_at,
      views_remaining: shareData.max_views - shareData.view_count - 1
    }, { status: 200 });

  } catch (err) {
    console.error('Fetch share link error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the shared password.' },
      { status: 500 }
    );
  }
}

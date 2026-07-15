import { NextResponse } from 'next/server';
import { createAuthedClient, getTokenFromRequest } from '@/lib/supabaseWithAuth';

// POST /api/passwords/[id]/share — Create a share link for a password
export async function POST(request, { params }) {
  try {
    const { id } = await params; // Password ID
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    // Insert a new share link. RLS will ensure user owns the password because of foreign key / logic,
    // actually, let's verify ownership implicitly: if RLS allows inserting, it must match user_id.
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        password_id: id,
        user_id: user.id,
      })
      .select('token, expires_at')
      .single();

    if (error) {
      console.error('Error creating share link:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Share link created successfully.',
      token: data.token,
      expires_at: data.expires_at
    }, { status: 201 });

  } catch (err) {
    console.error('Create share link error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the share link.' },
      { status: 500 }
    );
  }
}

// DELETE /api/passwords/[id]/share — Revoke all share links for a password
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);

    const { error } = await supabase
      .from('shared_links')
      .delete()
      .eq('password_id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke share links.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Share links revoked successfully.' }, { status: 200 });

  } catch (err) {
    console.error('Revoke share links error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while revoking the share links.' },
      { status: 500 }
    );
  }
}

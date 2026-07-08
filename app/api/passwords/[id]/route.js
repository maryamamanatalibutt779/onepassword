import { NextResponse } from 'next/server';
import { createAuthedClient, getTokenFromRequest } from '@/lib/supabaseWithAuth';
import { encryptPassword, decryptPassword } from '@/lib/encryption';

// GET /api/passwords/[id] — fetch a single password entry
export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);
    const { id } = await params; // params is a Promise in Next.js 15+

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Password entry not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        password: {
          id: data.id,
          site_name: data.site_name,
          site_url: data.site_url,
          username: data.username,
          password: decryptPassword(data.encrypted_password, data.iv),
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Fetch password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the password.' },
      { status: 500 }
    );
  }
}

// PUT /api/passwords/[id] — update an existing password entry
export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);
    const { id } = await params; // params is a Promise in Next.js 15+

    const { site_name, site_url, username, password } = await request.json();

    if (!site_name && !username && !password) {
      return NextResponse.json(
        { error: 'Provide at least one field to update.' },
        { status: 400 }
      );
    }

    // Only include fields that were actually provided
    const updates = {};
    if (site_name) updates.site_name = site_name;
    if (site_url !== undefined) updates.site_url = site_url;
    if (username) updates.username = username;
    if (password) {
      const { encryptedPassword, iv } = encryptPassword(password);
      updates.encrypted_password = encryptedPassword;
      updates.iv = iv;
    }

    const { data, error } = await supabase
      .from('passwords')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Password updated successfully.',
        password: {
          id: data.id,
          site_name: data.site_name,
          site_url: data.site_url,
          username: data.username,
          updated_at: data.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Update password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the password.' },
      { status: 500 }
    );
  }
}

// DELETE /api/passwords/[id] — delete a password entry
export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);
    const { id } = await params; // params is a Promise in Next.js 15+

    const { error } = await supabase.from('passwords').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Password deleted successfully.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Delete password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the password.' },
      { status: 500 }
    );
  }
}
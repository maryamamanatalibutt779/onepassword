import { NextResponse } from 'next/server';
import { createAuthedClient, getTokenFromRequest } from '@/lib/supabaseWithAuth';
import { encryptPassword, decryptPassword } from '@/lib/encryption';

// GET /api/passwords — list all saved passwords for the logged-in user
export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabase = createAuthedClient(token);

    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Decrypt each password before sending it back to the client
    const decrypted = data.map((entry) => ({
      id: entry.id,
      site_name: entry.site_name,
      site_url: entry.site_url,
      username: entry.username,
      password: decryptPassword(entry.encrypted_password, entry.iv),
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    }));

    return NextResponse.json({ passwords: decrypted }, { status: 200 });
  } catch (err) {
    console.error('Fetch passwords error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching passwords.' },
      { status: 500 }
    );
  }
}

// POST /api/passwords — create a new password entry
export async function POST(request) {
  try {
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

    const { site_name, site_url, username, password } = await request.json();

    if (!site_name || !username || !password) {
      return NextResponse.json(
        { error: 'site_name, username, and password are required.' },
        { status: 400 }
      );
    }

    const { encryptedPassword, iv } = encryptPassword(password);

    const { data, error } = await supabase
      .from('passwords')
      .insert({
        user_id: user.id,
        site_name,
        site_url: site_url || null,
        username,
        encrypted_password: encryptedPassword,
        iv,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Password saved successfully.',
        password: {
          id: data.id,
          site_name: data.site_name,
          site_url: data.site_url,
          username: data.username,
          created_at: data.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the password.' },
      { status: 500 }
    );
  }
}
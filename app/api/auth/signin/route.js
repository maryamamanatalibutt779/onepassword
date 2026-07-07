import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Server-side validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Call Supabase signin API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Login successful!',
        user: data.user,
        session: data.session
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Signin error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during signin.' },
      { status: 500 }
    );
  }
}

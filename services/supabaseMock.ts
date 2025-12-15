// ... (todo lo anterior igual hasta loginMock)

export const loginMock = async (password: string, email?: string): Promise<boolean> => {
  if (!email) {
     console.error("Email required for login");
     return false;
  }
  
  try {
    console.log('📤 [loginMock] Calling auth backend...');
    
    const response = await fetch('/.netlify/functions/auth-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login failed:', errorData.error);
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Login error:', data.error);
      return false;
    }

    // IMPORTANTE: Guardar token en localStorage
    if (data.session?.access_token) {
      localStorage.setItem('supabase_auth_token', data.session.access_token);
      console.log('✅ Token guardado');
    }

    console.log('✅ Login successful');
    return true;
  } catch (err) {
    console.error("❌ Login exception:", err);
    return false;
  }
};

export const checkAuth = async (): Promise<boolean> => {
  // Primero check localStorage
  const token = localStorage.getItem('supabase_auth_token');
  if (token) {
    console.log('✅ Token encontrado en localStorage');
    return true;
  }

  // Si no hay token, check sesión de Supabase
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const logoutMock = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('supabase_auth_token');
};

// ... (resto del archivo igual)

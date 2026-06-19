import { state } from '../state.js';

let supabase = null;

export function setupAuth() {
  const overlay = document.getElementById('auth-overlay');
  const form = document.getElementById('auth-form');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const nameInput = document.getElementById('auth-name');
  const phoneInput = document.getElementById('auth-phone');
  const submitBtn = document.getElementById('btn-auth-submit');
  const toggleBtn = document.getElementById('btn-auth-toggle');
  const subtitle = document.getElementById('auth-subtitle');
  const toggleText = document.getElementById('auth-toggle-text');
  const signOutBtn = document.getElementById('btn-sign-out');

  if (!overlay || !form || !emailInput || !passwordInput || !toggleBtn) {
    console.error('Auth DOM elements missing!');
    return;
  }

  // Initialize Supabase Client dynamically once env values are loaded
  if (window.supabase && state.supabaseUrl && state.supabaseAnonKey) {
    supabase = window.supabase.createClient(state.supabaseUrl, state.supabaseAnonKey);
  } else {
    console.error('Supabase SDK CDN or Environment config variables missing!');
    return;
  }

  let mode = 'signin'; // 'signin' or 'signup'

  // Toggle Mode Handler
  toggleBtn.addEventListener('click', () => {
    const signupFields = document.querySelectorAll('.signup-only');
    if (mode === 'signin') {
      mode = 'signup';
      subtitle.innerText = 'Register a new context developer identity';
      submitBtn.innerText = 'Create Developer Identity';
      toggleText.innerText = 'Already have an identity?';
      toggleBtn.innerText = 'Sign In';
      signupFields.forEach(field => field.classList.remove('hidden'));
      if (nameInput) nameInput.required = true;
    } else {
      mode = 'signin';
      subtitle.innerText = 'Sign in to initialize context engine';
      submitBtn.innerText = 'Access Context Engine';
      toggleText.innerText = 'Need an account?';
      toggleBtn.innerText = 'Sign Up';
      signupFields.forEach(field => field.classList.add('hidden'));
      if (nameInput) nameInput.required = false;
    }
  });

  // Handle Form Submission (Sign In / Sign Up)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (mode === 'signup' && !name) {
      alert('Please enter your name.');
      return;
    }

    if (!email || password.length < 6) {
      alert('Please enter a valid email and a password of at least 6 characters.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = mode === 'signin' ? 'Authenticating...' : 'Registering...';

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              full_name: name,
              phone: phone
            }
          }
        });
        if (error) throw error;
        alert('Verification email sent! Please check your inbox.');
        // Auto switch back to signin
        toggleBtn.click();
      }
    } catch (err) {
      console.error('Authentication process failed:', err);
      if (mode === 'signin') {
        const confirmSignup = confirm(`Authentication Error: ${err.message}\n\nAre you a new user? Click OK to switch to the registration screen.`);
        if (confirmSignup) {
          toggleBtn.click();
        }
      } else {
        alert(`Authentication Error: ${err.message}`);
      }
    } finally {
      // Keep inputs intact on error; only re‑enable button
      submitBtn.disabled = false;
      submitBtn.innerText = mode === 'signin' ? 'Access Context Engine' : 'Create Developer Identity';
    }
  });

  // Sign Out Handler
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out and lock the Neural Engine context?')) {
        try {
          await supabase.auth.signOut();
          // Clear active histories upon sign out for security
          state.user = null;
          state.session = null;
          state.documents = [];
          state.chatHistoryDirect = [];
          state.chatHistoryRag = [];
          localStorage.removeItem('aether_rag_docs');
          localStorage.removeItem('aether_chat_direct');
          localStorage.removeItem('aether_chat_rag');
          
          window.location.reload();
        } catch (err) {
          console.error('Sign Out Error:', err);
        }
      }
    });
  }

  // Observe Auth Session changes in real-time
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      state.session = session;
      state.user = session.user;
      overlay.classList.add('hidden');
      console.log('Session initialized for user:', session.user.email);
    } else {
      state.session = null;
      state.user = null;
      overlay.classList.remove('hidden');
      console.log('No active session found, locking user screen.');
    }
  });
}

// Jolly Kids Maison — auth.js
// Handles signup + login, with client-side salted SHA-256 password hashing.
// NOTE: hashing on the client protects the password in transit/at rest in the
// Sheet, but for production-grade security consider a real auth provider
// (Firebase Auth / Supabase Auth) instead of hand-rolled hashing over Apps Script.

const AUTH = {
  async sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Per-app static salt (pepper). Combined with a per-user random salt generated at signup.
  APP_PEPPER: 'jolly-kids-maison-v1',

  randomSalt(len = 16) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async hashPassword(password, salt) {
    return this.sha256Hex(`${salt}:${this.APP_PEPPER}:${password}`);
  },

  setSession(parent) {
    sessionStorage.setItem('jkm_parent', JSON.stringify(parent));
  },
  getSession() {
    const raw = sessionStorage.getItem('jkm_parent');
    return raw ? JSON.parse(raw) : null;
  },
  clearSession() {
    sessionStorage.removeItem('jkm_parent');
  },
  requireSession(redirectTo = 'login.html') {
    const p = this.getSession();
    if (!p) window.location.href = redirectTo;
    return p;
  },

  async callApi(action, payload) {
    const res = await fetch(APP_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) throw new Error('Network error, please try again.');
    return res.json();
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('form-error');
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      errorEl.classList.add('hidden');

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.remove('hidden');
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters.';
        errorEl.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account…';
      try {
        const salt = AUTH.randomSalt();
        const passwordHash = await AUTH.hashPassword(password, salt);
        const result = await AUTH.callApi('signup', { fullName, phone, salt, passwordHash });
        if (result.success) {
          AUTH.setSession(result.parent);
          window.location.href = 'dashboard.html';
        } else {
          errorEl.textContent = result.message || 'Could not create account.';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('form-error');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      errorEl.classList.add('hidden');

      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in…';
      try {
        // Step 1: fetch this parent's salt
        const saltRes = await AUTH.callApi('getSalt', { phone });
        if (!saltRes.success) {
          errorEl.textContent = 'Invalid phone number or password.';
          errorEl.classList.remove('hidden');
          return;
        }
        const passwordHash = await AUTH.hashPassword(password, saltRes.salt);
        const result = await AUTH.callApi('login', { phone, passwordHash });
        if (result.success) {
          AUTH.setSession(result.parent);
          window.location.href = 'dashboard.html';
        } else {
          errorEl.textContent = 'Invalid phone number or password.';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
      }
    });
  }
});

// Jolly Kids Maison — dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
  const parent = AUTH.requireSession();
  if (!parent) return;

  document.getElementById('welcome-name').textContent = parent.fullName || 'Parent';
  const nameInput = document.getElementById('profileFullName');
  const phoneInput = document.getElementById('profilePhone');
  if (nameInput) nameInput.value = parent.fullName || '';
  if (phoneInput) phoneInput.value = parent.phone || '';

  // Logout
  ['logout-btn', 'logout-btn-mobile'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      AUTH.clearSession();
      window.location.href = 'login.html';
    });
  });

  // Load children
  const listEl = document.getElementById('children-list');
  try {
    const result = await AUTH.callApi('getChildren', { parentId: parent.parentId });
    if (result.success && result.children.length) {
      listEl.innerHTML = result.children.map((c) => `
        <div class="child-card">
          <p class="font-semibold text-lg">${c.fullName}</p>
          <p class="text-xs text-inksoft mb-2">${c.age ? c.age + ' yrs · ' : ''}${c.sex ? c.sex + ' · ' : ''}${c.serviceType || 'Daily'}</p>
          <p class="text-xs text-sagedeep font-semibold">Registered ✓</p>
        </div>
      `).join('');
    } else {
      listEl.innerHTML = `
        <div class="child-card sm:col-span-2 text-center py-8">
          <p class="text-sm text-inksoft mb-3">You haven't registered a child yet.</p>
          <a href="register-child.html" class="btn-primary inline-block px-6 py-2.5 rounded-full font-semibold text-sm">Register Your First Child</a>
        </div>`;
    }
  } catch (err) {
    listEl.innerHTML = `<p class="text-sm text-berry">Could not load children right now.</p>`;
  }

  // Update profile
  const profileForm = document.getElementById('profile-form');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('profile-message');
    msg.classList.add('hidden');
    try {
      const result = await AUTH.callApi('updateProfile', {
        parentId: parent.parentId,
        fullName: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
      });
      if (result.success) {
        const updated = { ...parent, fullName: nameInput.value.trim(), phone: phoneInput.value.trim() };
        AUTH.setSession(updated);
        document.getElementById('welcome-name').textContent = updated.fullName;
        msg.textContent = 'Profile updated successfully.';
        msg.className = 'bg-sage/15 text-sagedeep text-sm rounded-lg px-4 py-3';
      } else {
        msg.textContent = result.message || 'Could not update profile.';
        msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
      }
    } catch (err) {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
    }
  });
});

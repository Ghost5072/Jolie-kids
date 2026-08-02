// Jolly Kids Maison — attendance.js
// The daily QR code encodes a link like:
//   https://yourdomain.com/attendance.html?token=TODAYS_TOKEN
// Scanning it with any phone camera opens this page, which verifies the
// token against Settings!todayToken in Google Sheets before showing children.

document.addEventListener('DOMContentLoaded', async () => {
  const parent = AUTH.requireSession();
  if (!parent) return;

  document.getElementById('today-date').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const checkingEl = document.getElementById('token-checking');
  const invalidEl = document.getElementById('token-invalid');
  const panelEl = document.getElementById('attendance-panel');
  const noChildrenEl = document.getElementById('no-children');
  const listEl = document.getElementById('attendance-list');

  if (!token) {
    checkingEl.classList.add('hidden');
    invalidEl.classList.remove('hidden');
    return;
  }

  try {
    // Step 2: verify today's token
    const verify = await AUTH.callApi('verifyToken', { token });
    if (!verify.success || !verify.valid) {
      checkingEl.classList.add('hidden');
      invalidEl.classList.remove('hidden');
      return;
    }

    // Step 3: fetch parent's registered children
    const childrenRes = await AUTH.callApi('getChildren', { parentId: parent.parentId });
    checkingEl.classList.add('hidden');

    if (!childrenRes.success || !childrenRes.children.length) {
      noChildrenEl.classList.remove('hidden');
      return;
    }

    // Step 4: render children, all pre-checked
    listEl.innerHTML = childrenRes.children.map((c) => `
      <label class="attendance-row" data-child-id="${c.childId}">
        <span class="font-semibold">${c.fullName}</span>
        <input type="checkbox" checked>
      </label>
    `).join('');

    listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        cb.closest('.attendance-row').classList.toggle('is-absent', !cb.checked);
      });
    });

    panelEl.classList.remove('hidden');

    // Step 6 & 7: submit attendance
    document.getElementById('submit-attendance').addEventListener('click', async () => {
      const btn = document.getElementById('submit-attendance');
      const msg = document.getElementById('attendance-message');
      btn.disabled = true;
      btn.textContent = 'Submitting…';

      const rows = [...listEl.querySelectorAll('.attendance-row')];
      const attendance = rows.map((row) => ({
        childId: row.dataset.childId,
        present: row.querySelector('input[type="checkbox"]').checked,
      }));

      try {
        const result = await AUTH.callApi('submitAttendance', {
          parentId: parent.parentId,
          token,
          attendance,
        });
        if (result.success) {
          const presentNames = rows
            .filter((row) => row.querySelector('input[type="checkbox"]').checked)
            .map((row) => row.querySelector('span').textContent);
          document.getElementById('success-summary').textContent = presentNames.length
            ? `Checked in: ${presentNames.join(', ')}`
            : 'No children marked present today.';
          panelEl.classList.add('hidden');
          document.getElementById('attendance-success').classList.remove('hidden');
        } else {
          msg.textContent = result.message || 'Could not submit attendance.';
          msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
          msg.classList.remove('hidden');
        }
      } catch (err) {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
        msg.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Attendance';
      }
    });
  } catch (err) {
    checkingEl.classList.add('hidden');
    invalidEl.classList.remove('hidden');
  }
});

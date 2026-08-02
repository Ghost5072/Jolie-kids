// Jolly Kids Maison — register.js

document.addEventListener('DOMContentLoaded', () => {
  const parent = AUTH.requireSession();
  if (!parent) return;

  const form = document.getElementById('register-child-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('form-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    msg.classList.add('hidden');

    const val = (id) => document.getElementById(id).value.trim();

    const payload = {
      parentId: parent.parentId,
      fullName: val('childFullName'),
      dob: val('dob'),
      sex: val('sex'),
      placeOfBirth: val('placeOfBirth'),
      residentialAddress: val('residentialAddress'),
      fatherName: val('fatherName'),
      fatherPhone: val('fatherPhone'),
      fatherOccupation: val('fatherOccupation'),
      motherName: val('motherName'),
      motherPhone: val('motherPhone'),
      motherOccupation: val('motherOccupation'),
      lastImmunization: val('lastImmunization'),
      immunizationDate: val('immunizationDate'),
      allergies: val('allergies'),
      medicalReport: val('medicalReport'),
      medicalDetails: val('medicalDetails'),
      serviceType: val('serviceType'),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering…';
    try {
      const result = await AUTH.callApi('registerChild', payload);
      if (result.success) {
        msg.textContent = `${payload.fullName} has been registered! Redirecting to your dashboard…`;
        msg.className = 'bg-sage/15 text-sagedeep text-sm rounded-lg px-4 py-3';
        msg.classList.remove('hidden');
        setTimeout(() => { window.location.href = 'dashboard.html#my-children'; }, 1400);
      } else {
        msg.textContent = result.message || 'Could not register child. Please try again.';
        msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
        msg.classList.remove('hidden');
      }
    } catch (err) {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.className = 'bg-berry/10 text-berry text-sm rounded-lg px-4 py-3';
      msg.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Child';
    }
  });
});

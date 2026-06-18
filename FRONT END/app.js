document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.getElementById('registrationForm');

  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      // 1. Stop the browser from refreshing the page automatically
      e.preventDefault();

      // 2. Visual Defense: Turn on a loading state so users don't double-tap submit
      const submitBtn = registrationForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.textContent = 'Processing Registration Securely...';
      }

      // 3. Automatically scoop up all form fields (text, select dropdowns, and file uploads)
      const formDataPayload = new FormData(this);

      try {
        // 4. Fire the payload over the local network bridge to your running Express server
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          body: formDataPayload // Browser handles structural headers automatically
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Registration Completed Successfully!');
          
          // Clear any local drafts since the profile is now safe in the database
          localStorage.removeItem('form_draft');
          
          // Forward them over to the dashboard view
          window.location.href = result.redirectUrl;
        } else {
          throw new Error(result.message || 'The server rejected your registration details.');
        }
      } catch (error) {
        alert('Submission Failed: ' + error.message);
        
        // Unlock the submit button if there's an error so the user can fix their inputs
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.textContent = 'Complete Registration';
        }
      }
    });
  }
});
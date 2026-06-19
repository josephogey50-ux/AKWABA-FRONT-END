document.addEventListener('DOMContentLoaded', () => {
  const registrationForm = document.getElementById('registrationForm');
  if (!registrationForm) return;

  registrationForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;

    const setLoading = (loading) => {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.style.opacity = loading ? '0.6' : '1';
      submitBtn.textContent = loading ? 'Processing...' : originalText;
    };

    const showMessage = (msg, isError = false) => {
      const el = document.getElementById('formMessage');
      if (el) { 
        el.textContent = msg; 
        el.className = isError ? 'error' : 'success'; 
      } else {
        // Fallback alert if you haven't added <div id="formMessage"></div> to your HTML yet
        alert(msg);
      }
    };

    setLoading(true);

    const formEntries = Object.fromEntries(new FormData(this).entries());

    // Basic validation
    if (!formEntries.email || !formEntries.password) {
      showMessage('Email and password are required.', true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      // FIXED: Added full absolute local URL path to map straight to your running Express backend port
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEntries),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await response.json().catch(() => ({ message: 'Invalid server response' }));

      if (!response.ok) throw new Error(result.message || `Error ${response.status}`);

      localStorage.removeItem('form_draft');
      showMessage('Registration successful! Redirecting...');
      
      // Delay redirection slightly so the user can read the success message
      setTimeout(() => {
        window.location.href = result.redirectUrl || '/';
      }, 1500);

    } catch (error) {
      const msg = error.name === 'AbortError' ? 'Request timed out. Please try again.' : error.message;
      showMessage(msg, true);
      setLoading(false);
    }
  });
});
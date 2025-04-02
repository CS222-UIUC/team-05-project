document.addEventListener('DOMContentLoaded', () => {
    // Registration Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = {
                username: document.getElementById('regUsername').value,
                password: document.getElementById('regPassword').value
            };

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });

                const data = await response.json();
                
                if (response.ok) {
                    alert('Registration successful! Please login');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                alert('Error connecting to server');
            }
        });
    }
});
// login.js
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const username = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
  
    try {
      const response = await fetch('http://localhost:5000/api/login', {  /
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Giriş başarılı!');
        localStorage.setItem('token', result.token); 
        window.location.href = 'index.html';         
      } else {
        alert('Hata: ' + result.message);            
      }
    } catch (error) {
      alert('Sunucu hatası: ' + error.message);      
      console.error(error);
    }
  });
  
document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const loginBtn = document.getElementById('login-btn');
  const openWebappBtn = document.getElementById('open-webapp');
  const statsDiv = document.getElementById('stats');
  
  checkAuthStatus();
  
  loginBtn.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ action: 'getAuthToken' }, (response) => {
      if (response.success) {
        checkAuthStatus();
      } else {
        console.error('Login failed:', response.error);
      }
    });
  });
  
  openWebappBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://your-project-id.web.app' });
  });
  
  async function checkAuthStatus() {
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
      if (token) {
        statusDiv.textContent = 'ログイン済み';
        statusDiv.className = 'status connected';
        loginBtn.style.display = 'none';
        statsDiv.style.display = 'block';
        
        await loadStats(token);
      } else {
        statusDiv.textContent = '未ログイン';
        statusDiv.className = 'status disconnected';
        loginBtn.style.display = 'block';
        statsDiv.style.display = 'none';
      }
    });
  }
  
  async function loadStats(token) {
    try {
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await userInfo.json();
      const userId = userData.id;
      
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/users/${userId}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const items = data.documents || [];
        
        document.getElementById('item-count').textContent = items.length;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthItems = items.filter(item => {
          const purchaseDate = new Date(item.fields.purchaseDate.timestampValue);
          return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
        });
        
        document.getElementById('month-count').textContent = monthItems.length;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }
});
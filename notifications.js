document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const desktopThemeSwitcher = document.getElementById('theme-switcher-desktop');
  const mobileThemeSwitcher = document.getElementById('theme-switcher-mobile');
  const desktopThemeIcon = document.getElementById('theme-icon-desktop');
  const mobileThemeIcon = document.getElementById('theme-icon-mobile');
  const loader = document.getElementById('loader');
  const notificationList = document.getElementById('notification-list');
  
  // Cache duration: 24 hours in milliseconds
  const cacheDuration = 24 * 60 * 60 * 1000; 
  const now = Date.now();

  // Load user theme preference from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
    updateThemeIcon(); // Update icons on load
  }

  // Function to update theme icons
  function updateThemeIcon() {
    const isDarkMode = body.classList.contains('dark-mode');
    const themeIconSrc = isDarkMode ? 'icon/active-moon.svg' : 'icon/active-sun.svg';

    if (desktopThemeIcon) desktopThemeIcon.src = themeIconSrc;
    if (mobileThemeIcon) mobileThemeIcon.src = themeIconSrc;
  }

  // Toggle theme on click for both desktop and mobile
  function toggleTheme() {
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon(); 
  }

  // Add event listeners for both desktop and mobile theme switchers
  if (desktopThemeSwitcher) {
    desktopThemeSwitcher.addEventListener('click', toggleTheme);
  }
  if (mobileThemeSwitcher) {
    mobileThemeSwitcher.addEventListener('click', toggleTheme);
  }

  // Fetch notifications data
  function fetchNotificationsData() {
    loader.style.display = 'block';

    fetch('https://script.google.com/macros/s/AKfycbza0GztWt1HjPv8g8FJ0GROuyd_0DZy9qRkZbFiZ11XiKHYRj9TD0nMQrVbROgYP2FkbQ/exec')
      .then(response => response.json())
      .then(data => {
        loader.style.display = 'none';
        localStorage.setItem('notificationsData', JSON.stringify(data.data)); // Cache the data
        localStorage.setItem('notificationsTimestamp', Date.now()); // Cache the timestamp
        renderNotifications(data.data); // Render notifications
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
        loader.style.display = 'none'; // Hide loader in case of error
      });
  }

  // Function to render notifications
  function renderNotifications(notifications) {
    notificationList.innerHTML = ''; // Clear previous entries

    notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = 'notification-item';

      notificationItem.innerHTML = `
        <p class="notification-date">${notification.Date}</p>
        <p class="notification-info">${notification.UpdateInfo}</p>
      `;

      // Append the notification to the list
      notificationList.appendChild(notificationItem);
    });

    // If no notifications are available
    if (notifications.length === 0) {
      notificationList.innerHTML = '<p>No notifications at this time.</p>';
    }
  }

  // Check if cached notifications exist and are still valid
  const cachedNotifications = JSON.parse(localStorage.getItem('notificationsData'));
  const notificationsCacheTimestamp = localStorage.getItem('notificationsTimestamp');

  if (cachedNotifications && notificationsCacheTimestamp && (now - notificationsCacheTimestamp < cacheDuration)) {
    // Use cached data if within 24 hours
    renderNotifications(cachedNotifications);
  } else {
    // Fetch new data if cache is expired or doesn't exist
    fetchNotificationsData();
  }
});

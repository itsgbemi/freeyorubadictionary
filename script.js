document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const desktopThemeSwitcher = document.getElementById('theme-switcher-desktop');
  const mobileThemeSwitcher = document.getElementById('theme-switcher-mobile');
  const desktopThemeIcon = document.getElementById('theme-icon-desktop');
  const mobileThemeIcon = document.getElementById('theme-icon-mobile');
  const loader = document.getElementById('loader');
  const dictionaryContainer = document.getElementById('dictionary');
  const searchInput = document.getElementById('search-input');
  const noResultsMessage = document.getElementById('no-results-message');

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

  // Fetch dictionary data
  function fetchDictionaryData() {
    loader.style.display = 'block';

    fetch('https://script.google.com/macros/s/AKfycbxWzRazn4djmSidBKYs5e_LH2tc3rauUEQfwyMPXINnfd0m_Y5s0JivWZRf2N7qHOAg/exec')
      .then(response => response.json())
      .then(data => {
        loader.style.display = 'none';
        localStorage.setItem('dictionaryData', JSON.stringify(data.data)); // Cache the data
        localStorage.setItem('dictionaryTimestamp', Date.now()); // Cache the timestamp
        renderDictionary(data.data); // Render dictionary
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        loader.style.display = 'none'; // Hide loader in case of error
      });
  }

  // Function to render dictionary entries
  function renderDictionary(entries) {
    dictionaryContainer.innerHTML = ''; // Clear previous entries
    noResultsMessage.style.display = 'none'; // Hide the no results message initially

    entries.forEach(entry => {
      const wordEntry = document.createElement('div');
      wordEntry.className = 'word-entry';
      wordEntry.setAttribute('data-audio', entry.Audio);

      wordEntry.innerHTML = `
        <div class="play-icon">
          <img src="icon/play.svg" alt="Play Icon" class="play-button">
        </div>
        <div>
          <strong class="word">${entry.Word}</strong> <span class="phonetics">/${entry.Phonetics}/</span>
          <p class="definition">${entry.Meaning}</p>
        </div>
      `;

      dictionaryContainer.appendChild(wordEntry);

      // Add event listener for the play button to play audio
      const playButton = wordEntry.querySelector('.play-icon');
      playButton.addEventListener('click', () => {
        const audio = new Audio(entry.Audio);
        audio.play().catch(error => {
          console.error('Audio playback failed:', error);
        });
      });
    });

    // If no entries are found, show the no results message
    if (entries.length === 0) {
      showNoResultsMessage();
    }
  }

  // Function to show no results message
  function showNoResultsMessage() {
    noResultsMessage.style.display = 'block'; 
  }

  // Check if cached data exists and is still valid
  const cachedData = JSON.parse(localStorage.getItem('dictionaryData'));
  const cacheTimestamp = localStorage.getItem('dictionaryTimestamp');

  if (cachedData && cacheTimestamp && (now - cacheTimestamp < cacheDuration)) {
    // Use cached data if within 24 hours
    renderDictionary(cachedData);
  } else {
    // Fetch new data if cache is expired or doesn't exist
    fetchDictionaryData();
  }

  // Search functionality
  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const cachedData = JSON.parse(localStorage.getItem('dictionaryData'));
    if (cachedData) {
      const filteredEntries = cachedData.filter(entry => 
        entry.Word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm) || 
        entry.Meaning.toLowerCase().includes(searchTerm) // Also search in meaning
      );
      renderDictionary(filteredEntries);
    }
  });
});

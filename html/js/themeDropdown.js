// Custom theme dropdown for full theming (open and closed)
// Requires: a <div id="custom-theme-dropdown"></div> in your header
// and 14 theme options as in your previous select

// Initialize theme from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('themeColor') || 'original';
  if (typeof applyTheme === 'function') {
    console.log('[Theme] Applying saved theme:', savedTheme);
    applyTheme(savedTheme);
  }
});

const themeNames = [
  { value: 'original', label: 'Original' },
  { value: 'default', label: 'Default' },
  { value: 'oceanic', label: 'Oceanic' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'forest', label: 'Forest' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'neon', label: 'Neon' },
  { value: 'cyber', label: 'Cyber' },
  { value: 'carbon', label: 'Carbon' },
  { value: 'vaporwave', label: 'Vaporwave' },
  { value: 'inferno', label: 'Inferno' },
  { value: 'dark', label: 'Dark' },
  { value: 'red', label: 'Red' },
  { value: 'light', label: 'Light' }
];

function createThemeDropdown(selected) {
  // Helper to apply theme styles to the button
  function themeButtonStyles(btn) {
    if (!btn) return;
    const root = getComputedStyle(document.documentElement);
    btn.style.background = root.getPropertyValue('--dark-card') || '#222';
    btn.style.color = root.getPropertyValue('--text-color') || '#fff';
    btn.style.borderColor = root.getPropertyValue('--border-color') || '#999';
  }
  const container = document.getElementById('custom-theme-dropdown');
  if (!container) return;

  // Enable: Add dropdown logic for the static .audio-controls markup
  const audioControls = container.querySelector('.audio-controls');
  if (!audioControls) return;
  const audioButtons = audioControls.querySelector('.audio-buttons');
  if (!audioButtons) return;

  // Remove any existing dropdown
  let dropdown = audioControls.querySelector('.theme-dropdown-list');
  if (dropdown) dropdown.remove();
  
  // Load the saved theme from localStorage, default to 'original' if not found
  const savedTheme = localStorage.getItem('themeColor') || 'original';
  // Apply the saved theme on page load
  if (typeof applyTheme === 'function') applyTheme(savedTheme);
  
  // Find the selected theme's label to display in the dropdown
  const savedThemeLabel = themeNames.find(t => t.value === savedTheme)?.label || 'Theme';
  audioButtons.querySelector('span').textContent = savedThemeLabel;

  // State
  let isOpen = false;

  // Create dropdown list (hidden by default)
  dropdown = document.createElement('ul');
  dropdown.className = 'theme-dropdown-list';
  dropdown.setAttribute('role', 'listbox');
  dropdown.style.display = 'none';
  dropdown.style.position = 'absolute';
  dropdown.style.top = '100%';
  dropdown.style.left = '0';
  dropdown.style.right = '0';
  dropdown.style.zIndex = '100';

  // Add theme options
  themeNames.forEach(({ value, label }) => {
    const li = document.createElement('li');
    li.className = 'theme-dropdown-option';
    li.setAttribute('role', 'option');
    li.dataset.value = value;
    li.textContent = label;
    li.style.cursor = 'pointer';
    li.addEventListener('click', e => {
      e.stopPropagation();
      if (typeof applyTheme === 'function') applyTheme(value);
      // Save the selected theme to localStorage
      localStorage.setItem('themeColor', value);
      // Update display text
      audioButtons.querySelector('span').textContent = label;
      dropdown.style.display = 'none';
      isOpen = false;
    });
    dropdown.appendChild(li);
  });
  audioControls.style.position = 'relative';
  audioControls.appendChild(dropdown);

  // Toggle dropdown on click
  audioButtons.addEventListener('click', e => {
    e.stopPropagation();
    isOpen = !isOpen;
    dropdown.style.display = isOpen ? 'block' : 'none';
  });
  // Keyboard accessibility
  audioButtons.setAttribute('tabindex', '0');
  audioButtons.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      audioButtons.click();
    }
  });
  // Close dropdown when clicking outside
  document.addEventListener('click', e => {
    if (!audioControls.contains(e.target)) {
      dropdown.style.display = 'none';
      isOpen = false;
    }
  });
}

// --- THEME SYSTEM ---

// Theme definitions: add/edit as needed
const themeConfigs = {
  original: {
    '--dark-card': '#181b24',
    '--border-color': '#232737',
    '--text-color': '#ffffff',
    '--accent-color': '#00b0ff',
    '--primary-color': '#4ea0d9',
    '--primary-color-rgb': '78, 160, 217',
    '--accent-color-rgb': '0, 176, 255',
    '--secondary-accent': '#06a8fa',
    '--progress-bar-color': '#4ea0d9',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
    '--cursor-color': '#00b0ff',
    '--tab-active': '#222b3a',
    '--text-secondary': '#e8f5ff',
    '--theme-success': '#2ecc71',
    '--theme-warning': '#ffe066',
    '--theme-danger': '#ff6f61',
    '--theme-gold': '#ffd700',
  },
  dark: {
    '--dark-card': '#121820',
    '--border-color': '#1e2a3a',
    '--text-color': '#f0f5fa',
    '--accent-color': '#0095e0',
    '--primary-color': '#3a7db7',
    '--primary-color-rgb': '58, 125, 183',
    '--accent-color-rgb': '0, 149, 224',
    '--secondary-accent': '#2c8fca',
    '--progress-bar-color': '#0095e0',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
    '--cursor-color': '#0095e0',
    '--tab-active': '#1a2635',
    '--text-secondary': '#a3cef1',
    '--theme-success': '#36b37e',
    '--theme-warning': '#ffab00',
    '--theme-danger': '#ff5252',
    '--theme-gold': '#ffd700',
  },
  light: {
    '--dark-card': '#f8f9fa',
    '--border-color': '#d0d7de',
    '--text-color': '#24292f',
    '--accent-color': '#0969da',
    '--primary-color': '#4e92d9',
    '--primary-color-rgb': '78, 146, 217',
    '--accent-color-rgb': '9, 105, 218',
    '--secondary-accent': '#1f6feb',
    '--progress-bar-color': '#0969da',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)',
    '--cursor-color': '#0969da',
    '--tab-active': '#eaeef2',
    '--text-secondary': '#57606a',
    '--theme-success': '#2da44e',
    '--theme-warning': '#bf8700',
    '--theme-danger': '#cf222e',
    '--theme-gold': '#f1c21b',
  },
  default: {
    '--dark-card': '#2e3440',
    '--border-color': '#434c5e',
    '--text-color': '#eceff4',
    '--accent-color': '#88c0d0',
    '--primary-color': '#5e81ac',
    '--primary-color-rgb': '94, 129, 172',
    '--accent-color-rgb': '136, 192, 208',
    '--secondary-accent': '#81a1c1',
    '--progress-bar-color': '#88c0d0',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.19), transparent)',
    '--cursor-color': '#88c0d0',
    '--tab-active': '#3b4252',
    '--text-secondary': '#d8dee9',
    '--theme-success': '#a3be8c',
    '--theme-warning': '#ebcb8b',
    '--theme-danger': '#bf616a',
    '--theme-gold': '#d08770',
  },
  oceanic: {
    '--dark-card': '#1b263b',
    '--border-color': '#415a77',
    '--text-color': '#e0fbfc',
    '--accent-color': '#00eaff',
    '--primary-color': '#4ea0d9',
    '--primary-color-rgb': '78, 160, 217',
    '--accent-color-rgb': '0, 234, 255',
    '--secondary-accent': '#06a8fa',
    '--progress-bar-color': '#00eaff',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
    '--cursor-color': '#00eaff',
    '--tab-active': '#415a77',
    '--text-secondary': '#98c1d9',
    '--theme-success': '#57cc99',
    '--theme-warning': '#ffdd80',
    '--theme-danger': '#ff7e67',
    '--theme-gold': '#ffd700',
  },
  sunset: {
    '--dark-card': '#2d1b2f',
    '--border-color': '#a44a3f',
    '--text-color': '#ffd6ba',
    '--accent-color': '#ff784f',
    '--primary-color': '#ff784f',
    '--primary-color-rgb': '255, 120, 79',
    '--accent-color-rgb': '255, 120, 79',
    '--secondary-accent': '#ffb677',
    '--progress-bar-color': '#ff784f',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
    '--cursor-color': '#ff784f',
    '--tab-active': '#a44a3f',
    '--text-secondary': '#ffa577',
    '--theme-success': '#ff9f1c',
    '--theme-warning': '#ffdd80',
    '--theme-danger': '#ff5a5f',
    '--theme-gold': '#ffc857',
  },
  forest: {
    '--dark-card': '#1b2e20',
    '--border-color': '#3a5a40',
    '--text-color': '#ecf39e',
    '--accent-color': '#70e000',
    '--primary-color': '#38b000',
    '--primary-color-rgb': '56, 176, 0',
    '--accent-color-rgb': '112, 224, 0',
    '--secondary-accent': '#70e000',
    '--progress-bar-color': '#70e000',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.17), transparent)',
    '--cursor-color': '#70e000',
    '--tab-active': '#3a5a40',
    '--text-secondary': '#90e17b',
    '--theme-success': '#70e000',
    '--theme-warning': '#ffdd80',
    '--theme-danger': '#e63946',
    '--theme-gold': '#f9dc5c',
  },
  midnight: {
    '--dark-card': '#0f1c38',
    '--border-color': '#283c5a',
    '--text-color': '#e2e8f0',
    '--accent-color': '#7878ff',
    '--primary-color': '#4d6ab2',
    '--primary-color-rgb': '77, 106, 178',
    '--accent-color-rgb': '120, 120, 255',
    '--secondary-accent': '#94a3b8',
    '--progress-bar-color': '#7878ff',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
    '--cursor-color': '#7878ff',
    '--tab-active': '#1e293b',
    '--text-secondary': '#cbd5e1',
    '--theme-success': '#34d399',
    '--theme-warning': '#facc15',
    '--theme-danger': '#f87171',
    '--theme-gold': '#f59e0b',
  },
  neon: {
    '--dark-card': '#0f0f1c',
    '--border-color': '#512da8',
    '--text-color': '#e9e9fc',
    '--accent-color': '#fe53bb',
    '--primary-color': '#7928ca',
    '--primary-color-rgb': '121, 40, 202',
    '--accent-color-rgb': '254, 83, 187',
    '--secondary-accent': '#21d4fd',
    '--progress-bar-color': '#21d4fd',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
    '--cursor-color': '#fe53bb',
    '--tab-active': '#24144d',
    '--text-secondary': '#b39ddb',
    '--theme-success': '#39ff14',
    '--theme-warning': '#ffec4a',
    '--theme-danger': '#fe53bb',
    '--theme-gold': '#ffdd00',
  },
  cyber: {
    '--dark-card': '#1a1a2e',
    '--border-color': '#16213e',
    '--text-color': '#e6f1ff',
    '--accent-color': '#00ffff',
    '--primary-color': '#0072ff',
    '--primary-color-rgb': '0, 114, 255',
    '--accent-color-rgb': '0, 255, 255',
    '--secondary-accent': '#72efdd',
    '--progress-bar-color': '#00ffff',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.19), transparent)',
    '--cursor-color': '#00ffff',
    '--tab-active': '#2c2c4c',
    '--text-secondary': '#64dfdf',
    '--theme-success': '#00ff9f',
    '--theme-warning': '#ffee00',
    '--theme-danger': '#ff003c',
    '--theme-gold': '#f9c80e',
  },
  carbon: {
    '--dark-card': '#1a1a1a',
    '--border-color': '#2c2c2c',
    '--text-color': '#f5f5f5',
    '--accent-color': '#3d9df2',
    '--primary-color': '#2c2c2c',
    '--primary-color-rgb': '44, 44, 44',
    '--accent-color-rgb': '61, 157, 242',
    '--secondary-accent': '#56c7fa',
    '--progress-bar-color': '#3d9df2',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
    '--cursor-color': '#3d9df2',
    '--tab-active': '#2c2c2c',
    '--text-secondary': '#b0b0b0',
    '--theme-success': '#68c964',
    '--theme-warning': '#f9c851',
    '--theme-danger': '#f05c5c',
    '--theme-gold': '#fdce70',
  },
  vaporwave: {
    '--dark-card': '#20123a',
    '--border-color': '#5a108f',
    '--text-color': '#fdfdfd',
    '--accent-color': '#ff71ce',
    '--primary-color': '#7b2cbf',
    '--primary-color-rgb': '123, 44, 191',
    '--accent-color-rgb': '255, 113, 206',
    '--secondary-accent': '#b967ff',
    '--progress-bar-color': '#ff71ce',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.21), transparent)',
    '--cursor-color': '#01cdfe',
    '--tab-active': '#3c096c',
    '--text-secondary': '#c77dff',
    '--theme-success': '#05ffa1',
    '--theme-warning': '#fffb96',
    '--theme-danger': '#ff71ce',
    '--theme-gold': '#fffb96',
  },
  inferno: {
    '--dark-card': '#240401',
    '--border-color': '#540804',
    '--text-color': '#ffebd2',
    '--accent-color': '#ff4000',
    '--primary-color': '#bb2d00',
    '--primary-color-rgb': '187, 45, 0',
    '--accent-color-rgb': '255, 64, 0',
    '--secondary-accent': '#ff7f50',
    '--progress-bar-color': '#ff4000',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.16), transparent)',
    '--cursor-color': '#ff4000',
    '--tab-active': '#540804',
    '--text-secondary': '#ffbd9d',
    '--theme-success': '#ff9500',
    '--theme-warning': '#ffce00',
    '--theme-danger': '#ff3000',
    '--theme-gold': '#ffce00',
  },
  red: {
    '--dark-card': '#1f0000',
    '--border-color': '#450a0a',
    '--text-color': '#fef2f2',
    '--accent-color': '#dc2626',
    '--primary-color': '#991b1b',
    '--primary-color-rgb': '153, 27, 27',
    '--accent-color-rgb': '220, 38, 38',
    '--secondary-accent': '#ef4444',
    '--progress-bar-color': '#dc2626',
    '--progress-bar-gloss': 'linear-gradient(to bottom, rgba(255,255,255,0.20), transparent)',
    '--cursor-color': '#dc2626',
    '--tab-active': '#450a0a',
    '--text-secondary': '#fca5a5',
    '--theme-success': '#65a30d',
    '--theme-warning': '#eab308',
    '--theme-danger': '#dc2626',
    '--theme-gold': '#facc15',
  },
};


// Progress bar style recommendations based on themes
const progressBarStyles = {
  original: '', // Default rounded style
  default: '',
  oceanic: '',
  sunset: 'style-gradient',
  forest: 'style-angular',
  midnight: 'style-minimal',
  neon: 'style-neon',
  cyber: 'style-neon',
  carbon: 'style-angular',
  vaporwave: 'style-gradient',
  inferno: 'style-gradient',
  dark: '',
  red: 'style-angular',
  light: ''
};

// Function to apply progress bar style based on theme
function applyProgressBarStyle(themeKey) {
  const progressBar = document.querySelector('.progress-bar-container');
  if (!progressBar) return;
  
  // Remove all style classes first
  progressBar.classList.remove('style-angular', 'style-neon', 'style-minimal', 'style-gradient');
  
  // Add the appropriate style class for this theme
  if (progressBarStyles[themeKey]) {
    progressBar.classList.add(progressBarStyles[themeKey]);
  }
  
  // Additional adjustments for specific themes if needed
  if (themeKey === 'cyber' || themeKey === 'neon') {
    document.querySelector('.progress-bar')?.classList.add('glow-effect');
  } else {
    document.querySelector('.progress-bar')?.classList.remove('glow-effect');
  }
}

// Function to toggle between progress bar styles
function toggleProgressBarStyle() {
  const progressBar = document.querySelector('.progress-bar-container');
  if (!progressBar) return;
  
  const styles = ['', 'style-angular', 'style-neon', 'style-minimal', 'style-gradient'];
  let currentIndex = 0;
  
  // Find current style
  for (let i = 0; i < styles.length; i++) {
    if (styles[i] && progressBar.classList.contains(styles[i])) {
      currentIndex = i;
      break;
    }
  }
  
  // Move to next style
  const nextIndex = (currentIndex + 1) % styles.length;
  
  // Remove all style classes
  progressBar.classList.remove('style-angular', 'style-neon', 'style-minimal', 'style-gradient');
  
  // Add new style if not the default
  if (styles[nextIndex]) {
    progressBar.classList.add(styles[nextIndex]);
  }
  
  // Save preference
  const themeKey = localStorage.getItem('themeColor') || 'original';
  localStorage.setItem(`${themeKey}_progressStyle`, styles[nextIndex]);
}

// Set theme CSS variables and update UI
function applyTheme(themeKey) {
  // Safeguard: only apply known themes
  if (!themeConfigs.hasOwnProperty(themeKey)) {
    themeKey = 'original';
  }

  // Apply the theme's CSS variables to the root element
  const theme = themeConfigs[themeKey];
  const root = document.documentElement;

  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }

  // Save the selected theme to localStorage
  localStorage.setItem('themeColor', themeKey);

  // Only create dropdown when DOM is fully loaded
  if (document.readyState === 'complete') {
    createThemeDropdown(themeKey);
  }

  // Update the UI or other elements if needed
  const eventData = {
    detail: {
      theme: themeKey,
      config: theme
    }
  };
  document.dispatchEvent(new CustomEvent('themeChanged', eventData));

  // Add active class to accent decorations
  // This supports themes that don't have JS theme class changes
  let themeClass = themeKey;
  document.querySelectorAll('.theme-accents').forEach(el => {
    // Remove all theme-* classes
    el.classList.forEach(cls => {
      if (cls.startsWith('theme-') && cls !== 'theme-accents') {
        el.classList.remove(cls);
      }
    });
    // Add current theme class
    el.classList.add(`theme-${themeClass}`);
  });
  
  // Update audio button if it exists
  const themeButton = document.querySelector('.audio-buttons span');
  if (themeButton) {
    for (const themeName of themeNames) {
      if (themeName.value === themeKey) {
        themeButton.textContent = themeName.label;
        break;
      }
    }
  }

  // Apply appropriate progress bar style based on theme
  applyProgressBarStyle(themeKey);

  // Update UI
  updateThemeUI(theme);

  return theme; // Return the applied theme config
}

// Dynamic UI updates based on theme
function updateThemeUI(config) {
  // Update dropdown label
  const audioDropdown = document.querySelector('#custom-theme-dropdown .audio-buttons span');
  if (audioDropdown) {
    const found = themeNames.find(t => t.value === localStorage.getItem('themeColor') || 'original');
    audioDropdown.textContent = found ? found.label : localStorage.getItem('themeColor') || 'original';
  }

  // Cursor
  const cursor = document.querySelector('.custom-cursor');
  if (cursor) cursor.style.background = config['--cursor-color'];

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.style.background = '';
    tab.style.color = '';
  });
  document.querySelectorAll('.tab.active').forEach(tab => {
    tab.style.background = config['--tab-active'];
    tab.style.color = config['--accent-color'];
  });
}

// Set default theme on load and add event listeners
window.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('themeColor') || 'original');
  
  // Add double-click handler for progress bar to change styles
  const progressBarContainer = document.querySelector('.progress-container');
  if (progressBarContainer) {
    progressBarContainer.addEventListener('dblclick', toggleProgressBarStyle);
  }
});

// Initialize on load or immediately if already loaded
if (document.readyState === 'complete') {
  applyTheme(localStorage.getItem('themeColor') || 'original');
} else {
  window.addEventListener('load', () => {
    applyTheme(localStorage.getItem('themeColor') || 'original');
  });
}

// Initialize the theme dropdown once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createThemeDropdown(localStorage.getItem('themeColor') || 'original');
});

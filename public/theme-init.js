// Before the first paint, so a light theme never flashes dark (App keeps it in sync afterwards).
try {
  var t = (JSON.parse(localStorage.getItem('focus-space:prefs')) || {}).theme
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name=theme-color]').content = t === 'light' ? '#f2f1ec' : '#0b0b0b'
} catch (e) {}

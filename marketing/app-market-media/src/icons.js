// Replaces <i data-icon="name"> placeholders with simple line-art product icons.
const ICONS = {
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
  charger: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12.8 9l-2 3.2h2.4l-2 3.2"/>',
  case: '<rect x="3.5" y="7" width="17" height="11" rx="5.5"/><path d="M3.8 11.5h16.4"/><rect x="10.5" y="10.5" width="3" height="2" rx="0.6"/>',
  cable: '<path d="M7 3v3M10 3v3"/><rect x="5.5" y="6" width="6" height="5" rx="1"/><path d="M8.5 11v3a4 4 0 0 0 4 4h2a3 3 0 0 0 3-3V7"/><rect x="16" y="3" width="3" height="4" rx="0.8"/>',
  earbuds: '<path d="M8 4.5a3.2 3.2 0 0 0-3.2 3.2v.6A3.2 3.2 0 0 0 8 11.5h1v-7z"/><path d="M9 11.5v8"/><path d="M16 4.5a3.2 3.2 0 0 1 3.2 3.2v.6A3.2 3.2 0 0 1 16 11.5h-1v-7z"/><path d="M15 11.5v8"/>',
  watch: '<rect x="6.5" y="6.5" width="11" height="11" rx="3"/><path d="M9 6.5l.8-4h4.4l.8 4M9 17.5l.8 4h4.4l.8-4M12 9.5v2.8l1.8 1"/>',
  speaker: '<rect x="6" y="3" width="12" height="18" rx="3"/><circle cx="12" cy="14.5" r="3.2"/><circle cx="12" cy="7.5" r="1.2"/>',
};

document.querySelectorAll('[data-icon]').forEach((el) => {
  const size = el.dataset.size || 64;
  const color = el.dataset.color || '#3b4057';
  el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ICONS[el.dataset.icon]}</svg>`;
});

// Sidebar interaction: only visual state switching for current section.
const navButtons = document.querySelectorAll('.nav-item');
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    navButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

// Slide-over panel interaction for creating new products.
const newProductBtn = document.getElementById('newProductBtn');
const panelOverlay = document.getElementById('panelOverlay');
const closePanelBtn = document.getElementById('closePanelBtn');
const cancelPanelBtn = document.getElementById('cancelPanelBtn');

function openPanel() {
  panelOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  panelOverlay.hidden = true;
  document.body.style.overflow = '';
}

newProductBtn.addEventListener('click', openPanel);
closePanelBtn.addEventListener('click', closePanel);
cancelPanelBtn.addEventListener('click', closePanel);

// Close panel when clicking overlay background or pressing Escape.
panelOverlay.addEventListener('click', (event) => {
  if (event.target === panelOverlay) closePanel();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !panelOverlay.hidden) closePanel();
});

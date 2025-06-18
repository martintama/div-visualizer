document.addEventListener('DOMContentLoaded', function() {
  const hoverModeButton = document.getElementById('toggle-hover-mode');
  const outlineModeButton = document.getElementById('toggle-outline-mode');
  const disableButton = document.getElementById('disable-visualizer');
  const showDimensions = document.getElementById('show-dimensions');
  const showBorders = document.getElementById('show-borders');
  const outlineDepth = document.getElementById('outline-depth');
  const depthValue = document.getElementById('depth-value');
  
  let currentMode = 'disabled'; // Start with disabled state
  
  // Initialize with disabled state
  setActiveMode('disabled');
  
  hoverModeButton.addEventListener('click', function() {
    setActiveMode('hover');
  });
  
  outlineModeButton.addEventListener('click', function() {
    setActiveMode('outline');
  });
  
  disableButton.addEventListener('click', function() {
    setActiveMode('disabled');
  });
  
  function setActiveMode(mode) {
    currentMode = mode;
    
    // Update button styles
    hoverModeButton.classList.toggle('active', mode === 'hover');
    outlineModeButton.classList.toggle('active', mode === 'outline');
    disableButton.classList.toggle('active', mode === 'disabled');
    
    // Send message to content script
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {
        command: 'setMode',
        mode: mode,
        showDimensions: showDimensions.checked,
        showBorders: showBorders.checked,
        maxDepth: parseInt(outlineDepth.value, 10)
      });
    });
  }
  
  showDimensions.addEventListener('change', function() {
    updateSettings();
  });
  
  showBorders.addEventListener('change', function() {
    updateSettings();
  });
  
  outlineDepth.addEventListener('input', function() {
    depthValue.textContent = outlineDepth.value;
    updateSettings();
  });
  
  function updateSettings() {
    if (currentMode !== 'disabled') {
      browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: 'updateSettings',
          showDimensions: showDimensions.checked,
          showBorders: showBorders.checked,
          maxDepth: parseInt(outlineDepth.value, 10)
        });
      });
    }
  }
});

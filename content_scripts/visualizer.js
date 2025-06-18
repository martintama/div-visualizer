(function() {
  let currentMode = 'disabled'; // Start with disabled state
  let showDimensions = true;
  let showBorders = true;
  let maxDepth = 10;
  let overlay = null;
  let dimensionsBox = null;
  let outlineBoxes = [];
  
  function createOverlay() {
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'all 0.2s';
    overlay.style.zIndex = '9999';
    
    dimensionsBox = document.createElement('div');
    dimensionsBox.style.position = 'absolute';
    dimensionsBox.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    dimensionsBox.style.color = '#fff';
    dimensionsBox.style.padding = '4px 8px';
    dimensionsBox.style.borderRadius = '4px';
    dimensionsBox.style.fontSize = '12px';
    dimensionsBox.style.pointerEvents = 'none';
    dimensionsBox.style.zIndex = '10000';
    
    document.body.appendChild(overlay);
    document.body.appendChild(dimensionsBox);
  }
  
  function removeOverlay() {
    if (overlay) {
      document.body.removeChild(overlay);
      overlay = null;
    }
    
    if (dimensionsBox) {
      document.body.removeChild(dimensionsBox);
      dimensionsBox = null;
    }
  }
  
  function removeOutlineBoxes() {
    outlineBoxes.forEach(box => {
      if (box && box.parentNode) {
        box.parentNode.removeChild(box);
      }
    });
    outlineBoxes = [];
  }
  
  function getRandomColor(depth) {
    // Generate colors based on depth for better visualization of nesting
    const hue = depth * 30 % 360;
    return `hsla(${hue}, 90%, 50%, 0.2)`;
  }
  
  function getBorderColor(depth) {
    // Generate border colors based on depth
    const hue = depth * 30 % 360;
    return `hsla(${hue}, 90%, 50%, 0.8)`;
  }
  
  function handleMouseOver(event) {
    if (currentMode !== 'hover') return;
    
    const target = event.target;
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Skip small elements and text nodes
    if (rect.width < 5 || rect.height < 5 || target === overlay || target === dimensionsBox || outlineBoxes.includes(target)) {
      return;
    }
    
    // Calculate nesting depth
    let depth = 0;
    let parent = target.parentElement;
    while (parent) {
      depth++;
      parent = parent.parentElement;
    }
    
    // Update overlay
    overlay.style.top = `${rect.top + scrollTop}px`;
    overlay.style.left = `${rect.left + scrollLeft}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    
    if (showBorders) {
      overlay.style.backgroundColor = getRandomColor(depth);
      overlay.style.border = '1px solid rgba(255, 255, 255, 0.5)';
      overlay.style.boxSizing = 'border-box';
    } else {
      overlay.style.backgroundColor = 'transparent';
      overlay.style.border = 'none';
    }
    
    // Update dimensions box
    if (showDimensions) {
      const tagName = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const classes = target.className ? `.${target.className.replace(/\s+/g, '.')}` : '';
      
      dimensionsBox.textContent = `${tagName}${id}${classes} ${Math.round(rect.width)}×${Math.round(rect.height)}`;
      dimensionsBox.style.top = `${rect.top + scrollTop - 25}px`;
      dimensionsBox.style.left = `${rect.left + scrollLeft}px`;
      dimensionsBox.style.display = 'block';
    } else {
      dimensionsBox.style.display = 'none';
    }
  }
  
  function handleMouseOut() {
    if (currentMode !== 'hover') return;
    
    if (overlay) {
      overlay.style.backgroundColor = 'transparent';
      overlay.style.border = 'none';
    }
    if (dimensionsBox) {
      dimensionsBox.style.display = 'none';
    }
  }
  
  function enableHoverMode() {
    // Clean up outline mode if active
    removeOutlineBoxes();
    
    // Set up hover mode
    createOverlay();
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
  }
  
  function disableHoverMode() {
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    removeOverlay();
  }
  
  function enableOutlineMode() {
    // Clean up hover mode if active
    disableHoverMode();
    
    // Remove any existing outline boxes
    removeOutlineBoxes();
    
    // Create outline boxes for all visible elements
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      // Skip invisible elements and our own elements
      if (el === overlay || el === dimensionsBox || outlineBoxes.includes(el)) {
        return;
      }
      
      const rect = el.getBoundingClientRect();
      
      // Skip elements that are too small
      if (rect.width < 10 || rect.height < 10) {
        return;
      }
      
      // Calculate nesting depth
      let depth = 0;
      let parent = el.parentElement;
      while (parent) {
        depth++;
        parent = parent.parentElement;
      }
      
      // Skip elements beyond our max depth
      if (depth > maxDepth) {
        return;
      }
      
      const outlineBox = document.createElement('div');
      outlineBox.style.position = 'absolute';
      outlineBox.style.pointerEvents = 'none';
      outlineBox.style.zIndex = `${9000 + depth}`;
      outlineBox.style.boxSizing = 'border-box';
      
      // Position the outline box
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      outlineBox.style.top = `${rect.top + scrollTop}px`;
      outlineBox.style.left = `${rect.left + scrollLeft}px`;
      outlineBox.style.width = `${rect.width}px`;
      outlineBox.style.height = `${rect.height}px`;
      
      // Style based on settings
      if (showBorders) {
        outlineBox.style.border = `1px solid ${getBorderColor(depth)}`;
      }
      
      if (showDimensions && rect.width > 50 && rect.height > 20) {
        const tagName = el.tagName.toLowerCase();
        outlineBox.setAttribute('data-label', `${tagName} ${Math.round(rect.width)}×${Math.round(rect.height)}`);
        outlineBox.style.fontSize = '10px';
        outlineBox.style.color = 'white';
        outlineBox.style.paddingLeft = '3px';
        outlineBox.style.paddingTop = '3px';
        
        // Add small label for the element
        const label = document.createElement('span');
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '0';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        label.style.color = 'white';
        label.style.padding = '2px 4px';
        label.style.fontSize = '9px';
        label.style.borderRadius = '2px';
        label.style.pointerEvents = 'none';
        label.textContent = `${tagName} ${Math.round(rect.width)}×${Math.round(rect.height)}`;
        outlineBox.appendChild(label);
      }
      
      // Add transparent background with color based on depth
      outlineBox.style.backgroundColor = getRandomColor(depth);
      
      document.body.appendChild(outlineBox);
      outlineBoxes.push(outlineBox);
    });
  }
  
  function disableOutlineMode() {
    removeOutlineBoxes();
  }
  
  function disableAllVisualizers() {
    disableHoverMode();
    disableOutlineMode();
  }
  
  function setMode(mode) {
    // First, disable all modes
    disableAllVisualizers();
    
    // Then enable the selected mode
    currentMode = mode;
    
    if (mode === 'hover') {
      enableHoverMode();
    } else if (mode === 'outline') {
      enableOutlineMode();
    }
    // If mode is 'disabled', we've already disabled everything
  }
  
  // Listen for messages from the popup
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === 'setMode') {
      // Update settings
      showDimensions = message.showDimensions;
      showBorders = message.showBorders;
      maxDepth = message.maxDepth;
      
      // Set the active mode
      setMode(message.mode);
    } else if (message.command === 'updateSettings') {
      // Update settings
      showDimensions = message.showDimensions;
      showBorders = message.showBorders;
      maxDepth = message.maxDepth;
      
      // Refresh the current mode (unless disabled)
      if (currentMode !== 'disabled') {
        setMode(currentMode);
      }
    }
  });
})();

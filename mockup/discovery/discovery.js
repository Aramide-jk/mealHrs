document.querySelectorAll('[data-reaction]').forEach((button) => {
  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
    button.style.color = pressed ? '' : '#b9e88b';
  });
});

document.querySelectorAll('[data-follow]').forEach((button) => {
  button.addEventListener('click', () => {
    const following = button.textContent.trim() === 'Following';
    button.textContent = following ? 'Follow' : 'Following';
    button.setAttribute('aria-pressed', String(!following));
  });
});

document.querySelectorAll('.mobile-nav').forEach((nav) => {
  if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'Customer navigation');
});
document.querySelectorAll('a[href="notifications.html"]').forEach((link) => {
  if (!link.textContent.trim() && !link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'Notifications');
});
document.querySelector('.store-tabs a[href="#videos"]')?.remove();

if (/\/(category|results)\.html$/.test(window.location.pathname)) {
  document.querySelectorAll('.dish-grid, [data-panel]').forEach((region, index) => {
    if (region.querySelector(':scope > h2')) return;
    const heading = document.createElement('h2');
    heading.className = 'sr-only';
    heading.textContent = index === 0 ? 'Matching meals' : 'More search results';
    region.prepend(heading);
  });
}

document.querySelectorAll('[role="tablist"]').forEach((tablist, groupIndex) => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, tabIndex) => {
    const targetKey = tab.dataset.tab;
    const panel = targetKey ? document.querySelector(`[data-panel="${targetKey}"]`) : document.querySelector('#reels');
    const panelId = panel?.id || `tab-panel-${groupIndex}-${tabIndex}`;
    if (panel && !panel.id) panel.id = panelId;
    if (panel) panel.setAttribute('role', 'tabpanel');
    tab.id ||= `tab-${groupIndex}-${tabIndex}`;
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
    if (panel && tabs.length > 1 && targetKey) panel.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => tabs.forEach((item) => item.setAttribute('tabindex', item === tab ? '0' : '-1')));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
});

const emptyLocal = document.querySelector('#empty-local');
const feedLoading = document.querySelector('#feed-loading');
document.querySelector('[data-preview-empty]')?.addEventListener('click', () => { emptyLocal.hidden = false; feedLoading.hidden = true; });
document.querySelector('[data-preview-loading]')?.addEventListener('click', () => { feedLoading.hidden = false; emptyLocal.hidden = true; });
document.querySelectorAll('[data-show-feed]').forEach((button) => button.addEventListener('click', () => { emptyLocal.hidden = true; feedLoading.hidden = true; }));

const locationSelect = document.querySelector('#location-select');
locationSelect?.addEventListener('change', () => {
  const note = document.querySelector('#location-preview-note');
  const supported = locationSelect.value !== 'Ikeja';
  note.className = supported ? 'notice' : 'notice warning';
  note.textContent = supported ? `${locationSelect.value} is supported by Amaka's Kitchen.` : 'Ikeja is outside this vendor’s delivery area. Applying it will disable this offer and show the local empty state.';
});
function renderLocation(area, announce = true) {
  const supported = area !== 'Ikeja';
  sessionStorage.setItem('mealhrsArea', area);
  document.querySelectorAll('[data-active-location]').forEach((item) => { item.textContent = `Delivering to ${area}`; });
  document.querySelectorAll('[data-location-short]').forEach((item) => { item.textContent = area; });
  const status = document.querySelector('[data-eligibility-status]');
  const copy = document.querySelector('[data-eligibility-copy]');
  const action = document.querySelector('[data-eligible-action]');
  const fee = area === 'Egbe' ? '₦1,500' : area === 'Ikotun' ? '₦1,200' : 'Unavailable';
  status.className = supported ? 'status' : 'status unavailable';
  status.textContent = supported ? 'Available now' : 'Outside delivery area';
  copy.textContent = supported ? `Amaka's Kitchen delivers this meal to ${area} in an estimated 25–35 minutes.` : `Amaka's Kitchen does not currently deliver this meal to ${area}.`;
  action.disabled = !supported;
  action.setAttribute('aria-disabled', String(!supported));
  document.querySelector('[data-delivery-fee]').textContent = fee;
  const trayStatus = document.querySelector('[data-tray-status]');
  trayStatus.className = supported ? 'status' : 'status unavailable';
  trayStatus.textContent = supported ? 'Available now' : 'Outside area';
  const sheetStatus = document.querySelector('[data-sheet-status]');
  sheetStatus.className = supported ? 'status' : 'status unavailable';
  sheetStatus.textContent = supported ? 'Available now' : 'Outside delivery area';
  document.querySelector('[data-sheet-eligibility]').innerHTML = supported
    ? `<a href="vendor.html">Amaka's Kitchen</a> · Delivers to ${area} · 25–35 min`
    : `<a href="vendor.html">Amaka's Kitchen</a> · Does not deliver to ${area}. Change location to order.`;
  const add = document.querySelector('[data-sheet-add]');
  add.setAttribute('aria-disabled', String(!supported));
  if (supported) {
    add.href = '../commerce/cart.html';
    add.removeAttribute('tabindex');
  } else {
    add.removeAttribute('href');
    add.tabIndex = -1;
  }
  emptyLocal.hidden = supported;
  feedLoading.hidden = true;
  if (announce) window.mealhrsToast?.(`Previewing ${area}; delivery ${supported ? fee : 'unavailable'}`);
}
document.querySelector('[data-apply-location]')?.addEventListener('click', () => {
  renderLocation(locationSelect.value);
  window.mealhrsCloseSheet?.(document.querySelector('#location-sheet'));
});
const savedArea = sessionStorage.getItem('mealhrsArea');
if (savedArea && locationSelect) {
  locationSelect.value = savedArea;
  renderLocation(savedArea, false);
}
document.querySelectorAll('[data-feed-mode]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-feed-mode]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  emptyLocal.hidden = true;
  feedLoading.hidden = true;
}));
function stateMarkup(state) {
  if (state === 'loading') return '<div class="result-list" role="status" aria-label="Loading results"><div class="result-row"><div class="skeleton" style="width:90px;height:75px"></div><span><h3 class="skeleton">Loading meal</h3><p class="skeleton">Checking availability</p></span></div><div class="result-row"><div class="skeleton" style="width:90px;height:75px"></div><span><h3 class="skeleton">Loading kitchen</h3><p class="skeleton">Checking delivery area</p></span></div></div>';
  if (state === 'empty') return '<div class="empty-state card"><div><h2>No exact matches for “jollof”</h2><p>Try a broader search or browse rice meals near Ikotun.</p><a class="btn" href="category.html">Browse rice meals</a></div></div>';
  return '<div class="empty-state card"><div><div class="notice error">Search could not be refreshed. Your query is still here.</div><h2>Something interrupted the search</h2><p>Check your connection and try again.</p><button class="btn" type="button" onclick="location.reload()">Try again</button></div></div>';
}

document.querySelector('#result-state')?.addEventListener('change', (event) => {
  const content = document.querySelector('#results-content');
  const state = document.querySelector('#results-state');
  const showContent = event.target.value === 'content';
  content.hidden = !showContent;
  state.hidden = showContent;
  if (!showContent) state.innerHTML = stateMarkup(event.target.value);
});

document.querySelector('#dish-state')?.addEventListener('change', (event) => {
  const status = document.querySelector('#dish-status');
  const notice = document.querySelector('#dish-notice');
  const add = document.querySelector('#dish-add');
  const unavailable = event.target.value !== 'available';
  status.className = unavailable ? 'status unavailable' : 'status';
  status.textContent = event.target.value === 'soldout' ? 'Sold out' : unavailable ? 'Outside delivery area' : 'Available now';
  notice.className = unavailable ? 'notice warning' : 'notice';
  notice.textContent = event.target.value === 'outside' ? 'This vendor does not deliver to your selected area. Change location or view pickup options.' : event.target.value === 'soldout' ? 'Today’s capacity is full. The next available date will appear here.' : 'Delivers to your selected area, Ikotun.';
  add.setAttribute('aria-disabled', String(unavailable));
  if (unavailable) {
    add.dataset.href = add.getAttribute('href') || add.dataset.href;
    add.removeAttribute('href');
    add.setAttribute('tabindex', '-1');
  } else {
    add.setAttribute('href', add.dataset.href || '../commerce/cart.html');
    add.removeAttribute('tabindex');
  }
  add.style.opacity = unavailable ? '.45' : '';
});

document.querySelector('#drop-state')?.addEventListener('change', (event) => {
  const status = document.querySelector('#drop-status');
  const notice = document.querySelector('#drop-notice');
  const add = document.querySelector('#drop-add');
  const closed = event.target.value === 'closed';
  status.className = closed ? 'status unavailable' : 'status preorder';
  status.textContent = closed ? 'Ordering closed' : 'Pre-order';
  notice.innerHTML = event.target.value === 'closing' ? '<strong>Cutoff approaching: Saturday, 6:00 PM WAT</strong><br>Checkout revalidates time and remaining capacity.' : closed ? '<strong>Cutoff passed</strong><br>This drop is archived. Next Sunday’s menu will appear when published.' : '<strong>Order by Saturday, 6:00 PM WAT</strong><br>Delivery Sunday, 1:00–4:00 PM. Capacity: 40 meals.';
  add.setAttribute('aria-disabled', String(closed));
  if (closed) {
    add.dataset.href = add.getAttribute('href') || add.dataset.href;
    add.removeAttribute('href');
    add.setAttribute('tabindex', '-1');
  } else {
    add.setAttribute('href', add.dataset.href || '../commerce/cart.html');
    add.removeAttribute('tabindex');
  }
  add.style.opacity = closed ? '.45' : '';
});

document.querySelectorAll('[aria-disabled="true"]').forEach((control) => {
  control.addEventListener('click', (event) => event.preventDefault());
});

document.querySelector('#saved-state')?.addEventListener('change', (event) => {
  document.querySelector('#saved-content').hidden = event.target.value === 'empty';
  document.querySelector('#saved-empty').hidden = event.target.value !== 'empty';
});

document.querySelector('#notification-state')?.addEventListener('change', (event) => {
  document.querySelector('#notification-content').hidden = event.target.value === 'error';
  document.querySelector('#notification-error').hidden = event.target.value !== 'error';
});
document.querySelector('[data-retry-notifications]')?.addEventListener('click', () => {
  document.querySelector('#notification-content').hidden = false;
  document.querySelector('#notification-error').hidden = true;
  const select = document.querySelector('#notification-state');
  if (select) select.value = 'content';
});

const reels = document.querySelector('#reels');
document.addEventListener('keydown', (event) => {
  if (!reels || !['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) return;
  const direction = event.key.includes('Down') ? 1 : -1;
  reels.scrollBy({ top: direction * reels.clientHeight, behavior: 'smooth' });
});

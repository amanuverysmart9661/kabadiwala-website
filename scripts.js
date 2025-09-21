/* scripts.js - combined: toggle + full 29-item calculator + form handlers */
(function(){
  'use strict';

  /* ---------- Utilities ---------- */
  function safeParse(json, fallback){ try { return JSON.parse(json); } catch(e){ return fallback; } }
  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
  function fmtINR(num){ return '₹ ' + Number(num || 0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }

  /* ---------- Toggle Pickup / Franchise ---------- */
  function initToggle(){
    const pickupForm = $('#pickupForm');
    const franchiseForm = $('#franchiseForm');
    if(!pickupForm || !franchiseForm) return;

    const pickBtn = document.querySelector('.form-toggle .toggle-btn[data-form="pickup"]');
    const franBtn = document.querySelector('.form-toggle .toggle-btn[data-form="franchise"]');

    function activate(active, inactive){
      if(!active || !inactive) return;
      active.classList.add('active');
      inactive.classList.remove('active');
    }
    function showPickup(){
      pickupForm.classList.remove('hidden'); pickupForm.style.display='';
      franchiseForm.classList.add('hidden'); franchiseForm.style.display='none';
      activate(pickBtn, franBtn);
    }
    function showFranchise(){
      franchiseForm.classList.remove('hidden'); franchiseForm.style.display='';
      pickupForm.classList.add('hidden'); pickupForm.style.display='none';
      activate(franBtn, pickBtn);
    }

    if(pickBtn) pickBtn.addEventListener('click', showPickup);
    if(franBtn) franBtn.addEventListener('click', showFranchise);

    showPickup();
  }

  /* ---------- Scrap Price Calculator ---------- */
  function initCalculator(){
    const ITEMS = [
      { id: 'newspaper', name: 'Newspaper', price: 14, unit: 'kg' },
      { id: 'copy_paper', name: 'Copy', price: 12, unit: 'kg' },
      { id: 'book', name: 'Book', price: 10, unit: 'kg' },
      { id: 'magazine', name: 'Magazine', price: 8, unit: 'kg' },
      { id: 'copy_book_mix', name: 'Copy + Book Mix', price: 10, unit: 'kg' },
      { id: 'cartoon', name: 'Cartoon', price: 10, unit: 'kg' },
      { id: 'iron', name: 'Iron', price: 25, unit: 'kg' },
      { id: 'cutting_iron', name: 'Cutting Iron', price: 15, unit: 'kg' },
      { id: 'tina', name: 'Tina', price: 12, unit: 'kg' },
      { id: 'steel', name: 'Steel', price: 40, unit: 'kg' },
      { id: 'al_cast', name: 'Aluminium (Cast)', price: 100, unit: 'kg' },
      { id: 'al_beat', name: 'Aluminium (Beat)', price: 120, unit: 'kg' },
      { id: 'plastic_black', name: 'Plastic (Black)', price: 2, unit: 'kg' },
      { id: 'plastic_hard', name: 'Plastic (Hard)', price: 2, unit: 'kg' },
      { id: 'plastic_soft', name: 'Plastic (Soft)', price: 10, unit: 'kg' },
      { id: 'bottle_quarter', name: 'Bottle (Quarter)', price: 50, unit: 'pc' },
      { id: 'bottle_full', name: 'Bottle (Full)', price: 1, unit: 'pc' },
      { id: 'beer_bottle', name: 'Beer Bottle', price: 1, unit: 'pc' },
      { id: 'computer', name: 'Computer', price: 15, unit: 'kg' },
      { id: 'cpu', name: 'CPU', price: 25, unit: 'kg' },
      { id: 'ups', name: 'U.P.S', price: 30, unit: 'kg' },
      { id: 'battery_black', name: 'Battery (Black Dry)', price: 90, unit: 'kg' },
      { id: 'battery_liquid', name: 'Battery (Liquid)', price: 100, unit: 'kg' },
      { id: 'tyre', name: 'Tyre (4+6 Wheeler only)', price: 5, unit: 'kg' },
      { id: 'tube', name: 'Tube', price: 10, unit: 'kg' },
      { id: 'fridge_big', name: 'Frize (Big)', price: 400, unit: 'pc' },
      { id: 'fridge_small', name: 'Frize (Small)', price: 300, unit: 'pc' }
    ];

    const GST_RATE = 0;
    const container = $('#itemsContainer');
    if(!container) return;

    const items_total_el = $('#items_total');
    const tax_total_el = $('#tax_total');
    const calc_total_el = $('#calc_total');
    const gstRateEl = $('#gst_rate');
    if(gstRateEl) gstRateEl.textContent = GST_RATE;

    // Build rows dynamically
    ITEMS.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'calc-row';
      row.style.cssText = 'display:flex;align-items:center;gap:12px;justify-content:space-between;padding:8px 6px;border-radius:8px;background:linear-gradient(180deg,#ffffff,#fcfffd);border:1px solid rgba(0,0,0,0.02)';

      const left = document.createElement('div');
      left.style.flex = '1';
      const title = document.createElement('div');
      title.style.fontWeight = '800';
      title.innerHTML = `${item.name} <small style="font-weight:600;color:var(--muted)"> (${item.unit})</small>`;
      left.appendChild(title);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = item.unit === 'pc' ? '1' : '0.01';
      input.placeholder = '0';
      input.id = item.id + '_qty';
      input.className = 'calc-input';
      input.style.cssText = 'width:140px;padding:8px;border-radius:8px;border:1px solid #edf5f0;margin-top:8px';
      left.appendChild(input);

      const right = document.createElement('div');
      right.style.textAlign = 'right';
      right.style.width = '180px';
      right.innerHTML = `
        <div style="color:var(--muted);font-size:13px">Price</div>
        <div id="${item.id}_price_display" style="font-weight:800;margin-top:6px">${fmtINR(item.price)}${item.unit==='kg'?'/kg':'/pc'}</div>
        <div id="${item.id}_total" style="margin-top:6px;color:var(--green);font-weight:900">₹ 0.00</div>
      `;

      row.appendChild(left); row.appendChild(right);
      container.appendChild(row);

      // Input live update + Enter triggers total
      input.addEventListener('input', ()=>{ updateItemTotal(item); updateTotals(); });
      input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); updateTotals(); }});
    });

    function updateItemTotal(item){
      const qty = parseFloat($('#'+item.id+'_qty').value) || 0;
      const total = qty * item.price;
      $('#'+item.id+'_total').textContent = fmtINR(total);
      return total;
    }
    function computeItemsTotal(){
      return ITEMS.reduce((sum,it)=>{
        const qty = parseFloat($('#'+it.id+'_qty').value) || 0;
        return sum + qty*it.price;
      },0);
    }
    function updateTotals(){
      const itemsTotal = computeItemsTotal();
      const tax = itemsTotal*(GST_RATE/100);
      const grand = itemsTotal+tax;
      if(items_total_el) items_total_el.textContent = fmtINR(itemsTotal);
      if(tax_total_el) tax_total_el.textContent = fmtINR(tax);
      if(calc_total_el) calc_total_el.textContent = fmtINR(grand);
    }

    // Buttons
    const calcBtn = $('#calcBtn');
    const resetBtn = $('#resetBtn');
    if(calcBtn) calcBtn.addEventListener('click', e=>{ e.preventDefault(); ITEMS.forEach(updateItemTotal); updateTotals(); });
    if(resetBtn) resetBtn.addEventListener('click', e=>{ e.preventDefault(); ITEMS.forEach(it=>{ $('#'+it.id+'_qty').value=''; $('#'+it.id+'_total').textContent='₹ 0.00'; }); updateTotals(); });

    updateTotals();
  }

  /* ---------- Form save (local fallback) ---------- */
  function initForms(){
    const pickupForm = $('#pickupForm');
    if(pickupForm){
      pickupForm.addEventListener('submit', e=>{
        e.preventDefault();
        const data = {
          name: pickupForm.querySelector('#name')?.value || '',
          phone: pickupForm.querySelector('#phone')?.value || '',
          city: pickupForm.querySelector('#city')?.value || '',
          category: pickupForm.querySelector('select[name="category"]')?.value || '',
          ts: new Date().toISOString()
        };
        const arr = safeParse(localStorage.getItem('a1_leads') || '[]', []);
        arr.unshift(data);
        localStorage.setItem('a1_leads', JSON.stringify(arr));
        alert('Pickup request saved locally.');
        pickupForm.reset();
      });
    }

    const franchiseForm = $('#franchiseForm');
    if(franchiseForm){
      franchiseForm.addEventListener('submit', e=>{
        e.preventDefault();
        const data = {
          fullname: franchiseForm.querySelector('#fname')?.value || '',
          phone: franchiseForm.querySelector('#fphone')?.value || '',
          email: franchiseForm.querySelector('#femail')?.value || '',
          city: franchiseForm.querySelector('#fcity')?.value || '',
          state: franchiseForm.querySelector('#state')?.value || '',
          investment: franchiseForm.querySelector('select[name="investment"]')?.value || '',
          reason: franchiseForm.querySelector('#reason')?.value || '',
          ts: new Date().toISOString()
        };
        const arr = safeParse(localStorage.getItem('a1_franchise_leads') || '[]', []);
        arr.unshift(data);
        localStorage.setItem('a1_franchise_leads', JSON.stringify(arr));
        alert('Franchise application saved locally.');
        franchiseForm.reset();
        document.querySelector('.form-toggle .toggle-btn[data-form="pickup"]')?.click();
      });
    }
  }

  /* ---------- Init all ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    initToggle();
    initCalculator();
    initForms();
    const y = $('#year'); if(y) y.textContent = new Date().getFullYear();
  });

})();
// floating label fix: add placeholder attribute dynamically so :placeholder-shown works reliably
document.querySelectorAll('.field input, .field textarea').forEach(el=>{
  if(!el.getAttribute('placeholder')) el.setAttribute('placeholder',' ');
});

// small client-side submit animation / friendly UX
const form = document.getElementById('contactPageForm');
if (form) {
  form.addEventListener('submit', function(e){
    // simple UX: replace button text with sending animation; allow native submit to continue
    const btn = form.querySelector('button[type="submit"]');
    if(btn){
      btn.disabled = true;
      btn.style.transform = 'translateY(0)';
      btn.innerHTML = '<span class="btn-inner">Sending…</span>';
    }
    // no preventDefault — leave to Formspree / server
  });
}

// YEAR in footer if you have <span id="year"></span>
try{ document.getElementById('year').textContent = new Date().getFullYear(); }catch(e){}
// MOBILE MENU TOGGLE (drop-in)
(function () {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  const closeBtn = document.getElementById('mobile-nav-close');
  const backdrop = nav ? nav.querySelector('.mobile-nav-backdrop') : null;

  if (!btn || !nav) return;

  function openMenu() {
    nav.classList.add('open');
    nav.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    // trap focus simply: focus first link
    const firstLink = nav.querySelector('.mobile-nav-list a');
    if (firstLink) firstLink.focus();
    document.body.style.overflow = 'hidden'; // avoid body scroll when menu open
  }

  function closeMenu() {
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // restore scroll
    btn.focus();
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = nav.classList.contains('open');
    if (isOpen) closeMenu(); else openMenu();
  });

  closeBtn && closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeMenu();
  });

  backdrop && backdrop.addEventListener('click', function () {
    closeMenu();
  });

  // close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });

  // close menu when clicking any nav link (so it changes page cleanly)
  nav.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href')) {
      // allow link to navigate — close menu first to avoid stuck state when returning via back
      closeMenu();
      // do not prevent default: let browser navigate
    }
  });

  // Optional: Auto-hide button on wider screens (in case user resizes)
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980) {
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ========================================================
   PAYTM PREMIUM — Main JavaScript
   Features:
   - Navbar scroll effect
   - Mobile nav drawer
   - Sign In modal (phone + OTP)
   - Recharge drawer
   - Movie ticket seat selector
   - Toast notification system
   - Scroll reveal animations
   - Accordion footer
   - Scroll-to-top button
   - Stats counter animation
   ======================================================== */

'use strict';

/* ── Utility: Wait for DOM ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initSignInModal();
  initRechargeDrawer();
  initMovieDrawer();
  initScrollReveal();
  initAccordion();
  initScrollTopBtn();
  initStatsCounter();
  initServiceCardClicks();
});

/* ════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ════════════════════════════════════════════════════════ */
function showToast({ title = '', message = '', type = 'info', duration = 4000 }) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div>
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto-remove
  const timer = setTimeout(() => removeToast(toast), duration);
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.classList.add('closing');
  setTimeout(() => toast.remove(), 350);
}

/* ════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════
   MOBILE NAV DRAWER
   ════════════════════════════════════════════════════════ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('mobile-nav-overlay');
  const closeBtn = document.getElementById('mobile-nav-close');

  if (!hamburger || !drawer) return;

  const open = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);

  // Close on nav link click
  drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      close();
    });
  });
}

/* ════════════════════════════════════════════════════════
   SIGN IN MODAL (Phone + OTP Flow)
   ════════════════════════════════════════════════════════ */
function initSignInModal() {
  const signInBtns = document.querySelectorAll('.open-signin');
  const modal = document.getElementById('signin-modal');
  const overlay = document.getElementById('signin-overlay');
  const closeBtn = document.getElementById('signin-close');
  const phoneStep = document.getElementById('step-phone');
  const otpStep = document.getElementById('step-otp');
  const phoneInput = document.getElementById('signin-phone');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const verifyBtn = document.getElementById('verify-otp-btn');
  const displayPhone = document.getElementById('display-phone');
  const changeBtn = document.getElementById('change-number-btn');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    showPhoneStep();
    setTimeout(() => phoneInput?.focus(), 350);
  };

  const closeModal = () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(resetModal, 400);
  };

  const showPhoneStep = () => {
    if (phoneStep) phoneStep.style.display = 'block';
    if (otpStep)   otpStep.style.display   = 'none';
  };

  const showOtpStep = (phone) => {
    if (phoneStep) phoneStep.style.display = 'none';
    if (otpStep)   otpStep.style.display   = 'block';
    if (displayPhone) displayPhone.textContent = '+91 ' + phone;
    // Auto-fill mock OTP after 1.5s
    setTimeout(() => fillMockOtp(), 1500);
  };

  const resetModal = () => {
    showPhoneStep();
    if (phoneInput) phoneInput.value = '';
    clearOtpInputs();
  };

  signInBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', closeModal);

  // Phone number validation + send OTP
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const phone = phoneInput?.value.trim();
      if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        showToast({ title: 'Invalid Number', message: 'Please enter a valid 10-digit mobile number.', type: 'error' });
        phoneInput?.focus();
        return;
      }
      // Simulate loading
      sendOtpBtn.disabled = true;
      sendOtpBtn.innerHTML = '<span class="spinner"></span>';
      setTimeout(() => {
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = 'Send OTP';
        showOtpStep(phone);
        showToast({ title: 'OTP Sent!', message: `A 6-digit OTP has been sent to +91 ${phone}`, type: 'success' });
      }, 1400);
    });
  }

  // Allow pressing Enter on phone input
  if (phoneInput) {
    phoneInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendOtpBtn?.click();
    });
  }

  // Change number
  if (changeBtn) changeBtn.addEventListener('click', showPhoneStep);

  // OTP input handling
  setupOtpInputs();

  // Verify OTP
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      const otp = getOtpValue();
      if (otp.length < 6) {
        showToast({ title: 'Incomplete OTP', message: 'Please enter all 6 digits of the OTP.', type: 'error' });
        return;
      }
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<span class="spinner"></span>';
      setTimeout(() => {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = 'Verify & Login';
        closeModal();
        showToast({
          title: 'Welcome to Paytm! 👋',
          message: 'You have successfully logged in.',
          type: 'success',
          duration: 5000
        });
      }, 1600);
    });
  }
}

function setupOtpInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(-1);
      if (val && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      if (val) input.classList.add('filled');
      else input.classList.remove('filled');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].value = '';
        inputs[index - 1].classList.remove('filled');
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      inputs.forEach((inp, i) => {
        inp.value = text[i] || '';
        if (text[i]) inp.classList.add('filled');
      });
      if (text.length >= 6) inputs[5].focus();
    });
  });
}

function fillMockOtp() {
  const inputs = document.querySelectorAll('.otp-input');
  const mockOtp = '123456';
  inputs.forEach((inp, i) => {
    setTimeout(() => {
      inp.value = mockOtp[i];
      inp.classList.add('filled');
      if (i === inputs.length - 1) inp.focus();
    }, i * 100);
  });
}

function clearOtpInputs() {
  document.querySelectorAll('.otp-input').forEach(inp => {
    inp.value = '';
    inp.classList.remove('filled');
  });
}

function getOtpValue() {
  return Array.from(document.querySelectorAll('.otp-input')).map(i => i.value).join('');
}

/* ════════════════════════════════════════════════════════
   RECHARGE DRAWER
   ════════════════════════════════════════════════════════ */
function initRechargeDrawer() {
  const drawer = document.getElementById('recharge-drawer');
  const overlay = document.getElementById('recharge-overlay');
  const closeBtn = document.getElementById('recharge-close');
  const payBtn = document.getElementById('recharge-pay-btn');
  const mobileInput = document.getElementById('recharge-mobile');
  const amountInput = document.getElementById('recharge-amount');

  if (!drawer) return;

  window.openRechargeDrawer = (type = 'Mobile Recharge') => {
    const titleEl = document.getElementById('recharge-type-title');
    if (titleEl) titleEl.textContent = type;
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobileInput?.focus(), 400);
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);

  // Quick amount selection
  document.querySelectorAll('.quick-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-amount').forEach(b => {
        b.classList.remove('selected-amount');
        b.style.background = '';
        b.style.color = '';
      });
      btn.classList.add('selected-amount');
      btn.style.background = '#00baf2';
      btn.style.color = 'white';
      if (amountInput) amountInput.value = btn.dataset.amount;
    });
  });

  if (payBtn) {
    payBtn.addEventListener('click', () => {
      const mobile = mobileInput?.value.trim();
      const amount = amountInput?.value.trim();

      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        showToast({ title: 'Invalid Number', message: 'Please enter a valid 10-digit mobile number.', type: 'error' });
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) < 10) {
        showToast({ title: 'Invalid Amount', message: 'Please enter a valid recharge amount (min ₹10).', type: 'error' });
        return;
      }

      payBtn.disabled = true;
      payBtn.innerHTML = '<span class="spinner"></span> Processing...';

      setTimeout(() => {
        payBtn.disabled = false;
        payBtn.innerHTML = 'Pay Now';
        closeDrawer();
        showToast({
          title: '✅ Recharge Successful!',
          message: `₹${amount} recharge for ${mobile} done!`,
          type: 'success',
          duration: 5000
        });
        if (mobileInput) mobileInput.value = '';
        if (amountInput) amountInput.value = '';
      }, 2000);
    });
  }
}

/* ════════════════════════════════════════════════════════
   MOVIE TICKET SEAT SELECTOR
   ════════════════════════════════════════════════════════ */
function initMovieDrawer() {
  const drawer = document.getElementById('movie-drawer');
  const overlay = document.getElementById('movie-overlay');
  const closeBtn = document.getElementById('movie-close');
  const bookBtn = document.getElementById('book-seats-btn');
  const totalEl = document.getElementById('seat-total');
  const countEl = document.getElementById('seat-count');

  if (!drawer) return;

  const PRICE_PER_SEAT = 250;
  // Pre-booked seats
  const bookedSeats = new Set(['A2', 'A5', 'B3', 'C1', 'C6', 'D4', 'E2', 'E5', 'F3']);
  let selectedSeats = new Set();

  window.openMovieDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    buildSeatMap();
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    selectedSeats.clear();
    updateSeatSummary();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay)  overlay.addEventListener('click', closeDrawer);

  function buildSeatMap() {
    const container = document.getElementById('seat-map');
    if (!container) return;
    container.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = 8;

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'flex items-center gap-2 mb-2';
      const rowLabel = document.createElement('span');
      rowLabel.textContent = row;
      rowLabel.className = 'text-xs font-bold text-gray-400 w-4 text-center';
      rowDiv.appendChild(rowLabel);

      for (let c = 1; c <= cols; c++) {
        const seatId = `${row}${c}`;
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seat = seatId;
        seat.title = seatId;

        if (bookedSeats.has(seatId)) {
          seat.classList.add('booked');
          seat.textContent = '✕';
        } else {
          seat.addEventListener('click', () => toggleSeat(seatId, seat));
        }

        rowDiv.appendChild(seat);
      }
      container.appendChild(rowDiv);
    });
  }

  function toggleSeat(id, el) {
    if (selectedSeats.has(id)) {
      selectedSeats.delete(id);
      el.classList.remove('selected');
    } else {
      if (selectedSeats.size >= 6) {
        showToast({ message: 'You can select up to 6 seats at once.', type: 'warning' });
        return;
      }
      selectedSeats.add(id);
      el.classList.add('selected');
    }
    updateSeatSummary();
  }

  function updateSeatSummary() {
    const count = selectedSeats.size;
    const total = count * PRICE_PER_SEAT;
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = `₹${total}`;
    if (bookBtn) bookBtn.disabled = count === 0;
  }

  updateSeatSummary();

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      if (selectedSeats.size === 0) return;
      const seats = Array.from(selectedSeats).join(', ');
      const total = selectedSeats.size * PRICE_PER_SEAT;

      bookBtn.disabled = true;
      bookBtn.innerHTML = '<span class="spinner"></span> Booking...';

      setTimeout(() => {
        bookBtn.disabled = false;
        bookBtn.innerHTML = 'Book Seats';
        closeDrawer();
        showToast({
          title: '🎬 Booking Confirmed!',
          message: `Seats ${seats} booked for ₹${total}. Enjoy the show!`,
          type: 'success',
          duration: 6000
        });
      }, 2000);
    });
  }
}

/* ════════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

/* ════════════════════════════════════════════════════════
   ACCORDION FOOTER
   ════════════════════════════════════════════════════════ */
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ════════════════════════════════════════════════════════
   SCROLL TO TOP BUTTON
   ════════════════════════════════════════════════════════ */
function initScrollTopBtn() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════════════════
   STATS COUNTER ANIMATION
   ════════════════════════════════════════════════════════ */
function initStatsCounter() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const isFloat = !Number.isInteger(target);
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(current + increment, target);
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (step >= steps) clearInterval(timer);
  }, duration / steps);
}

/* ════════════════════════════════════════════════════════
   SERVICE CARD CLICK HANDLERS
   ════════════════════════════════════════════════════════ */
function initServiceCardClicks() {
  // Recharge section cards
  const rechargeCards = {
    'mobile-recharge': 'Mobile Recharge',
    'dth-recharge': 'DTH Recharge',
    'electricity-bill': 'Electricity Bill',
    'credit-card-bill': 'Credit Card Bill',
    'gas-bill': 'Gas Bill',
    'broadband': 'Broadband/Landline',
    'water-bill': 'Water Bill',
  };

  Object.entries(rechargeCards).forEach(([id, label]) => {
    const card = document.getElementById(id);
    if (card) {
      card.addEventListener('click', () => openRechargeDrawer(label));
    }
  });

  // Movie ticket card
  const movieCard = document.getElementById('movie-tickets');
  if (movieCard) {
    movieCard.addEventListener('click', () => openMovieDrawer());
  }

  // Other "Book & Buy" cards
  const bookBuyCards = [
    'flight-tickets', 'bus-tickets', 'train-tickets',
    'car-insurance', 'fastag', 'google-play'
  ];

  bookBuyCards.forEach(id => {
    const card = document.getElementById(id);
    if (card) {
      card.addEventListener('click', () => {
        showToast({
          title: 'Opening...',
          message: `Redirecting to ${card.dataset.label || 'booking'} page.`,
          type: 'info'
        });
      });
    }
  });

  // "Learn More" buttons
  document.querySelectorAll('.learn-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast({
        message: 'This feature is coming soon on the live app!',
        type: 'info'
      });
    });
  });

  // Download App buttons
  document.querySelectorAll('.download-app-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast({
        title: '📱 Paytm App',
        message: 'Redirecting to your app store...',
        type: 'success'
      });
    });
  });

  // App store / social links
  document.querySelectorAll('.app-store-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast({
        title: 'Download Paytm App',
        message: 'Opening store link...',
        type: 'info'
      });
    });
  });
}

/**
 * Bjelland Entreprenør AS - Main JavaScript
 * ==========================================
 */

(function() {
  'use strict';

  // DOM Elements
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  const contactForm = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  /**
   * Mobile Navigation Toggle
   */
  function initMobileNav() {
    if (!navToggle || !navMobile) return;

    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMobile.classList.toggle('active');
      document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav when clicking a link
    const navLinks = navMobile.querySelectorAll('a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close mobile nav on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMobile.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /**
   * Header Scroll Effect
   */
  function initHeaderScroll() {
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleScroll() {
      const currentScroll = window.pageYOffset;

      // Add shadow when scrolled
      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    // Throttle scroll event for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Smooth Scroll for Anchor Links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Contact Form Handling
   */
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Hide any existing messages
      if (successMessage) successMessage.style.display = 'none';
      if (errorMessage) errorMessage.style.display = 'none';

      // Check honeypot field (spam protection)
      const honeypot = document.getElementById('website');
      if (honeypot && honeypot.value) {
        // Likely a bot, silently fail
        console.log('Spam detected');
        return;
      }

      // Get form data
      const formData = new FormData(this);
      const data = {};
      formData.forEach(function(value, key) {
        if (key !== 'website') { // Exclude honeypot
          data[key] = value;
        }
      });

      // Validate required fields
      const requiredFields = ['name', 'phone', 'email', 'message'];
      let isValid = true;

      requiredFields.forEach(function(field) {
        const input = document.getElementById(field);
        if (!input || !input.value.trim()) {
          isValid = false;
          if (input) {
            input.style.borderColor = '#dc3545';
          }
        } else {
          if (input) {
            input.style.borderColor = '';
          }
        }
      });

      // Validate email format
      const emailInput = document.getElementById('email');
      if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          isValid = false;
          emailInput.style.borderColor = '#dc3545';
        }
      }

      // Validate phone format (Norwegian)
      const phoneInput = document.getElementById('phone');
      if (phoneInput && phoneInput.value) {
        const phoneClean = phoneInput.value.replace(/\s/g, '');
        const phoneRegex = /^(\+47)?[0-9]{8}$/;
        if (!phoneRegex.test(phoneClean)) {
          // Still allow submission, just log
          console.log('Phone format may be non-standard');
        }
      }

      if (!isValid) {
        if (errorMessage) {
          errorMessage.textContent = 'Vennligst fyll ut alle påkrevde felt.';
          errorMessage.style.display = 'block';
        }
        return;
      }

      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span>Sender...</span>';
      submitButton.disabled = true;

      // Simulate form submission (replace with actual API call)
      // In production, this would send to an email API like Resend or EmailJS
      setTimeout(function() {
        // For demo purposes, always show success
        // In production, handle actual API response

        if (successMessage) {
          successMessage.style.display = 'block';
        }

        // Reset form
        contactForm.reset();

        // Restore button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        // Scroll to message
        if (successMessage) {
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Log form data (for development)
        console.log('Form submitted with data:', data);

      }, 1500);

      /*
      // Production implementation with Resend API
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_RESEND_API_KEY'
        },
        body: JSON.stringify({
          from: 'noreply@bjelland-entreprenor.no',
          to: 'post@bjelland-entreprenor.no',
          subject: 'Ny henvendelse fra nettsiden',
          html: `
            <h2>Ny henvendelse</h2>
            <p><strong>Navn:</strong> ${data.name}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>E-post:</strong> ${data.email}</p>
            <p><strong>Adresse:</strong> ${data.address || 'Ikke oppgitt'}</p>
            <p><strong>Type arbeid:</strong> ${data.service || 'Ikke valgt'}</p>
            <p><strong>Tidspunkt:</strong> ${data.timing || 'Ikke valgt'}</p>
            <p><strong>Melding:</strong></p>
            <p>${data.message}</p>
          `
        })
      })
      .then(response => {
        if (response.ok) {
          successMessage.style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error('API error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
      })
      .finally(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      });
      */
    });

    // Remove error styling on input
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(function(input) {
      input.addEventListener('input', function() {
        this.style.borderColor = '';
      });
    });
  }

  /**
   * Lazy Loading for Images
   */
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(function(img) {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // Fallback for older browsers
      const lazyImages = document.querySelectorAll('img[data-src]');

      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });

        lazyImages.forEach(function(img) {
          imageObserver.observe(img);
        });
      } else {
        // Fallback for very old browsers
        lazyImages.forEach(function(img) {
          img.src = img.dataset.src;
        });
      }
    }
  }

  /**
   * Fade In Animation on Scroll
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .service-detail, .feature-item, .value-card, .project-card');

    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
      });
    } else {
      // Fallback - just show elements
      animatedElements.forEach(function(el) {
        el.classList.add('fade-in');
      });
    }
  }

  /**
   * Phone Number Click Tracking (for analytics)
   */
  function initPhoneTracking() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        // Track phone click (integrate with your analytics)
        console.log('Phone number clicked');

        // If using Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            event_category: 'Contact',
            event_label: 'Phone Call',
            value: 1
          });
        }
      });
    });
  }

  /**
   * Email Link Click Tracking
   */
  function initEmailTracking() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

    emailLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        console.log('Email link clicked');

        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            event_category: 'Contact',
            event_label: 'Email',
            value: 1
          });
        }
      });
    });
  }

  /**
   * Active Navigation State
   */
  function setActiveNavState() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');

    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Year Update in Footer
   */
  function updateFooterYear() {
    const yearSpans = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearSpans.forEach(function(span) {
      span.textContent = currentYear;
    });
  }

  /**
   * Print Friendly
   */
  function initPrintFriendly() {
    // Add print button functionality if needed
    const printButtons = document.querySelectorAll('.print-button');

    printButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
      });
    });
  }

  /**
   * Accessibility Improvements
   */
  function initAccessibility() {
    // Skip to main content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        e.preventDefault();
        const main = document.querySelector('main') || document.querySelector('.hero');
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus();
        }
      });
    }

    // Focus trap for mobile nav
    if (navMobile) {
      const focusableElements = navMobile.querySelectorAll('a, button');
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      navMobile.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });
    }
  }

  /**
   * Initialize All Functions
   */
  function init() {
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initContactForm();
    initLazyLoading();
    initScrollAnimations();
    initPhoneTracking();
    initEmailTracking();
    setActiveNavState();
    updateFooterYear();
    initPrintFriendly();
    initAccessibility();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions globally if needed
  window.BjellandEntreprenor = {
    init: init
  };

})();

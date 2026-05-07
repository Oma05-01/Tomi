document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const preloader = document.getElementById("preloader");
  const intro = document.getElementById("intro");
  const overlay = document.getElementById("overlay");
  const bio = document.getElementById("bio");
  const video = document.getElementById("intro-video");
  const mainContent = document.getElementById("main-content");
  const skipNotification = document.getElementById("skip-notification");

  // State flags (Caching these prevents heavy DOM checks during video playback)
  let notificationShown = false;
  let bioVisible = false;
  let bioFadingOut = false;
  let mainVisible = false;
  let lastTapTime = 0;

  // ==========================================
  // 1. SKIP LOGIC & INTERACTION ENGINE
  // ==========================================

  function skipIntro() {
    if (preloader) preloader.style.display = 'none';
    if (intro) intro.style.display = 'none';
    if (bio) bio.style.display = 'none';
    if (mainContent) {
      mainContent.style.display = 'block';
      requestAnimationFrame(() => {
        mainContent.classList.add('fade-in');
      });
      mainContent.style.setProperty('--main-blur', '0px');
    }
    if (intro) intro.style.setProperty('--blur-amount', '8px');

    if (video) {
      video.pause();
      // Performance: Removing the video source frees up memory for the heavy gallery images
      video.removeAttribute('src');
      video.load();
    }
  }

  // Unified elegant double-tap/double-click handler
  function handleDoubleAction(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 500 && tapLength > 0) {
      skipIntro();
    }
    lastTapTime = currentTime;
  }

  if (intro) {
    intro.addEventListener('touchend', handleDoubleAction, { passive: true });
    intro.addEventListener('click', handleDoubleAction);  // Covers mouse/trackpad
  }

  // Accessibility/UX: Allow pressing 'Space' or 'Escape' to skip
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Escape') && intro && intro.style.display !== 'none') {
      skipIntro();
    }
  });

  // ==========================================
  // 2. TIMING & SEQUENCING
  // ==========================================

  // Check if URL has #main-content to skip preloader and intro
  if (window.location.hash === '#main-content') {
    skipIntro();
  } else {
    // Exact preloader fade-out timing preserved (2500ms)
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add("fade-out");
        preloader.addEventListener("transitionend", () => {
          preloader.style.display = "none";
          if (intro) intro.style.display = "block";
        }, { once: true });
      }
    }, 2500);
  }

  // ==========================================
  // 3. CINEMATIC VIDEO ENGINE
  // ==========================================

  if (video) {
    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;

      // Exact timing preserved
      const showBioTime = Math.max(duration - 10, 0);
      const showMainTime = Math.max(duration - 2, 0);
      const blurStart = Math.max(duration - 0.5, 0);
      const bioFadeOutTime = Math.max(duration - 1, 0);

      video.addEventListener('timeupdate', () => {
        const t = video.currentTime;

        // Skip notification
        if (t >= 2 && !notificationShown && skipNotification) {
          notificationShown = true;
          skipNotification.style.display = 'block';
          requestAnimationFrame(() => {
            skipNotification.classList.add('visible');
          });

          setTimeout(() => {
            skipNotification.classList.remove('visible');
            setTimeout(() => skipNotification.style.display = 'none', 500);
          }, 3000); // Extended slightly so users can actually read it
        }

        // Bio fade-in (Optimized: using boolean flag instead of classList.contains)
        if (t >= showBioTime && !bioVisible && bio) {
          bioVisible = true;
          bio.style.display = 'block';
          // Small delay ensures display:block applies before opacity changes
          requestAnimationFrame(() => bio.classList.add('visible'));
        }

        // Bio fade-out
        if (t >= bioFadeOutTime && !bioFadingOut && bioVisible && bio) {
          bioFadingOut = true;
          bio.classList.remove('visible');
          bio.addEventListener('transitionend', () => {
            bio.style.display = 'none';
          }, { once: true });
        }

        // Main content fade-in with blur-in
        if (t >= showMainTime && mainContent && !mainVisible) {
          mainVisible = true;
          mainContent.style.display = 'block';
          requestAnimationFrame(() => {
            mainContent.classList.add('fade-in');
          });
        }

        // Gradual blur ramp (Calculates frame-by-frame)
        if (t >= blurStart && intro && mainContent) {
          const elapsed = t - blurStart;
          const pct = Math.min(elapsed / 0.5, 1);
          const maxBlur = 8;

          intro.style.setProperty('--blur-amount', (pct * maxBlur).toFixed(2) + 'px');
          mainContent.style.setProperty('--main-blur', ((1 - pct) * maxBlur).toFixed(2) + 'px');
        }
      });
    });

    video.addEventListener('play', () => {
      setTimeout(() => {
        if (overlay) overlay.classList.add('fade-out');
      }, 1000);
    });

    video.addEventListener('ended', () => {
      if (overlay) overlay.classList.add('fade-out');
      if (bio) bio.style.display = 'none';
      if (intro) intro.style.setProperty('--blur-amount', '8px');
      if (mainContent) {
        mainContent.style.setProperty('--main-blur', '0px');
        if (!mainVisible) {
          mainContent.style.display = 'block';
          mainContent.classList.add('fade-in');
        }
      }

      // Performance cleanup
      video.removeAttribute('src');
      video.load();
    });
  }
});

// ==========================================
// 4. CLIENT INTERACTION LAYER (Form Submit)
// ==========================================

document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Luxury UX: Visual feedback during submission
  submitBtn.textContent = 'Transmitting...';
  submitBtn.style.opacity = '0.7';
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

  try {
    const response = await fetch('/submit-contact/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      // Replaced harsh alert() with elegant button state
      submitBtn.textContent = 'Inquiry Received';
      submitBtn.style.backgroundColor = 'var(--logo-accent)'; // Use the brand accent
      submitBtn.style.color = '#fff';
      submitBtn.style.opacity = '1';
      form.reset();

      // Reset button after 4 seconds
      setTimeout(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.style.backgroundColor = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 4000);
    } else {
      throw new Error('Server returned false success status.');
    }
  } catch (error) {
    console.error('Submission error:', error);
    submitBtn.textContent = 'Error. Please Try Again.';
    submitBtn.style.backgroundColor = 'red';

    setTimeout(() => {
      submitBtn.textContent = originalBtnText;
      submitBtn.style.backgroundColor = '';
      submitBtn.style.opacity = '1';
      submitBtn.disabled = false;
    }, 4000);
  }
});
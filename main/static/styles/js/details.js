document.addEventListener('DOMContentLoaded', () => {
  console.log("Couture Details loaded. Initializing cinematic sequence...");

  try {
    // ==========================================
    // 1. GSAP TIMELINE CHOREOGRAPHY
    // ==========================================
    // Using a timeline allows us to link animations together fluidly
    // rather than relying on strict, hard-coded delays.
    const tl = gsap.timeline({
      defaults: { ease: "expo.out" } // Expo.out gives that sharp-then-smooth luxury feel
    });

    // Animate Main Feature Image
    // Using fromTo guarantees the starting state regardless of CSS load times
    tl.fromTo(".main-img",
      {
        y: 60,           // Starts slightly lower
        opacity: 0,
        scale: 1.03      // Slight zoom-in for a cinematic "settling" effect
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.8
      }
    )

    // Animate Detail Cards
    // The "-=1.4" makes this animation start 1.4 seconds BEFORE the main image finishes.
    // This creates a beautiful overlapping cascade effect.
    .fromTo(".card",
      {
        y: 40,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: {
          each: 0.15, // Fast, crisp sequence
          from: "start"
        },
        onComplete: () => {
          // Lock in the visibility so CSS hover effects can take over
          document.querySelectorAll(".card").forEach(card => {
            card.classList.add("loaded");
          });
          console.log("Detail grid sequence complete.");
        }
      },
      "-=1.4" // Overlap parameter
    );

    // ==========================================
    // 2. SCROLL-TRIGGERED NARRATIVE REVEAL
    // ==========================================
    // Instead of animating the description on page load (which ruins the effect
    // if it's off-screen on mobile), we use an IntersectionObserver to wait
    // until the user scrolls down to read it.

    const narrativeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Fire GSAP animation when the narrative enters the viewport
          gsap.fromTo(entry.target,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }
          );

          // Stop observing once animated so it doesn't repeat awkwardly
          narrativeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2 // Triggers when 20% of the text is visible on screen
    });

    const description = document.querySelector(".description");
    if (description) {
      narrativeObserver.observe(description);
    }

    // ==========================================
    // 3. SAFETY FALLBACK (Preserved)
    // ==========================================
    // In case user has prefers-reduced-motion or JS hangs
    setTimeout(() => {
      document.querySelectorAll(".card").forEach(card => {
        if (!card.classList.contains("loaded")) {
          card.style.opacity = "1";
          card.style.transform = "none";
          card.classList.add("loaded");
        }
      });
      if (description && description.style.opacity === "0") {
        description.style.opacity = "1";
      }
    }, 4000);

  } catch (error) {
    console.error("GSAP Engine Error. Falling back to static view.", error);
    // Emergency static fallback
    document.querySelectorAll('.card, .main-img, .description').forEach(el => {
      el.style.opacity = '1';
      if(el.classList.contains('card')) el.classList.add('loaded');
    });
  }
});
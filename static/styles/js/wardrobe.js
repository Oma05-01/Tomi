document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel");
  const items = document.querySelectorAll(".carousel__face");
  const overlay = document.getElementById("previewOverlay");
  const previewImage = document.getElementById("previewImage");
  const closerBtn = document.getElementById("closerLookBtn");
  const closeBtn = document.getElementById("closeOverlayBtn"); // Hooking up the new X button

  if (!carousel || items.length === 0) return; // Safety guard if archive is empty

  // ==========================================
  // 1. DYNAMIC 3D GEOMETRY MATH
  // ==========================================
  const totalItems = items.length;
  const angleStep = 360 / totalItems;

  // Advanced Math: Automatically calculates the perfect radius based on the
  // number of items, ensuring they form a perfect circle without overlapping.
  const itemWidth = 280; // Matches your new CSS
  let calculatedRadius = Math.round((itemWidth / 2) / Math.tan(Math.PI / totalItems));

  // Set a minimum radius of 350 so it still looks good if there are only 2 or 3 items
  const radius = Math.max(350, calculatedRadius + 40);

  items.forEach((item, index) => {
    const angle = index * angleStep;
    item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });

  // ==========================================
  // 2. EXPERIENCE-DRIVEN UX (PAUSE ON INTENT)
  // ==========================================
  // Pause the spinning when the user hovers, so they aren't "chasing" the photo
  carousel.addEventListener("mouseenter", () => carousel.classList.add("paused"));

  carousel.addEventListener("mouseleave", () => {
    // Only resume spinning if the modal is NOT currently open
    if (!overlay.classList.contains("active")) {
      carousel.classList.remove("paused");
    }
  });

  // ==========================================
  // 3. CINEMATIC MODAL LOGIC (GSAP)
  // ==========================================
  function closeOverlay() {
    // Cinematic exit
    gsap.to(".preview-content", { y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        overlay.classList.remove("active");
        overlay.style.display = "none";
        carousel.classList.remove("paused"); // Resume spinning when closed
      }
    });
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      // 1. Lock the carousel so it doesn't spin in the background
      carousel.classList.add("paused");

      // 2. Extract image safely using Regex (better than slicing specific character counts)
      const style = window.getComputedStyle(item);
      const bgImage = style.backgroundImage;
      const imgSrc = bgImage.replace(/(url\(|\)|"|')/g, '');
      const photoId = item.dataset.photoId;

      // 3. Populate modal
      previewImage.src = imgSrc;
      closerBtn.href = `/detail/${photoId}`;

      // 4. GSAP Cinematic Entrance
      overlay.style.display = "flex";
      overlay.classList.add("active");

      // Fade in the dark void
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      // Slide up and gently scale in the photo and button
      gsap.fromTo(".preview-content",
        { y: 40, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.1 }
      );
    });
  });

  // ==========================================
  // 4. ROBUST CLOSING MECHANISMS
  // ==========================================
  // Close via the new X button
  if (closeBtn) {
    closeBtn.addEventListener("click", closeOverlay);
  }

  // Close via clicking the background void
  overlay.addEventListener("click", (e) => {
    if (!e.target.closest(".preview-content") && !e.target.closest(".overlay-close-btn")) {
      closeOverlay();
    }
  });

  // Luxury UX: Allow users to close the modal by pressing the 'Escape' key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeOverlay();
    }
  });
});
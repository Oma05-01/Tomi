document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.zoom-link');
  const detailContainer = document.getElementById('detail-container');

  // Intercept clicks on any .zoom-link
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const thumb = link.querySelector('img');
      const url   = link.href;
      zoomToFullScreen(thumb, url);
    });
  });

  // Handle browser Back button
  window.addEventListener('popstate', evt => {
    if (evt.state && evt.state.detailURL) {
      reverseZoom(evt.state.detailURL);
    }
  });

  function zoomToFullScreen(thumbImg, url) {
    const rect  = thumbImg.getBoundingClientRect();
    const clone = thumbImg.cloneNode();
    clone.classList.add('zoom-clone');
    document.body.append(clone);

    // position the clone over the thumbnail
    clone.style.width  = rect.width  + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.top    = rect.top    + 'px';
    clone.style.left   = rect.left   + 'px';
    clone.style.transform = 'none';

    // compute scale & translation to fill viewport
    const scaleX = window.innerWidth  / rect.width;
    const scaleY = window.innerHeight / rect.height;
    const tx     = -rect.left;
    const ty     = -rect.top;

    requestAnimationFrame(() => {
      clone.style.transform = `
        translate(${tx}px, ${ty}px)
        scale(${scaleX}, ${scaleY})
      `;
    });

    clone.addEventListener('transitionend', () => {
      // pushState so Back works
      history.pushState({ detailURL: url }, '', url);

      // fetch detail HTML (only fragment) via AJAX
      fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(r => r.text())
        .then(html => {
          detailContainer.innerHTML = html;
          document.body.classList.add('detail-open');
          clone.remove();
        });
    }, { once: true });
  }

  function reverseZoom(url) {
    const detailImg = detailContainer.querySelector('img');
    const link      = document.querySelector(`.zoom-link[href="${url}"]`);
    const thumbImg  = link.querySelector('img');
    const startRect = detailImg.getBoundingClientRect();
    const endRect   = thumbImg.getBoundingClientRect();
    const clone     = detailImg.cloneNode();

    clone.classList.add('zoom-clone');
    document.body.append(clone);

    // start clone at full-screen image
    clone.style.width     = startRect.width  + 'px';
    clone.style.height    = startRect.height + 'px';
    clone.style.top       = startRect.top    + 'px';
    clone.style.left      = startRect.left   + 'px';
    clone.style.transform = 'none';

    // hide the injected detail view
    document.body.classList.remove('detail-open');

    // compute transform back to thumbnail
    const scaleX = endRect.width  / startRect.width;
    const scaleY = endRect.height / startRect.height;
    const tx     = endRect.left   - startRect.left;
    const ty     = endRect.top    - startRect.top;

    requestAnimationFrame(() => {
      clone.style.transform = `
        translate(${tx}px, ${ty}px)
        scale(${scaleX}, ${scaleY})
      `;
    });

    clone.addEventListener('transitionend', () => {
      clone.remove();
      detailContainer.innerHTML = '';
    }, { once: true });
  }
});

(function(){
  // Generic UI helpers used by all pages
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

  window.mailtoSubmit = function(){
    const form = document.getElementById('contact-form');
    console.log('mailtoSubmit invoked');
    if(!form) { console.warn('contact-form not found'); return; }
    // show form snapshot for debugging (not sensitive) — do not log whole message in prod
    console.log('form values', {
      name: form.elements['name'] ? form.elements['name'].value : '',
      email: form.elements['email'] ? form.elements['email'].value : '',
      subject: form.elements['subject'] ? form.elements['subject'].value : ''
    });

  // set UI status
  setStatus('Skickar…', 'sending');

  // Ensure EmailJS SDK is available (dynamically load if needed) before trying to send.
    // If it loads, we'll try EmailJS; otherwise we'll fall back to mailto.
    ensureEmailJsLoaded().then(() => {
      console.log('ensureEmailJsLoaded resolved, window.emailjs?', !!window.emailjs);
      trySendViaEmailJs(form);
    }).catch(err => {
      console.warn('EmailJS SDK not available or failed to load:', err);
      trySendViaEmailJs(form); // try anyway; will fallback if not present
    });
    return; // send handled asynchronously
  }

  // UI helper for contact status (shows inline messages instead of alerts)
  function setStatus(message, kind){
    const el = document.getElementById('contact-status');
    if(!el) return; if(!message){ el.hidden = true; return; }
    el.textContent = message;
    el.classList.remove('sending','success','error');
    if(kind) el.classList.add(kind);
    el.hidden = false;
  }

  // Helper: attempt send via EmailJS if available, otherwise fallback
  async function trySendViaEmailJs(form){
    console.log('trySendViaEmailJs - window.emailjs?', !!window.emailjs);
    const templateParams = {
      from_name: form.elements['name'] ? form.elements['name'].value : '',
      reply_to: form.elements['email'] ? form.elements['email'].value : '',
      subject: form.elements['subject'] ? form.elements['subject'].value : '',
      message: form.elements['message'] ? form.elements['message'].value : ''
    };

    // Prefer SDK if available
    try {
      if(window.emailjs && emailjs.send) {
        console.log('Attempting EmailJS.send via SDK', 'service_ms33alm', 'template_atttpp7', templateParams);
        emailjs.send('service_ms33alm', 'template_atttpp7', templateParams)
          .then(function(response) {
            console.log('EmailJS SUCCESS', response.status, response.text);
            setStatus('Skickat! Tack för ditt meddelande.', 'success');
            form.reset();
          }, function(err) {
            console.error('EmailJS error (SDK)', err);
            setStatus('Kunde inte skicka via EmailJS SDK, försöker via REST API...', 'error');
            fallbackToRest();
          });
        return;
      }
    } catch(e){
      console.warn('EmailJS send exception (SDK)', e);
    }

    // If SDK not available (blocked by extension/CSP), try direct REST API call to EmailJS
    async function fallbackToRest(){
      const payload = {
        service_id: 'service_ms33alm',
        template_id: 'template_atttpp7',
        user_id: 'gUXxwoVUfq7pdLYGq', // public key from your index.html
        template_params: templateParams
      };

      try{
        console.log('Attempting EmailJS REST POST to /api/v1.0/email/send', payload);
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if(res.ok){
          console.log('EmailJS REST success', res.status);
          setStatus('Skickat! Tack för ditt meddelande.', 'success');
          form.reset();
          return;
        }

        const text = await res.text();
        console.error('EmailJS REST error', res.status, text);
        setStatus('Kunde inte skicka via EmailJS REST. Öppnar din e‑postklient som fallback.', 'error');
      }catch(err){
        console.error('EmailJS REST request failed', err);
        setStatus('Kunde inte nå EmailJS (REST). Öppnar din e‑postklient som fallback.', 'error');
      }

      // final fallback
      fallbackMailto(form);
    }

    // Call the REST fallback immediately (SDK not present)
    fallbackToRest();
  }

  // Ensure EmailJS SDK is loaded; dynamically inject if missing. Resolves when available or rejects on timeout/error.
  function ensureEmailJsLoaded(timeoutMs = 4000){
    return new Promise((resolve, reject) => {
      if(window.emailjs && emailjs.send) return resolve();

      // If script already injected dynamically, wait for it
      const existing = document.querySelector('script[data-emailjs-dyn]');
      if(!existing){
        const s = document.createElement('script');
        s.src = 'https://cdn.emailjs.com/sdk/3.2.0/email.min.js';
        s.setAttribute('data-emailjs-dyn','1');
        s.onload = function(){
          try { if(window.emailjs && emailjs.init) emailjs.init('gUXxwoVUfq7pdLYGq'); } catch(e){}
          resolve();
        };
        s.onerror = function(){ reject(new Error('Failed to load EmailJS script')); };
        document.head.appendChild(s);
      }

      // Poll until available or timeout
      const start = Date.now();
      (function check(){
        if(window.emailjs && emailjs.send) return resolve();
        if(Date.now() - start > timeoutMs) return reject(new Error('EmailJS load timeout'));
        setTimeout(check, 120);
      })();
    });
  }

  function fallbackMailto(form){
  const name = form.elements['name'] ? form.elements['name'].value : '';
  const email = form.elements['email'] ? form.elements['email'].value : '';
  const subject = form.elements['subject'] ? form.elements['subject'].value : 'Contact from portfolio';
  const message = form.elements['message'] ? form.elements['message'].value : '';
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  const mailtoUrl = `mailto:your.email@example.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  console.log('Invoking fallback mailto with URL:', mailtoUrl);
  window.location.href = mailtoUrl;
  }

  // Projects page - fetch public GitHub repos for the username set on <body data-github-user="...">
  async function loadGithubRepos(){
    const reposEl = document.getElementById('repos');
    if(!reposEl) return;
    const user = document.body.getAttribute('data-github-user') || 'octocat';
  reposEl.innerHTML = 'Loading repos...';
    try{
      const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=10&sort=updated`);
      if(!res.ok) throw new Error(`GitHub API fel: ${res.status}`);
      const repos = await res.json();
      if(!repos || repos.length === 0){ reposEl.innerHTML = '<p>Inga publika repos hittades.</p>'; return; }
      reposEl.innerHTML = '';
      repos.forEach(r=>{
        const div = document.createElement('div'); div.className = 'repo';
        div.innerHTML = `
          <h3><a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)}</a></h3>
          <p class="meta">${escapeHtml(r.description || '')} • ${r.language || ''} • ⭐ ${r.stargazers_count}</p>
        `;
        reposEl.appendChild(div);
      });
    }catch(err){
      console.error(err);
  reposEl.innerHTML = '<p>Could not fetch GitHub repos. Check the username or rate limit.</p>';
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]});
  }

  // Run on pages where applicable
  if(document.getElementById('repos')) loadGithubRepos();

  // Mobile nav toggle logic
  (function(){
    const toggle = document.querySelector('.nav-toggle');
    const navList = document.getElementById('site-navigation');
    if(!toggle || !navList) return;

    function setOpen(open){
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) navList.classList.add('mobile-open'); else navList.classList.remove('mobile-open');
    }

    toggle.addEventListener('click', function(e){
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', function(e){
      if(!navList.classList.contains('mobile-open')) return;
      if(e.target === toggle || toggle.contains(e.target)) return;
      if(e.target === navList || navList.contains(e.target)) return;
      setOpen(false);
    });

    // Close on escape
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });

    // Close and remove mobile class when resizing to large screens
    window.addEventListener('resize', function(){ if(window.innerWidth > 600) setOpen(false); });
  })();

  // Sticky header on scroll
  (function(){
    const header = document.querySelector('.site-header');
    if(!header) return;
    const onScroll = () => {
      if(window.scrollY > 20) header.classList.add('sticky'); else header.classList.remove('sticky');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  })();

  // Smooth scroll for in-page anchor links with offset for sticky header
  (function(){
    // Replace existing scrollToHash with this
    function scrollToHash(hash){
      const el = document.querySelector(hash);
      if(!el) return false;

      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 72;
      const start = window.pageYOffset;
      const rect = el.getBoundingClientRect();

      // Extra pixels to leave between header and section (tweak this)
      const EXTRA_OFFSET = -5; // <-- ändra här (px). Öka för att scrolla längre ner.

      const target = rect.top + window.pageYOffset - headerHeight - EXTRA_OFFSET;

      // Duration scales with distance (keeps feel consistent)
      const distance = Math.abs(target - start);
      const duration = Math.max(300, Math.min(1200, Math.round(distance * 0.55)));

      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      let startTime = null;

      function step(timestamp){
        if(!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(progress);
        const current = start + (target - start) * eased;
        window.scrollTo(0, Math.round(current));
        if(progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      return true;
    }

    // Attach handler for anchors that are hash links. If the target exists in the
    // current document, prevent default and smooth-scroll. If it doesn't exist
    // (click originated on another page), navigate to index.html with the hash.
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e){
        const hash = this.getAttribute('href');
        if(!hash) return;

        const targetExists = document.querySelector(hash) !== null;

        if(targetExists){
          e.preventDefault();
          // Special-case the home anchor: scroll to top smoothly instead of forcing a reload
          if(hash === '#home' || hash === '#'){
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Update the URL without jumping
            if(history && history.replaceState) history.replaceState(null, '', window.location.pathname);
            return;
          }

          // Smooth scroll to the in-page target and update the URL hash without jumping
          scrollToHash(hash);
          if(history && history.pushState) history.pushState(null, '', hash);
          else window.location.hash = hash;
        } else {
          // Target not present in this document — navigate to index with the hash.
          // Use a relative path so it works when served from a folder.
          e.preventDefault();
          window.location.href = 'index.html' + hash;
        }
      });
    });

    // If the page loads with a hash, wait for load and then attempt a smooth scroll
    // only when the target exists. This avoids races where the browser has already
    // jumped or the element isn't yet available.
    if(window.location.hash){
      window.addEventListener('load', () => {
        setTimeout(()=>{
          const hash = window.location.hash;
          if(!hash) return;
          const scrolled = scrollToHash(hash);
          if(!scrolled){
            // fallback: scroll to top if target not found
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 80);
      });
    }
  })();

    // Toggle a class when About section is visible to show a centered divider
    (function(){
      const about = document.getElementById('about');
      if(!about) return;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if(e.isIntersecting && e.intersectionRatio >= 0.5) document.body.classList.add('about-visible');
          else if(!e.isIntersecting) document.body.classList.remove('about-visible');
        });
      }, { threshold: [0, 0.5, 1] });
      observer.observe(about);
    })();

    // Ensure contact form submit is observed (helps debug cases where inline onclick isn't firing)
    (function(){
      const form = document.getElementById('contact-form');
      if(!form) return;
      form.addEventListener('submit', function(e){
        e.preventDefault();
        console.log('contact-form submit listener fired');
        try { mailtoSubmit(); } catch(err){ console.error('mailtoSubmit threw', err); }
      });
    })();
})();

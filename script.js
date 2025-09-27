// script.js — handles page flow, music, and controls
(function() {
  // Elements
  const pages = Array.from(document.querySelectorAll('.page'));
  const navDots = Array.from(document.querySelectorAll('.nav-dot'));
  const btnSkip = document.getElementById('skipToCake');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const playPause = document.getElementById('playPauseMusic');
  const againBtn = document.getElementById('againBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const vol = document.getElementById('vol');
  const bgMusic = document.getElementById('bgMusic');

  let current = 1; // start at page 1
  let heartTimeout = null;
  let autoToCakeDelay = 6000; // ms for auto move from hearts to cake

  // utils
  function showPage(n) {
    pages.forEach(p => {
      const pNum = Number(p.dataset.page);
      if (pNum === n) {
        p.classList.add('active');
        p.setAttribute('aria-hidden', 'false');
      } else {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
      }
    });
    navDots.forEach(d => d.classList.toggle('active', Number(d.dataset.goto) === n));
    current = n;
  }

  // assign goto on nav dots
  navDots.forEach((d, i) => {
    d.dataset.goto = i + 1;
    d.addEventListener('click', () => {
      stopAutoHeart();
      showPage(i + 1);
    });
  });

  // page transitions
  function toCake() {
    stopAutoHeart();
    showPage(2);
    // auto play music on cake page if user device allows
    try { bgMusic.volume = Number(vol.value); bgMusic.play().catch(()=>{}); playPause.textContent = 'Pause Music'; }
    catch(e){}
  }

  function stopAutoHeart(){
    if (heartTimeout) { clearTimeout(heartTimeout); heartTimeout = null; }
  }

  // skip button
  btnSkip.addEventListener('click', toCake);

  // previous/next navigation
  prevBtn && prevBtn.addEventListener('click', () => {
    if (current > 1) showPage(current - 1);
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    if (current < pages.length) showPage(current + 1);
  });

  // play/pause music
  function updatePlayState(){
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play().catch(()=>{ /* autoplay may be blocked; ignore */ });
      playPause.textContent = 'Pause Music';
    } else {
      bgMusic.pause();
      playPause.textContent = 'Play Music';
    }
  }
  playPause && playPause.addEventListener('click', updatePlayState);

  // volume control
  vol && vol.addEventListener('input', (e) => {
    if (bgMusic) bgMusic.volume = Number(e.target.value);
  });

  // again button - go to start
  againBtn && againBtn.addEventListener('click', () => {
    showPage(1);
    scheduleHeartAuto();
  });

  // small keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') { // play/pause music
      e.preventDefault();
      updatePlayState();
    } else if (e.key === 'ArrowRight') {
      if (current < pages.length) showPage(current + 1);
    } else if (e.key === 'ArrowLeft') {
      if (current > 1) showPage(current - 1);
    }
  });

  // schedule auto transition from heart intro to cake
  function scheduleHeartAuto(){
    stopAutoHeart();
    heartTimeout = setTimeout(() => {
      toCake();
    }, autoToCakeDelay);
  }

  // initial start
  showPage(1);
  scheduleHeartAuto();

  // OPTIONAL: if user interacts (clicks anywhere), skip to cake early
  document.getElementById('page-1').addEventListener('click', () => {
    toCake();
  });

  // download/share button: create a basic sharable HTML blob (simple)
  downloadBtn && downloadBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    // Create a small HTML snapshot with images referenced relatively (user can zip)
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Happy Birthday</title></head><body><h1>Happy Birthday!</h1><p>Open this folder and view the assets/ images to see the card.</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    downloadBtn.href = url;
    downloadBtn.download = 'happy-bday-preview.html';
    // automatically revoke after a moment
    setTimeout(()=>URL.revokeObjectURL(url), 60000);
  });

  // Accessibility: if audio not present or not supported, disable playPause
  if (!bgMusic || !bgMusic.canPlayType) {
    playPause.disabled = true;
    playPause.title = "Music not available in this browser";
  }

  // Ensure music volume default from slider
  if (bgMusic) bgMusic.volume = Number(vol.value);

})();

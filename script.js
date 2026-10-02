// ==========================================================================
// ANUSHKA'S SURPRISE - BESPOKE INTERACTION CONTROLLER
// Handles audio players, notebook tabs, lightbox modals, videos, animations & chaos
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initSideNav();
  initMysteryIntro();
  initObservationScroll();
  initGallery();
  initNotebookTabs();
  initNotebookScreenshotStrips();
  initScreenshotModal();
  initChaosSequence();
  initAudioPlayers();
  initStardustCursor();
  initOutroConfetti();
  initInteractiveSoundFX();
});

/* --------------------------------------------------------------------------
   1. SCROLL PROGRESS & SIDE NAV
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });
}

function initSideNav() {
  const dots = document.querySelectorAll('.nav-dot');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    dots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-target') === currentId);
    });
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-target');
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
        playSoftChime(520, 0.1);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   2. PHASE 1: MYSTERY INTRO TIMED TEXT REVEAL
   -------------------------------------------------------------------------- */
function initMysteryIntro() {
  const textElem = document.getElementById('intro-step-text');
  const enterBtn = document.getElementById('intro-enter-btn');
  if (!textElem) return;

  const messages = [
    "Hold on...",
    "Ek second ruk.",
    "Before you ask 'Yeh kya bakchodi hai?'...",
    "Before you call me pagal...",
    "And before you say 'DHAAT'...",
    "There are a few things that needed to be put in one place.",
    "Ready? Scroll down or enter below. ✨"
  ];

  let step = 0;

  function showNextMessage() {
    textElem.classList.remove('visible');
    setTimeout(() => {
      textElem.textContent = messages[step];
      textElem.classList.add('visible');
      step++;
      if (step < messages.length) {
        setTimeout(showNextMessage, 2400);
      } else if (enterBtn) {
        enterBtn.style.opacity = '1';
        enterBtn.style.pointerEvents = 'auto';
      }
    }, 400);
  }

  showNextMessage();

  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playSoftChime(440, 0.15);
      const obsSec = document.getElementById('observations');
      if (obsSec) {
        obsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* --------------------------------------------------------------------------
   3. PHASE 2: OBSERVATIONS SEQUENTIAL REVEAL
   -------------------------------------------------------------------------- */
function initObservationScroll() {
  const rows = document.querySelectorAll('.observation-row');
  if (!rows.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const row = entry.target;
        const delay = parseInt(row.getAttribute('data-delay') || '0', 10);
        setTimeout(() => {
          row.classList.add('revealed');
        }, delay);
        observer.unobserve(row);
      }
    });
  }, { threshold: 0.15 });

  rows.forEach(row => observer.observe(row));
}

/* --------------------------------------------------------------------------
   4. PHASE 3: PHOTO & VIDEO DISCOVERY (POLAROIDS WITH CLICK-TO-PLAY)
   -------------------------------------------------------------------------- */
const DEFAULT_ANNOTATIONS = [
  { tag: "soft smile detected.", pin: "pin-top-right", caption: "That smile deserves its own section 🫠", icon: "✨" },
  { tag: "Devi mode 👑", pin: "pin-bottom-left", caption: "Self-proclaimed. Nobody dared to challenge.", icon: "👑" },
  { tag: "Certified gossip dept 🤫", pin: "pin-top-right", caption: "From normal talk to intel in 14 seconds.", icon: "🗣️" },
  { tag: "Random dancing dept 💃", pin: "pin-bottom-right", caption: "Zero context. Pure energy.", icon: "💃" },
  { tag: "Professional mood fixer 🛠️", pin: "pin-top-right", caption: "Will ask 'kya hua?' before you know it.", icon: "💖" },
  { tag: "Part-time philosopher 🧠", pin: "pin-bottom-left", caption: "Has the emotional wisdom of a therapist...", icon: "📖" },
  { tag: "Full-time menace 😈", pin: "pin-top-right", caption: "...and the language of a savage best friend.", icon: "🔥" },
  { tag: "Emergency contact 📞", pin: "pin-bottom-right", caption: "Somehow everyone's 3 AM safe space.", icon: "🤝" },
  { tag: "Stefan Salvatore club 🧛", pin: "pin-top-right", caption: "The ultimate relatable movie companion.", icon: "🎬" },
  { tag: "Pretty without trying ✨", pin: "pin-bottom-left", caption: "Effortless, authentic, completely real.", icon: "🌸" },
  { tag: "Trademark Bsdkdu 😂", pin: "pin-bottom-right", caption: "Highest badge of friendship honor.", icon: "🫶" }
];

const VIDEO_ANNOTATIONS = [
  { tag: "Devi In Motion 🎥", pin: "pin-top-right", caption: "Zero script. Pure Anushka chaos in live action ✨", icon: "🎬" },
  { tag: "Live Candid Reel 📹", pin: "pin-bottom-left", caption: "Documented proof of the menace department 😈", icon: "🍿" },
  { tag: "Peak Bakchodi ⚡", pin: "pin-top-right", caption: "When the filter completely leaves the chat 😂", icon: "🔥" },
  { tag: "Real Vibes Only 🌸", pin: "pin-bottom-right", caption: "That laugh needs to be protected at all costs 🥹", icon: "✨" }
];

let allGalleryItems = [];

function initGallery() {
  const grid = document.getElementById('polaroid-grid');
  const uploadInput = document.getElementById('photo-uploader');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  if (!grid) return;

  const photos = (window.CUTE_PICS && window.CUTE_PICS.length > 0) ? window.CUTE_PICS : [];
  
  // Combine all cute & funny videos for rich gallery playback
  const cuteVids = (window.CUTE_VIDEOS && window.CUTE_VIDEOS.length > 0) ? window.CUTE_VIDEOS : [];
  const funnyVids = (window.FUNNY_VIDEOS && window.FUNNY_VIDEOS.length > 0) ? window.FUNNY_VIDEOS : [];
  const allVids = [...cuteVids, ...funnyVids];

  allGalleryItems = [];

  // Add photos to gallery pool
  photos.forEach((src, idx) => {
    const meta = DEFAULT_ANNOTATIONS[idx % DEFAULT_ANNOTATIONS.length];
    allGalleryItems.push({
      type: 'photo',
      src: src,
      tag: meta.tag,
      pin: meta.pin,
      caption: meta.caption,
      icon: meta.icon
    });
  });

  // Interleave videos into gallery pool
  allVids.forEach((vidSrc, idx) => {
    const meta = VIDEO_ANNOTATIONS[idx % VIDEO_ANNOTATIONS.length];
    allGalleryItems.push({
      type: 'video',
      src: vidSrc,
      tag: meta.tag,
      pin: meta.pin,
      caption: meta.caption,
      icon: meta.icon
    });
  });

  renderGalleryGrid(grid, allGalleryItems, 'all');

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      playSoftChime(600, 0.08);
      renderGalleryGrid(grid, allGalleryItems, filter);
    });
  });

  // Upload custom memories
  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const readPromises = files.map(file => {
        return new Promise((resolve) => {
          const isVideo = file.type.startsWith('video');
          const reader = new FileReader();
          reader.onload = (ev) => resolve({ src: ev.target.result, type: isVideo ? 'video' : 'photo' });
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(results => {
        results.forEach((item, i) => {
          const meta = item.type === 'video' ? VIDEO_ANNOTATIONS[i % VIDEO_ANNOTATIONS.length] : DEFAULT_ANNOTATIONS[i % DEFAULT_ANNOTATIONS.length];
          allGalleryItems.unshift({
            type: item.type,
            src: item.src,
            tag: meta.tag,
            pin: meta.pin,
            caption: meta.caption,
            icon: meta.icon
          });
        });
        renderGalleryGrid(grid, allGalleryItems, 'all');
      });
    });
  }
}

function renderGalleryGrid(grid, items, filterType) {
  grid.innerHTML = '';
  
  const filtered = items.filter(item => {
    if (filterType === 'photo') return item.type === 'photo';
    if (filterType === 'video') return item.type === 'video';
    return true;
  });

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = `polaroid-card ${item.type === 'video' ? 'is-video' : ''}`;

    let mediaHtml = '';
    if (item.type === 'video') {
      mediaHtml = `
        <video preload="metadata" muted playsinline style="width:100%; height:100%; object-fit:cover;">
          <source src="${encodeURI(item.src)}" type="video/mp4">
        </video>
        <span class="video-time-tag">
          <span class="video-pulse-dot"></span>
          <span>VIDEO CLIP</span>
        </span>
      `;
    } else {
      mediaHtml = `<img src="${encodeURI(item.src)}" alt="Anushka Memory" loading="lazy">`;
    }

    card.innerHTML = `
      <div class="polaroid-img-wrapper">${mediaHtml}</div>
      <div class="polaroid-caption">${item.caption}</div>
      <span class="annotation-badge ${item.pin}">${item.tag}</span>
    `;

    // Click to play/view in full lightbox
    card.addEventListener('click', () => {
      playSoftChime(480, 0.1);
      openSingleMediaModal(item.src, item.type, item.caption);
    });

    grid.appendChild(card);
  });
}

function openSingleMediaModal(src, type, caption) {
  const modal = document.getElementById('screenshot-modal');
  const imgElem = document.getElementById('modal-img');
  const vidElem = document.getElementById('modal-video');
  const titleElem = document.getElementById('modal-title');
  const footerElem = document.querySelector('.modal-carousel-footer');
  if (!modal) return;

  // Pause any playing audio
  pauseAllMusic();

  if (type === 'video') {
    if (imgElem) imgElem.style.display = 'none';
    if (vidElem) {
      vidElem.style.display = 'block';
      vidElem.src = encodeURI(src);
      vidElem.play().catch(() => {});
    }
    titleElem.textContent = caption || "Video Reel • Anushka";
  } else {
    if (vidElem) {
      vidElem.pause();
      vidElem.style.display = 'none';
    }
    if (imgElem) {
      imgElem.style.display = 'block';
      imgElem.src = encodeURI(src);
    }
    titleElem.textContent = caption || "Photo Memory • Anushka";
  }

  if (footerElem) footerElem.style.display = 'none';
  modal.classList.add('open');
}

/* --------------------------------------------------------------------------
   5. PHASE 6: FRIENDS' NOTEBOOK TABS & MINI PHOTO STRIPS
   -------------------------------------------------------------------------- */
function initNotebookTabs() {
  const tabBtns = document.querySelectorAll('.friend-tab-btn');
  const tabContents = document.querySelectorAll('.friend-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetFriend = btn.getAttribute('data-friend');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetFriend}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      playSoftChime(500, 0.08);
    });
  });
}

function initNotebookScreenshotStrips() {
  const contents = document.querySelectorAll('.friend-tab-content');
  contents.forEach(content => {
    const btn = content.querySelector('.view-screenshot-btn');
    if (!btn) return;

    const listAttr = btn.getAttribute('data-screenshots');
    const friendName = btn.getAttribute('data-friend-name') || 'Friend';
    if (!listAttr) return;

    try {
      const shots = JSON.parse(listAttr);
      const strip = document.createElement('div');
      strip.className = 'notebook-screenshot-strip';

      shots.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'notebook-screenshot-thumb';
        thumb.title = `Click to zoom screenshot ${idx + 1}`;
        thumb.innerHTML = `<img src="${encodeURI(src)}" alt="Chat preview" loading="lazy">`;
        thumb.addEventListener('click', () => {
          currentScreenshots = shots;
          currentScreenshotIndex = idx;
          document.getElementById('modal-title').textContent = `${friendName}'s WhatsApp Message (${idx + 1}/${shots.length})`;
          document.querySelector('.modal-carousel-footer').style.display = 'flex';
          updateModalImage();
          document.getElementById('screenshot-modal').classList.add('open');
          playSoftChime(550, 0.1);
        });
        strip.appendChild(thumb);
      });

      const body = content.querySelector('.notebook-body');
      if (body) {
        const label = document.createElement('div');
        label.style.fontFamily = 'var(--font-mono)';
        label.style.fontSize = '0.78rem';
        label.style.color = '#e11d48';
        label.style.marginTop = '24px';
        label.style.fontWeight = '700';
        label.textContent = '📸 Chat Screenshots Archive (Tap any thumbnail to zoom):';
        body.appendChild(label);
        body.appendChild(strip);
      }
    } catch (e) {
      console.warn("Could not build strip", e);
    }
  });
}

/* --------------------------------------------------------------------------
   6. PHASE 6: SCREENSHOT LIGHTBOX MODAL WITH CAROUSEL
   -------------------------------------------------------------------------- */
let currentScreenshots = [];
let currentScreenshotIndex = 0;

function initScreenshotModal() {
  const modal = document.getElementById('screenshot-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const prevBtn = document.getElementById('modal-prev-btn');
  const nextBtn = document.getElementById('modal-next-btn');
  const vidElem = document.getElementById('modal-video');

  if (!modal) return;

  // View screenshots button click handlers
  document.querySelectorAll('.view-screenshot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const listAttr = btn.getAttribute('data-screenshots');
      const friendName = btn.getAttribute('data-friend-name') || 'Friend';
      if (!listAttr) return;

      try {
        currentScreenshots = JSON.parse(listAttr);
        currentScreenshotIndex = 0;
        document.getElementById('modal-title').textContent = `${friendName}'s Real WhatsApp Message`;
        document.querySelector('.modal-carousel-footer').style.display = 'flex';
        updateModalImage();
        modal.classList.add('open');
        playSoftChime(480, 0.1);
      } catch (err) {
        console.error("Screenshot list parse error", err);
      }
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    if (vidElem) {
      vidElem.pause();
      vidElem.src = '';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentScreenshotIndex > 0) {
        currentScreenshotIndex--;
        updateModalImage();
        playSoftChime(420, 0.08);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentScreenshotIndex < currentScreenshots.length - 1) {
        currentScreenshotIndex++;
        updateModalImage();
        playSoftChime(460, 0.08);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' && currentScreenshotIndex > 0) {
      currentScreenshotIndex--;
      updateModalImage();
    }
    if (e.key === 'ArrowRight' && currentScreenshotIndex < currentScreenshots.length - 1) {
      currentScreenshotIndex++;
      updateModalImage();
    }
  });
}

function updateModalImage() {
  const imgElem = document.getElementById('modal-img');
  const vidElem = document.getElementById('modal-video');
  const counterElem = document.getElementById('modal-counter');
  const prevBtn = document.getElementById('modal-prev-btn');
  const nextBtn = document.getElementById('modal-next-btn');

  if (!imgElem || !currentScreenshots.length) return;

  if (vidElem) {
    vidElem.pause();
    vidElem.style.display = 'none';
  }

  imgElem.style.display = 'block';
  const currentPath = currentScreenshots[currentScreenshotIndex];
  imgElem.src = encodeURI(currentPath);

  if (counterElem) {
    counterElem.textContent = `${currentScreenshotIndex + 1} / ${currentScreenshots.length}`;
  }

  if (prevBtn) prevBtn.disabled = currentScreenshotIndex === 0;
  if (nextBtn) nextBtn.disabled = currentScreenshotIndex === currentScreenshots.length - 1;
}

/* --------------------------------------------------------------------------
   7. PHASE 7: CHAOS INTERRUPTION HARD CUT TO BLACK
   -------------------------------------------------------------------------- */
function initChaosSequence() {
  const chaosSec = document.getElementById('chaos');
  const line1 = document.getElementById('chaos-line-1');
  const line2 = document.getElementById('chaos-line-2');
  const punchline = document.getElementById('chaos-punchline');
  const funnyGrid = document.getElementById('chaos-gallery');
  const resumeBtn = document.getElementById('chaos-resume-btn');

  if (!chaosSec) return;

  let triggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        playComicBeep();

        setTimeout(() => {
          if (line1) line1.classList.add('active');
        }, 600);

        setTimeout(() => {
          if (line2) line2.classList.add('active');
        }, 2800);

        setTimeout(() => {
          if (punchline) punchline.classList.add('active');
          playDrumHit();
          renderChaosPhotos(funnyGrid);
        }, 5000);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(chaosSec);

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const audioSec = document.getElementById('audio');
      if (audioSec) {
        audioSec.scrollIntoView({ behavior: 'smooth' });
        playSoftChime(440, 0.15);
      }
    });
  }
}

function renderChaosPhotos(container) {
  if (!container) return;
  container.innerHTML = '';

  const photos = (window.FUNNY_PICS && window.FUNNY_PICS.length > 0) ? window.FUNNY_PICS : [];
  const videos = (window.FUNNY_VIDEOS && window.FUNNY_VIDEOS.length > 0) ? window.FUNNY_VIDEOS : [];
  
  const funnyCaptions = [
    "Evidence of pure unfiltered menace 🚨",
    "Self-declared Devi candid vault 👑",
    "404: Serious face not found 🤡",
    "The official 'Dhat' face detected 😂",
    "Peak unhinged moment captured 💀",
    "Certified chaos department in action 🎬"
  ];

  photos.forEach((imgSrc, i) => {
    const card = document.createElement('div');
    card.className = 'chaos-photo-card';
    const cap = funnyCaptions[i % funnyCaptions.length];

    card.innerHTML = `
      <img src="${encodeURI(imgSrc)}" class="chaos-media-player" style="height: 220px; object-fit: cover; border-radius: 4px;" alt="Chaos Candid" loading="lazy">
      <p style="font-family: var(--font-mono); font-size: 0.75rem; color: #f87171; margin-top: 8px;">${cap}</p>
    `;
    card.addEventListener('click', () => {
      openSingleMediaModal(imgSrc, 'photo', cap);
    });
    container.appendChild(card);
  });

  videos.forEach((vidSrc, i) => {
    const card = document.createElement('div');
    card.className = 'chaos-video-card';
    const cap = `Chaos Reel #${i + 1} 📹 (${funnyCaptions[(i + 3) % funnyCaptions.length]})`;

    card.innerHTML = `
      <video class="chaos-media-player" controls preload="metadata" playsinline>
        <source src="${encodeURI(vidSrc)}" type="video/mp4">
      </video>
      <p style="font-family: var(--font-mono); font-size: 0.75rem; color: #fbbf24; margin-top: 8px;">${cap}</p>
    `;
    container.appendChild(card);
  });
}

function playComicBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function playDrumHit() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function playSoftChime(freq = 440, duration = 0.1) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   8. AUDIO PLAYERS (VOICE NOTES & THE RAP)
   -------------------------------------------------------------------------- */
const allAudioInstances = [];

function initAudioPlayers() {
  const cards = document.querySelectorAll('.audio-track-card, .vinyl-player-box');

  cards.forEach(card => {
    const audio = card.querySelector('audio');
    const playBtn = card.querySelector('.play-toggle-btn');
    const scrubber = card.querySelector('.scrubber-slider');
    const timeCurrent = card.querySelector('.time-current');
    const timeTotal = card.querySelector('.time-total');
    const vinyl = card.querySelector('.vinyl-record');

    if (!audio || !playBtn) return;

    allAudioInstances.push({ audio, card, playBtn, vinyl });

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        pauseAllMusic(audio);

        audio.play().then(() => {
          playBtn.innerHTML = '❚❚';
          card.classList.add('playing');
          if (vinyl) vinyl.classList.add('spinning');
        }).catch(err => {
          console.warn("Playback error:", err);
        });
      } else {
        audio.pause();
        playBtn.innerHTML = '▶';
        card.classList.remove('playing');
        if (vinyl) vinyl.classList.remove('spinning');
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (scrubber && !isNaN(audio.duration) && audio.duration > 0) {
        scrubber.value = (audio.currentTime / audio.duration) * 100;
      }
      if (timeCurrent) {
        timeCurrent.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (timeTotal && !isNaN(audio.duration) && audio.duration > 0) {
        timeTotal.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener('ended', () => {
      playBtn.innerHTML = '▶';
      card.classList.remove('playing');
      if (vinyl) vinyl.classList.remove('spinning');
      if (scrubber) scrubber.value = 0;
    });

    if (scrubber) {
      scrubber.addEventListener('input', () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
          audio.currentTime = (scrubber.value / 100) * audio.duration;
        }
      });
    }
  });
}

function pauseAllMusic(exceptAudio = null) {
  allAudioInstances.forEach(item => {
    if (item.audio !== exceptAudio) {
      item.audio.pause();
      item.playBtn.innerHTML = '▶';
      item.card.classList.remove('playing');
      if (item.vinyl) item.vinyl.classList.remove('spinning');
    }
  });
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/* --------------------------------------------------------------------------
   9. STARDUST CURSOR TRAIL (Aesthetic Polish)
   -------------------------------------------------------------------------- */
function initStardustCursor() {
  if (window.innerWidth < 768) return; // Only on desktop to keep mobile performance snappy

  let lastX = 0;
  let lastY = 0;
  let throttle = 0;

  window.addEventListener('mousemove', (e) => {
    throttle++;
    if (throttle % 4 !== 0) return;

    const star = document.createElement('div');
    star.style.position = 'fixed';
    star.style.left = `${e.clientX}px`;
    star.style.top = `${e.clientY}px`;
    star.style.width = '6px';
    star.style.height = '6px';
    star.style.borderRadius = '50%';
    star.style.backgroundColor = Math.random() > 0.5 ? '#f43f5e' : '#fbbf24';
    star.style.boxShadow = `0 0 8px ${star.style.backgroundColor}`;
    star.style.pointerEvents = 'none';
    star.style.zIndex = '9998';
    star.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
    document.body.appendChild(star);

    setTimeout(() => {
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      star.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;
      star.style.opacity = '0';
    }, 20);

    setTimeout(() => star.remove(), 850);
  });
}

/* --------------------------------------------------------------------------
   10. INTERACTIVE BUTTON SOUND FX
   -------------------------------------------------------------------------- */
function initInteractiveSoundFX() {
  document.querySelectorAll('.rhyme-card, .dossier-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      playSoftChime(700 + Math.random() * 200, 0.05);
    });
  });
}

/* --------------------------------------------------------------------------
   11. PHASE 10: CONFETTI & OUTRO
   -------------------------------------------------------------------------- */
function initOutroConfetti() {
  const restartBtn = document.getElementById('outro-restart-btn');
  const outroSec = document.getElementById('outro');

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playSoftChime(440, 0.2);
    });
  }

  if (outroSec) {
    let fired = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          triggerGentleConfetti();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(outroSec);
  }
}

function triggerGentleConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#ffffff'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 50,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 2 + 1.5,
      speedX: Math.random() * 1.5 - 0.75,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 4 - 2
    });
  }

  let animationFrame;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y < canvas.height + 20) alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    });

    if (alive > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  render();
}

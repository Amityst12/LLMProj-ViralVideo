/**
 * Client-side Controller for Viral Hook & Retention Deconstructor Dashboard.
 * Handles DOM interactions, live character counter, sample loading, API calls, and dynamic rendering.
 */

const VIRAL_SAMPLE = `Stop drinking coffee immediately after waking up. When you wake up, your cortisol levels are already peaking naturally. Introducing caffeine immediately spikes your heart rate and causes a severe energy crash by early afternoon. Instead, drink sixteen ounces of mineral water with Celtic sea salt. Wait ninety minutes before your first brew so your adenosine receptors clear. This simple reset stabilizes your focus, eliminates afternoon brain fog, and keeps your mental clarity sharp all day long.`;

const MEDIOCRE_SAMPLE = `היי חברים, מה קורה? ברוכים הבאים לעוד סרטון בערוץ שלי! היום אני רוצה לדבר איתכם על איך לנהל את הזמן שלכם יותר טוב, כי שמתי לב שהמון אנשים מסתבכים עם זה ביומיום. אבל רגע לפני שנתחיל, אם אתם חדשים פה, אל תשכחו ללחוץ על כפתור הסאבסקרייב ולהפעיל את הפעמון כדי לא לפספס אף עדכון. אז ככה, ניהול זמן זה אחד הדברים הכי חשובים לכל עצמאי או סטודנט שרוצה להצליח בחיים, ואני הולך לתת לכם כמה טיפים שיעזרו לכם.`;

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('deconstruct-form');
  const scriptInput = document.getElementById('script-input');
  const charCounter = document.getElementById('char-counter');
  const wordCounter = document.getElementById('word-counter');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const resultsView = document.getElementById('results-view');
  const modeBadge = document.getElementById('mode-badge');

  const loadViralBtn = document.getElementById('load-viral-btn');
  const loadMediocreBtn = document.getElementById('load-mediocre-btn');

  // Check health and update mode badge
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          // If server is active
          console.log('[System Online]:', data);
        }
      }
    } catch {
      // Offline fallback
    }
  }
  checkHealth();

  // Character and Word Counter
  function updateCounters() {
    const text = scriptInput.value;
    const charCount = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    charCounter.textContent = `${charCount.toLocaleString()} / 2,000 characters`;
    wordCounter.textContent = `${wordCount.toLocaleString()} words`;

    charCounter.classList.remove('warning', 'danger');
    if (charCount > 1800 && charCount <= 2000) {
      charCounter.classList.add('warning');
    } else if (charCount > 2000) {
      charCounter.classList.add('danger');
    }
  }

  scriptInput.addEventListener('input', updateCounters);

  // Sample Loaders
  loadViralBtn.addEventListener('click', () => {
    scriptInput.value = VIRAL_SAMPLE;
    updateCounters();
    clearError();
  });

  loadMediocreBtn.addEventListener('click', () => {
    scriptInput.value = MEDIOCRE_SAMPLE;
    updateCounters();
    clearError();
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function clearError() {
    errorBanner.classList.add('hidden');
    errorMessage.textContent = '';
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Deconstructing Dynamics...';
      btnLoader.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Deconstruct Retention Dynamics';
      btnLoader.classList.add('hidden');
    }
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const rawText = scriptInput.value.trim();
    if (!rawText) {
      showError('Script cannot be empty or contain only whitespace.');
      return;
    }

    if (rawText.length > 2000) {
      showError('Script exceeds the strict 2,000 character limit.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rawText }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Validation failed. Please verify your script input.');
        return;
      }

      renderReport(data);
      resultsView.classList.remove('hidden');
      resultsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError(`Network or server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  // Render Full Report
  function renderReport(report) {
    // 1. Cadence Windows
    const segments = report.segments || [];
    const swipeSeg = segments.find((s) => s.window === 'swipe_zone');
    const valueSeg = segments.find((s) => s.window === 'value_delivery');
    const bodySeg = segments.find((s) => s.window === 'body_and_resolution');

    document.getElementById('swipe-text-view').textContent = swipeSeg?.text || '—';
    document.getElementById('swipe-word-badge').textContent = `${swipeSeg?.wordCount || 0} words`;

    document.getElementById('value-text-view').textContent = valueSeg?.text || '—';
    document.getElementById('value-word-badge').textContent = `${valueSeg?.wordCount || 0} words`;

    document.getElementById('body-text-view').textContent = bodySeg?.text || '—';
    document.getElementById('body-word-badge').textContent = `${bodySeg?.wordCount || 0} words`;

    // 2. The Skeptic Swiper
    const swiper = report.swiperVerdict || {};
    const retentionVal = swiper.predictedRetentionScore || 0;
    const retentionEl = document.getElementById('retention-percent-val');
    const gaugeEl = document.getElementById('retention-gauge');
    const swiperBadge = document.getElementById('swiper-timestamp-badge');
    const swipeAtText = document.getElementById('swipe-at-text');
    const riskLabel = document.getElementById('retention-risk-label');

    retentionEl.textContent = `${retentionVal}%`;
    gaugeEl.className = 'gauge-ring';
    swiperBadge.className = 'badge-timestamp';

    if (swiper.swipeAtSecond === 'survived') {
      gaugeEl.classList.add('high');
      swiperBadge.classList.add('badge-survived');
      swiperBadge.textContent = 'Survived Second 3';
      swipeAtText.className = 'status-green';
      swipeAtText.textContent = 'Survived past 3.0s';
      riskLabel.className = 'risk-low';
      riskLabel.textContent = 'Minimal Risk';
    } else {
      const isSevere = swiper.swipeAtSecond === 1;
      gaugeEl.classList.add(isSevere ? 'low' : 'med');
      swiperBadge.classList.add('badge-dropped');
      swiperBadge.textContent = `Swiped at ${swiper.swipeAtSecond}s`;
      swipeAtText.className = 'status-red';
      swipeAtText.textContent = `Swiped away at second ${swiper.swipeAtSecond}`;
      riskLabel.className = 'risk-high';
      riskLabel.textContent = isSevere ? 'Critical Abandonment' : 'High Friction';
    }

    document.getElementById('brutalVerdict-quote' in document ? 'brutalVerdict-quote' : 'brutal-verdict-quote').textContent =
      `"${swiper.brutalVerdict || 'No verdict provided.'}"`;

    // 3. 5 Retention Dimensions
    const dims = report.dimensions || {};
    document.getElementById('hook-velocity-score').textContent = (dims.compositeScore || 0).toFixed(1);

    function setDim(idPrefix, val) {
      document.getElementById(`${idPrefix}-val`).textContent = `${val} / 100`;
      document.getElementById(`${idPrefix}-bar`).style.width = `${Math.min(100, Math.max(0, val))}%`;
    }

    setDim('dim-curiosity', dims.curiosityGap || 0);
    setDim('dim-friction', dims.cognitiveFriction || 0);
    setDim('dim-pattern', dims.patternInterrupt || 0);
    setDim('dim-emotional', dims.emotionalStake || 0);
    setDim('dim-sensory', dims.sensorySpecificity || 0);

    // 4. Anti-Sycophancy Negative Critiques
    const critiqueList = document.getElementById('critique-list');
    critiqueList.innerHTML = '';
    const critiques = report.negativeCritique || [];
    document.getElementById('critique-count-badge').textContent = `${critiques.length} Failure Points`;

    for (const point of critiques) {
      const li = document.createElement('li');
      li.className = 'critique-item';
      li.innerHTML = `<span class="critique-bullet">⚠️</span><span>${escapeHtml(point)}</span>`;
      critiqueList.appendChild(li);
    }

    // 5. Tri-Archetype Remake Blueprints
    const remakesGrid = document.getElementById('remakes-grid');
    remakesGrid.innerHTML = '';
    const rewrites = report.prescriptiveRewrites || [];

    const archetypeLabels = {
      negative_frame: { title: 'The Negative Frame', class: 'title-negative', desc: 'Attacks a bad habit / myth' },
      high_stakes_intrigue: { title: 'High-Stakes Intrigue', class: 'title-intrigue', desc: 'Immediate downside risk' },
      visceral_pattern_interrupt: { title: 'Visceral Pattern Interrupt', class: 'title-interrupt', desc: 'Counter-intuitive paradox' },
    };

    for (const item of rewrites) {
      const meta = archetypeLabels[item.archetype] || { title: item.archetype, class: '', desc: '' };
      const wordCount = (item.hookText || '').trim().split(/\s+/).filter(Boolean).length;

      const card = document.createElement('div');
      card.className = 'remake-card';
      card.innerHTML = `
        <div class="remake-header">
          <div>
            <span class="archetype-title ${meta.class}">${escapeHtml(meta.title)}</span>
            <p class="window-desc">${escapeHtml(meta.desc)}</p>
          </div>
          <div class="remake-meta">
            <span class="meta-chip">${wordCount} words</span>
            <span class="meta-chip">${item.estimatedDurationSeconds}s</span>
          </div>
        </div>
        <div class="hook-text-box">
          <p class="hook-quote">"${escapeHtml(item.hookText)}"</p>
        </div>
        <div class="rationale-box">
          <span class="rationale-label">Engineering Rationale:</span>
          ${escapeHtml(item.engineeringRationale)}
        </div>
        <button type="button" class="btn copy-btn" data-text="${escapeHtml(item.hookText)}">
          📋 Copy Hook
        </button>
      `;

      const copyBtn = card.querySelector('.copy-btn');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(item.hookText);
          copyBtn.textContent = '✅ Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy Hook';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch {
          copyBtn.textContent = 'Manual copy needed';
        }
      });

      remakesGrid.appendChild(card);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
});

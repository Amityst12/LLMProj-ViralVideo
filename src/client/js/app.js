/**
 * Client-side Controller for Viral Hook & Retention Deconstructor Dashboard.
 * Turn 5: Live OpenRouter Multi-Model Engine & Token Economics.
 */

const VIRAL_SAMPLE = `Stop drinking coffee immediately after waking up. When you wake up, your cortisol levels are already peaking naturally. Introducing caffeine immediately spikes your heart rate and causes a severe energy crash by early afternoon. Instead, drink sixteen ounces of mineral water with Celtic sea salt. Wait ninety minutes before your first brew so your adenosine receptors clear. This simple reset stabilizes your focus, eliminates afternoon brain fog, and keeps your mental clarity sharp all day long.`;

const MEDIOCRE_SAMPLE = `היי חברים, מה קורה? ברוכים הבאים לעוד סרטון בערוץ שלי! היום אני רוצה לדבר איתכם על איך לנהל את הזמן שלכם יותר טוב, כי שמתי לב שהמון אנשים מסתבכים עם זה ביומיום. אבל רגע לפני שנתחיל, אם אתם חדשים פה, אל תשכחו ללחוץ על כפתור הסאבסקרייב ולהפעיל את הפעמון כדי לא לפספס אף עדכון. אז ככה, ניהול זמן זה אחד הדברים הכי חשובים לכל עצמאי או סטודנט שרוצה להצליח בחיים, ואני הולך לתת לכם כמה טיפים שיעזרו לכם.`;

const STORAGE_KEYS = {
  API_KEY: 'viral_deconstructor_openrouter_key',
  MODEL: 'viral_deconstructor_selected_model',
  ENGINE: 'viral_deconstructor_engine_mode',
};

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

  // Settings elements
  const settingsToggleBtn = document.getElementById('settings-toggle-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const engineModeSelect = document.getElementById('engine-mode-select');
  const modelSelect = document.getElementById('model-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const clearKeyBtn = document.getElementById('clear-key-btn');

  // History elements (Turn 6)
  const historyToggleBtn = document.getElementById('history-toggle-btn');
  const historyPanel = document.getElementById('history-panel');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const historyList = document.getElementById('history-list');
  const replayBanner = document.getElementById('replay-banner');
  const replayTimestamp = document.getElementById('replay-timestamp');
  const replayModel = document.getElementById('replay-model');
  const exitReplayBtn = document.getElementById('exit-replay-btn');

  // Economics elements
  const econEngineBadge = document.getElementById('econ-engine-badge');
  const econModelName = document.getElementById('econ-model-name');
  const econLatencyVal = document.getElementById('econ-latency-val');
  const econTokensVal = document.getElementById('econ-tokens-val');
  const econTokensDetail = document.getElementById('econ-tokens-detail');
  const econCostVal = document.getElementById('econ-cost-val');

  // 1. Fetch available models from /api/models
  async function loadModels() {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          const currentVal = modelSelect.value;
          modelSelect.innerHTML = '';
          for (const m of data.models) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} ($${m.promptCostPerMillion} / 1M)`;
            modelSelect.appendChild(opt);
          }
          if (currentVal && [...modelSelect.options].some((o) => o.value === currentVal)) {
            modelSelect.value = currentVal;
          }
        }
      }
    } catch {
      // Keep static defaults if offline
    }
  }
  loadModels();

  // 2. Initialize Settings from localStorage
  function initSettings() {
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL) || 'google/gemini-2.0-flash-exp:free';
    const savedEngine = localStorage.getItem(STORAGE_KEYS.ENGINE) || (savedKey ? 'live' : 'simulation');

    if (savedKey) {
      apiKeyInput.value = savedKey;
    }
    if (savedModel) {
      modelSelect.value = savedModel;
    }
    engineModeSelect.value = savedEngine;
    updateModeBadge();
  }

  function updateModeBadge() {
    const isLive = engineModeSelect.value === 'live' && apiKeyInput.value.trim().length > 0;
    if (isLive) {
      modeBadge.className = 'badge badge-live';
      modeBadge.textContent = '🌐 Live OpenRouter AI';
    } else {
      modeBadge.className = 'badge badge-sim';
      modeBadge.textContent = '⚡ Simulation Mode';
    }
  }

  initSettings();

  // Settings Drawer Toggle
  settingsToggleBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    if (!settingsPanel.classList.contains('hidden') && historyPanel) {
      historyPanel.classList.add('hidden');
    }
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  // History Drawer (Turn 6: Module 7)
  if (historyToggleBtn && historyPanel) {
    historyToggleBtn.addEventListener('click', () => {
      historyPanel.classList.toggle('hidden');
      if (!historyPanel.classList.contains('hidden')) {
        settingsPanel.classList.add('hidden');
        loadHistoryList();
      }
    });
  }

  if (closeHistoryBtn && historyPanel) {
    closeHistoryBtn.addEventListener('click', () => {
      historyPanel.classList.add('hidden');
    });
  }

  if (exitReplayBtn && replayBanner) {
    exitReplayBtn.addEventListener('click', () => {
      replayBanner.classList.add('hidden');
    });
  }

  async function loadHistoryList() {
    if (!historyList) return;
    historyList.innerHTML = '<div class="history-loading">Loading saved analyses...</div>';

    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.history || []);

      if (items.length === 0) {
        historyList.innerHTML = '<div class="history-empty-state">No saved analyses yet. Deconstruct a script to start your history log.</div>';
        return;
      }

      historyList.innerHTML = '';
      for (const item of items) {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown date';
        const score = item.retentionScore ?? item.compositeScore ?? 0;
        const scoreClass = score >= 60 ? 'history-score-high' : 'history-score-low';
        const modelLabel = item.model || item.activeModel || 'simulation';
        const preview = item.scriptPreview || item.scriptText || 'No text';

        card.innerHTML = `
          <div class="history-card-header">
            <span class="history-card-date">${escapeHtml(dateStr)}</span>
            <div class="history-card-tags">
              <span class="history-model-chip" title="${escapeHtml(modelLabel)}">${escapeHtml(modelLabel)}</span>
              <span class="history-score-chip ${scoreClass}">${score}% Score</span>
            </div>
          </div>
          <div class="history-card-preview">${escapeHtml(preview)}</div>
        `;

        card.addEventListener('click', () => {
          loadAnalysisById(item.id);
        });

        historyList.appendChild(card);
      }
    } catch {
      historyList.innerHTML = '<div class="history-empty-state">Unable to load history. Please try again later.</div>';
    }
  }

  async function loadAnalysisById(id) {
    try {
      setLoading(true);
      clearError();
      const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Failed to fetch historical record');
      const data = await res.json();
      const report = data.report || data;

      if (data.scriptText) {
        scriptInput.value = data.scriptText;
        updateCounters();
      }

      renderReport(report);
      resultsView.classList.remove('hidden');

      // Show Replay Banner
      if (replayBanner) {
        const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Saved Date';
        const modelStr = data.model || report.economics?.modelUsed || 'Recorded Model';
        if (replayTimestamp) replayTimestamp.textContent = dateStr;
        if (replayModel) replayModel.textContent = modelStr;
        replayBanner.classList.remove('hidden');
      }

      // Close history drawer
      if (historyPanel) historyPanel.classList.add('hidden');
      resultsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError(err.message || 'Error loading analysis record');
    } finally {
      setLoading(false);
    }
  }

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
      engineModeSelect.value = 'live';
      localStorage.setItem(STORAGE_KEYS.ENGINE, 'live');
      saveKeyBtn.textContent = '✅ Saved!';
      setTimeout(() => {
        saveKeyBtn.textContent = 'Save Key';
      }, 1800);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      engineModeSelect.value = 'simulation';
      localStorage.setItem(STORAGE_KEYS.ENGINE, 'simulation');
    }
    updateModeBadge();
  });

  clearKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    engineModeSelect.value = 'simulation';
    localStorage.setItem(STORAGE_KEYS.ENGINE, 'simulation');
    updateModeBadge();
  });

  engineModeSelect.addEventListener('change', () => {
    localStorage.setItem(STORAGE_KEYS.ENGINE, engineModeSelect.value);
    updateModeBadge();
  });

  modelSelect.addEventListener('change', () => {
    localStorage.setItem(STORAGE_KEYS.MODEL, modelSelect.value);
  });

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
    if (replayBanner) {
      replayBanner.classList.add('hidden');
    }

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

    const payload = { text: rawText };
    const isLive = engineModeSelect.value === 'live';
    const apiKey = apiKeyInput.value.trim();
    if (isLive && apiKey) {
      payload.apiKey = apiKey;
      payload.model = modelSelect.value;
    }

    try {
      const response = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    // 0. Render Token Economics
    const econ = report.economics || {};
    if (econ.isLiveExecution) {
      econEngineBadge.className = 'badge badge-live';
      econEngineBadge.textContent = 'Live OpenRouter AI';
    } else {
      econEngineBadge.className = 'badge badge-sim';
      econEngineBadge.textContent = 'Simulation Mode (Mock)';
    }

    econModelName.textContent = econ.modelUsed || 'mock-deterministic-local';
    const wallMs = econ.wallTimeMs || 0;
    const cumMs = econ.cumulativeTimeMs || 0;
    const speedup = (wallMs > 0 && cumMs > 0) ? (cumMs / wallMs).toFixed(1) : '1.0';
    econLatencyVal.textContent = `${wallMs}ms wall / ${cumMs}ms cum (${speedup}x speedup)`;

    const tokens = econ.tokensUsed || { prompt: 0, completion: 0, total: 0 };
    econTokensVal.textContent = `${tokens.total.toLocaleString()} tokens`;
    econTokensDetail.textContent = `${tokens.prompt.toLocaleString()} prompt / ${tokens.completion.toLocaleString()} comp`;

    const cost = typeof econ.estimatedCostUsd === 'number' ? econ.estimatedCostUsd : 0;
    econCostVal.textContent = cost > 0 ? `$${cost.toFixed(6)}` : '$0.000000 (Free)';

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

    const brutalQuoteEl = document.getElementById('brutal-verdict-quote');
    if (brutalQuoteEl) {
      brutalQuoteEl.textContent = `"${swiper.brutalVerdict || 'No verdict provided.'}"`;
    }

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

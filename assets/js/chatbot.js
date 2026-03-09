// ===== DEEPSEEK LEADERSHIP COACH CHATBOT =====
// Proxy URL — update this after deploying to Render
const PROXY_URL = 'https://gergelyczukor.onrender.com/api/coach';

const SYSTEM_PROMPT = `You are a direct, supportive, and practical leadership coach using the SFGAL model. Your tone should be warm, human, and encouraging—like a trusted mentor reflecting with someone after a tough game.

Start every analysis by truly connecting with the leader's experience. Acknowledge the courage it takes to share a story that didn't go perfectly and validate their positive intent before any analysis.

Note: The 'Quality' score provided is the leader's own rating of how effectively they motivated their team's effort, from 1-10. Your core task is to analyze the leader's capacity to motivate their team by addressing three basic human needs at work:
- *Feeling capable* (Did people feel equipped and confident to do the work?)
- *Feeling ownership* (Did they have a real say in how the work gets done?)
- *Feeling connected* (Did they see how their effort mattered to the team or the bigger purpose?)

If the leader describes facing disengagement, missed commitments, or disrespect, address it directly and constructively. Validate that this is a real leadership challenge. Frame any 'toughness' they used not as punishment, but as a tool to refocus attention on shared goals. Ask yourself: Did their firmness clarify expectations? Did it protect the goal? Was it followed by an invitation to reconnect? If so, this can be a legitimate part of Win-Win leadership — because achieving the goal matters, and leaders have a right and responsibility to expect commitment. If the toughness was reactive or personal, gently guide them toward more goal-centered alternatives.

Structure your feedback in three clear sections:
1. **Motivation Capacity Analysis:** Start by connecting and appreciating their intent. Use phrases like 'I hear that...' or 'It's clear that...'. Then, analyze their actions using plain language: Did people feel *capable*? Did they feel *ownership*? Did they feel *connected* to the purpose? If they faced resistance, include how their response affected these feelings. Avoid academic jargon—just describe what happened in everyday words.
2. **Leadership Style:** Based on the analysis, identify the style using the SFGAL terms: *Win-Win*, *Self-Oriented*, *Self-Neglecting*, or *Lose-Lose*. Be precise:
   - *Self-Neglecting* means the leader sacrifices their own goals, but followers are still winning (developing, growing, achieving).
   - *Lose-Lose* means both sides lose — the goal is not achieved, AND followers are not developing or growing from the experience. If the leader accepted disengagement without response and no one grew, that is Lose-Lose.
   If the leader used constructive firmness to protect the goal while still respecting the person, acknowledge this as a Win-Win approach. If the toughness was reactive or one-sided, name the style with empathy.
3. **Your Coaching Plan:** Frame this as a supportive path forward. Give 3-4 practical, plain-language steps. If the leader faced disengagement, include suggestions like: 'Name the gap directly, then ask what they need to succeed' or 'Set a clear expectation, then follow up with genuine curiosity about what's getting in the way.' Keep suggestions concrete and usable.

Keep the total analysis under 500 words, and keep the tone warm throughout.`;

// Step definitions with translations
const steps = [
  {
    id: 'leader_goal',
    en: { question: 'What was the goal you were trying to achieve with your team?', placeholder: 'e.g., Complete the quarterly report by Friday...' },
    tr: { question: 'Ekibinizle birlikte neyi başarmaya çalışıyordunuz?', placeholder: 'örn., Çeyreklik raporu Cuma gününe kadar tamamlamak...' },
    hu: { question: 'Mi volt a cél, amit a csapatoddal el akartál érni?', placeholder: 'pl., A negyedéves jelentés elkészítése péntekig...' },
  },
  {
    id: 'leader_urgency',
    en: { question: 'How urgent was this goal? What was at stake?', placeholder: 'e.g., High urgency — client deadline was approaching...' },
    tr: { question: 'Bu hedef ne kadar acildi? Risk altında olan neydi?', placeholder: 'örn., Çok acildi — müşterinin teslim tarihi yaklaşıyordu...' },
    hu: { question: 'Mennyire volt sürgős ez a cél? Mi forgott kockán?', placeholder: 'pl., Nagyon sürgős — közeledett az ügyfél határideje...' },
  },
  {
    id: 'leader_motivation_strategy',
    en: { question: 'What strategy did you use to motivate your team?', placeholder: 'e.g., I held a team meeting to explain the importance and assigned clear roles...' },
    tr: { question: 'Ekibinizi motive etmek için ne yaptınız?', placeholder: 'örn., Konunun önemini anlatmak için toplantı yaptım ve herkese net görevler verdim...' },
    hu: { question: 'Milyen stratégiát használtál a csapatod motiválására?', placeholder: 'pl., Csapatmegbeszélést tartottam a fontosság elmagyarázására és egyértelmű szerepeket osztottam ki...' },
  },
  {
    id: 'framing_for_team_benefit',
    en: { question: 'How did you frame this goal as beneficial for the team?', placeholder: 'e.g., I explained how completing this would give everyone more autonomy next quarter...' },
    tr: { question: 'Bu hedefin ekibe olan faydasını nasıl anlattınız?', placeholder: 'örn., Bunu başarırsak gelecek dönem herkesin daha bağımsız çalışabileceğini söyledim...' },
    hu: { question: 'Hogyan keretezted ezt a célt a csapat számára előnyösként?', placeholder: 'pl., Elmagyaráztam, hogy ennek teljesítése a következő negyedévben mindenkinek nagyobb autonómiát ad...' },
  },
  {
    id: 'leaderships_action_quality_score',
    type: 'range',
    en: { question: 'On a scale of 1-10, how effectively did you motivate your team\'s effort?' },
    tr: { question: '1-10 arasında puanlayın: Ekibinizi ne kadar iyi motive edebildiniz?' },
    hu: { question: 'Egy 1-10-es skálán mennyire hatékonyan motiváltad a csapatod erőfeszítését?' },
  },
  {
    id: 'leader_values2',
    en: { question: 'What are your core leadership values?', placeholder: 'e.g., Integrity, collaboration, growth, transparency...' },
    tr: { question: 'Liderlik anlayışınızın temelindeki değerler nelerdir?', placeholder: 'örn., dürüstlük, iş birliği, gelişim, şeffaflık...' },
    hu: { question: 'Mik a legfontosabb vezetői értékeid?', placeholder: 'pl., Integritás, együttműködés, növekedés, átláthatóság...' },
  },
  {
    id: 'leader_vision2',
    en: { question: 'What is your leadership vision?', placeholder: 'e.g., To build a team that delivers excellent results while growing professionally...' },
    tr: { question: 'Lider olarak vizyonunuzu nasıl tanımlarsınız?', placeholder: 'örn., Hem profesyonel olarak gelişen hem de mükemmel sonuçlar üreten bir ekip kurmak...' },
    hu: { question: 'Mi a vezetői víziód?', placeholder: 'pl., Olyan csapat építése, amely kiváló eredményeket ér el, miközben szakmailag fejlődik...' },
  },
  {
    id: 'achievement',
    en: { question: 'What was the outcome? Was the goal achieved?', placeholder: 'e.g., We completed the report but missed the deadline by one day...' },
    tr: { question: 'Sonuç nasıl oldu? Hedefe ulaşabildiniz mi?', placeholder: 'örn., Raporu tamamladık ama teslim tarihini bir gün geçirdik...' },
    hu: { question: 'Mi lett az eredmény? Sikerült elérni a célt?', placeholder: 'pl., Elkészítettük a jelentést, de egy napot csúsztunk a határidőhöz képest...' },
  },
  {
    id: 'toughness',
    en: { question: 'Did you need to be firm or tough at any point? If so, describe what happened.', placeholder: 'e.g., I had to directly address a team member who was disengaged and missing deadlines...' },
    tr: { question: 'Süreçte sert veya kararlı davranmanız gereken bir an oldu mu? Olduysa neler yaşandı?', placeholder: 'örn., İşe ilgisiz kalan ve sürekli geciken bir ekip üyesiyle doğrudan konuşmam gerekti...' },
    hu: { question: 'Kellett bármikor határozottnak vagy keménynek lenned? Ha igen, írd le, mi történt.', placeholder: 'pl., Közvetlenül kellett foglalkoznom egy csapattaggal, aki nem volt elkötelezett és határidőket mulasztott...' },
  },
];

class LeadershipCoach {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentStep = -1; // -1 = welcome
    this.answers = {};
    this.lang = currentLang || 'en';
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.classList.add('coach-chat');

    // Messages area
    this.messagesEl = document.createElement('div');
    this.messagesEl.className = 'chat-messages';
    this.container.appendChild(this.messagesEl);

    // Input area
    this.inputArea = document.createElement('div');
    this.inputArea.className = 'chat-input-area';
    this.container.appendChild(this.inputArea);

    this.showWelcome();
  }

  getLang() {
    return currentLang || 'en';
  }

  t(key) {
    const labels = {
      en: {
        welcome: "Welcome! I'm your AI Leadership Coach. I'll ask you a few questions about a recent leadership experience, then provide personalized feedback based on the SFGAL model.",
        start: 'Start Analysis',
        next: 'Next',
        submit: 'Get My Analysis',
        thinking: 'Analyzing your leadership experience...',
        restart: 'Start New Analysis',
        error: 'Something went wrong. Please try again.',
        stepOf: 'Question {current} of {total}',
      },
      tr: {
        welcome: "Hoş geldiniz! Ben yapay zeka destekli liderlik koçunuzum. Size yakın zamanda yaşadığınız bir liderlik deneyimiyle ilgili birkaç soru soracağım, ardından SFGAL modeline dayalı kişisel geri bildiriminizi hazırlayacağım.",
        start: 'Başlayalım',
        next: 'Devam',
        submit: 'Analizimi Göster',
        thinking: 'Deneyiminiz değerlendiriliyor...',
        restart: 'Yeni Bir Analiz Yap',
        error: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
        stepOf: 'Soru {current} / {total}',
      },
      hu: {
        welcome: "Üdvözlöm! Én vagyok az MI Vezetői Coachod. Felteszek néhány kérdést egy közelmúltbeli vezetői tapasztalatodról, majd személyre szabott visszajelzést adok az SFGAL modell alapján.",
        start: 'Elemzés Indítása',
        next: 'Következő',
        submit: 'Elemzés Kérése',
        thinking: 'A vezetői tapasztalatod elemzése folyamatban...',
        restart: 'Új Elemzés Indítása',
        error: 'Valami hiba történt. Kérjük, próbáld újra.',
        stepOf: 'Kérdés {current} / {total}',
      }
    };
    const lang = this.getLang();
    return (labels[lang] && labels[lang][key]) || labels.en[key] || key;
  }

  addMessage(content, type = 'bot') {
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg-${type}`;

    if (type === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.textContent = 'BL';
      msg.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = content;
    msg.appendChild(bubble);

    this.messagesEl.appendChild(msg);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return bubble;
  }

  showWelcome() {
    this.addMessage(this.t('welcome'));

    this.inputArea.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'chat-btn chat-btn-primary';
    btn.textContent = this.t('start');
    btn.addEventListener('click', () => this.nextStep());
    this.inputArea.appendChild(btn);
  }

  nextStep() {
    this.currentStep++;

    if (this.currentStep >= steps.length) {
      this.submitAnalysis();
      return;
    }

    const step = steps[this.currentStep];
    const lang = this.getLang();
    const stepData = step[lang] || step.en;
    const total = steps.length;

    // Progress indicator
    const progress = `<div class="chat-progress"><span>${this.t('stepOf').replace('{current}', this.currentStep + 1).replace('{total}', total)}</span><div class="progress-bar"><div class="progress-fill" style="width:${((this.currentStep + 1) / total) * 100}%"></div></div></div>`;

    this.addMessage(progress + stepData.question);

    this.inputArea.innerHTML = '';

    if (step.type === 'range') {
      this.showRangeInput(step);
    } else {
      this.showTextInput(step, stepData);
    }
  }

  showTextInput(step, stepData) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-input-wrapper';

    const textarea = document.createElement('textarea');
    textarea.className = 'chat-textarea';
    textarea.placeholder = stepData.placeholder || '';
    textarea.rows = 2;

    const btn = document.createElement('button');
    btn.className = 'chat-send-btn';
    btn.innerHTML = '&#x27A4;';
    btn.title = this.currentStep < steps.length - 1 ? this.t('next') : this.t('submit');

    const submit = () => {
      const val = textarea.value.trim();
      if (!val) return;
      this.answers[step.id] = val;
      this.addMessage(val, 'user');
      this.nextStep();
    };

    btn.addEventListener('click', submit);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    wrapper.appendChild(textarea);
    wrapper.appendChild(btn);
    this.inputArea.appendChild(wrapper);
    textarea.focus();
  }

  showRangeInput(step) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-range-wrapper';

    const display = document.createElement('div');
    display.className = 'range-display';
    display.textContent = '5';

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '1';
    range.max = '10';
    range.value = '5';
    range.className = 'chat-range';

    const labels = document.createElement('div');
    labels.className = 'range-labels';
    labels.innerHTML = '<span>1</span><span>5</span><span>10</span>';

    range.addEventListener('input', () => {
      display.textContent = range.value;
    });

    const btn = document.createElement('button');
    btn.className = 'chat-btn chat-btn-primary';
    btn.textContent = this.currentStep < steps.length - 1 ? this.t('next') : this.t('submit');
    btn.addEventListener('click', () => {
      this.answers[step.id] = range.value;
      this.addMessage(range.value + '/10', 'user');
      this.nextStep();
    });

    wrapper.appendChild(display);
    wrapper.appendChild(range);
    wrapper.appendChild(labels);
    wrapper.appendChild(btn);
    this.inputArea.appendChild(wrapper);
  }

  async submitAnalysis() {
    this.inputArea.innerHTML = '';
    const thinkingBubble = this.addMessage(`<div class="thinking-dots">${this.t('thinking')}<span class="dots"><span>.</span><span>.</span><span>.</span></span></div>`);

    const userMessage = `Goal: ${this.answers.leader_goal}. Urgency: ${this.answers.leader_urgency}. Strategy: ${this.answers.leader_motivation_strategy}. Framing: ${this.answers.framing_for_team_benefit}. Quality: ${this.answers.leaderships_action_quality_score}. Values: ${this.answers.leader_values2}. Vision: ${this.answers.leader_vision2}. Outcome: ${this.answers.achievement}. Toughness: ${this.answers.toughness}.`;

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || this.t('error');

      // Replace thinking with actual response
      thinkingBubble.innerHTML = this.formatMarkdown(reply);

    } catch (err) {
      console.error('DeepSeek API error:', err);
      thinkingBubble.innerHTML = `<p class="chat-error">${this.t('error')}</p>`;
    }

    // Restart button
    const btn = document.createElement('button');
    btn.className = 'chat-btn chat-btn-primary';
    btn.textContent = this.t('restart');
    btn.addEventListener('click', () => {
      this.currentStep = -1;
      this.answers = {};
      this.init();
    });
    this.inputArea.appendChild(btn);
  }

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
}

// Initialize when DOM is ready and when language changes
function initChatbot() {
  const container = document.getElementById('chatbot-container');
  if (container) {
    window.leadershipCoach = new LeadershipCoach(container);
  }
}

// Hook into language changes
const originalSetLanguage = window.setLanguage || setLanguage;
window.setLanguage = function(lang) {
  originalSetLanguage(lang);
  // Reinitialize chatbot if it exists and language changed
  if (window.leadershipCoach) {
    window.leadershipCoach.currentStep = -1;
    window.leadershipCoach.answers = {};
    window.leadershipCoach.init();
  }
};

document.addEventListener('DOMContentLoaded', initChatbot);

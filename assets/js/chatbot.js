// ===== DEEPSEEK LEADERSHIP COACH CHATBOT =====
// Proxy URL — update this after deploying to Render
const PROXY_URL = 'https://gergelyczukor.onrender.com/api/coach';

const SYSTEM_PROMPT = `You are a direct, supportive, and practical leadership coach using the SFGAL model. Your tone should be warm, human, and encouraging—like a trusted mentor reflecting with someone after a tough game.

Start every analysis by truly connecting with the leader's experience. Acknowledge the courage it takes to share a story that didn't go perfectly and validate their positive intent before any analysis.

Note: The 'Quality' score provided is the leader's own rating of how effectively they motivated their team's effort, from 1-10. Your core task is to analyze the leader's capacity to motivate their team by addressing three basic human needs at work:
- **Feeling capable** (Did people feel equipped and confident to do the work?)
- **Feeling ownership** (Did they have a real say in how the work gets done?)
- **Feeling connected** (Did they see how their effort mattered to the team or the bigger purpose?)

**If the leader describes facing disengagement, missed commitments, or disrespect, address it directly and constructively. Validate that this is a real leadership challenge. Frame any 'toughness' they used not as punishment, but as a tool to refocus attention on shared goals. Ask yourself: Did their firmness clarify expectations? Did it protect the goal? Was it followed by an invitation to reconnect? If so, this can be a legitimate part of Win-Win leadership — because achieving the goal matters, and leaders have a right and responsibility to expect commitment. If the toughness was reactive or personal, gently guide them toward more goal-centered alternatives.**

Structure your feedback in three clear sections:
1. **Motivation Capacity Analysis:** Start by connecting and appreciating their intent. Use phrases like 'I hear that...' or 'It's clear that...'. Then, analyze their actions using plain language: Did people feel **capable**? Did they feel **ownership**? Did they feel **connected** to the purpose? If they faced resistance, include how their response affected these feelings. Avoid academic jargon—just describe what happened in everyday words.
2. **Leadership Style:** Based on the analysis, identify the style using the SFGAL terms: **Win-Win, Self-Oriented, Self-Neglecting, or Lose-Lose**. Be precise:
   * **Win-Win** means both the leader's goals AND the followers' needs (growth, development, motivation) are served.
   * **Self-Oriented** means the leader focused on achieving the goal but overlooked the team's intrinsic motivation needs.
   * **Self-Neglecting** means the leader sacrifices their own goals, but followers are still winning (developing, growing, achieving).
   * **Lose-Lose** means both sides lose — the goal is not achieved, AND followers are not developing or growing from the experience. If the leader accepted disengagement without response and no one grew, that is Lose-Lose.
   If the leader used constructive firmness to protect the goal while still respecting the person, acknowledge this as a Win-Win approach. If the toughness was reactive or one-sided, name the style with empathy.
3. **Your Coaching Plan:** Frame this as a supportive path forward. Give 3-4 practical, plain-language steps. If the leader faced disengagement, include suggestions like: 'Name the gap directly, then ask what they need to succeed' or 'Set a clear expectation, then follow up with genuine curiosity about what is getting in the way.' Keep suggestions concrete and usable.

Keep the total analysis under 450 words, and keep the tone warm throughout.

CRITICAL: You MUST write your entire response in the language specified by the "Response language" field in the user message. If it says English, write in English. If it says Turkish, write in Turkish. If it says Hungarian, write in Hungarian. Do NOT switch languages based on any non-English terms in this prompt — those are model terminology only.`;

// Step definitions with translations — aligned with Landbot flow
const steps = [
  {
    id: 'leader_goal',
    en: {
      question: 'Think of a recent situation where you wanted your team to achieve an important goal. What was the specific goal you needed them to achieve?<br><br><em>Important: Any recent leadership challenge — success or a learning experience — is welcome!</em>',
      placeholder: 'Describe the specific goal...',
    },
    tr: {
      question: 'Yakın zamanda ekibinizin önemli bir hedefe ulaşmasını istediğiniz bir durumu düşünün. Ulaşmalarını istediğiniz spesifik hedef neydi?<br><br><em>Önemli: Herhangi bir yakın tarihli liderlik deneyimi — ister başarı ister öğrenme fırsatı olsun — değerlidir!</em>',
      placeholder: 'Spesifik hedefi açıklayın...',
    },
    hu: {
      question: 'Gondolj egy közelmúltbeli helyzetre, amikor azt akartad, hogy a csapatod elérjen egy fontos célt. Mi volt az a konkrét cél, amit el kellett érniük?<br><br><em>Fontos: Bármilyen közelmúltbeli vezetői kihívás — legyen siker vagy tanulási tapasztalat — hasznos!</em>',
      placeholder: 'Írd le a konkrét célt...',
    },
  },
  {
    id: 'leader_urgency',
    type: 'range',
    en: { question: 'How important was this goal for you personally, on a scale of 1-10?' },
    tr: { question: 'Bu hedef sizin için kişisel olarak ne kadar önemliydi? (1-10 arası)' },
    hu: { question: 'Mennyire volt fontos számodra személyesen ez a cél? (1-10 skálán)' },
  },
  {
    id: 'framing_for_team_benefit',
    en: {
      question: 'How did you frame the goal or design the task to make it beneficial or meaningful for your team members?',
      placeholder: 'e.g., I explained how completing this would give everyone more autonomy...',
    },
    tr: {
      question: 'Ekibiniz için faydalı veya anlamlı olması amacıyla hedefi nasıl çerçevelendirdiniz veya görevi nasıl tasarladınız?',
      placeholder: 'örn., Bunu başarırsak herkesin daha bağımsız çalışabileceğini anlattım...',
    },
    hu: {
      question: 'Hogyan keretezted a célt vagy tervezted meg a feladatot, hogy az előnyös vagy értelmes legyen a csapattagjaid számára?',
      placeholder: 'pl., Elmagyaráztam, hogy ennek teljesítése mindenkinek nagyobb autonómiát ad...',
    },
  },
  {
    id: 'team_emotional_response',
    en: {
      question: 'What was your team\'s immediate emotional response to your request to achieve the goal? (e.g., Enthusiastic, Reluctant, Empowered, Skeptical)',
      placeholder: 'e.g., They were initially skeptical but became more engaged after I explained the reasoning...',
    },
    tr: {
      question: 'Ekibinizin, hedefe ulaşma talebinize karşı anlık duygusal tepkisi ne oldu? (Örn: Coşkulu, İsteksiz, Güçlenmiş, Şüpheci)',
      placeholder: 'örn., Başta şüpheciydiler ama nedenlerimi açıklayınca daha ilgili oldular...',
    },
    hu: {
      question: 'Mi volt a csapatod azonnali érzelmi reakciója a cél elérésére vonatkozó kérésedre? (pl. Lelkes, Vonakodó, Felhatalmazott, Szkeptikus)',
      placeholder: 'pl., Eleinte szkeptikusak voltak, de az indoklás után elkötelezettebbek lettek...',
    },
  },
  {
    id: 'motivation_quality_score',
    type: 'range',
    en: { question: 'To what extent were you able to motivate your team to put in high effort toward achieving this goal, on a scale of 1-10?' },
    tr: { question: 'Ekibinizi bu hedefe ulaşmak için yüksek çaba göstermeye ne ölçüde motive edebildiniz? (1-10 arası)' },
    hu: { question: 'Milyen mértékben tudtad motiválni a csapatodat, hogy nagy erőfeszítést tegyenek a cél eléréséért? (1-10 skálán)' },
  },
  {
    id: 'toughness',
    en: {
      question: 'Did you face any disengagement, missed commitments, or disrespect from your team member(s)? If so, how did you handle it?',
      placeholder: 'e.g., One team member kept missing deadlines, so I had a direct conversation about expectations...',
    },
    tr: {
      question: 'Ekip üyelerinizden ilgisizlik, taahhütlerin yerine getirilmemesi veya saygısızlık gibi durumlarla karşılaştınız mı? Karşılaştıysanız, nasıl ele aldınız?',
      placeholder: 'örn., Bir ekip üyesi sürekli teslim tarihlerini kaçırıyordu, bu yüzden beklentiler hakkında doğrudan bir görüşme yaptım...',
    },
    hu: {
      question: 'Tapasztaltál-e elkötelezettség-hiányt, elmulasztott vállalásokat vagy tiszteletlenséget a csapattagjaid részéről? Ha igen, hogyan kezelted?',
      placeholder: 'pl., Az egyik csapattag folyamatosan lekéste a határidőket, ezért közvetlen beszélgetést folytattam az elvárásokról...',
    },
  },
  {
    id: 'achievement',
    en: {
      question: 'Was the goal ultimately achieved? Explain if it was fully or partially achieved, or if it was not achieved.',
      placeholder: 'e.g., We achieved it partially — we hit the revenue target but missed the timeline...',
    },
    tr: {
      question: 'Hedefe sonuçta ulaşıldı mı? Tamamen mi, kısmen mi ulaşıldığını veya ulaşılamadığını açıklayın.',
      placeholder: 'örn., Kısmen ulaşıldı — gelir hedefini tutturduk ama takvimi kaçırdık...',
    },
    hu: {
      question: 'Végül elérted a célt? Magyarázd el, hogy teljesen, részlegesen sikerült-e, vagy nem sikerült.',
      placeholder: 'pl., Részben sikerült — a bevételi célt elértük, de a határidőt nem...',
    },
  },
  {
    id: 'leader_values',
    en: {
      question: 'What personal values were most important to you in this leadership situation? (e.g., collaboration, ambition, integrity, support)',
      placeholder: 'e.g., Integrity, collaboration, growth...',
    },
    tr: {
      question: 'Bu liderlik durumunda sizin için en önemli olan kişisel değerler hangileriydi? (Örn: iş birliği, hırs, dürüstlük, destek)',
      placeholder: 'örn., Dürüstlük, iş birliği, gelişim...',
    },
    hu: {
      question: 'Milyen személyes értékek voltak a legfontosabbak számodra ebben a vezetői helyzetben? (pl. együttműködés, ambíció, integritás, támogatás)',
      placeholder: 'pl., Integritás, együttműködés, fejlődés...',
    },
  },
  {
    id: 'vision_alignment',
    type: 'choice',
    en: {
      question: 'Did your approach in this situation feel aligned with your broader leadership vision?',
      choices: ['Yes', 'No', "I don't know"],
    },
    tr: {
      question: 'Bu durumdaki yaklaşımınız, daha geniş liderlik vizyonunuzla örtüşüyor muydu?',
      choices: ['Evet', 'Hayır', 'Bilmiyorum'],
    },
    hu: {
      question: 'Úgy érezted, hogy a megközelítésed ebben a helyzetben összhangban volt a tágabb vezetői víziódddal?',
      choices: ['Igen', 'Nem', 'Nem tudom'],
    },
  },
  {
    id: 'leader_vision',
    en: {
      question: 'In a nutshell, what is your leadership vision?',
      placeholder: 'e.g., To build a team that delivers excellent results while growing professionally...',
    },
    tr: {
      question: 'Kısacası, liderlik vizyonunuz nedir?',
      placeholder: 'örn., Hem profesyonel olarak gelişen hem de mükemmel sonuçlar üreten bir ekip kurmak...',
    },
    hu: {
      question: 'Dióhéjban, mi a vezetői víziód?',
      placeholder: 'pl., Olyan csapat építése, amely kiváló eredményeket ér el, miközben szakmailag fejlődik...',
    },
  },
  {
    id: 'team_benefit',
    en: {
      question: 'What was the benefit, if any, your team members gained from your leadership in this specific situation?',
      placeholder: 'e.g., They gained confidence in handling high-pressure situations...',
    },
    tr: {
      question: 'Bu spesifik durumda, ekip üyeleriniz sizin liderliğinizden ne gibi bir fayda sağladı (varsa)?',
      placeholder: 'örn., Yüksek baskı altında çalışma konusunda özgüven kazandılar...',
    },
    hu: {
      question: 'Milyen előnye származott, ha volt, a csapattagjaidnak a te vezetésedből ebben a konkrét helyzetben?',
      placeholder: 'pl., Magabiztosságot szereztek a nyomás alatti helyzetek kezelésében...',
    },
  },
  {
    id: 'leader_benefit',
    en: {
      question: 'What was the primary benefit for you as the leader?',
      placeholder: 'e.g., I learned the importance of giving my team more ownership...',
    },
    tr: {
      question: 'Lider olarak sizin için sağlanan temel fayda neydi?',
      placeholder: 'örn., Ekibime daha fazla sahiplenme hakkı tanımanın önemini öğrendim...',
    },
    hu: {
      question: 'Mi volt a fő előny számodra mint vezető?',
      placeholder: 'pl., Megtanultam, milyen fontos nagyobb felelősséget adni a csapatnak...',
    },
  },
  {
    id: 'org_benefit',
    en: {
      question: 'How did the organization benefit?',
      placeholder: 'e.g., We delivered the project on time, improving client trust...',
    },
    tr: {
      question: 'Kuruluş bu durumdan nasıl fayda sağladı?',
      placeholder: 'örn., Projeyi zamanında teslim ettik, müşteri güvenini artırdık...',
    },
    hu: {
      question: 'Hogyan profitált ebből a szervezet?',
      placeholder: 'pl., Időben szállítottuk a projektet, javítva az ügyfélbizalmat...',
    },
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
        welcome: "Welcome! I'm your AI Leadership Coach. I'll ask you a series of questions about a recent leadership experience, then generate a personalized AI analysis based on the SFGAL model.",
        start: 'Start Analysis',
        next: 'Next',
        submit: 'Get My Analysis',
        thinking: 'Analyzing your leadership experience...',
        restart: 'Start New Analysis',
        error: 'Something went wrong. Please try again.',
        stepOf: 'Question {current} of {total}',
      },
      tr: {
        welcome: "Hoş geldiniz! Ben yapay zeka destekli liderlik koçunuzum. Size yakın zamanda yaşadığınız bir liderlik deneyimiyle ilgili bir dizi soru soracağım, ardından SFGAL modeline dayalı kişiselleştirilmiş yapay zeka analizinizi oluşturacağım.",
        start: 'Başlayalım',
        next: 'Devam',
        submit: 'Analizimi Göster',
        thinking: 'Deneyiminiz değerlendiriliyor...',
        restart: 'Yeni Bir Analiz Yap',
        error: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
        stepOf: 'Soru {current} / {total}',
      },
      hu: {
        welcome: "Üdvözlöm! Én vagyok az MI Vezetői Coachod. Felteszek egy sor kérdést egy közelmúltbeli vezetői tapasztalatodról, majd személyre szabott MI elemzést készítek az SFGAL modell alapján.",
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
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
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
    } else if (step.type === 'choice') {
      this.showChoiceInput(step, stepData);
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

  showChoiceInput(step, stepData) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-choice-wrapper';

    stepData.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'chat-btn chat-btn-choice';
      btn.textContent = choice;
      btn.addEventListener('click', () => {
        this.answers[step.id] = choice;
        this.addMessage(choice, 'user');
        this.nextStep();
      });
      wrapper.appendChild(btn);
    });

    this.inputArea.appendChild(wrapper);
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

    const langNames = { en: 'English', tr: 'Turkish', hu: 'Hungarian' };
    const userMessage = `Response language: ${langNames[this.getLang()] || 'English'}.\n\nGoal: ${this.answers.leader_goal}. Importance (1-10): ${this.answers.leader_urgency}. Framing for team benefit: ${this.answers.framing_for_team_benefit}. Team's emotional response: ${this.answers.team_emotional_response}. Quality (1-10): ${this.answers.motivation_quality_score}. Toughness: ${this.answers.toughness}. Achievement: ${this.answers.achievement}. Personal values: ${this.answers.leader_values}. Vision alignment: ${this.answers.vision_alignment}. Leadership vision: ${this.answers.leader_vision}. Team benefit: ${this.answers.team_benefit}. Leader benefit: ${this.answers.leader_benefit}. Organization benefit: ${this.answers.org_benefit}.`;

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
          answers: this.answers,
          language: this.getLang(),
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

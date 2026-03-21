/**
 * Personality quiz data and scoring logic.
 * Each answer maps to trait dimensions that drive the animation.
 */

const QUESTIONS = [
  {
    text: "It's a rainy Saturday morning. What are you doing?",
    options: [
      { text: "Curled up reading with tea", traits: { introvert: 2, cozy: 2, calm: 1 } },
      { text: "Cooking something elaborate", traits: { creative: 2, warm: 1, sensory: 1 } },
      { text: "Calling a friend to come hang out", traits: { extrovert: 2, warm: 1, social: 1 } },
      { text: "Working on a secret project", traits: { creative: 2, introvert: 1, dreamer: 1 } }
    ]
  },
  {
    text: "Pick a color that feels like home.",
    options: [
      { text: "Warm amber / burnt orange", traits: { warm: 2, cozy: 1, sensory: 1 } },
      { text: "Soft sage green", traits: { calm: 2, nature: 2 } },
      { text: "Deep midnight blue", traits: { dreamer: 2, introvert: 1, calm: 1 } },
      { text: "Dusty rose pink", traits: { warm: 1, creative: 1, social: 1, gentle: 1 } }
    ]
  },
  {
    text: "Your ideal evening involves...",
    options: [
      { text: "A bonfire under the stars", traits: { nature: 2, dreamer: 1, warm: 1 } },
      { text: "A dinner party with close friends", traits: { social: 2, extrovert: 1, warm: 1 } },
      { text: "Getting lost in music or art", traits: { creative: 2, introvert: 1, sensory: 1 } },
      { text: "A long walk through quiet streets", traits: { calm: 2, introvert: 1, nature: 1 } }
    ]
  },
  {
    text: "If your life had a soundtrack, it would be...",
    options: [
      { text: "Soft acoustic guitar", traits: { calm: 2, warm: 1, gentle: 1 } },
      { text: "Jazz in a smoky room", traits: { creative: 1, sensory: 2, dreamer: 1 } },
      { text: "Upbeat indie pop", traits: { extrovert: 1, social: 1, warm: 1, energy: 1 } },
      { text: "Ambient electronic / lo-fi", traits: { dreamer: 2, introvert: 1, calm: 1 } }
    ]
  },
  {
    text: "Which of these speaks to your soul?",
    options: [
      { text: "A cluttered bookshop that smells like old paper", traits: { introvert: 1, cozy: 2, creative: 1 } },
      { text: "A wildflower meadow at golden hour", traits: { nature: 2, dreamer: 1, gentle: 1 } },
      { text: "A rooftop full of fairy lights and friends", traits: { social: 2, extrovert: 1, warm: 1 } },
      { text: "A studio full of half-finished canvases", traits: { creative: 2, sensory: 1, dreamer: 1 } }
    ]
  },
  {
    text: "How do you recharge?",
    options: [
      { text: "Total solitude — just me and my thoughts", traits: { introvert: 2, calm: 1, dreamer: 1 } },
      { text: "Being around people who energize me", traits: { extrovert: 2, social: 1, energy: 1 } },
      { text: "Making something with my hands", traits: { creative: 2, sensory: 1, calm: 1 } },
      { text: "Being outdoors, rain or shine", traits: { nature: 2, energy: 1, gentle: 1 } }
    ]
  },
  {
    text: "Pick a pet that matches your vibe.",
    options: [
      { text: "A sleepy cat on a windowsill", traits: { introvert: 1, cozy: 2, calm: 1 } },
      { text: "A golden retriever at the park", traits: { extrovert: 1, social: 1, energy: 1, warm: 1 } },
      { text: "A fish tank with soft blue light", traits: { calm: 2, dreamer: 1, sensory: 1 } },
      { text: "A houseplant (they count!)", traits: { nature: 2, gentle: 1, creative: 1 } }
    ]
  },
  {
    text: "What would you hang on your wall?",
    options: [
      { text: "A messy abstract painting", traits: { creative: 2, sensory: 1, energy: 1 } },
      { text: "Polaroid photos of people I love", traits: { social: 2, warm: 2 } },
      { text: "A vintage map of somewhere I've never been", traits: { dreamer: 2, nature: 1, introvert: 1 } },
      { text: "A mirror with dried flowers around it", traits: { gentle: 2, cozy: 1, nature: 1 } }
    ]
  },
  {
    text: "When you daydream, you picture...",
    options: [
      { text: "A tiny cottage by the sea", traits: { cozy: 2, nature: 1, calm: 1 } },
      { text: "Traveling with no itinerary", traits: { dreamer: 2, energy: 1, extrovert: 1 } },
      { text: "A future version of me who has it all figured out", traits: { introvert: 1, dreamer: 1, gentle: 1, warm: 1 } },
      { text: "Building something that didn't exist before", traits: { creative: 2, energy: 1, sensory: 1 } }
    ]
  }
];

// Personality archetypes derived from trait combinations
const ARCHETYPES = [
  {
    id: 'cozy-dreamer',
    name: 'The Cozy Dreamer',
    description: 'You live in a world of soft blankets and big ideas. Your mind wanders to beautiful places while your body stays curled up somewhere warm. You find magic in the quiet moments.',
    primaryTraits: ['cozy', 'dreamer', 'introvert'],
    scene: 'cozy-room',
    palette: 'warm',
    traitTags: ['Imaginative', 'Gentle', 'Introspective', 'Warm-hearted']
  },
  {
    id: 'wild-creative',
    name: 'The Wild Creative',
    description: 'Your hands are always stained with paint, ink, or flour. You see art in everything and can\'t help but make the world more colorful. Chaos is just another word for creativity.',
    primaryTraits: ['creative', 'sensory', 'energy'],
    scene: 'studio',
    palette: 'bold',
    traitTags: ['Expressive', 'Passionate', 'Spontaneous', 'Bold']
  },
  {
    id: 'gentle-wanderer',
    name: 'The Gentle Wanderer',
    description: 'You\'re drawn to open skies and quiet paths. Nature speaks to you in ways that words can\'t. You move through the world softly, noticing what others miss.',
    primaryTraits: ['nature', 'calm', 'gentle'],
    scene: 'nature-path',
    palette: 'earthy',
    traitTags: ['Observant', 'Peaceful', 'Grounded', 'Free-spirited']
  },
  {
    id: 'warm-connector',
    name: 'The Warm Connector',
    description: 'People are your favorite art form. You remember birthdays, write long texts, and always have room for one more at the table. Your warmth is contagious.',
    primaryTraits: ['social', 'warm', 'extrovert'],
    scene: 'gathering',
    palette: 'sunset',
    traitTags: ['Empathetic', 'Generous', 'Joyful', 'Magnetic']
  },
  {
    id: 'midnight-thinker',
    name: 'The Midnight Thinker',
    description: 'Your best ideas come at 2am. You\'re equal parts philosopher and poet, always chasing a thought just beyond reach. The night sky feels like home.',
    primaryTraits: ['dreamer', 'introvert', 'calm'],
    scene: 'night-room',
    palette: 'midnight',
    traitTags: ['Thoughtful', 'Deep', 'Curious', 'Enigmatic']
  }
];

class Quiz {
  constructor() {
    this.currentQuestion = 0;
    this.answers = [];
    this.traits = {};
  }

  getQuestion() {
    return QUESTIONS[this.currentQuestion];
  }

  get totalQuestions() {
    return QUESTIONS.length;
  }

  get progress() {
    return this.currentQuestion / QUESTIONS.length;
  }

  get isComplete() {
    return this.currentQuestion >= QUESTIONS.length;
  }

  answer(optionIndex) {
    const question = QUESTIONS[this.currentQuestion];
    const chosen = question.options[optionIndex];
    this.answers.push(optionIndex);

    // Accumulate traits
    for (const [trait, value] of Object.entries(chosen.traits)) {
      this.traits[trait] = (this.traits[trait] || 0) + value;
    }

    this.currentQuestion++;
    return this.isComplete;
  }

  getResult() {
    // Score each archetype by how well the user's traits match
    let bestArchetype = ARCHETYPES[0];
    let bestScore = -1;

    for (const archetype of ARCHETYPES) {
      let score = 0;
      for (const trait of archetype.primaryTraits) {
        score += (this.traits[trait] || 0);
      }
      if (score > bestScore) {
        bestScore = score;
        bestArchetype = archetype;
      }
    }

    return {
      archetype: bestArchetype,
      traits: { ...this.traits },
      answers: [...this.answers]
    };
  }

  reset() {
    this.currentQuestion = 0;
    this.answers = [];
    this.traits = {};
  }
}

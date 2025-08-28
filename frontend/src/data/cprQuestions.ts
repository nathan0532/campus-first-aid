export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  stepId: string; // 关联到CPR步骤
}

export const cprQuestions: QuizQuestion[] = [
  {
    id: 'consciousness-check-1',
    stepId: 'check-consciousness',
    question: 'When checking for consciousness, what should you do first?',
    options: [
      'Immediately start chest compressions',
      'Tap the patient\'s shoulders and shout loudly',
      'Check for a pulse',
      'Tilt the head back to open the airway'
    ],
    correctAnswer: 1,
    explanation: 'You should tap the patient\'s shoulders firmly and shout "Are you okay?" to assess consciousness. This helps determine if the person is responsive and needs emergency care.'
  },
  {
    id: 'consciousness-check-2',
    stepId: 'check-consciousness',
    question: 'How long should you spend checking for consciousness?',
    options: [
      'Up to 2 minutes',
      'No more than 10 seconds',
      'At least 30 seconds',
      '1 minute'
    ],
    correctAnswer: 1,
    explanation: 'Consciousness check should take no more than 10 seconds. Time is critical in cardiac arrest, and prolonged assessment delays life-saving interventions.'
  },
  {
    id: 'call-help-1',
    stepId: 'call-help',
    question: 'What is the correct order of actions when calling for help?',
    options: [
      'Call 911, then get an AED if available',
      'Get an AED first, then call 911',
      'Start CPR, then call 911',
      'Check pulse, call 911, then get AED'
    ],
    correctAnswer: 0,
    explanation: 'Call 911 (or your local emergency number) immediately, then get an AED if available. Early activation of emergency medical services is crucial for survival.'
  },
  {
    id: 'call-help-2',
    stepId: 'call-help',
    question: 'What information should you provide when calling for emergency help?',
    options: [
      'Only your location',
      'Only the patient\'s condition',
      'Location, nature of emergency, patient\'s condition, and your name',
      'Just that someone needs CPR'
    ],
    correctAnswer: 2,
    explanation: 'Provide clear, complete information: exact location, nature of emergency (cardiac arrest), patient\'s condition (unconscious, not breathing), and your name. This helps dispatchers send appropriate help quickly.'
  },
  {
    id: 'position-1',
    stepId: 'position',
    question: 'What is the correct position for the patient during CPR?',
    options: [
      'On their side (recovery position)',
      'Sitting upright',
      'Supine (on their back) on a firm, flat surface',
      'Face down'
    ],
    correctAnswer: 2,
    explanation: 'The patient should be supine (on their back) on a firm, flat surface. This position allows for effective chest compressions and proper airway management.'
  },
  {
    id: 'position-2',
    stepId: 'position',
    question: 'How should you position the patient\'s head for effective CPR?',
    options: [
      'Head tilted to one side',
      'Head slightly tilted back with chin lifted',
      'Head in neutral position',
      'Head tilted forward'
    ],
    correctAnswer: 1,
    explanation: 'Tilt the head slightly back and lift the chin to open the airway. This head-tilt, chin-lift maneuver helps ensure the airway is clear for effective ventilation.'
  },
  {
    id: 'compression-1',
    stepId: 'compression',
    question: 'What is the correct compression depth for adult CPR?',
    options: [
      '3-4 cm (1.2-1.6 inches)',
      '5-6 cm (2-2.4 inches)',
      '7-8 cm (2.8-3.2 inches)',
      '2-3 cm (0.8-1.2 inches)'
    ],
    correctAnswer: 1,
    explanation: 'Compressions should be 5-6 cm (2-2.4 inches) deep for adults. This depth is necessary to effectively pump blood and maintain circulation to vital organs.'
  },
  {
    id: 'compression-2',
    stepId: 'compression',
    question: 'What is the correct compression rate for CPR?',
    options: [
      '80-100 compressions per minute',
      '100-120 compressions per minute',
      '120-140 compressions per minute',
      '60-80 compressions per minute'
    ],
    correctAnswer: 1,
    explanation: 'The compression rate should be 100-120 compressions per minute. This rate provides optimal blood flow while allowing adequate time for chest recoil between compressions.'
  },
  {
    id: 'compression-3',
    stepId: 'compression',
    question: 'Where should you place your hands for chest compressions?',
    options: [
      'Upper half of the breastbone',
      'Lower half of the breastbone (lower sternum)',
      'Over the left side of the chest',
      'Just below the ribcage'
    ],
    correctAnswer: 1,
    explanation: 'Place your hands on the lower half of the breastbone (lower sternum), between the nipples. This position ensures compressions are delivered over the heart for maximum effectiveness.'
  },
  {
    id: 'ventilation-1',
    stepId: 'ventilation',
    question: 'How long should each rescue breath take?',
    options: [
      '3-4 seconds',
      '1 second',
      '2 seconds',
      '5-6 seconds'
    ],
    correctAnswer: 1,
    explanation: 'Each rescue breath should take about 1 second and should make the chest rise visibly. Longer breaths can cause gastric inflation and reduce the effectiveness of CPR.'
  },
  {
    id: 'ventilation-2',
    stepId: 'ventilation',
    question: 'What is the correct ratio of compressions to ventilations in adult CPR?',
    options: [
      '15:2',
      '30:2',
      '20:2',
      '10:1'
    ],
    correctAnswer: 1,
    explanation: 'The correct ratio is 30 compressions to 2 ventilations for adult CPR. This ratio maximizes the time spent on chest compressions while providing adequate ventilation.'
  }
];
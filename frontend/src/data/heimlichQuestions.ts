export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  stepId: string; // 关联到海姆立克步骤
}

export const heimlichQuestions: QuizQuestion[] = [
  {
    id: 'choking-signs-1',
    stepId: 'identify-choking',
    question: 'What is the universal sign of choking?',
    options: [
      'Coughing loudly',
      'Hands clutched to the throat',
      'Waving hands frantically',
      'Pointing to the mouth'
    ],
    correctAnswer: 1,
    explanation: 'The universal sign of choking is hands clutched to the throat. This is a widely recognized distress signal that indicates someone cannot breathe due to an airway obstruction.'
  },
  {
    id: 'choking-signs-2',
    stepId: 'identify-choking',
    question: 'Which of these indicates severe choking that requires immediate intervention?',
    options: [
      'Person can speak and cough forcefully',
      'Person cannot speak, cough, or breathe',
      'Person is coughing but can still talk',
      'Person is crying loudly'
    ],
    correctAnswer: 1,
    explanation: 'Severe choking occurs when a person cannot speak, cough, or breathe. This indicates complete airway obstruction and requires immediate action like the Heimlich maneuver.'
  },
  {
    id: 'positioning-1',
    stepId: 'position-behind',
    question: 'Where should you position yourself when performing the Heimlich maneuver on a standing adult?',
    options: [
      'In front of the person',
      'To the side of the person',
      'Behind the person',
      'Above the person'
    ],
    correctAnswer: 2,
    explanation: 'You should position yourself behind the person. This allows you to wrap your arms around their waist and deliver effective abdominal thrusts.'
  },
  {
    id: 'positioning-2',
    stepId: 'position-behind',
    question: 'What should you tell the choking person before starting the Heimlich maneuver?',
    options: [
      'Try to cough harder',
      'I\'m going to help you with abdominal thrusts',
      'Lean forward as much as possible',
      'Hold your breath'
    ],
    correctAnswer: 1,
    explanation: 'You should tell the person "I\'m going to help you with abdominal thrusts." This informs them of what you\'re about to do and may help reduce panic.'
  },
  {
    id: 'hand-position-1',
    stepId: 'hand-position',
    question: 'Where should you place your fist when performing the Heimlich maneuver?',
    options: [
      'On the lower chest',
      'Just above the navel, below the ribcage',
      'On the upper abdomen near the ribcage',
      'On the back between the shoulder blades'
    ],
    correctAnswer: 1,
    explanation: 'Place your fist just above the navel (belly button) and below the ribcage. This position targets the diaphragm to create pressure that can dislodge the obstruction.'
  },
  {
    id: 'hand-position-2',
    stepId: 'hand-position',
    question: 'How should your hands be positioned during the Heimlich maneuver?',
    options: [
      'Both hands side by side',
      'One hand on top of the other',
      'Fist with thumb side against abdomen, other hand covering fist',
      'Palms flat against the abdomen'
    ],
    correctAnswer: 2,
    explanation: 'Make a fist with your thumb side against the person\'s abdomen, then grasp your fist with your other hand. This provides better control and force distribution.'
  },
  {
    id: 'thrust-technique-1',
    stepId: 'abdominal-thrust',
    question: 'What is the correct direction for abdominal thrusts?',
    options: [
      'Straight up',
      'Straight in toward the spine',
      'Up and inward toward the spine',
      'Down and inward'
    ],
    correctAnswer: 2,
    explanation: 'Thrusts should be directed up and inward toward the spine. This upward and inward motion creates the most effective pressure to dislodge the obstruction.'
  },
  {
    id: 'thrust-technique-2',
    stepId: 'abdominal-thrust',
    question: 'How should each abdominal thrust be performed?',
    options: [
      'Slow and gentle',
      'Quick and forceful',
      'Steady and continuous pressure',
      'Gradual increasing pressure'
    ],
    correctAnswer: 1,
    explanation: 'Each thrust should be quick and forceful, like you\'re trying to lift the person off the ground. Gentle pressure is not effective for dislodging airway obstructions.'
  },
  {
    id: 'thrust-technique-3',
    stepId: 'abdominal-thrust',
    question: 'When should you stop performing abdominal thrusts?',
    options: [
      'After exactly 5 thrusts',
      'When the person stops making noise',
      'When the object is expelled or person becomes unconscious',
      'After 2 minutes of trying'
    ],
    correctAnswer: 2,
    explanation: 'Stop when the object is expelled and the person can breathe, or if the person becomes unconscious (then switch to CPR). Continue until one of these outcomes occurs.'
  },
  {
    id: 'special-cases-1',
    stepId: 'abdominal-thrust',
    question: 'What should you do for a pregnant woman who is choking?',
    options: [
      'Perform abdominal thrusts as normal',
      'Perform chest thrusts instead',
      'Only encourage coughing',
      'Position her lying down first'
    ],
    correctAnswer: 1,
    explanation: 'For pregnant women, perform chest thrusts instead of abdominal thrusts to avoid injury to the baby. Place your hands on the center of the breastbone and thrust inward.'
  },
  {
    id: 'follow-up-1',
    stepId: 'abdominal-thrust',
    question: 'What should you do after successfully dislodging the object?',
    options: [
      'Leave immediately',
      'Encourage the person to seek medical attention',
      'Give them water to drink',
      'Have them lie down and rest'
    ],
    correctAnswer: 1,
    explanation: 'Even after successful removal of the obstruction, the person should seek medical attention. Abdominal thrusts can cause internal injuries that need to be evaluated.'
  }
];
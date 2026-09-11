export interface Role {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
}

export interface Question {
  id: number;
  text: string;
  category: string;
  targetTime: string;
}

const SHORT_ANSWER = '90 to 120 sec';
const MEDIUM_ANSWER = '120 to 150 sec';
const LONG_ANSWER = '150 to 180 sec';

export const roleQuestions: Record<string, Question[]> = {
  'software-engineer': [
    {
      id: 1,
      text: 'Tell me about yourself and why you are interested in this role.',
      category: 'Behavioral',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 2,
      text: 'Describe a technically challenging problem you solved. What was your approach?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'How would you design a URL shortener like bit.ly at scale?',
      category: 'System Design',
      targetTime: LONG_ANSWER,
    },
    {
      id: 4,
      text: 'Walk me through how you would debug a production outage you have never seen before.',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'Tell me about a time you disagreed with a technical decision on your team.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'Explain the difference between concurrency and parallelism to a non-engineer.',
      category: 'Technical',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 7,
      text: 'How do you decide when to write tests, and what do you choose to test?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 8,
      text: 'Design a rate limiter for a public API. What are the trade-offs?',
      category: 'System Design',
      targetTime: LONG_ANSWER,
    },
    {
      id: 9,
      text: 'Tell me about a piece of code you are proud of and what made it good.',
      category: 'Behavioral',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 10,
      text: 'How would you approach reducing the latency of a slow database query?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 11,
      text: 'Describe a time you mentored someone or unblocked a struggling teammate.',
      category: 'Leadership',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 12,
      text: 'Where do you want your engineering career to be in three years, and why here?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'product-manager': [
    {
      id: 1,
      text: 'Tell me about a product you have taken from an idea to launch.',
      category: 'Behavioral',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 2,
      text: 'How do you prioritise features when everything is labelled urgent?',
      category: 'Strategy',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'A key metric drops fifteen percent overnight. Walk me through your first day.',
      category: 'Analytical',
      targetTime: LONG_ANSWER,
    },
    {
      id: 4,
      text: 'How do you decide what not to build?',
      category: 'Strategy',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'Tell me about a time you shipped something that failed. What did you learn?',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'How do you handle an engineering lead who disagrees with your roadmap?',
      category: 'Leadership',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'How would you measure the success of a feature three months after launch?',
      category: 'Analytical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 8,
      text: 'Pick a product you use daily and tell me how you would improve it.',
      category: 'Strategy',
      targetTime: LONG_ANSWER,
    },
    {
      id: 9,
      text: 'Describe how you gather and weigh customer feedback.',
      category: 'Behavioral',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 10,
      text: 'Why this company, and what would you want to own in your first ninety days?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'data-scientist': [
    {
      id: 1,
      text: 'Tell me about a data project that changed a business decision.',
      category: 'Behavioral',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 2,
      text: 'Explain the bias-variance trade-off to a stakeholder with no maths background.',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'How would you design an A/B test for a new checkout flow?',
      category: 'Analytical',
      targetTime: LONG_ANSWER,
    },
    {
      id: 4,
      text: 'Your model performs well offline but poorly in production. How do you investigate?',
      category: 'Technical',
      targetTime: LONG_ANSWER,
    },
    {
      id: 5,
      text: 'How do you handle a dataset with thirty percent missing values?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'Describe a time you had to tell a stakeholder the data did not support their idea.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'When would you choose a simpler model over a more accurate one?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 8,
      text: 'How do you detect and address bias in a training dataset?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 9,
      text: 'Walk me through how you would forecast demand for a new product line.',
      category: 'Analytical',
      targetTime: LONG_ANSWER,
    },
    {
      id: 10,
      text: 'What kind of data problems do you most want to work on, and why here?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'ux-designer': [
    {
      id: 1,
      text: 'Walk me through a project in your portfolio from research to final design.',
      category: 'Behavioral',
      targetTime: LONG_ANSWER,
    },
    {
      id: 2,
      text: 'How do you run user research when you have two weeks and no budget?',
      category: 'Research',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'Describe a time user testing proved your design assumption wrong.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 4,
      text: 'How do you design for accessibility beyond meeting the minimum standard?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'A stakeholder wants a change you believe harms the user. How do you handle it?',
      category: 'Leadership',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'How do you decide between improving an existing flow and redesigning it?',
      category: 'Strategy',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'Explain how you would improve the onboarding of an app you use.',
      category: 'Strategy',
      targetTime: LONG_ANSWER,
    },
    {
      id: 8,
      text: 'How do you work with engineers to keep a design intact through build?',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 9,
      text: 'How do you measure whether a design actually worked?',
      category: 'Analytical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 10,
      text: 'What kind of design team do you do your best work in?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'marketing-manager': [
    {
      id: 1,
      text: 'Tell me about a campaign you owned end to end and what it delivered.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 2,
      text: 'How would you launch a product into a market where nobody knows the brand?',
      category: 'Strategy',
      targetTime: LONG_ANSWER,
    },
    {
      id: 3,
      text: 'A campaign is burning budget with no conversions. What do you do first?',
      category: 'Analytical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 4,
      text: 'How do you decide how to split spend across channels?',
      category: 'Strategy',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'Describe a time you had to market something you did not personally believe in.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'How do you measure brand awareness in a way a finance team accepts?',
      category: 'Analytical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'How do you work with sales when they say the leads are low quality?',
      category: 'Leadership',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 8,
      text: 'Tell me about a campaign that failed and what you changed afterwards.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 9,
      text: 'What draws you to marketing at this company specifically?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'sales-executive': [
    {
      id: 1,
      text: 'Walk me through a deal you closed from first contact to signature.',
      category: 'Behavioral',
      targetTime: LONG_ANSWER,
    },
    {
      id: 2,
      text: 'How do you qualify whether a prospect is worth your time?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'A prospect says your product is too expensive. How do you respond?',
      category: 'Negotiation',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 4,
      text: 'Tell me about a deal you lost and what you would do differently.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'How do you build a pipeline from nothing in a new territory?',
      category: 'Strategy',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'How do you handle a champion who goes quiet late in the cycle?',
      category: 'Negotiation',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'Sell me something on my desk right now.',
      category: 'Negotiation',
      targetTime: SHORT_ANSWER,
    },
    {
      id: 8,
      text: 'What kind of sales culture brings out your best work?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],

  'finance-analyst': [
    {
      id: 1,
      text: 'Walk me through a financial model you built and the decision it supported.',
      category: 'Behavioral',
      targetTime: LONG_ANSWER,
    },
    {
      id: 2,
      text: 'Walk me through the three financial statements and how they connect.',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 3,
      text: 'How would you value a company with negative earnings?',
      category: 'Technical',
      targetTime: LONG_ANSWER,
    },
    {
      id: 4,
      text: 'Your forecast is off by twenty percent. How do you find out why?',
      category: 'Analytical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 5,
      text: 'How do you present a number a business leader does not want to hear?',
      category: 'Leadership',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 6,
      text: 'What assumptions do you stress test first in any model, and why?',
      category: 'Technical',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 7,
      text: 'Describe a time you caught an error that others had missed.',
      category: 'Behavioral',
      targetTime: MEDIUM_ANSWER,
    },
    {
      id: 8,
      text: 'Why this company, and what would you want to own here?',
      category: 'Cultural Fit',
      targetTime: SHORT_ANSWER,
    },
  ],
};

export const DEFAULT_ROLE_ID = 'software-engineer';

export const roles: Role[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description: 'Full-stack, backend, frontend, and system design interviews.',
    category: 'Engineering',
    questionCount: roleQuestions['software-engineer'].length,
    difficulty: 'advanced',
    estimatedTime: '25 min',
    tags: ['Algorithms', 'System Design', 'Coding'],
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Product strategy, roadmap, prioritization, and stakeholder management.',
    category: 'Product',
    questionCount: roleQuestions['product-manager'].length,
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    tags: ['Strategy', 'Roadmap', 'Leadership'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Statistics, machine learning, data analysis, and A/B testing.',
    category: 'Data',
    questionCount: roleQuestions['data-scientist'].length,
    difficulty: 'advanced',
    estimatedTime: '22 min',
    tags: ['ML', 'Statistics', 'Python'],
  },
  {
    id: 'ux-designer',
    title: 'UX / Product Designer',
    description: 'Design thinking, user research, prototyping, and portfolio presentation.',
    category: 'Design',
    questionCount: roleQuestions['ux-designer'].length,
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    tags: ['Design Thinking', 'Figma', 'Research'],
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    description: 'Campaign strategy, brand management, and growth marketing.',
    category: 'Marketing',
    questionCount: roleQuestions['marketing-manager'].length,
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    tags: ['Campaigns', 'Brand', 'Growth'],
  },
  {
    id: 'sales-executive',
    title: 'Account Executive / Sales',
    description: 'B2B sales, negotiation, pipeline management, and closing.',
    category: 'Sales',
    questionCount: roleQuestions['sales-executive'].length,
    difficulty: 'beginner',
    estimatedTime: '15 min',
    tags: ['Negotiation', 'CRM', 'Closing'],
  },
  {
    id: 'finance-analyst',
    title: 'Finance / Analyst',
    description: 'Financial modeling, forecasting, budgeting, and investment analysis.',
    category: 'Finance',
    questionCount: roleQuestions['finance-analyst'].length,
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    tags: ['Modeling', 'Excel', 'Forecasting'],
  },
];

export function getQuestionsForRole(roleId: string): Question[] {
  return roleQuestions[roleId] ?? roleQuestions[DEFAULT_ROLE_ID];
}

export function getRoleById(roleId: string): Role | undefined {
  return roles.find((role) => role.id === roleId);
}

export function getRoleByTitle(title: string): Role | undefined {
  return roles.find((role) => role.title === title);
}

export function resolveRoleId(roleTitle: string, storedRoleId?: string): string {
  if (storedRoleId) return storedRoleId;
  return getRoleByTitle(roleTitle)?.id ?? DEFAULT_ROLE_ID;
}

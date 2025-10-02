const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const stages = ['applied', 'screening', 'interview', 'technical', 'final', 'offer', 'hired', 'rejected']
const tagsPool = ['frontend', 'backend', 'devops', 'design', 'ml', 'infra', 'mobile', 'data', 'security', 'qa']
const jobTitles = [
  'Senior Frontend Engineer', 'Backend Developer', 'Full Stack Engineer', 'DevOps Engineer',
  'UI/UX Designer', 'Product Manager', 'Data Scientist', 'Machine Learning Engineer',
  'Site Reliability Engineer', 'QA Engineer', 'Security Engineer', 'Mobile Developer',
  'Technical Lead', 'Engineering Manager', 'Solutions Architect', 'Cloud Engineer',
  'Database Administrator', 'Business Analyst', 'Scrum Master', 'Technical Writer',
  'Platform Engineer', 'Infrastructure Engineer', 'AI Engineer', 'Blockchain Developer',
  'Game Developer'
]

const questionTypes = ['single', 'multi', 'short', 'long', 'numeric']
const questionTemplates = {
  single: [
    'What is your preferred programming language?',
    'Which development methodology do you prefer?',
    'What is your experience level with cloud platforms?',
    'Which database system are you most comfortable with?',
    'What is your preferred IDE/editor?'
  ],
  multi: [
    'Which of the following technologies have you worked with?',
    'Select all programming languages you are proficient in',
    'Which project management tools have you used?',
    'What types of testing have you performed?',
    'Which cloud services have you utilized?'
  ],
  short: [
    'Describe your ideal work environment',
    'What motivates you in your career?',
    'How do you handle tight deadlines?',
    'What is your greatest professional strength?',
    'How do you stay updated with technology trends?'
  ],
  long: [
    'Describe a challenging project you worked on and how you overcame obstacles',
    'Explain your approach to debugging complex issues',
    'How would you design a scalable system for high traffic?',
    'Describe your experience with team collaboration and leadership',
    'What would you do in your first 90 days in this role?'
  ],
  numeric: [
    'How many years of professional experience do you have?',
    'How many team members have you managed?',
    'What is your expected salary range (in thousands)?',
    'How many projects have you led from start to finish?',
    'Rate your proficiency in your primary technology (1-10)'
  ]
}

export async function fakeSeed(db) {
  console.log('🌱 Checking if seed data exists...')
  const jobsCount = await db.jobs.count()
  console.log(`📊 Current jobs count: ${jobsCount}`)
  
  if (jobsCount > 0) {
    console.log('✅ Seed data already exists, skipping...')
    return
  }
  
  console.log('🚀 Creating seed data...')

  // Create exactly 25 jobs with mixed active/archived status
  const jobs = Array.from({ length: 25 }).map((_, i) => {
    const isActive = Math.random() < 0.6 // 60% active, 40% archived
    const hasAutoArchive = isActive && Math.random() < 0.3 // 30% of active jobs have auto-archive
    const autoArchiveHours = hasAutoArchive ? random([2, 6, 12, 24, 48, 168]) : null // 2h to 1 week
    
    const experienceLevel = random(['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'])
    const salaryRange = {
      'Junior': [60000, 90000],
      'Mid-level': [90000, 130000],
      'Senior': [130000, 180000],
      'Lead': [180000, 250000],
      'Principal': [250000, 350000]
    }
    const [minSalary, maxSalary] = salaryRange[experienceLevel]
    const actualMinSalary = minSalary + Math.floor(Math.random() * 20000)
    const actualMaxSalary = maxSalary + Math.floor(Math.random() * 30000)

    return {
      title: jobTitles[i] || `${random(['Senior', 'Junior', 'Lead'])} ${random(['Engineer', 'Developer', 'Specialist'])}`,
      slug: `job-${i + 1}-${jobTitles[i]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'position'}`,
      status: isActive ? 'active' : 'archived',
      tags: Array.from(new Set([random(tagsPool), random(tagsPool), random(tagsPool)])).slice(0, 2),
      description: `We are seeking a talented ${experienceLevel} professional to join our ${random(['dynamic', 'innovative', 'growing', 'collaborative'])} team. This role involves working with modern technologies and collaborating with cross-functional teams. You'll be responsible for ${random(['developing scalable solutions', 'leading technical initiatives', 'mentoring team members', 'driving product innovation'])} and contributing to our mission of ${random(['transforming digital experiences', 'building the future of technology', 'creating impactful solutions', 'revolutionizing the industry'])}.`,
      location: random(['Remote', 'New York', 'San Francisco', 'Austin', 'Seattle', 'Boston', 'Chicago']),
      department: random(['Engineering', 'Product', 'Design', 'Data', 'Security', 'Infrastructure']),
      experienceLevel: experienceLevel,
      experienceYears: {
        'Junior': '1-3 years',
        'Mid-level': '3-5 years', 
        'Senior': '5-8 years',
        'Lead': '8-12 years',
        'Principal': '12+ years'
      }[experienceLevel],
      salaryMin: actualMinSalary,
      salaryMax: actualMaxSalary,
      salaryType: random(['yearly', 'yearly', 'yearly', 'hourly']), // 75% yearly, 25% hourly
      benefits: random([
        ['Health Insurance', 'Dental', '401k', 'PTO'],
        ['Health Insurance', 'Vision', 'Stock Options', 'Flexible Hours'],
        ['Medical', 'Dental', 'Vision', '401k Match', 'Remote Work'],
        ['Health Coverage', 'Life Insurance', 'Stock Options', 'Learning Budget'],
        ['Full Benefits', 'Equity', 'Unlimited PTO', 'Home Office Stipend']
      ]),
      requirements: [
        `${random(['Bachelor\'s', 'Master\'s'])} degree in ${random(['Computer Science', 'Engineering', 'related field'])} or equivalent experience`,
        `${random(['Strong', 'Excellent', 'Proven'])} experience with ${random(['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS'])}`,
        `${random(['Experience', 'Proficiency'])} in ${random(['agile methodologies', 'CI/CD', 'microservices', 'cloud platforms'])}`,
        `${random(['Strong', 'Excellent'])} ${random(['communication', 'problem-solving', 'analytical'])} skills`,
        `Ability to work ${random(['independently', 'in a team environment', 'in a fast-paced environment'])}`
      ],
      responsibilities: [
        `${random(['Design', 'Develop', 'Build'])} and ${random(['maintain', 'optimize', 'enhance'])} ${random(['scalable applications', 'robust systems', 'user interfaces'])}`,
        `${random(['Collaborate', 'Work closely'])} with ${random(['cross-functional teams', 'product managers', 'designers', 'stakeholders'])}`,
        `${random(['Participate in', 'Lead', 'Contribute to'])} ${random(['code reviews', 'technical discussions', 'architecture decisions'])}`,
        `${random(['Mentor', 'Guide', 'Support'])} ${random(['junior developers', 'team members', 'new hires'])}`,
        `${random(['Stay current', 'Keep up-to-date'])} with ${random(['industry trends', 'best practices', 'emerging technologies'])}`
      ],
      workType: random(['Full-time', 'Full-time', 'Full-time', 'Contract', 'Part-time']), // 60% full-time
      autoArchiveDate: hasAutoArchive ? new Date(Date.now() + autoArchiveHours * 60 * 60 * 1000).toISOString() : null,
      autoArchiveHours: autoArchiveHours,
      order: i,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  await db.jobs.bulkAdd(jobs)

  // Create exactly 1000 candidates randomly assigned to jobs and stages
  const candidates = Array.from({ length: 1000 }).map((_, i) => ({
    name: `${random(['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Chris', 'Anna'])} ${random(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'])}`,
    email: `candidate${i + 1}@${random(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'tech.io'])}`,
    phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    stage: random(stages),
    jobId: Math.floor(Math.random() * 25) + 1, // Randomly assign to one of 25 jobs
    experience: Math.floor(Math.random() * 15) + 1, // 1-15 years experience
    skills: Array.from(new Set([random(tagsPool), random(tagsPool), random(tagsPool)])),
    appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Applied within last 60 days
    notes: Math.random() < 0.3 ? `${random(['Strong', 'Good', 'Excellent', 'Outstanding'])} candidate with ${random(['great', 'solid', 'impressive'])} background.` : ''
  }))

  await db.candidates.bulkAdd(candidates)

  // Create sample applications linking candidates to jobs
  const applications = []
  for (let i = 0; i < 200; i++) {
    const candidateId = Math.floor(Math.random() * 1000) + 1
    const jobId = Math.floor(Math.random() * 25) + 1
    
    // Avoid duplicate applications
    const existingApp = applications.find(app => app.candidateId === candidateId && app.jobId === jobId)
    if (!existingApp) {
      applications.push({
        candidateId,
        jobId,
        status: random(['applied', 'reviewing', 'interview', 'rejected', 'hired']),
        appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  await db.applications.bulkAdd(applications)

  // Create exactly 5 assessments with real questions
  const assessments = [
    {
      jobId: 1,
      title: 'Frontend Developer Assessment',
      description: `Practical questions to evaluate modern web fundamentals, React, and performance/accessibility.`,
      timeLimit: 60,
      sections: [
        {
          id: 1,
          title: 'HTML/CSS Fundamentals',
          description: 'Core web semantics and layout best practices',
          questions: [
            { id: 1, type: 'single', label: 'Which HTML element is best for marking up a page’s primary navigation?', required: true, options: ['<nav>', '<menu>', '<section>', '<aside>'] },
            { id: 2, type: 'short', label: 'Explain the difference between display: none and visibility: hidden.', required: true },
            { id: 3, type: 'single', label: 'Which layout technique enables two-dimensional control (rows and columns)?', required: true, options: ['Flexbox', 'Grid', 'Floats', 'Inline-block'] },
            { id: 4, type: 'short', label: 'What problem do CSS custom properties solve compared to preprocessor variables?', required: true },
            { id: 5, type: 'single', label: 'Which attribute improves image loading performance for below-the-fold content?', required: true, options: ['decoding="sync"', 'loading="lazy"', 'fetchpriority="high"', 'draggable="true"'] },
            { id: 6, type: 'short', label: 'Describe an accessible way to hide content visually but keep it available to screen readers.', required: false },
            { id: 7, type: 'single', label: 'Which unit scales with the root font-size?', required: true, options: ['em', 'rem', 'px', 'vh'] },
            { id: 8, type: 'short', label: 'When would you use <figure> and <figcaption>?', required: false }
          ]
        },
        {
          id: 2,
          title: 'React & State Management',
          description: 'Component patterns, hooks, and rendering behavior',
          questions: [
            { id: 1, type: 'short', label: 'Explain the difference between useMemo and useCallback with examples.', required: true },
            { id: 2, type: 'single', label: 'Which hook is best for subscribing to external stores in React 18?', required: true, options: ['useEffect', 'useLayoutEffect', 'useSyncExternalStore', 'useReducer'] },
            { id: 3, type: 'short', label: 'Describe how React keys impact reconciliation and list reordering.', required: true },
            { id: 4, type: 'short', label: 'When would you choose context over prop drilling? Mention trade-offs.', required: true },
            { id: 5, type: 'short', label: 'How do you avoid unnecessary re-renders in large lists?', required: false }
          ]
        },
        {
          id: 3,
          title: 'Performance & Accessibility',
          description: 'Web vitals and inclusive UX',
          questions: [
            { id: 1, type: 'short', label: 'Name three ways to reduce JavaScript bundle size in a React app.', required: true },
            { id: 2, type: 'short', label: 'Explain the purpose of aria-live regions and when to use them.', required: true },
            { id: 3, type: 'short', label: 'How do you measure and improve LCP on a SPA?', required: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      jobId: 2,
      title: 'Backend (Node.js) Assessment',
      description: 'APIs, data modeling, scalability, and reliability.',
      timeLimit: 75,
      sections: [
        {
          id: 1,
          title: 'API Design',
          description: 'REST, resources, and versioning',
          questions: [
            { id: 1, type: 'short', label: 'When would you choose PUT vs PATCH? Provide examples.', required: true },
            { id: 2, type: 'single', label: 'Which status code best represents a rate limit exceeded?', required: true, options: ['400', '401', '403', '429'] },
            { id: 3, type: 'short', label: 'Describe idempotency and why it matters for APIs.', required: true }
          ]
        },
        {
          id: 2,
          title: 'Data & Reliability',
          description: 'Transactions, caching, and queues',
          questions: [
            { id: 1, type: 'short', label: 'Explain eventual consistency and an example where it’s acceptable.', required: true },
            { id: 2, type: 'short', label: 'Compare Redis caching strategies: write-through vs write-back.', required: false },
            { id: 3, type: 'short', label: 'When would you use a message queue? Mention retry and DLQ patterns.', required: true }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      jobId: 3,
      title: 'Data Science Assessment',
      description: 'Modeling, evaluation, and data pipelines.',
      timeLimit: 60,
      sections: [
        {
          id: 1,
          title: 'ML Fundamentals',
          description: 'Bias-variance and metrics',
          questions: [
            { id: 1, type: 'short', label: 'Explain bias-variance tradeoff and how to detect overfitting.', required: true },
            { id: 2, type: 'single', label: 'Which metric is suitable for imbalanced classification?', required: true, options: ['Accuracy', 'Precision', 'Recall', 'ROC AUC'] },
            { id: 3, type: 'short', label: 'When would you choose XGBoost over linear regression?', required: true }
          ]
        },
        {
          id: 2,
          title: 'Data Engineering',
          description: 'ETL/ELT and orchestration',
          questions: [
            { id: 1, type: 'short', label: 'Compare ETL vs ELT with a warehouse example.', required: true },
            { id: 2, type: 'short', label: 'List three partitioning strategies for large datasets.', required: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      jobId: 4,
      title: 'DevOps/SRE Assessment',
      description: 'CI/CD, observability, and reliability engineering.',
      timeLimit: 45,
      sections: [
        {
          id: 1,
          title: 'CI/CD & Infra',
          description: 'Pipelines and IaC',
          questions: [
            { id: 1, type: 'short', label: 'Blue/Green vs Rolling deployments—trade-offs?', required: true },
            { id: 2, type: 'short', label: 'What problems does IaC solve? Mention drift and reviewability.', required: true }
          ]
        },
        {
          id: 2,
          title: 'Observability',
          description: 'Logs, metrics, and traces',
          questions: [
            { id: 1, type: 'short', label: 'Define RED vs USE metrics; when to use each.', required: true },
            { id: 2, type: 'short', label: 'Alert fatigue: how to design actionable alerts?', required: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true
    },
    {
      jobId: 5,
      title: 'Product Manager Assessment',
      description: 'Discovery, prioritization, and stakeholder management.',
      timeLimit: 40,
      sections: [
        {
          id: 1,
          title: 'Discovery & Prioritization',
          description: 'Frameworks and trade-offs',
          questions: [
            { id: 1, type: 'short', label: 'Explain RICE scoring and when it can mislead prioritization.', required: true },
            { id: 2, type: 'short', label: 'Draft a problem statement for improving onboarding completion.', required: true }
          ]
        },
        {
          id: 2,
          title: 'Execution',
          description: 'Roadmaps and alignment',
          questions: [
            { id: 1, type: 'short', label: 'How do you handle conflicting stakeholder requests?', required: true },
            { id: 2, type: 'short', label: 'Define a success metric for a new search feature.', required: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ];

  await db.assessments.bulkAdd(assessments);

  console.log('✅ Seed data created:', {
    jobs: jobs.length,
    candidates: candidates.length,
    applications: applications.length,
    assessments: assessments.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    archivedJobs: jobs.filter(j => j.status === 'archived').length
  })
}

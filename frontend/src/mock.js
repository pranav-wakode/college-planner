// Mock data for College Timetable & Syllabus App
export const mockTimeSlots = [
  "9:00 - 10:00",
  "10:00 - 11:00", 
  "11:15 - 12:15",
  "12:15 - 1:15",
  "2:15 - 3:15",
  "3:15 - 4:15",
  "4:30 - 5:30"
];

export const mockDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const mockSubjects = [
  "Mathematics",
  "Physics", 
  "Chemistry",
  "Computer Science",
  "English Literature",
  "History",
  "Economics",
  "Biology"
];

export const mockTimetable = {
  "Monday": {
    "9:00 - 10:00": "Mathematics",
    "10:00 - 11:00": "Physics",
    "11:15 - 12:15": "Chemistry", 
    "12:15 - 1:15": "Lunch Break",
    "2:15 - 3:15": "Computer Science",
    "3:15 - 4:15": "English Literature",
    "4:30 - 5:30": "Free Period"
  },
  "Tuesday": {
    "9:00 - 10:00": "Physics",
    "10:00 - 11:00": "Mathematics",
    "11:15 - 12:15": "History",
    "12:15 - 1:15": "Lunch Break", 
    "2:15 - 3:15": "Economics",
    "3:15 - 4:15": "Biology",
    "4:30 - 5:30": "Computer Science"
  },
  "Wednesday": {
    "9:00 - 10:00": "Chemistry",
    "10:00 - 11:00": "English Literature",
    "11:15 - 12:15": "Mathematics",
    "12:15 - 1:15": "Lunch Break",
    "2:15 - 3:15": "Physics", 
    "3:15 - 4:15": "History",
    "4:30 - 5:30": "Free Period"
  },
  "Thursday": {
    "9:00 - 10:00": "Economics",
    "10:00 - 11:00": "Biology",
    "11:15 - 12:15": "Computer Science",
    "12:15 - 1:15": "Lunch Break",
    "2:15 - 3:15": "Mathematics",
    "3:15 - 4:15": "Chemistry",
    "4:30 - 5:30": "Physics"
  },
  "Friday": {
    "9:00 - 10:00": "English Literature", 
    "10:00 - 11:00": "History",
    "11:15 - 12:15": "Economics",
    "12:15 - 1:15": "Lunch Break",
    "2:15 - 3:15": "Biology",
    "3:15 - 4:15": "Mathematics",
    "4:30 - 5:30": "Computer Science"
  },
  "Saturday": {
    "9:00 - 10:00": "Mathematics",
    "10:00 - 11:00": "Physics",
    "11:15 - 12:15": "Chemistry",
    "12:15 - 1:15": "Lunch Break",
    "2:15 - 3:15": "Free Period",
    "3:15 - 4:15": "Free Period", 
    "4:30 - 5:30": "Free Period"
  }
};

export const mockSyllabus = {
  "Mathematics": [
    "Calculus - Limits, Derivatives, and Integrals",
    "Linear Algebra - Matrices, Vectors, Eigenvalues",
    "Statistics - Probability Distributions, Hypothesis Testing",
    "Discrete Mathematics - Graph Theory, Combinatorics",
    "Differential Equations - First and Second Order",
    "Number Theory - Prime Numbers, Modular Arithmetic"
  ],
  "Physics": [
    "Mechanics - Kinematics, Dynamics, Work and Energy",
    "Thermodynamics - Laws of Thermodynamics, Heat Engines", 
    "Electromagnetism - Electric Fields, Magnetic Fields, Maxwell's Equations",
    "Quantum Mechanics - Wave-Particle Duality, Schrödinger Equation",
    "Optics - Reflection, Refraction, Interference, Diffraction",
    "Modern Physics - Relativity, Atomic Structure, Nuclear Physics"
  ],
  "Chemistry": [
    "Organic Chemistry - Hydrocarbons, Functional Groups, Reactions",
    "Inorganic Chemistry - Periodic Table, Chemical Bonding, Coordination Compounds",
    "Physical Chemistry - Chemical Kinetics, Thermodynamics, Equilibrium",
    "Analytical Chemistry - Qualitative and Quantitative Analysis",
    "Biochemistry - Proteins, Carbohydrates, Lipids, Nucleic Acids",
    "Environmental Chemistry - Pollution, Green Chemistry"
  ],
  "Computer Science": [
    "Data Structures - Arrays, Linked Lists, Trees, Graphs",
    "Algorithms - Sorting, Searching, Dynamic Programming",
    "Programming Languages - Java, Python, C++, JavaScript",
    "Database Systems - SQL, NoSQL, Database Design",
    "Computer Networks - TCP/IP, HTTP, Network Security",
    "Software Engineering - SDLC, Design Patterns, Testing",
    "Operating Systems - Process Management, Memory Management"
  ],
  "English Literature": [
    "Shakespeare - Hamlet, Romeo and Juliet, Macbeth",
    "Victorian Literature - Charles Dickens, Charlotte Brontë",
    "Modern Poetry - T.S. Eliot, Robert Frost, Maya Angelou",
    "American Literature - Mark Twain, F. Scott Fitzgerald",
    "Literary Criticism - Formalism, Structuralism, Post-colonialism",
    "Creative Writing - Short Stories, Poetry, Essays"
  ],
  "History": [
    "Ancient Civilizations - Egypt, Greece, Rome, India, China",
    "Medieval History - Feudalism, Crusades, Islamic Golden Age",
    "Renaissance and Reformation - Humanism, Protestant Reformation",
    "Modern History - Industrial Revolution, World Wars",
    "Contemporary History - Cold War, Decolonization, Globalization",
    "Historical Methodology - Primary Sources, Historiography"
  ],
  "Economics": [
    "Microeconomics - Supply and Demand, Market Structures, Consumer Theory",
    "Macroeconomics - GDP, Inflation, Unemployment, Fiscal Policy",
    "International Economics - International Trade, Exchange Rates",
    "Development Economics - Economic Growth, Poverty, Inequality",
    "Financial Economics - Banking, Stock Markets, Investment",
    "Economic History - Great Depression, Economic Theories"
  ],
  "Biology": [
    "Cell Biology - Cell Structure, Cell Division, Cellular Respiration",
    "Genetics - DNA, RNA, Inheritance, Genetic Engineering",
    "Evolution - Natural Selection, Speciation, Phylogeny",
    "Ecology - Ecosystems, Food Webs, Conservation Biology",
    "Human Biology - Anatomy, Physiology, Disease",
    "Molecular Biology - Protein Synthesis, Gene Expression",
    "Biotechnology - Cloning, GMOs, Bioinformatics"
  ]
};

// Helper functions for local storage management
export const saveTimetableToStorage = (timetable) => {
  localStorage.setItem('collegeTimetable', JSON.stringify(timetable));
};

export const loadTimetableFromStorage = () => {
  const stored = localStorage.getItem('collegeTimetable');
  return stored ? JSON.parse(stored) : mockTimetable;
};

export const saveSyllabusToStorage = (syllabus) => {
  localStorage.setItem('collegeSyllabus', JSON.stringify(syllabus));
};

export const loadSyllabusFromStorage = () => {
  const stored = localStorage.getItem('collegeSyllabus');
  return stored ? JSON.parse(stored) : mockSyllabus;
};
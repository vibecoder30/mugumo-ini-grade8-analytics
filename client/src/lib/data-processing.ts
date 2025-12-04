import Papa from 'papaparse';

export interface Student {
  StudentID: string;
  Name: string;
  Gender: 'M' | 'F';
  Stream: string;
  English: number;
  Kiswahili: number;
  Mathematics: number;
  IntegratedScience: number;
  SocialStudies: number;
  ReligiousEducation: number;
  CreativeArtsAndSports: number;
  PreTechnicalStudies: number;
  AgricultureAndNutrition: number;
  [key: string]: string | number;
}

export const SUBJECTS = [
  'English',
  'Kiswahili',
  'Mathematics',
  'IntegratedScience',
  'SocialStudies',
  'ReligiousEducation',
  'CreativeArtsAndSports',
  'PreTechnicalStudies',
  'AgricultureAndNutrition'
];

export interface SubjectStats {
  name: string;
  mean: number;
  passRate: number;
  min: number;
  max: number;
  gradeDistribution: { [key: string]: number };
}

export interface ProcessedStudent extends Student {
  Average: number;
  TotalMarks: number;
  TotalPoints: number;
  FailedSubjects: number;
  OverallGrade: string;
  Position: number;
}

export interface AnalyticsResult {
  totalStudents: number;
  genderDistribution: { M: number; F: number };
  streamStats: { [stream: string]: { count: number; mean: number } };
  subjectStats: SubjectStats[];
  top10: ProcessedStudent[];
  bottom10: ProcessedStudent[];
  studentsFailing2Plus: ProcessedStudent[];
  overallMean: number;
  processedData: ProcessedStudent[];
}

const PASS_MARK = 41; // ME2 (41-57) is the lowest "Meeting Expectation"

// KJSEA Grading System
// EE1 (AL 8): 90–100% = 8 points
// EE2 (AL 7): 75–89% = 7 points
// ME1 (AL 6): 58–74% = 6 points
// ME2 (AL 5): 41–57% = 5 points
// AE1 (AL 4): 31–40% = 4 points
// AE2 (AL 3): 21–30% = 3 points
// BE1 (AL 2): 11–20% = 2 points
// BE2 (AL 1): 1–10% = 1 point

export function getGrade(score: number): string {
  if (score >= 90) return 'EE1';
  if (score >= 75) return 'EE2';
  if (score >= 58) return 'ME1';
  if (score >= 41) return 'ME2';
  if (score >= 31) return 'AE1';
  if (score >= 21) return 'AE2';
  if (score >= 11) return 'BE1';
  return 'BE2';
}

export function getPoints(score: number): number {
  if (score >= 90) return 8;
  if (score >= 75) return 7;
  if (score >= 58) return 6;
  if (score >= 41) return 5;
  if (score >= 31) return 4;
  if (score >= 21) return 3;
  if (score >= 11) return 2;
  return 1;
}

export function getRemarks(grade: string): string {
  switch (grade) {
    case 'EE1': return 'Exceptional';
    case 'EE2': return 'Very Good';
    case 'ME1': return 'Good';
    case 'ME2': return 'Fair';
    case 'AE1': return 'Needs Improvement';
    case 'AE2': return 'Below Average';
    case 'BE1': return 'Well Below Average';
    case 'BE2': return 'Minimal';
    default: return '';
  }
}

// Helper to infer gender from name (simple heuristic for mock data, not perfect)
function guessGender(name: string): 'M' | 'F' {
  const first = name.split(' ')[0].toLowerCase();
  const femaleNames = ['agnes', 'angela', 'beatrice', 'blessed', 'cindy', 'elizabeth', 'esther', 'hope', 'joan', 'mary', 'michelle', 'melody', 'miriam', 'noel', 'oliva', 'precious', 'princess', 'sarah', 'shalon', 'shantel', 'subrina', 'zuleikha', 'wairimu', 'wangui', 'njeri', 'nyambura', 'njoki', 'muthoni', 'wangari', 'ndunge', 'waithiegeni'];
  return femaleNames.includes(first) ? 'F' : 'M';
}

export function generateMockData(): Student[] {
  const classList = [
    "Adrian Nga’nga", "Agnes Wangui", "Alex Mwaura", "Angela Njeri", "Beatrice Nyambura", 
    "Blessed Njoki", "Brassel Irungu", "Brian Muiruri", "Brendon Oteyo", "Cindy Njoki", 
    "Daniel Kiarie", "David Ndegwa", "Dennis Kimeu", "Edwin Karanja", "Elizabeth Muthoni", 
    "Emmanuel Bongera", "Emmanuel Karita", "Esther Nyambura", "Hope Nasimiyu", "Humphrey Njuguna", 
    "Israel Jomo", "Jeff Mwangi", "Joan Nyambura", "Josphat Kariuki", "Julius Ikui", 
    "Kelvin Mwangi", "Kelvin Ombongi", "Lewis Miring’u", "Lincon Okello", "Martin Ngarari", 
    "Mary Wangui", "Michelle Wanjiku", "Melody Njoki", "Miriam Sarange", "Noel Vivian", 
    "Oliva Nkatha", "Peter Ndungu", "Precious Njeri", "Precious Wanjiku", "Princess Wanjiru", 
    "Ramadhan Ismael", "Ronny Ndungu", "Ryan Junior", "Ryan Kariuki", "Ryan Ngunjiri", 
    "Sarah Wangari", "Shalon Ndunge", "Shantel Wairimu", "Subrina Waithiegeni", "Samuel Makau", 
    "Yakub Huka", "Zuleikha Adan"
  ];

  const students: Student[] = classList.map((name, index) => {
    const student: any = {
      StudentID: `MUGUMO-${2026001 + index}`,
      Name: name,
      Gender: guessGender(name),
      Stream: '8 Suswa', 
    };

    // Generate scores with aptitude logic
    const aptitude = Math.random() * 40 + 40; // Base aptitude 40-80
    
    SUBJECTS.forEach(sub => {
      let score = Math.floor(aptitude + (Math.random() * 30 - 15));
      score = Math.max(0, Math.min(100, score));
      student[sub] = score;
    });

    return student as Student;
  });
  
  return students;
}

export function processData(data: Student[]): AnalyticsResult {
  // 1. Calculate averages and totals
  let processed: ProcessedStudent[] = data.map(s => {
    let total = 0;
    let totalPoints = 0;
    let failedCount = 0;
    SUBJECTS.forEach(sub => {
      const score = Number(s[sub]);
      total += score;
      totalPoints += getPoints(score);
      if (score < PASS_MARK) failedCount++;
    });
    const avg = parseFloat((total / SUBJECTS.length).toFixed(2));
    return {
      ...s,
      Average: avg,
      TotalMarks: total,
      TotalPoints: totalPoints,
      FailedSubjects: failedCount,
      OverallGrade: getGrade(avg),
      Position: 0 // Placeholder
    };
  });

  // 2. Sort by Average Descending
  processed.sort((a, b) => b.Average - a.Average);

  // 3. Assign Positions
  processed = processed.map((student, index) => ({
    ...student,
    Position: index + 1
  }));

  const totalStudents = processed.length;
  const genderStats = { M: 0, F: 0 };
  const streamStats: { [key: string]: { count: number; totalAvg: number; mean: number } } = {};

  processed.forEach(s => {
    genderStats[s.Gender]++;
    
    if (!streamStats[s.Stream]) streamStats[s.Stream] = { count: 0, totalAvg: 0, mean: 0 };
    streamStats[s.Stream].count++;
    streamStats[s.Stream].totalAvg += s.Average;
  });

  Object.keys(streamStats).forEach(k => {
    streamStats[k].mean = parseFloat((streamStats[k].totalAvg / streamStats[k].count).toFixed(2));
  });

  const subjectStats = SUBJECTS.map(sub => {
    const scores = processed.map(s => Number(s[sub]));
    const total = scores.reduce((a, b) => a + b, 0);
    const passed = scores.filter(s => s >= PASS_MARK).length;
    
    const grades: { [key: string]: number } = { 
      EE1: 0, EE2: 0, ME1: 0, ME2: 0, 
      AE1: 0, AE2: 0, BE1: 0, BE2: 0 
    };
    scores.forEach(s => grades[getGrade(s)]++);

    return {
      name: sub,
      mean: parseFloat((total / totalStudents).toFixed(2)),
      passRate: parseFloat(((passed / totalStudents) * 100).toFixed(1)),
      min: Math.min(...scores),
      max: Math.max(...scores),
      gradeDistribution: grades
    };
  });

  // Sort subject stats by mean descending (Top to Bottom Analysis)
  subjectStats.sort((a, b) => b.mean - a.mean);

  return {
    totalStudents,
    genderDistribution: genderStats,
    streamStats: Object.fromEntries(Object.entries(streamStats).map(([k, v]) => [k, { count: v.count, mean: v.mean }])),
    subjectStats,
    top10: processed.slice(0, 10),
    bottom10: processed.slice(-10),
    studentsFailing2Plus: processed.filter(s => s.FailedSubjects >= 2),
    overallMean: parseFloat((processed.reduce((a, b) => a + b.Average, 0) / totalStudents).toFixed(2)),
    processedData: processed
  };
}

export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

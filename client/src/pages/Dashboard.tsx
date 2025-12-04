import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { generateMockData, processData, AnalyticsResult, Student, exportToCSV, SUBJECTS, ProcessedStudent, getGrade, getRemarks, SubjectStats } from '@/lib/data-processing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Users, BookOpen, AlertTriangle, TrendingUp, 
  FileSpreadsheet, Copy, RefreshCw, Lightbulb, ArrowRight, Printer, FileText
} from 'lucide-react';
import logo from '@assets/generated_images/modern_academic_crest_logo.png';
import { useReactToPrint } from 'react-to-print';

// Single Page Report Card
const ReportCard = ({ student, refCallback }: { student: ProcessedStudent, refCallback: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div ref={refCallback} className="bg-white text-slate-900 w-[210mm] h-[297mm] mx-auto print:w-full print:h-full p-8 print:p-6 text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-2 mb-4">
        <div className="flex justify-center mb-1">
           <img src={logo} alt="School Logo" className="h-12 w-12" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider">MUGUMO-INI JUNIOR SECONDARY SCHOOL</h1>
        <h2 className="text-base font-semibold mt-0.5">Grade 8 Suswa - Term 1 2026</h2>
        <p className="text-xs text-slate-600">Official Student Report Card</p>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div>
          <p className="text-xs text-slate-500">Student Name</p>
          <p className="font-bold text-base">{student.Name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">ADM No.</p>
          <p className="font-bold">{student.StudentID}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Stream</p>
          <p className="font-semibold">{student.Stream}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Position</p>
          <p className="font-bold text-lg text-blue-700">#{student.Position} <span className="text-xs text-slate-400 font-normal">/ 52</span></p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-100 p-2 rounded text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Total Marks</p>
          <p className="text-lg font-bold">{student.TotalMarks}</p>
        </div>
        <div className="bg-slate-100 p-2 rounded text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Mean Score</p>
          <p className="text-lg font-bold">{student.Average}</p>
        </div>
        <div className="bg-slate-100 p-2 rounded text-center">
           <p className="text-[10px] uppercase tracking-wide text-slate-500">Overall Grade</p>
           <p className="text-lg font-bold text-blue-600">{student.OverallGrade}</p>
        </div>
      </div>

      {/* Subject Table */}
      <table className="w-full mb-4 border-collapse text-xs">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-2 text-left w-1/4">Subject</th>
            <th className="p-2 text-center w-1/12">Score</th>
            <th className="p-2 text-center w-1/12">Grade</th>
            <th className="p-2 text-left w-1/4">Remarks</th>
            <th className="p-2 text-left w-1/4">Subject Teacher</th>
          </tr>
        </thead>
        <tbody>
          {SUBJECTS.map((sub, idx) => {
            const score = Number(student[sub]);
            const grade = getGrade(score);
            return (
              <tr key={sub} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="p-2 font-medium">{sub}</td>
                <td className="p-2 text-center font-bold">{score}</td>
                <td className="p-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    grade.startsWith('EE') ? 'bg-green-100 text-green-800' :
                    grade.startsWith('ME') ? 'bg-blue-100 text-blue-800' :
                    grade.startsWith('AE') ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {grade}
                  </span>
                </td>
                <td className="p-2 italic text-slate-600">{getRemarks(grade)}</td>
                <td className="p-2 border-b border-slate-100">
                   <div className="border-b border-slate-300 border-dotted w-full h-4"></div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Grading Key */}
      <div className="mb-4 p-2 bg-slate-50 rounded border border-slate-100">
        <p className="text-[10px] font-bold mb-1 uppercase text-slate-500">Grading Key (KJSEA)</p>
        <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[9px]">
          <div>EE1 (90-100): Exceptional</div>
          <div>EE2 (75-89): Very Good</div>
          <div>ME1 (58-74): Good</div>
          <div>ME2 (41-57): Fair</div>
          <div>AE1 (31-40): Needs Imp.</div>
          <div>AE2 (21-30): Below Avg</div>
          <div>BE1 (11-20): Well Below</div>
          <div>BE2 (0-10): Minimal</div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-auto pt-2">
         <div className="mb-4">
            <p className="font-bold text-xs uppercase text-slate-500 mb-1">Class Teacher's Remarks</p>
            <div className="border-b border-slate-400 border-dashed h-6 mb-2"></div>
            <div className="border-b border-slate-400 border-dashed h-6"></div>
         </div>

         <div className="flex justify-between items-end mt-6">
            <div className="text-center">
              <div className="mb-1 font-script text-lg text-slate-600">Madam Kinyua</div>
              <div className="border-t border-slate-800 w-40 pt-1">
                <p className="font-bold text-xs uppercase">Class Teacher</p>
              </div>
            </div>
             <div className="text-center">
               <div className="text-[10px] text-slate-400 mb-2">Official Stamp</div>
              <div className="border-2 border-slate-300 rounded-full w-20 h-20 flex items-center justify-center text-slate-300 text-[10px] uppercase font-bold tracking-widest rotate-[-12deg]">
                School Stamp
              </div>
            </div>
         </div>
      </div>
      
      <div className="mt-4 text-center text-[9px] text-slate-400">
        MUGUMO-INI JUNIOR SECONDARY SCHOOL • Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

// Printable Subject Analysis
const SubjectAnalysisPrint = ({ subjectStats, refCallback }: { subjectStats: SubjectStats[], refCallback: React.RefObject<HTMLDivElement | null> }) => {
  return (
     <div ref={refCallback} className="bg-white text-slate-900 w-[210mm] mx-auto p-8 print:p-6 text-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase">MUGUMO-INI JUNIOR SECONDARY SCHOOL</h1>
          <h2 className="text-base font-semibold">Subject Analysis Report - Grade 8 Suswa</h2>
        </div>
        
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-2 text-left border border-slate-600">Subject</th>
              <th className="p-2 text-center border border-slate-600">Mean</th>
              <th className="p-2 text-center border border-slate-600 bg-green-900">EE1</th>
              <th className="p-2 text-center border border-slate-600 bg-green-800">EE2</th>
              <th className="p-2 text-center border border-slate-600 bg-blue-900">ME1</th>
              <th className="p-2 text-center border border-slate-600 bg-blue-800">ME2</th>
              <th className="p-2 text-center border border-slate-600 bg-amber-700">AE1</th>
              <th className="p-2 text-center border border-slate-600 bg-amber-600">AE2</th>
              <th className="p-2 text-center border border-slate-600 bg-red-900">BE1</th>
              <th className="p-2 text-center border border-slate-600 bg-red-800">BE2</th>
            </tr>
          </thead>
          <tbody>
             {subjectStats.map((sub, idx) => (
                <tr key={sub.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-bold">{sub.name}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.mean}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.EE1}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.EE2}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.ME1}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.ME2}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.AE1}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.AE2}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.BE1}</td>
                  <td className="p-2 border border-slate-300 text-center">{sub.gradeDistribution.BE2}</td>
                </tr>
             ))}
          </tbody>
        </table>
     </div>
  );
}

// Printable Remediation List
const RemediationListPrint = ({ students, refCallback }: { students: ProcessedStudent[], refCallback: React.RefObject<HTMLDivElement | null> }) => {
  return (
     <div ref={refCallback} className="bg-white text-slate-900 w-[210mm] mx-auto p-8 print:p-6 text-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase">MUGUMO-INI JUNIOR SECONDARY SCHOOL</h1>
          <h2 className="text-base font-semibold">Remediation List - Grade 8 Suswa</h2>
          <p className="text-xs">Students failing 2 or more subjects (Score &lt; 41%)</p>
        </div>

        <table className="w-full border-collapse text-xs">
           <thead>
             <tr className="bg-slate-800 text-white">
               <th className="p-2 text-left border border-slate-600">Pos</th>
               <th className="p-2 text-left border border-slate-600">Student Name</th>
               <th className="p-2 text-center border border-slate-600">Failed Count</th>
               <th className="p-2 text-left border border-slate-600">Subjects of Concern</th>
             </tr>
           </thead>
           <tbody>
              {students.map((s, idx) => (
                <tr key={s.StudentID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                   <td className="p-2 border border-slate-300 text-center">{s.Position}</td>
                   <td className="p-2 border border-slate-300 font-bold">{s.Name}</td>
                   <td className="p-2 border border-slate-300 text-center font-bold text-red-600">{s.FailedSubjects}</td>
                   <td className="p-2 border border-slate-300">
                      {SUBJECTS.filter(sub => Number(s[sub]) < 41).map(sub => (
                        <span key={sub} className="inline-block bg-red-50 text-red-800 px-1 py-0.5 rounded mr-1 mb-1 text-[10px] border border-red-100">
                          {sub}: {s[sub]}
                        </span>
                      ))}
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  );
}


export default function Dashboard() {
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<ProcessedStudent | null>(null);

  // Print Refs
  const reportCardRef = useRef<HTMLDivElement>(null);
  const subjectAnalysisRef = useRef<HTMLDivElement>(null);
  const remediationRef = useRef<HTMLDivElement>(null);

  // Print Handlers
  const handlePrintReportCard = useReactToPrint({
    contentRef: reportCardRef,
    documentTitle: selectedStudent ? `${selectedStudent.Name}_ReportCard` : 'ReportCard',
  });

  const handlePrintSubjectAnalysis = useReactToPrint({
    contentRef: subjectAnalysisRef,
    documentTitle: 'Subject_Analysis_Report',
  });

  const handlePrintRemediation = useReactToPrint({
    contentRef: remediationRef,
    documentTitle: 'Remediation_List',
  });

  useEffect(() => {
    // Load mock data initially
    const mock = generateMockData();
    setData(processData(mock));
    setLoading(false);
  }, []);

  const handleDataLoaded = (raw: Student[]) => {
    setData(processData(raw));
  };

  if (loading || !data) return <div className="flex items-center justify-center h-screen">Loading Analytics...</div>;

  const worstSubject = [...data.subjectStats].sort((a, b) => a.mean - b.mean)[0];
  const bestSubject = [...data.subjectStats].sort((a, b) => b.mean - a.mean)[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded-md" />
            <div>
               <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                MUGUMO-INI JUNIOR SEC.
               </h1>
               <p className="text-xs text-slate-500">Grade 8 Analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => setData(processData(generateMockData()))}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(data.processedData, 'grade8_suswa_summary.csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export Summary
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Upload Section */}
        {!data && <FileUpload onDataLoaded={handleDataLoaded} />}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                <h3 className="text-3xl font-bold mt-1">{data.totalStudents}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Mean</p>
                <h3 className="text-3xl font-bold mt-1">{data.overallMean}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Subjects Tracked</p>
                <h3 className="text-3xl font-bold mt-1">{data.subjectStats.length}</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                <BookOpen className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Needs Support</p>
                <h3 className="text-3xl font-bold mt-1 text-red-600">{data.studentsFailing2Plus.length}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg w-full md:w-auto justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
            <TabsTrigger value="students">Student List</TabsTrigger>
            <TabsTrigger value="remediation" className="text-red-600 data-[state=active]:text-red-700">Remediation</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Insights Banner */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full text-amber-700 dark:text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-400">School Recommendations</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-500 mt-1 max-w-2xl">
                    Performance in <strong>{worstSubject?.name}</strong> is lagging ({worstSubject?.mean}% mean). 
                    Consider dedicating extra periods or remedial sessions. 
                    <strong>{bestSubject?.name}</strong> is the strongest subject ({bestSubject?.mean}% mean).
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0">
                View Detailed Report <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Performance Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Subject Performance (Mean Score)</CardTitle>
                  <CardDescription>Average score per subject - Sorted by Performance</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectStats} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="mean" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

               {/* Pass Rate Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Pass Rates by Subject</CardTitle>
                  <CardDescription>Students scoring AE (40%) or higher</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickFormatter={(val) => val.substring(0, 3)} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: data.genderDistribution.M },
                          { name: 'Female', value: data.genderDistribution.F }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ec4899" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                   </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stream Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Comparison</CardTitle>
                  <CardDescription>Showing all active streams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.streamStats).map(([stream, stats]) => (
                      <div key={stream} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-8 bg-slate-200 rounded-full overflow-hidden">
                             <div className="bg-indigo-500 w-full" style={{ height: `${stats.mean}%` }}></div>
                          </div>
                          <span className="font-medium">{stream}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{stats.mean}</div>
                          <div className="text-xs text-slate-500">Mean Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects" className="space-y-6">
             <div className="flex justify-end mb-2">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline">
                            <Printer className="w-4 h-4 mr-2" /> Print Analysis
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[220mm] max-h-[90vh] overflow-y-auto p-0 gap-0">
                        <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 flex justify-between items-center">
                            <DialogTitle className="text-white flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Print Preview
                            </DialogTitle>
                            <Button onClick={handlePrintSubjectAnalysis} variant="secondary" size="sm">
                                Print Now
                            </Button>
                        </div>
                        <div className="bg-slate-200 p-8 flex justify-center">
                            <SubjectAnalysisPrint subjectStats={data.subjectStats} refCallback={subjectAnalysisRef} />
                        </div>
                    </DialogContent>
                </Dialog>
             </div>

             <Card>
               <CardHeader>
                 <CardTitle>Detailed Subject Statistics (Top to Bottom)</CardTitle>
                 <CardDescription>Sorted by Mean Score (Highest to Lowest)</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                        <tr>
                          <th className="p-4 font-medium text-slate-500">Rank</th>
                          <th className="p-4 font-medium text-slate-500">Subject</th>
                          <th className="p-4 font-medium text-slate-500">Mean</th>
                          <th className="p-4 font-medium text-slate-500">EE1</th>
                          <th className="p-4 font-medium text-slate-500">EE2</th>
                          <th className="p-4 font-medium text-slate-500">ME1</th>
                          <th className="p-4 font-medium text-slate-500">ME2</th>
                          <th className="p-4 font-medium text-slate-500">AE1</th>
                          <th className="p-4 font-medium text-slate-500">AE2</th>
                          <th className="p-4 font-medium text-slate-500">BE1</th>
                          <th className="p-4 font-medium text-slate-500">BE2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.subjectStats.map((sub, index) => (
                          <tr key={sub.name} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-400">#{index + 1}</td>
                            <td className="p-4 font-medium">{sub.name}</td>
                            <td className="p-4 font-bold">{sub.mean}</td>
                            <td className="p-4 text-green-600 font-medium bg-green-50/50">{sub.gradeDistribution.EE1}</td>
                            <td className="p-4 text-green-500 font-medium">{sub.gradeDistribution.EE2}</td>
                            <td className="p-4 text-blue-600 bg-blue-50/50">{sub.gradeDistribution.ME1}</td>
                            <td className="p-4 text-blue-500">{sub.gradeDistribution.ME2}</td>
                            <td className="p-4 text-amber-600 bg-amber-50/50">{sub.gradeDistribution.AE1}</td>
                            <td className="p-4 text-amber-500">{sub.gradeDistribution.AE2}</td>
                            <td className="p-4 text-red-600 bg-red-50/50">{sub.gradeDistribution.BE1}</td>
                            <td className="p-4 text-red-500">{sub.gradeDistribution.BE2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          {/* STUDENTS TAB */}
          <TabsContent value="students" className="space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle>Student Performance List</CardTitle>
                 <CardDescription>Sorted by position</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                        <tr>
                          <th className="p-4 w-16 font-medium text-slate-500">Pos</th>
                          <th className="p-4 font-medium text-slate-500">Name</th>
                          <th className="p-4 font-medium text-slate-500">Total</th>
                          <th className="p-4 font-medium text-slate-500">Mean</th>
                          <th className="p-4 font-medium text-slate-500">Grade</th>
                          <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.processedData.map((s) => (
                          <tr key={s.StudentID} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                s.Position <= 3 ? 'bg-yellow-100 text-yellow-700' : 
                                s.Position <= 10 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {s.Position}
                              </div>
                            </td>
                            <td className="p-4 font-medium">
                              {s.Name}
                              <span className="block text-xs text-slate-400 font-normal">{s.StudentID}</span>
                            </td>
                            <td className="p-4 text-slate-600">{s.TotalMarks}</td>
                            <td className="p-4 font-bold">{s.Average}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={
                                s.OverallGrade.startsWith('EE') ? 'border-green-500 text-green-600 bg-green-50' : 
                                s.OverallGrade.startsWith('ME') ? 'border-blue-500 text-blue-600 bg-blue-50' :
                                s.OverallGrade.startsWith('AE') ? 'border-amber-500 text-amber-600 bg-amber-50' :
                                'border-red-500 text-red-600 bg-red-50'
                              }>
                                {s.OverallGrade}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(s)}>
                                    <FileText className="w-4 h-4 mr-2" /> Report
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[220mm] max-h-[90vh] overflow-y-auto p-0 gap-0">
                                    <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 flex justify-between items-center">
                                      <DialogTitle className="text-white flex items-center gap-2">
                                        <Printer className="w-4 h-4" /> Print Preview
                                      </DialogTitle>
                                      <Button onClick={handlePrintReportCard} variant="secondary" size="sm">
                                        Print Report Card
                                      </Button>
                                    </div>
                                    <div className="bg-slate-200 p-8 flex justify-center">
                                        {selectedStudent && <ReportCard student={selectedStudent} refCallback={reportCardRef} />}
                                    </div>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

          {/* REMEDIATION TAB */}
          <TabsContent value="remediation" className="space-y-6">
             <div className="flex justify-end mb-2">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline">
                            <Printer className="w-4 h-4 mr-2" /> Print Remediation List
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[220mm] max-h-[90vh] overflow-y-auto p-0 gap-0">
                        <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 flex justify-between items-center">
                            <DialogTitle className="text-white flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Print Preview
                            </DialogTitle>
                            <Button onClick={handlePrintRemediation} variant="secondary" size="sm">
                                Print List
                            </Button>
                        </div>
                        <div className="bg-slate-200 p-8 flex justify-center">
                            <RemediationListPrint students={data.studentsFailing2Plus} refCallback={remediationRef} />
                        </div>
                    </DialogContent>
                </Dialog>
             </div>

             <Card>
               <CardHeader>
                 <CardTitle>Remediation Required</CardTitle>
                 <CardDescription>Students with scores Below Expectation (AE1/AE2/BE1/BE2) in 2 or more subjects</CardDescription>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[500px] pr-4">
                   <div className="space-y-4">
                     {data.studentsFailing2Plus.map(student => (
                       <div key={student.StudentID} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <h4 className="font-bold text-lg">{student.Name}</h4>
                             <p className="text-sm text-slate-500">Pos: #{student.Position} | Stream: {student.Stream}</p>
                           </div>
                           <Badge variant="destructive">{student.FailedSubjects} Subjects Requiring Attention</Badge>
                         </div>
                         
                         <div className="bg-white dark:bg-slate-950 p-4 rounded border font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                           {`REMEDIATION PLAN - GRADE 8 SUSWA
Date: ${new Date().toLocaleDateString()}
Student: ${student.Name} (${student.StudentID})

Dear Parent/Guardian,

This letter informs you that ${student.Name} is performing Below Expectation in ${student.FailedSubjects} subjects.
Overall Performance: ${student.OverallGrade} (${student.Average}%) - Position: ${student.Position}/${data.totalStudents}

Subjects Requiring Immediate Attention (<41%):
${SUBJECTS.filter(sub => (student[sub] as number) < 41).map(sub => `- ${sub}: ${student[sub]} (${getGrade(Number(student[sub]))})`).join('\n')}

Recommended Actions:
1. Remedial classes for the subjects listed above.
2. Review of homework schedule.
3. Parent-Teacher consultation scheduled for next week.

Yours Faithfully,

Madam Kinyua
Class Teacher, Grade 8 Suswa`}
                         </div>
                         <div className="mt-2 flex justify-end">
                           <Button size="sm" variant="ghost" className="text-slate-500">
                             <Copy className="w-3 h-3 mr-2" /> Copy Letter
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}

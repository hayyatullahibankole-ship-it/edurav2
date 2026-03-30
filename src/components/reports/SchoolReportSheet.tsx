import React from 'react';

interface SubjectScore {
  subject: string;
  score: number;
  grade: string;
}

interface SchoolReportSheetProps {
  studentName: string;
  schoolName: string;
  schoolLogoUrl?: string;
  eduraLogoUrl?: string;
  subjects: SubjectScore[];
  average: number;
  overallGrade: string;
  session?: string;
  term?: string;
}

export const SchoolReportSheet: React.FC<SchoolReportSheetProps> = ({
  studentName,
  schoolName,
  schoolLogoUrl,
  eduraLogoUrl,
  subjects,
  average,
  overallGrade,
  session,
  term,
}) => {
  return (
    <div className="bg-white text-black rounded-lg shadow-lg max-w-2xl mx-auto p-8 border relative print:p-0 print:shadow-none print:border-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {schoolLogoUrl && (
            <img src={schoolLogoUrl} alt="School Logo" className="h-16 w-16 object-contain rounded" />
          )}
          <div>
            <h2 className="text-xl font-bold uppercase">{schoolName}</h2>
            {session && <div className="text-xs text-gray-600">Session: {session}</div>}
            {term && <div className="text-xs text-gray-600">Term: {term}</div>}
          </div>
        </div>
        {eduraLogoUrl && (
          <img src={eduraLogoUrl} alt="Edura Logo" className="h-12 w-12 object-contain rounded" />
        )}
      </div>
      <div className="mb-6 border-b pb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">Student Name:</div>
          <div className="text-lg font-bold">{studentName}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">Average Score:</div>
          <div className="text-lg font-bold">{average}%</div>
          <div className="font-semibold mt-1">Overall Grade: <span className="text-xl">{overallGrade}</span></div>
        </div>
      </div>
      <table className="w-full mb-8 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Subject</th>
            <th className="py-2 px-4 border-b text-left">Score</th>
            <th className="py-2 px-4 border-b text-left">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2 px-4">{s.subject}</td>
              <td className="py-2 px-4">{s.score}</td>
              <td className="py-2 px-4">{s.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-8">
        <div className="text-xs text-gray-500">Powered by Edura</div>
        <button onClick={() => window.print()} className="bg-primary text-white px-4 py-2 rounded print:hidden">Print Report</button>
      </div>
    </div>
  );
};

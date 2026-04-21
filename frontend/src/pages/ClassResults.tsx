import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, FileDown, Table, Loader2, User, Calendar, Award } from 'lucide-react';

interface StudentResult {
    attemptId: number;
    studentName: string;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: string;
}

const ClassResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchResults();
    }, [testId]);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/teacher/tests/${testId}/results?size=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:8080/api/teacher/tests/${testId}/results/export?format=${format}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Results_Test_${testId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            alert("Export failed. Please try again.");
        }
    };

    const filteredResults = results.filter(r =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 font-sans">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/teacher-dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0056D2] mb-8 font-bold text-sm transition-colors uppercase tracking-widest"
                >
                    <ChevronLeft size={18} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 md:p-12 border-b border-slate-100 bg-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Class Performance</h1>
                                <p className="text-slate-500 mt-1">Detailed results and exports for Test #{testId}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95"
                                >
                                    <FileDown size={18} /> CSV
                                </button>
                                <button
                                    onClick={() => handleExport('xlsx')}
                                    className="flex items-center gap-2 px-5 py-3 bg-[#E6F4EA] hover:bg-[#CEEAD6] text-[#008148] rounded-xl font-bold text-sm transition-all border border-[#CEEAD6] active:scale-95"
                                >
                                    <Table size={18} /> Excel
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-10 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-[#0056D2] outline-none transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-12 py-5">Student Name</th>
                                        <th className="px-6 py-5">Date Submitted</th>
                                        <th className="px-6 py-5">Score</th>
                                        <th className="px-12 py-5 text-right">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredResults.map((res) => (
                                        <tr key={res.attemptId} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-12 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0056D2]">
                                                        <User size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-800">{res.studentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-slate-500 text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(res.submittedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="font-mono font-bold text-slate-700">{res.score}/{res.maxScore}</span>
                                            </td>
                                            <td className="px-12 py-6 text-right">
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs ${res.percentage >= 50 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <Award size={14} />
                                                    {Math.round(res.percentage)}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && filteredResults.length === 0 && (
                            <div className="p-20 text-center text-slate-400 font-medium">No results found matching your search.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassResults;
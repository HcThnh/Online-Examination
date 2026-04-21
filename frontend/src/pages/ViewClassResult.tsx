import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../services/api';
import TestStatisticsPanel from '../components/teacher/TestStatisticsPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentResultDto {
  attemptId: number;
  studentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

interface ClassResultsResponse {
  totalStudents: number;
  page: number;
  size: number;
  results: StudentResultDto[];
}

type SortField = 'studentName' | 'score' | 'percentage' | 'submittedAt';
type SortOrder = 'asc' | 'desc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getScoreBadgeClass = (pct: number) => {
  if (pct >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (pct >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-600 border border-red-200';
};

// ─── Sort icon component ──────────────────────────────────────────────────────

const SortIcon: React.FC<{ field: SortField; currentSort: SortField; order: SortOrder }> = ({
  field,
  currentSort,
  order,
}) => {
  if (field !== currentSort) return <ChevronsUpDown size={14} className="text-slate-300" />;
  return order === 'asc' ? (
    <ChevronUp size={14} className="text-[#0056D2]" />
  ) : (
    <ChevronDown size={14} className="text-[#0056D2]" />
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ViewClassResult: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ClassResultsResponse | null>(null);
  const [testTitle, setTestTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Task 15 logic - Robust Export Method using Axios API instance (supports Bearer Token)
  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (!testId || isExporting) return;
    setIsExporting(true);

    try {
      const response = await api.get(`/teacher/tests/${testId}/results/export`, {
        params: { format },
        responseType: 'blob', // Quan trọng: Yêu cầu Axios trả về dữ liệu dạng nhị phân (blob)
      });

      // Lấy tên file từ header (nếu server có trả về)
      const disposition = response.headers['content-disposition'];
      let filename = `Results_Test_${testId}.${format}`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Tạo url giả và thẻ <a> để tự động tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp DOM
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error(`Export error (${format}):`, err);
      alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchResults = useCallback(async () => {
    if (!testId) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        sort: sortField,
        order: sortOrder,
        page,
        size: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await api.get<ClassResultsResponse>(
        `/teacher/tests/${testId}/results`,
        { params }
      );
      setData(response.data);

      // Fetch test title (non-critical)
      if (!testTitle) {
        try {
          const testsRes = await api.get('/teacher/tests');
          const test = testsRes.data.find(
            (t: { id: string; title: string }) => String(t.id) === String(testId)
          );
          if (test) setTestTitle(test.title);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to fetch class results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [testId, sortField, sortOrder, page, debouncedSearch, testTitle]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const totalPages = data ? Math.ceil(data.totalStudents / PAGE_SIZE) : 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0056D2] transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {testTitle || 'Class Results'}
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              View all student submissions and scores for this test
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {data && (
              <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                <Users size={18} className="text-[#0056D2]" />
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-lg font-bold text-slate-800 ml-1">{data.totalStudents}</span>
              </div>
            )}

            <Link
              to={`/dashboard/tests/${testId}/question-analysis`}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#0056D2] hover:text-[#0056D2] px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm text-slate-700"
            >
              <BarChart2 size={18} />
              Question Analysis
            </Link>
          </div>
        </div>

        {/* Task 13: Test Statistics Panel */}
        {testId && <TestStatisticsPanel testId={testId} useMockData={false} />}

        {/* Toolbar: Search & Task 15 Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-8">
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              id="search-student"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#0056D2] transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors text-slate-700 shadow-sm cursor-pointer disabled:opacity-50 w-full md:w-auto"
            >
              <Download size={16} />
              Download CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#107c41] text-white rounded-xl text-sm font-semibold hover:bg-[#0b5e31] transition-colors shadow-sm cursor-pointer disabled:opacity-50 w-full md:w-auto"
            >
              <FileSpreadsheet size={16} />
              Download Excel
            </button>
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0056D2]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchResults}
              className="mt-4 px-4 py-2 bg-[#0056D2] text-white rounded-xl text-sm font-semibold hover:bg-[#00419E] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : data?.results.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-20 w-20 bg-blue-50 text-[#0056D2] rounded-2xl flex items-center justify-center mb-6">
              <Users size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 max-w-sm">
              {debouncedSearch
                ? `No students match "${debouncedSearch}".`
                : 'No students have submitted this test yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {(
                        [
                          { label: 'Student Name', field: 'studentName' as SortField },
                          { label: 'Score', field: 'score' as SortField },
                          { label: 'Percentage', field: 'percentage' as SortField },
                          { label: 'Submitted Date', field: 'submittedAt' as SortField },
                        ] as const
                      ).map(({ label, field }) => (
                        <th
                          key={field}
                          onClick={() => handleSort(field)}
                          className="px-6 py-4 text-left font-semibold text-slate-500 cursor-pointer select-none hover:text-[#0056D2] transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            {label}
                            <SortIcon field={field} currentSort={sortField} order={sortOrder} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data!.results.map((student, idx) => (
                      <tr
                        key={student.attemptId}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'
                          }`}
                      >
                        {/* Student name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0056D2] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {student.studentName?.charAt(0) ?? '?'}
                            </div>
                            <span className="font-medium text-slate-800">{student.studentName}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">
                            {student.score}
                            <span className="text-slate-400 font-normal ml-0.5">
                              /{student.maxScore}
                            </span>
                          </span>
                        </td>

                        {/* Percentage badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getScoreBadgeClass(
                              student.percentage
                            )}`}
                          >
                            {student.percentage.toFixed(1)}%
                          </span>
                        </td>

                        {/* Submitted date */}
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(student.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-700">{page + 1}</span> of{' '}
                  <span className="font-semibold text-slate-700">{totalPages}</span> &mdash;{' '}
                  {data!.totalStudents} total students
                </p>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-prev-page"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#0056D2] hover:border-[#0056D2]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum =
                      totalPages <= 5
                        ? i
                        : page <= 2
                          ? i
                          : page >= totalPages - 3
                            ? totalPages - 5 + i
                            : page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        id={`btn-page-${pageNum + 1}`}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all cursor-pointer ${pageNum === page
                            ? 'bg-[#0056D2] text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0056D2]/40 hover:text-[#0056D2]'
                          }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    id="btn-next-page"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#0056D2] hover:border-[#0056D2]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewClassResult;
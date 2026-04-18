import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AccessResponse {
    token: string;
    testId: number;
    attemptId: number;
    testTitle: string;
    studentId: number;
}

const AccessTest: React.FC = () => {
    const [passcode, setPasscode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.passcodeFromDashboard) {
            setPasscode(location.state.passcodeFromDashboard);
        }
    }, [location.state]);

    const handleAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!passcode.trim()) {
            setError("Please enter the test passcode.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post<AccessResponse>(
                'http://localhost:8080/api/student/access',
                {
                    passcode: passcode.trim(),
                    studentName: "Student" // Temporary identifier for token generation
                }
            );

            const { token, testId, attemptId } = response.data;
            localStorage.setItem('token', token);
            // Pass attemptId via navigation state - needed for submit
            navigate(`/student/test/${testId}`, { state: { attemptId } });

        } catch (err: any) {
            console.error("Access Error:", err);
            if (err.response?.status === 403) {
                setError("Invalid passcode or exam is not available.");
            } else {
                setError("Server connection failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 font-sans">
            <div className="max-w-[400px] w-full">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                    <div className="bg-gradient-to-r from-[#0056D2] to-[#00419E] p-8 text-center text-white">
                        <div className="inline-flex p-3 bg-white/10 rounded-xl backdrop-blur-md mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Test Access</h2>
                        <p className="text-blue-100/80 text-sm mt-1 font-medium">Verify your passcode to continue</p>
                    </div>

                    <form onSubmit={handleAccess} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center gap-3">
                                <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
                                <p className="text-red-700 text-xs font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                                    Exam Passcode
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-mono text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    CONTINUE
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="px-8 pb-8 text-center">
                        <p className="text-[10px] text-gray-400 font-medium italic">
                            The passcode is provided by your instructor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessTest;
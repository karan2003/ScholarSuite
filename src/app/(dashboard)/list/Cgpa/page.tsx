// app/calculator/page.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

export default function Calculator() {
    const router = useRouter();
    const { isLoaded, userId } = useAuth();
    const [activeTab, setActiveTab] = useState("cgpaToPercentage");
    const [semesters, setSemesters] = useState(
        Array.from({ length: 8 }, () => ({ value: null, isNA: false }))
    );
    const [cgpa, setCGPA] = useState<number | null>(null);
    const [percentage, setPercentage] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cgpaResult, setCgpaResult] = useState<number | null>(null);
    const [sgpaError, setSgpaError] = useState<string | null>(null);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        resetStates();
    };

    const resetStates = () => {
        setCGPA(null);
        setPercentage(null);
        setError(null);
        setCgpaResult(null);
        setSgpaError(null);
        setSemesters(
            Array.from({ length: 8 }, () => ({ value: null, isNA: false }))
        );
    };

    const calculatePercentage = (value: number) => {
        if (value < 0 || value > 10) {
            setError("CGPA must be between 0 and 10");
            return;
        }
        setError(null);
        setPercentage((value - 0.75) * 10);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (isNaN(value)) {
            setCGPA(null);
            setPercentage(null);
            setError("Please enter a valid number");
        } else {
            setCGPA(value);
            calculatePercentage(value);
        }
    };

    const handleSemesterChange = (
        index: number,
        value: string,
        isNA: boolean
    ) => {
        const newSemesters = [...semesters];
        newSemesters[index] = {
            value: isNA ? null : parseFloat(value),
            isNA,
        };
        setSemesters(newSemesters);
    };

    const calculateCGPA = () => {
        const validSgpas = semesters
            .filter((s) => !s.isNA && s.value !== null)
            .map((s) => s.value as number);

        if (validSgpas.length === 0) {
            setSgpaError("At least one semester is required");
            return;
        }

        if (validSgpas.some((sgpa) => sgpa < 0 || sgpa > 10)) {
            setSgpaError("SGPA must be between 0 and 10");
            return;
        }

        const sum = validSgpas.reduce((acc, curr) => acc + curr, 0);
        setCgpaResult(sum / validSgpas.length);
        setSgpaError(null);
    };

        if (!isLoaded) return (
            <motion.div 
            className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            >
            <div className="max-w-2xl w-full flex flex-col items-center space-y-4">
                <motion.div 
                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: 'linear'
                }}
                />
                <motion.span
                className="text-indigo-600 text-lg font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    repeatType: 'reverse'
                }}
                >
                Loading...
                </motion.span>
            </div>
            </motion.div>
        );

        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100"
                >
                    <div className="p-6 md:p-8">
                        <h1 className="text-3xl font-semibold mb-8 text-center text-slate-800">
                            Academic Calculators
                        </h1>
                        
                        {/* Tab Navigation */}
                        <div className="flex gap-6 mb-8 border-b border-slate-100">
                            <button
                                onClick={() => handleTabChange("cgpaToPercentage")}
                                className={`pb-3 font-medium text-sm md:text-base transition-all duration-200 ${
                                    activeTab === "cgpaToPercentage"
                                        ? "border-b-2 border-indigo-600 text-indigo-600"
                                        : "text-slate-500 hover:text-indigo-500"
                                }`}
                            >
                                CGPA to Percentage
                            </button>
                            <button
                                onClick={() => handleTabChange("sgpaToCgpa")}
                                className={`pb-3 font-medium text-sm md:text-base transition-all duration-200 ${
                                    activeTab === "sgpaToCgpa"
                                        ? "border-b-2 border-indigo-600 text-indigo-600"
                                        : "text-slate-500 hover:text-indigo-500"
                                }`}
                            >
                                SGPA to CGPA
                            </button>
                        </div>
    
                        <AnimatePresence mode="wait">
                            {/* CGPA to Percentage Tab */}
                            {activeTab === "cgpaToPercentage" && (
                                <motion.div
                                    key="cgpa"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="block text-slate-700 font-medium">
                                            Enter Your CGPA
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            placeholder="e.g. 8.5"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onChange={handleInputChange}
                                        />
                                        {error && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                ⚠️ {error}
                                            </p>
                                        )}
                                    </div>
    
                                    {percentage !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-5 bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer"
                                            onClick={() => router.push('/list/Cgpa')}
                                        >
                                            <h3 className="font-semibold text-indigo-600 mb-2">
                                                Calculated Percentage:
                                            </h3>
                                            <p className="text-2xl md:text-3xl text-center text-indigo-700 font-semibold">
                                                {percentage.toFixed(2)}%
                                            </p>
                                        </motion.div>
                                    )}
    
                                    <button
                                        className="w-full bg-indigo-50 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                                        onClick={resetStates}
                                    >
                                        Reset Calculation
                                    </button>
                                </motion.div>
                            )}
    
                            {/* SGPA to CGPA Tab */}
                            {activeTab === "sgpaToCgpa" && (
                                <motion.div
                                    key="sgpa"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {semesters.map((semester, index) => (
                                        <div key={index} className="flex gap-4 md:gap-6">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-slate-700 font-medium">
                                                    Semester {index + 1}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={semester.isNA}
                                                        onChange={(e) =>
                                                            handleSemesterChange(
                                                                index,
                                                                "",
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-slate-500 text-sm">N/A</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    placeholder="SGPA"
                                                    disabled={semester.isNA}
                                                    value={
                                                        semester.isNA || semester.value === null
                                                            ? ""
                                                            : semester.value
                                                    }
                                                    onChange={(e) =>
                                                        handleSemesterChange(
                                                            index,
                                                            e.target.value,
                                                            false
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50"
                                                />
                                            </div>
                                        </div>
                                    ))}
    
                                    <button
                                        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                        onClick={calculateCGPA}
                                    >
                                        Calculate CGPA
                                    </button>
    
                                    {sgpaError && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            ⚠️ {sgpaError}
                                        </p>
                                    )}
    
                                    {cgpaResult !== null && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-5 bg-indigo-50 rounded-lg border border-indigo-100"
                                        >
                                            <h3 className="font-semibold text-indigo-600 mb-2">
                                                Calculated CGPA:
                                            </h3>
                                            <p className="text-2xl md:text-3xl text-center text-indigo-700 font-semibold">
                                                {cgpaResult.toFixed(2)}
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        );
    }
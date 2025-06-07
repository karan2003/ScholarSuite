"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function NotesPage() {
    const { isLoaded, userId } = useAuth();
    const [notes, setNotes] = useState<string[]>([]);

    useEffect(() => {
        setNotes([
            "1st YEAR",
            "2nd YEAR",
            "3rd YEAR",
            "4th YEAR",
        ]);
    }, []);

    const yearLinks: { [key: string]: string } = {
        "1st YEAR": "https://drive.google.com/drive/folders/1wmGLuG9fgiI0eQUKQyGlxLG8rTYByQG3?usp=sharing",
        "2nd YEAR": "https://drive.google.com/drive/folders/1TnH6Y4vwGiMnse7Mr9zTJIW685prc97C",
        "3rd YEAR": "https://drive.google.com/drive/folders/1aF5SSx6y61euk8_rRUub2OMFmHQbjU6y?usp=drive_link",
        "4th YEAR": "https://drive.google.com/drive/folders/1HX9-swTxkB7qm64qDkv8jyCmSWVTveqI?usp=drive_link",
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
                    Loading Notes...
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
                        Study Notes
                    </h1>

                    <div className="space-y-4">
                        {notes.map((note, idx) => (
                            <motion.a
                                key={idx}
                                href={yearLinks[note]}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="block p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                                <h3 className="text-indigo-700 font-medium text-lg">
                                    {note}
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    Click to open in Google Drive
                                </p>
                            </motion.a>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {Object.entries(yearLinks).map(([year, link], index) => (
                            <button
                                key={index}
                                onClick={() => window.open(link, "_blank")}
                                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Open {year} Folder
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

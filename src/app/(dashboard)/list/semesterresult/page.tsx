    // File: app/(dashboard)/semester-results/page.tsx
    import prisma from "@/lib/prisma";
    import { auth } from "@clerk/nextjs/server";
    import { redirect } from "next/navigation";
    import AutoRefresh from "@/components/AutoRefresh";

    // Data type for a single row in the results table.
    type SemesterResultRow = {
    id: number;
    subjectName: string;
    credit: number;
    score: number;
    letterGrade: string;
    gradePoint: number;
    };

    // Helper function that computes the letter grade and corresponding grade point from a score.
    function getLetterGrade(score: number): { grade: string; gradePoint: number } {
    if (score >= 90) return { grade: "O", gradePoint: 10 };
    else if (score >= 80) return { grade: "S", gradePoint: 9 };
    else if (score >= 70) return { grade: "A", gradePoint: 8 };
    else if (score >= 60) return { grade: "B", gradePoint: 7 };
    else if (score >= 50) return { grade: "C", gradePoint: 6 };
    else if (score >= 45) return { grade: "D", gradePoint: 5 };
    else if (score >= 40) return { grade: "E", gradePoint: 4 };
    else return { grade: "F", gradePoint: 0 };
    }

    const SemesterResultsPage = async ({
    searchParams,
    }: {
    searchParams: { [key: string]: string | undefined };
    }) => {
    // Authenticate user—if not logged in, redirect to login.
    const { userId } = await auth();
    if (!userId) {
        redirect("/login");
    }

    // Determine the selected semester from the query parameter; default to semester 1.
    const semesterParam = searchParams.semester;
    const selectedSemester = semesterParam ? parseInt(semesterParam, 10) || 1 : 1;

    // Query the results for the logged‑in student for the specified semester.
    // (This filters results by ensuring the related subject has a matching semesterId.)
    const results = await prisma.result.findMany({
        where: {
        studentId: userId,
        subject: {
            semesterId: selectedSemester,
        },
        },
        include: {
        subject: {
            select: { name: true, credit: true },
        },
        },
    });

    // Map the fetched results into a table-friendly structure.
    const tableRows: SemesterResultRow[] = results.map((res) => {
        const { grade, gradePoint } = getLetterGrade(res.score);
        return {
        id: res.id,
        subjectName: res.subject.name,
        credit: res.subject.credit,
        score: res.score,
        letterGrade: grade,
        gradePoint: gradePoint,
        };
    });

    // Calculate summary statistics.
    let totalCreditsAttempted = 0;
    let totalCreditsEarned = 0;
    let totalGradePoints = 0;
    for (const row of tableRows) {
        totalCreditsAttempted += row.credit;
        if (row.score >= 40) {
        totalCreditsEarned += row.credit;
        }
        totalGradePoints += row.credit * row.gradePoint;
    }
    const SGPA =
        totalCreditsAttempted > 0
        ? totalGradePoints / totalCreditsAttempted
        : 0;
    const CGPA = SGPA; // Since we're calculating for one semester.
    let classification = "";
    if (CGPA >= 7.75) classification = "First Class with Distinction";
    else if (CGPA >= 6.75) classification = "First Class";
    else if (CGPA >= 5.75) classification = "Second Class";
    else classification = "Below Second Class";

    return (
        <div className="p-6">
        <AutoRefresh interval={30} />

        <h1 className="text-2xl font-bold mb-4">Semester Results</h1>

        {/* Semester Selection Form – the user can select a semester from 1 to 8 */}
        <form method="get" className="mb-4">
            <label htmlFor="semester" className="mr-2 font-medium">
            Select Semester:
            </label>
            <select
            name="semester"
            id="semester"
            defaultValue={selectedSemester.toString()}
            className="border p-1 rounded"
            >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                <option key={sem} value={sem}>
                Semester {sem}
                </option>
            ))}
            </select>
            <button
            type="submit"
            className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
            >
            Go
            </button>
        </form>

        {/* Results Table */}
        <table className="min-w-full bg-white border border-gray-200">
            <thead>
            <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Sl. No.</th>
                <th className="px-4 py-2 border">Subject Name</th>
                <th className="px-4 py-2 border">Credits</th>
                <th className="px-4 py-2 border">Score</th>
                <th className="px-4 py-2 border">Grade</th>
            </tr>
            </thead>
            <tbody>
            {tableRows.length > 0 ? (
                tableRows.map((row, index) => (
                <tr key={row.id} className="text-center border-b">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{row.subjectName}</td>
                    <td className="px-4 py-2 border">{row.credit}</td>
                    <td className="px-4 py-2 border">{row.score}</td>
                    <td className="px-4 py-2 border">{row.letterGrade}</td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan={5} className="text-center py-4">
                    No results found for Semester {selectedSemester}.
                </td>
                </tr>
            )}
            </tbody>
        </table>

        {/* Summary Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p>
            <span className="font-medium">Total Credits Attempted:</span>{" "}
            {totalCreditsAttempted}
            </p>
            <p>
            <span className="font-medium">Total Credits Earned:</span>{" "}
            {totalCreditsEarned}
            </p>
            <p>
            <span className="font-medium">SGPA (and CGPA):</span>{" "}
            {SGPA.toFixed(2)}
            </p>
            <p>
            <span className="font-medium">Classification:</span>{" "}
            {classification}
            </p>
        </div>
        </div>
    );
    };

    export default SemesterResultsPage;
"use client";

import { createAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useMemo } from "react";
import { toast } from "react-toastify";

const BulkAttendanceForm = ({
  setOpen,
  relatedData,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: { lessons: any[]; students: any[] };
}) => {
  const router = useRouter();
  const [lessonId, setLessonId] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (studentId: string, present: boolean) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: present }));
  };

  const studentsInLesson = useMemo(() => {
    const lesson = relatedData.lessons.find((l) => l.id.toString() === lessonId);
    if (!lesson) return [];
    return relatedData.students.filter(
      (s) => s.classId === lesson.classId
    );
  }, [lessonId, relatedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonId || !date) {
      toast.error("Please select a lesson and date.");
      return;
    }

    const entries = studentsInLesson.map((student) => ({
      studentId: student.id,
      lessonId: parseInt(lessonId),
      date: new Date(date),
      present: attendanceMap[student.id] ?? false,
    }));

    let successCount = 0;

    for (const entry of entries) {
      const res = await createAttendance(null, entry);
      if (res.success) successCount++;
    }

    toast(`${successCount} attendances marked successfully.`);
    setOpen(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Bulk Attendance</h1>

      {/* Lesson Selector */}
      <div className="flex flex-col">
        <label className="text-sm mb-1">Select Lesson</label>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">-- Select --</option>
          {relatedData.lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} (ID: {l.id})
            </option>
          ))}
        </select>
      </div>

      {/* Date Picker */}
      <div className="flex flex-col">
        <label className="text-sm mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded-md"
        />
      </div>

      {/* Students */}
      <div className="border p-4 rounded-md max-h-64 overflow-y-auto">
        {studentsInLesson.length === 0 ? (
          <p className="text-sm text-gray-500">Select a lesson to view students.</p>
        ) : (
          studentsInLesson.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-1 border-b"
            >
              <span>{s.name} {s.surname}</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-green-600">
                  <input
                    type="radio"
                    name={`present-${s.id}`}
                    checked={attendanceMap[s.id] === true}
                    onChange={() => handleToggle(s.id, true)}
                  />
                  Present
                </label>
                <label className="flex items-center gap-1 text-red-600">
                  <input
                    type="radio"
                    name={`present-${s.id}`}
                    checked={attendanceMap[s.id] === false}
                    onChange={() => handleToggle(s.id, false)}
                  />
                  Absent
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Submit Attendance
      </button>
    </form>
  );
};

export default BulkAttendanceForm;

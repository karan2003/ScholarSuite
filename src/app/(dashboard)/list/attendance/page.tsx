import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Attendance, Lesson, Student, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type AttendanceList = Attendance & {
  student: Student;
  lesson: Lesson;
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = sessionClaims?.sub;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const isLowAttendance = queryParams?.lowAttendance === "true";

  let data: any[] = [];
  let count = 0;

  let columns = [
    { header: "Student", accessor: "student" },
    { header: "Lesson", accessor: "lesson", className: "hidden sm:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Present", accessor: "present", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  if (isLowAttendance) {
    if (role === "student" || role === "parent") {
      // Restricted roles should not access low attendance summary
      data = [];
      count = 0;
    } else {
      const students = await prisma.student.findMany({
        include: { attendances: true },
      });

      const lowAttendanceSummaries = students
        .map((student) => {
          const total = student.attendances.length;
          const present = student.attendances.filter((a) => a.present).length;

          if (total === 0) return null;

          const percentage = (present / total) * 100;

          if (percentage < 75) {
            return {
              student,
              percentage: percentage.toFixed(1),
              total,
              present,
            };
          }

          return null;
        })
        .filter(Boolean);

      data = lowAttendanceSummaries as any;
      count = data.length;

      columns = [
        { header: "Student", accessor: "student" },
        { header: "Present %", accessor: "percentage", className: "text-center" },
        { header: "Total", accessor: "total", className: "text-center" },
        { header: "Present Days", accessor: "present", className: "text-center" },
      ];
    }
  } else {
    const query: Prisma.AttendanceWhereInput = {};

    if (role === "student") {
      query.studentId = currentUserId;
    }

    if (role === "parent") {
      const child = await prisma.student.findFirst({
        where: { parentId: currentUserId },
      });
      if (child) {
        query.studentId = child.id;
      } else {
        data = [];
        count = 0;
        return;
      }
    }

    if (queryParams?.search) {
      query.student = {
        name: {
          contains: queryParams.search,
          mode: "insensitive",
        },
      };
    }

    const [records, total] = await prisma.$transaction([
      prisma.attendance.findMany({
        where: query,
        include: { student: true, lesson: true },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: { date: "desc" },
      }),
      prisma.attendance.count({ where: query }),
    ]);

    data = records;
    count = total;
  }

  const renderRow = (item: any) => {
    if (isLowAttendance) {
      return (
        <tr
          key={item.student.id}
          className="border-b hover:bg-violet-50 transition"
        >
          <td className="py-3 px-4">{item.student.name} {item.student.surname}</td>
          <td className="text-center py-3 px-4 font-semibold text-red-600">
            {item.percentage}%
          </td>
          <td className="text-center py-3 px-4 text-gray-700">{item.total}</td>
          <td className="text-center py-3 px-4 text-gray-700">{item.present}</td>
        </tr>
      );
    }

    return (
      <tr key={item.id} className="border-b hover:bg-violet-50 transition">
        <td className="py-4 px-3">{item.student.name} {item.student.surname}</td>
        <td className="hidden sm:table-cell py-4 px-3">{item.lesson.name}</td>
        <td className="hidden md:table-cell py-4 px-3">
          {new Date(item.date).toLocaleDateString()}
        </td>
        <td className="hidden md:table-cell py-4 px-3">
          {item.present ? "✅ Present" : "❌ Absent"}
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="py-4 px-3">
            <div className="flex items-center gap-2">
              <FormContainer
                table="attendance"
                type="update"
                data={{
                  id: item.id,
                  studentId: item.studentId,
                  lessonId: item.lessonId,
                  present: item.present,
                }}
              />
              <FormContainer table="attendance" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-4 mt-0 flex-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-violet-800">
          📋 Attendance Records
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-3">
            {(role === "admin" || role === "teacher") && (
              <Link
                href={
                  isLowAttendance
                    ? "/list/attendance"
                    : "/list/attendance?lowAttendance=true"
                }
              >
                <button className="text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-all">
                  {isLowAttendance ? "Show All" : "<75% Filter"}
                </button>
              </Link>
            )}

            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="attendance" type="create" />
                <FormContainer table="attendance" type="bulk" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-violet-100 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`text-left text-xs font-semibold uppercase tracking-wider text-violet-800 px-3 py-3 ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{data.map(renderRow)}</tbody>
        </table>
      </div>

      {!isLowAttendance && (
        <div className="mt-6">
          <Pagination page={p} count={count} />
        </div>
      )}
    </div>
  );
};

export default AttendanceListPage;

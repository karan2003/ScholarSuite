// File: app/(dashboard)/list/results/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import AutoRefresh from "@/components/AutoRefresh";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
  credits: number; // Awarded credits for this result
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Authenticate user and obtain role.
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Define table columns.
  const columns = [
    { header: "Title", accessor: "title", className: "text-[#050C9C]" },
    { header: "Student", accessor: "student", className: "text-[#050C9C]" },
    { header: "Score", accessor: "score", className: "md:table-cell text-[#050C9C]" },
    { header: "Teacher", accessor: "teacher", className: "md:table-cell text-[#050C9C]" },
    { header: "Class", accessor: "class", className: "md:table-cell text-[#050C9C]" },
    { header: "Date", accessor: "date", className: "md:table-cell text-[#050C9C]" },
    { header: "Credits", accessor: "credits", className: "md:table-cell text-[#050C9C]" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action", className: "text-[#050C9C]" }]
      : []),
  ];

  // Render each row.
  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{`${item.studentName} ${item.studentSurname}`}</td>
      <td className="md:table-cell">{item.score}</td>
      <td className="md:table-cell">{`${item.teacherName} ${item.teacherSurname}`}</td>
      <td className="md:table-cell">{item.className}</td>
      <td className="md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td className="md:table-cell">{item.credits}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Process URL parameters.
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Apply role-based filtering.
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = { parentId: currentUserId! };
      break;
    default:
      break;
  }

  // Main query: fetch paginated results.
  const [resultsData, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: { select: { id: true, credit: true, name: true } },
                startTime: true,
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            startDate: true,
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
                subject: { select: { id: true, credit: true, name: true } },
              },
            },
          },
        },
        subject: { select: { id: true, credit: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  // Map the fetched data.
  const mappedData = resultsData
    .map((item) => {
      const assessment = item.exam || item.assignment;
      if (!assessment) return null;
      const isExam = !!item.exam;
      const awardedCredits =
        item.score > 39 &&
        item.subject &&
        assessment.lesson.subject &&
        item.subject.id === assessment.lesson.subject.id
          ? assessment.lesson.subject.credit
          : 0;
      return {
        id: item.id,
        title: assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        score: item.score,
        teacherName: assessment.lesson.teacher.name,
        teacherSurname: assessment.lesson.teacher.surname,
        className: assessment.lesson.class.name,
        startTime: isExam ? assessment.lesson.startTime : assessment.startDate,
        credits: awardedCredits,
      };
    })
    .filter((item): item is ResultList => item !== null);

  // STUDENT SUMMARY: Total Credits Earned and Required Credits.
  let totalCreditsEarned = 0;
  let studentRequiredCredits = 0;
  if (role === "student" && currentUserId) {
    // Fetch the student's required credits from the student record.
    const studentRecord = await prisma.student.findUnique({
      where: { id: currentUserId },
      select: { requiredCredits: true },
    });
    studentRequiredCredits = studentRecord?.requiredCredits ?? 0;

    // Fetch all results for this student.
    const allResultsForSummary = await prisma.result.findMany({
      where: { studentId: currentUserId },
      include: {
        exam: {
          include: {
            lesson: {
              select: { subject: { select: { id: true, credit: true } } },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: { subject: { select: { id: true, credit: true } } },
            },
          },
        },
        subject: { select: { id: true, credit: true } },
      },
    });

    // Calculate total earned credits.
    for (const res of allResultsForSummary) {
      if (res.score > 39 && res.subject) {
        if (
          res.exam &&
          res.exam.lesson.subject &&
          res.exam.lesson.subject.id === res.subject.id
        ) {
          totalCreditsEarned += res.exam.lesson.subject.credit;
        } else if (
          res.assignment &&
          res.assignment.lesson.subject &&
          res.assignment.lesson.subject.id === res.subject.id
        ) {
          totalCreditsEarned += res.assignment.lesson.subject.credit;
        }
      }
    }
  }

  // Deficient credits: compute as the difference between earned credits and required credits.
  const totalDeficientCredits = totalCreditsEarned - studentRequiredCredits;

  return (
    <div className="bg-lamaSkyLight p-4 rounded-md flex-1 m-4 mt-0">
      <AutoRefresh interval={30} />
      {/* Summary Banner for Students */}
      {role === "student" && (
        <div className="mb-4 p-4 bg-lb rounded-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Credits Earned:</h3>
              <p>{totalCreditsEarned}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Required Credits:</h3>
              <p>{studentRequiredCredits}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Deficient Credits:</h3>
              <p>{totalDeficientCredits}</p>
            </div>
          </div>
        </div>
      )}
      {/* TOP Bar */}
      <div className="flex items-center justify-between">
        <h1 className="flex md:block text-lg font-bold text-black-500">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end ">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* Results Table */}
      <Table columns={columns} renderRow={renderRow} data={mappedData} />
      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
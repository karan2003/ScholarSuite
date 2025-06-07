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

const ResultListPage = async ({ searchParams }) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata)?.role;
  const currentUserId = userId;

  const columns = [
    { header: "Title", accessor: "title", className: "text-[#050C9C]" },
    { header: "Student", accessor: "student", className: "text-[#050C9C]" },
    { header: "Score", accessor: "score", className: "hidden sm:table-cell text-[#050C9C]" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell text-[#050C9C]" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell text-[#050C9C]" },
    { header: "Date", accessor: "date", className: "hidden lg:table-cell text-[#050C9C]" },
    { header: "Credits", accessor: "credits", className: "hidden lg:table-cell text-[#050C9C]" },
    ...(role === "admin" || role === "teacher" ? [
      { header: "Actions", accessor: "action", className: "text-[#050C9C]" }
    ] : [])
  ];

  const renderRow = (item) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 font-medium">{item.title}</td>
      <td>{`${item.studentName} ${item.studentSurname}`}</td>
      <td className="hidden sm:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{`${item.teacherName} ${item.teacherSurname}`}</td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden lg:table-cell">{new Intl.DateTimeFormat("en-US").format(item.startTime)}</td>
      <td className="hidden lg:table-cell">{item.credits}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex flex-wrap gap-2 justify-start items-center">
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      switch (key) {
        case "studentId": query.studentId = value; break;
        case "search": query.OR = [
          { exam: { title: { contains: value, mode: "insensitive" } } },
          { student: { name: { contains: value, mode: "insensitive" } } }
        ]; break;
      }
    }
  }

  switch (role) {
    case "admin": break;
    case "teacher": query.OR = [
      { exam: { lesson: { teacherId: currentUserId } } },
      { assignment: { lesson: { teacherId: currentUserId } } }
    ]; break;
    case "student": query.studentId = currentUserId; break;
    case "parent": query.student = { parentId: currentUserId }; break;
  }

  const [resultsData, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: { include: {
          lesson: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              subject: { select: { id: true, credit: true, name: true } },
              startTime: true,
            }
          }
        } },
        assignment: { include: {
          lesson: {
            select: {
              class: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              subject: { select: { id: true, credit: true, name: true } },
            }
          }
        } },
        subject: { select: { id: true, credit: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query })
  ]);

  const mappedData = resultsData.map(item => {
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
  }).filter(item => item !== null);

  let totalCreditsEarned = 0;
  let studentRequiredCredits = 0;
  if (role === "student" && currentUserId) {
    const studentRecord = await prisma.student.findUnique({
      where: { id: currentUserId },
      select: { requiredCredits: true },
    });
    studentRequiredCredits = studentRecord?.requiredCredits ?? 0;

    const allResults = await prisma.result.findMany({
      where: { studentId: currentUserId },
      include: {
        exam: { include: { lesson: { select: { subject: { select: { id: true, credit: true } } } } } },
        assignment: { include: { lesson: { select: { subject: { select: { id: true, credit: true } } } } } },
        subject: { select: { id: true, credit: true } }
      }
    });

    for (const res of allResults) {
      if (res.score > 39 && res.subject) {
        if (res.exam && res.exam.lesson.subject.id === res.subject.id) {
          totalCreditsEarned += res.exam.lesson.subject.credit;
        } else if (res.assignment && res.assignment.lesson.subject.id === res.subject.id) {
          totalCreditsEarned += res.assignment.lesson.subject.credit;
        }
      }
    }
  }

  const totalDeficientCredits = totalCreditsEarned - studentRequiredCredits;

  return (
    <div className="bg-lamaSkyLight p-4 rounded-md flex-1 m-4 mt-0">
      <AutoRefresh interval={30} />

      {role === "student" && (
        <section className="mb-4 p-4 bg-lb rounded-md">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
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
        </section>
      )}

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-lg font-bold text-black">All Results</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </header>

      <Table columns={columns} renderRow={renderRow} data={mappedData} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
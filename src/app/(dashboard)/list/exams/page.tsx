// ✅ Here's a cleanly responsive version of your ExamListPage with improved layout handling.

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    { header: "Exam Title", accessor: "title" },
    { header: "Subject", accessor: "subject", className: "hidden md:table-cell" },
    { header: "Credit", accessor: "credit", className: "hidden lg:table-cell" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden sm:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ExamList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.lesson.subject.name}</td>
      <td className="hidden lg:table-cell">{item.lesson.subject.credit}</td>
      <td className="hidden md:table-cell">{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">{`${item.lesson.teacher.name} ${item.lesson.teacher.surname}`}</td>
      <td className="hidden sm:table-cell">{new Intl.DateTimeFormat("en-US").format(item.startTime)}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex flex-wrap items-center gap-2">
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.ExamWhereInput = {};
  let lessonFilter: Prisma.LessonWhereInput = { class: { students: { some: {} } } };

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            lessonFilter.classId = parseInt(value);
            break;
          case "teacherId":
            lessonFilter.teacherId = value;
            break;
          case "search":
            lessonFilter.subject = { name: { contains: value, mode: "insensitive" } };
            break;
        }
      }
    }
  }

  query.lesson = lessonFilter;

  switch (role) {
    case "teacher":
      lessonFilter.teacherId = currentUserId!;
      break;
    case "student":
      lessonFilter.class = { students: { some: { id: currentUserId! } } };
      break;
    case "parent":
      lessonFilter.class = { students: { some: { parentId: currentUserId! } } };
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true, credit: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  const mappedData: ExamList[] = dataRes;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-lg font-semibold">All Exams</h1>
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch />
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            <Image src="/filter.png" alt="Filter" width={14} height={14} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            <Image src="/sort.png" alt="Sort" width={14} height={14} />
          </button>
          {(role === "admin" || role === "teacher") && <FormContainer table="exam" type="create" />}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={mappedData} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;

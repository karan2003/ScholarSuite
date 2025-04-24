// File: app/(dashboard)/list/results/page.tsx
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

const ExamListPage = async ({
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
    {
      header: "Exam Title",
      accessor: "title",
    },
    {
      header: "Subject",
      accessor: "subject",
      className: "md:table-cell",
    },
    {
      header: "Credit",
      accessor: "credit",
      className: "md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  // Render each row.
  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="md:table-cell">{item.lesson.subject.name}</td>
      <td className="md:table-cell">{item.lesson.subject.credit}</td>
      <td className="md:table-cell">{item.lesson.class.name}</td>
      <td className="md:table-cell">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className="md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Process URL parameters.
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.ExamWhereInput = {};

  // Build a lesson filter using nested relations.
  // Instead of filtering on lesson.students (which doesn't exist), we filter on lesson.class.students.
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
            lessonFilter.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // Assign the lesson filter to the exam query.
  query.lesson = lessonFilter;

  // Role-based filter adjustments.
  switch (role) {
    case "admin":
      break;
    case "teacher":
      lessonFilter.teacherId = currentUserId!;
      break;
    case "student":
      lessonFilter.class = {
        students: { some: { id: currentUserId! } },
      };
      break;
    case "parent":
      lessonFilter.class = {
        students: { some: { parentId: currentUserId! } },
      };
      break;
    default:
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

  // Since the subject credit is derived directly, simply pass the data along.
  const mappedData: ExamList[] = dataRes;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP Bar */}
      <div className="flex items-center justify-between">
        <h1 className="md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={mappedData} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
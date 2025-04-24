import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Grade, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Fetch student with related class, grade, and lesson count.
  const student: (Student & {
    class: Class & { _count: { lessons: number } };
    grade: Grade;
  }) | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
      grade: true,
    },
  });

  if (!student) {
    return notFound();
  }

  // Query all results for this student to compute total credits earned.
  const studentResults = await prisma.result.findMany({
    where: { studentId: id },
    include: {
      exam: {
        include: {
          lesson: {
            select: { subject: { select: { credit: true } } },
          },
        },
      },
      assignment: {
        include: {
          lesson: {
            select: { subject: { select: { credit: true } } },
          },
        },
      },
    },
  });

  let totalCreditsEarned = 0;
  for (const res of studentResults) {
    if (res.exam && res.exam.lesson.subject.credit) {
      totalCreditsEarned += res.exam.lesson.subject.credit;
    } else if (res.assignment && res.assignment.lesson.subject.credit) {
      totalCreditsEarned += res.assignment.lesson.subject.credit;
    }
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT COLUMN */}
      <div className="w-full xl:w-2/3">
        {/* TOP: Student Info and Small Cards */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* User Info Card */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt="Student Avatar"
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name + " " + student.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500">{student.address}</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Image
                    src="/blood.png"
                    alt="Blood Type"
                    width={14}
                    height={14}
                  />
                  <span>{student.bloodType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src="/date.png"
                    alt="Birthday"
                    width={14}
                    height={14}
                  />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="Email" width={14} height={14} />
                  <span>{student.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src="/phone.png"
                    alt="Phone"
                    width={14}
                    height={14}
                  />
                  <span>{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Small Cards Section (use a grid for proper alignment) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Attendance Card */}
            <div className="bg-white p-4 rounded-md flex items-center gap-4">
              <Image
                src="/singleAttendance.png"
                alt="Attendance"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>
            {/* Grade Card */}
            <div className="bg-white p-4 rounded-md flex items-center gap-4">
              <Image
                src="/singleBranch.png"
                alt="Grade"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">{student.grade.level}</h1>
                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>
            {/* Lessons Card */}
            <div className="bg-white p-4 rounded-md flex items-center gap-4">
              <Image
                src="/singleLesson.png"
                alt="Lessons"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {student.class._count.lessons}
                </h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            {/* Class Card */}
            <div className="bg-white p-4 rounded-md flex items-center gap-4">
              <Image
                src="/singleClass.png"
                alt="Class"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div>
                <h1 className="text-xl font-semibold">{student.class.name}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>

          {/* Credits Summary Cards using a two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md flex flex-col gap-2">
              <h1 className="text-xl font-semibold">Total Credits Earned</h1>
              <span className="text-sm text-gray-400">{totalCreditsEarned}</span>
            </div>
            <div className="bg-white p-4 rounded-md flex flex-col gap-2">
              <h1 className="text-xl font-semibold">Credit Deficiency</h1>
              <span className="text-sm text-gray-400">
                {student.creditDeficiency}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Schedule */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?classId=${student.class.id}`}
            >
              Student&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${student.class.id}`}
            >
              Student&apos;s Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?classId=${student.class.id}`}
            >
              Student&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?classId=${student.class.id}`}
            >
              Student&apos;s Assignments
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?studentId=${student.id}`}
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
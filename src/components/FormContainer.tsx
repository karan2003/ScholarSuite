    import prisma from "@/lib/prisma";
    import FormModal from "./FormModal";
    import { auth } from "@clerk/nextjs/server";

    export type FormContainerProps = {
    table:
        | "teacher"
        | "student"
        | "parent"
        | "subject"
        | "class"
        | "lesson"
        | "exam"
        | "assignment"
        | "result"
        | "attendance"
        | "event"
        | "announcement"
        | "alumni";
    type: "create" | "update" | "delete";
    data?: any;
    id?: number | string;
    };

    const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
    let relatedData = {};

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    // Only fetch related data when not deleting.
    if (type !== "delete") {
        switch (table) {
        case "subject": {
            // Subject: fetch available teachers to link with the subject.
            const subjectTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            });
            relatedData = { teachers: subjectTeachers };
            break;
        }
        case "class": {
            // Class: fetch the list of grades and teachers.
            const classGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
            });
            const classTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            });
            relatedData = { teachers: classTeachers, grades: classGrades };
            break;
        }
        case "teacher": {
            // Teacher: fetch available subjects.
            const teacherSubjects = await prisma.subject.findMany({
            select: { id: true, name: true },
            });
            relatedData = { subjects: teacherSubjects };
            break;
        }
        case "student": {
            // Student: fetch available grades and classes.
            const studentGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
            });
            const studentClasses = await prisma.class.findMany({
            include: { _count: { select: { students: true } } },
            });
            relatedData = { classes: studentClasses, grades: studentGrades };
            break;
        }
        case "exam": {
            // Exam: fetch lessons for scheduling; if teacher, filter by current user.
            const examLessons = await prisma.lesson.findMany({
            where: role === "teacher" ? { teacherId: currentUserId! } : {},
            select: { id: true, name: true },
            });
            relatedData = { lessons: examLessons };
            break;
        }
        case "lesson": {
            // Lesson: fetch subjects, classes, and teachers.
            const lessonSubjects = await prisma.subject.findMany({
            select: { id: true, name: true },
            });
            const lessonClasses = await prisma.class.findMany({
            select: { id: true, name: true },
            });
            const lessonTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            });
            relatedData = {
            subjects: lessonSubjects,
            classes: lessonClasses,
            teachers: lessonTeachers,
            };
            break;
        }
        case "assignment": {
            // Assignment: fetch lessons (filter by teacher if needed).
            const assignmentLessons = await prisma.lesson.findMany({
                where: role === "teacher" ? { teacherId: currentUserId! } : {},
                select: { id: true, name: true },
            });
            relatedData = { lessons: assignmentLessons };
            break;
        }
        case "alumni": {
            relatedData = {}; // Nothing extra needed now
            break;
        }
        
        case "attendance": {
            // Get lessons created by this teacher (or all if admin)
            const attendanceLessons = await prisma.lesson.findMany({
              where: role === "teacher" ? { teacherId: currentUserId! } : {},
              select: { id: true, name: true, classId: true },
            });
          
            // Extract unique class IDs from teacher's lessons
            const lessonClassIds = [
              ...new Set(attendanceLessons.map((lesson) => lesson.classId)),
            ];
          
            // Fetch students who belong to any of the relevant classes
            const attendanceStudents = await prisma.student.findMany({
              where:
                role === "teacher"
                  ? {
                      classId: {
                        in: lessonClassIds,
                      },
                    }
                  : {},
              select: { id: true, name: true, surname: true },
            });
          
            // Pass only the required fields for lessons (id and name)
            const filteredLessons = attendanceLessons.map(({ id, name }) => ({
              id,
              name,
            }));
          
            relatedData = {
              lessons: filteredLessons,
              students: attendanceStudents,
            };
          
            break;
          }
          
        case "event": {
            // Event: fetch classes for events.
            const eventClasses = await prisma.class.findMany({
            select: { id: true, name: true },
            });
            relatedData = { classes: eventClasses };
            break;
        }
        case "announcement": {
            // Announcement: fetch classes for which the announcement applies.
            const announcementClasses = await prisma.class.findMany({
            select: { id: true, name: true },
            });
            relatedData = { classes: announcementClasses };
            break;
        }
        case "parent": {
            // Parent: no extra data needed.
            relatedData = {};
            break;
        }
        case "announcement": {
            const announcementClasses = await prisma.class.findMany({
            select: { id: true, name: true },
            });
            relatedData = { classes: announcementClasses };
            break;
        }          
        default: {
            relatedData = {};
            break;
        }
        }
    }


    return (
        <div>
        <FormModal
            table={table}
            type={type}
            data={data}
            id={id}
            relatedData={relatedData}
        />
        </div>
    );
    };

    export default FormContainer;
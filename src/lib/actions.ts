"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  LessonSchema,
  AssignmentSchema,
  ResultSchema,
  AlumniSchema,
  AnnouncementSchema,
  AttendanceSchema,
  attendanceSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

/* -------------------------------------------------------- */
/* Subject Actions                                          */
/* -------------------------------------------------------- */

// Create a subject, including name, subjectCode, credit, and connecting teachers.
export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        subjectCode: data.subjectCode,
        credit: data.credit,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Update a subject.
export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        subjectCode: data.subjectCode,
        credit: data.credit,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Delete a subject.
export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Class Actions                                            */
/* -------------------------------------------------------- */

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({ data });
    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });
    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Teacher Actions                                          */
/* -------------------------------------------------------- */

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const clerk = await clerkClient();
    const user=await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);
    await prisma.teacher.delete({
      where: { id },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Student Actions                                          */
/* -------------------------------------------------------- */

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        requiredCredits: data.requiredCredits,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        requiredCredits: data.requiredCredits,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);
    await prisma.student.delete({
      where: { id },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Lesson Actions                                           */
/* -------------------------------------------------------- */

// Create a lesson.
export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classId: data.classId,
      },
    });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Update a lesson.
export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classId: data.classId,
      },
    });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Delete a lesson.
export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Assignment Actions                                       */
/* -------------------------------------------------------- */

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Exam Actions                                             */
/* -------------------------------------------------------- */

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: { id: parseInt(id) },
      // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
    });
    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

/* -------------------------------------------------------- */
/* Result Actions                                           */
/* -------------------------------------------------------- */

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId,           // optional
        assignmentId: data.assignmentId, // optional
        studentId: data.studentId,
        subjectId: data.subjectId,
      },
    });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        examId: data.examId,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        subjectId: data.subjectId,
      },
    });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: { id: parseInt(id) },
    });
    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};



/* -------------------------------------------------------- */
/* Alumni Actions                                           */
export const createAlumni = async (
  currentState: any,
  data: AlumniSchema
) => {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: data.username,
      emailAddress: [data.email],
      password: data.password,
      firstName: data.name,
      publicMetadata: { role: "alumni" },
    });

    if (!user.id) throw new Error("Failed to retrieve Clerk user ID");

    await prisma.alumni.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password,
        graduationYear: data.graduationYear,
        currentJob: data.currentJob || null,
        company: data.company || null,
        position: data.position || null,
        bio: data.bio || null,
        phone: data.phone || null,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl: data.githubUrl || null,
        websiteUrl: data.websiteUrl || null,
        twitterUrl: data.twitterUrl || null,
        img: data.img || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Create Alumni Error:", err);
    return { success: false, error: true };
  }
};

export const updateAlumni = async (
  currentState: any,
  data: AlumniSchema
) => {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(data.id!, {
      emailAddress: [data.email],
      ...(data.password && { password: data.password }),
      firstName: data.name,
    });

    await prisma.alumni.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        email: data.email,
        ...(data.password && { password: data.password }), // ✅ only update if present
        graduationYear: data.graduationYear,
        currentJob: data.currentJob || null,
        company: data.company || null,
        position: data.position || null,
        bio: data.bio || null,
        phone: data.phone || null,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl: data.githubUrl || null,
        websiteUrl: data.websiteUrl || null,
        twitterUrl: data.twitterUrl || null,
        img: data.img || null,
      },
    });
    

    return { success: true, error: false };
  } catch (err) {
    console.error("Update Alumni Error:", err);
    return { success: false, error: true };
  }
};

export const deleteAlumni = async (
  currentState: any,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient().users.deleteUser(id);
    await prisma.alumni.delete({ where: { id } });
    revalidatePath("/list/alumni");
    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Alumni Error:", err);
    return { success: false, error: true };
  }
};

export const createEvent = async (currentState: any, data: EventSchema) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Create Event Error:", err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (currentState: any, data: EventSchema) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Update Event Error:", err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (currentState: any, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Event Error:", err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (state: any, data: AnnouncementSchema) => {
  try {
    await prisma.announcement.create({ data });
    return { success: true, error: false };
  } catch (err) {
    console.error("Create Announcement Error:", err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (state: any, data: AnnouncementSchema) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Update Announcement Error:", err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (state: any, formData: FormData) => {
  const id = formData.get("id") as string;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Announcement Error:", err);
    return { success: false, error: true };
  }
};

/* Attendance */
export const createAttendance = async (_: any, data: any) => {
  try {
    const validated = attendanceSchema.parse(data); // ✅ coercion handles string -> boolean
    await prisma.attendance.create({
      data: {
        ...validated,
        date: validated.date, // or validated.date
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Create Attendance Error:", err);
    return { success: false, error: true };
  }
};
export const updateAttendance = async (_: any, data: any) => {
  try {
    const validated = attendanceSchema.parse(data);
    await prisma.attendance.update({
      where: { id: validated.id },
      data: {
        studentId: validated.studentId,
        lessonId: validated.lessonId,
        present: validated.present, // actual boolean now
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Update Attendance Error:", err);
    return { success: false, error: true };
  }
};;


export const deleteAttendance = async (
  currentState: any,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Attendance Error:", err);
    return { success: false, error: true };
  }
};

export const createBulkAttendance = async (_: any, entries: AttendanceSchema[]) => {
  try {
    const validated = entries.map((entry) => attendanceSchema.parse(entry));
    await prisma.attendance.createMany({
      data: validated,
      skipDuplicates: true, // ✅ Prevent duplicate crash
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Bulk Attendance Error:", err);
    return { success: false, error: true };
  }
};

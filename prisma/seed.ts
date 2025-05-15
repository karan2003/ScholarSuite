import { Day, PrismaClient, UserSex } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server"; // adjust import if needed

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  // Clear all tables and restart auto-increment sequences.
  await prisma.$executeRaw`
    TRUNCATE TABLE "Admin", "Grade", "Class", "Subject", "Teacher", "Lesson", "Parent", "Student", "Exam", "Assignment", "Result", "Attendance", "Event", "Announcement" RESTART IDENTITY CASCADE;
  `;

  // -------------------
  // 1. Seed Admins
  // -------------------
  console.log("Seeding Admins...");
  await prisma.admin.createMany({
    data: [
      { id: "admin1", username: "superadmin" },
      { id: "admin2", username: "techlead" },
    ],
  });

  // -------------------
  // 2. Seed Grades (levels 1 to 8)
  // -------------------
  console.log("Seeding Grades...");
  for (let level = 1; level <= 8; level++) {
    await prisma.grade.create({ data: { level } });
  }

  // ----------------------
  // 3. Seed ISE Subjects (only 10 subjects)
  // ----------------------
  console.log("Seeding ISE Subjects...");
  const iseSubjects = [
    "Data Structures",
    "Database Systems",
    "Operating Systems",
    "Software Engineering",
    "Machine Learning",
    "Artificial Intelligence",
    "Web Development",
    "Cloud Computing",
    "Computer Networks",
    "Cybersecurity Basics"
  ];
  const subjectsData = iseSubjects.map((name, index) => ({
    name: name,
    subjectCode: `ISE-${(index + 1).toString().padStart(3, "0")}`,
    credit: 3 + (index % 3),
  }));
  await prisma.subject.createMany({ data: subjectsData, skipDuplicates: true });

  // ----------------------
  // 4. Seed Classes for ISE branch
  // ----------------------
  console.log("Seeding ISE Classes...");
  const iseGradeId = 1; // For simplicity, we assign ISE students to grade 1.
  const classA = await prisma.class.create({
    data: {
      name: "ISE-A",
      capacity: 30,
      gradeId: iseGradeId,
    },
  });
  const classB = await prisma.class.create({
    data: {
      name: "ISE-B",
      capacity: 30,
      gradeId: iseGradeId,
    },
  });
  const classIdMap = { ISE: [classA.id, classB.id] };

  // ----------------------
  // 5. Seed Teachers: Create exactly 5 teachers for ISE
  // ----------------------
  console.log("Seeding ISE Teachers...");
  const teacherNamesISE = [
    { first: "Kunal", last: "Verma" },
    { first: "Ritu", last: "Aggarwal" },
    { first: "Amit", last: "Shah" },
    { first: "Neha", last: "Desai" },
    { first: "Sanjay", last: "Patel" },
  ];
  const teacherIdMap = { ISE: [] as string[] };
  const clerkForTeachers = await clerkClient();
  for (let i = 0; i < teacherNamesISE.length; i++) {
    const uname = `iseteach${i + 1}`;
    // Create Clerk teacher user
    const clerkTeacher = await clerkForTeachers.users.createUser({
      username: uname,
      password: `${uname}@2025`,
      firstName: teacherNamesISE[i].first,
      lastName: teacherNamesISE[i].last,
      publicMetadata: { role: "teacher" },
    });
    // Create teacher record in Prisma
    const teacher = await prisma.teacher.create({
      data: {
        id: clerkTeacher.id,
        username: uname,
        name: teacherNamesISE[i].first,
        surname: teacherNamesISE[i].last,
        email: `${uname}@college.edu`,
        phone: `9090ISE${i + 1}`,
        address: `ISE Department, Campus`,
        bloodType: ["A+", "B+"][i % 2],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1980 + i, 0, 15),
      },
    });
    teacherIdMap.ISE.push(teacher.id);
    // For the first teacher, assign supervisor role for one random class.
    if (i === 0) {
      const randomClassId = classIdMap.ISE[Math.floor(Math.random() * classIdMap.ISE.length)];
      await prisma.class.update({
        where: { id: randomClassId },
        data: { supervisorId: teacher.id },
      });
    }
  }

  // ----------------------
  // 6. Seed Parents: Create exactly 5 parents.
  // ----------------------
  console.log("Seeding ISE Parents...");
  const parentFirstNames = ["Suresh", "Geeta", "Rajesh", "Kavita", "Mahesh"];
  const parentLastNames = ["Sharma", "Verma", "Gupta", "Singh", "Patel"];
  const parentsData = [];
  const clerkForParents = await clerkClient();
  for (let i = 1; i <= 5; i++) {
    const uname = `iseparent${i}`;
    const clerkParent = await clerkForParents.users.createUser({
      username: uname,
      password: `${uname}@2025`,
      firstName: parentFirstNames[i - 1],
      lastName: parentLastNames[i - 1],
      publicMetadata: { role: "parent" },
    });
    parentsData.push({
      id: clerkParent.id,
      username: uname,
      name: parentFirstNames[i - 1],
      surname: parentLastNames[i - 1],
      email: `iseparent${i}@example.com`,
      phone: `987654321${i.toString().padStart(2, "0")}`,
      address: `House No. ${i}, Some Street, City`,
    });
  }
  for (const parent of parentsData) {
    await prisma.parent.create({ data: parent });
  }

  // ----------------------
  // 7. Seed Students: Create exactly 10 students for ISE.
  // ----------------------
  console.log("Seeding ISE Students...");
  const studentFirstNames = ["Rahul", "Aditi", "Karan", "Sneha", "Vivek", "Anjali", "Arvind", "Priya", "Rohit", "Deepa"];
  const studentLastNames = ["Sharma", "Gupta", "Singh", "Patel", "Reddy", "Kumar", "Nair", "Jain", "Desai", "Verma"];
  for (let i = 1; i <= 10; i++) {
    const classIds = classIdMap.ISE;
    const randomClassId = classIds[Math.floor(Math.random() * classIds.length)];
    const firstName = studentFirstNames[Math.floor(Math.random() * studentFirstNames.length)];
    const lastName = studentLastNames[Math.floor(Math.random() * studentLastNames.length)];
    const parentId = parentsData[(i - 1) % parentsData.length].id;
    const uname = `isestud${i}`;
    const clerkForStudents = await clerkClient();
    const clerkStudent = await clerkForStudents.users.createUser({
      username: uname,
      password: `${uname}@2025`,
      firstName: firstName,
      lastName: lastName,
      publicMetadata: { role: "student" },
    });
    await prisma.student.create({
      data: {
        id: clerkStudent.id,
        username: uname,
        name: firstName,
        surname: lastName,
        email: `${uname}@college.edu`,
        phone: `912345678${i.toString().padStart(2, "0")}`,
        address: `Student Hostel, ISE Campus`,
        bloodType: ["A+", "B-", "O+"][i % 3],
        sex: i % 2 === 0 ? UserSex.FEMALE : UserSex.MALE,
        birthday: new Date(2004, (i % 12), 10),
        parentId: parentId,
        gradeId: iseGradeId,
        classId: randomClassId,
        creditDeficiency: 0,
        requiredCredits: 150,
      },
    });
  }

  // ----------------------
  // 8. Seed Lessons: Create only 6 lessons from the first 6 ISE subjects.
  // ----------------------
  console.log("Seeding ISE Lessons...");
  // Retrieve ISE subjects ordered by ID so we can pick the first 6.
  const allISESubjects = await prisma.subject.findMany({
    where: { subjectCode: { startsWith: "ISE-" } },
    orderBy: { id: "asc" },
  });
  const lessonsToSeed = allISESubjects.slice(0, 6);
  for (const subj of lessonsToSeed) {
    const randomClassId = classIdMap.ISE[Math.floor(Math.random() * classIdMap.ISE.length)];
    const randomTeacherId = teacherIdMap.ISE[Math.floor(Math.random() * teacherIdMap.ISE.length)];
    await prisma.lesson.create({
      data: {
        name: subj.name,
        day: Day.MONDAY,
        startTime: new Date(2025, 0, 1, 9, 0),
        endTime: new Date(2025, 0, 1, 10, 30),
        subjectId: subj.id,
        classId: randomClassId,
        teacherId: randomTeacherId,
      },
    });
  }

  // ----------------------
  // 9. Seed Exams & Assignments: For each lesson, create one exam and one assignment.
  // ----------------------
  console.log("Seeding Exams & Assignments...");
  const lessons = await prisma.lesson.findMany();
  for (const lesson of lessons) {
    await prisma.exam.create({
      data: {
        title: `${lesson.name} Exam`,
        startTime: new Date(2025, 5, 1, 9, 0),
        endTime: new Date(2025, 5, 1, 11, 0),
        lessonId: lesson.id,
      },
    });
    await prisma.assignment.create({
      data: {
        title: `${lesson.name} Assignment 1`,
        startDate: new Date(2025, 0, 1),
        dueDate: new Date(2025, 0, 15),
        lessonId: lesson.id,
      },
    });
  }

  // ----------------------
  // 10. Seed Results: Create 5 results for each student.
  // ----------------------
  console.log("Seeding Results...");
  const studentsDB = await prisma.student.findMany();
  const examsArr = await prisma.exam.findMany();
  const assignmentsArr = await prisma.assignment.findMany();
  const lessonsAll = await prisma.lesson.findMany({
    include: { subject: true },
  });
  for (const student of studentsDB) {
    for (let i = 0; i < 5; i++) {
      const isExam = Math.random() > 0.5;
      const score = Math.floor(60 + Math.random() * 40);
      const randomLesson = lessonsAll[Math.floor(Math.random() * lessonsAll.length)];
      await prisma.result.create({
        data: {
          score,
          studentId: student.id,
          ...(isExam
            ? { examId: examsArr[Math.floor(Math.random() * examsArr.length)].id }
            : { assignmentId: assignmentsArr[Math.floor(Math.random() * assignmentsArr.length)].id }),
          subjectId: randomLesson.subjectId,
        },
      });
    }
  }

  // ----------------------
  // 11. Seed Attendance: Create 5 attendance records.
  // ----------------------
  console.log("Seeding Attendance...");
  const allStudents = await prisma.student.findMany();
  for (let i = 1; i <= 5; i++) {
    const randomStudent = allStudents[Math.floor(Math.random() * allStudents.length)];
    await prisma.attendance.create({
      data: {
        date: new Date(2025, 7, (i % 28) + 1),
        present: i % 5 !== 0,
        studentId: randomStudent.id,
        lessonId: lessons[(i - 1) % lessons.length].id,
      },
    });
  }

  // ----------------------
  // 12. Seed Event & Announcement: Create 1 event and 1 announcement.
  // ----------------------
  console.log("Seeding Event & Announcement...");
  const classIds = Object.values(classIdMap).flat();
  const randomClassForEvent = classIds[Math.floor(Math.random() * classIds.length)];
  await prisma.event.create({
    data: {
      title: `ISE Workshop`,
      description: `ISE Hands-on Lab Session`,
      startTime: new Date(2025, 7, 21, 14, 0),
      endTime: new Date(2025, 7, 21, 16, 0),
      classId: randomClassForEvent,
    },
  });
  await prisma.announcement.create({
    data: {
      title: `ISE Notice`,
      description: `Important ISE class update`,
      date: new Date(2025, 7, 16),
      classId: randomClassForEvent,
    },
  });

  console.log("ISE seeding completed successfully!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
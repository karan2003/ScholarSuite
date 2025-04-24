import { Day, PrismaClient, UserSex } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ADMIN
  await prisma.admin.createMany({
    data: [
      { id: "admin1", username: "superadmin" },
      { id: "admin2", username: "techlead" },
    ],
  });

  // GRADE
  for (let level = 1; level <= 6; level++) {
    await prisma.grade.create({
      data: { level },
    });
  }

  // CLASS
  const classNames = ["CE-A", "CE-B", "ME-A", "ME-B", "EE-A", "EE-B"];
  for (let i = 0; i < classNames.length; i++) {
    await prisma.class.create({
      data: {
        name: classNames[i],
        gradeId: (i % 6) + 1,
        capacity: 30,
      },
    });
  }

  // SUBJECTS (Engineering Courses)
  const subjectData = [
    { name: "Engineering Mathematics I", subjectCode: "ENGR101", credit: 5 },
    { name: "Engineering Physics",       subjectCode: "ENGR102", credit: 4 },
    { name: "Chemistry for Engineers",  subjectCode: "ENGR103", credit: 4 },
    { name: "Basic Electrical",          subjectCode: "ENGR104", credit: 3 },
    { name: "Engineering Mechanics",    subjectCode: "ENGR201", credit: 5 },
    { name: "Programming in C",         subjectCode: "ENGR202", credit: 4 },
    { name: "Digital Logic Design",     subjectCode: "ENGR203", credit: 3 },
    { name: "Mechanics of Materials",   subjectCode: "ENGR204", credit: 3 },
    { name: "Thermodynamics",           subjectCode: "ENGR301", credit: 4 },
    { name: "Data Structures",          subjectCode: "ENGR302", credit: 4 },
  ];
  await prisma.subject.createMany({ data: subjectData });

  // TEACHERS
  const teacherNames = ["Alice Chen", "Bob Kumar", "Carlos Lopez", "Dana Singh", "Eliot Zhang"];
  for (let i = 1; i <= teacherNames.length; i++) {
    const [first, last] = teacherNames[i - 1].split(" ");
    await prisma.teacher.create({
      data: {
        id: `TCHR${100 + i}`,
        username: `tchr${100 + i}`,
        name: first,
        surname: last,
        email: `tchr${100 + i}@college.edu`,
        phone: `555-01${i.toString().padStart(2, '0')}`,
        address: `Engineering Block, Campus`,
        bloodType: ["A+","B+","O-","AB+","A-"][i % 5],
        sex: i % 2 === 0 ? UserSex.FEMALE : UserSex.MALE,
        birthday: new Date(1980 + i, 0, 15),
        subjects: {
          connect: [{ id: ((i - 1) % subjectData.length) + 1 }],
        },
        classes: {
          connect: [{ id: ((i - 1) % classNames.length) + 1 }],
        },
      },
    });
  }

  // LESSONS
  for (let i = 1; i <= 20; i++) {
    const classIndex = (i - 1) % classNames.length;
    await prisma.lesson.create({
      data: {
        name: `Lec${i}`,
        day: Day[Object.keys(Day)[(i - 1) % 5] as keyof typeof Day],
        startTime: new Date(2025, 7, i, 9, 0),
        endTime:   new Date(2025, 7, i, 10, 30),
        subjectId: ((i - 1) % subjectData.length) + 1,
        classId: classIndex + 1,
        teacherId: `TCHR${100 + (i - 1) % teacherNames.length + 1}`,
      },
    });
  }

  // PARENTS
  for (let i = 1; i <= 40; i++) {
    await prisma.parent.create({
      data: {
        id: `PRNT${200 + i}`,
        username: `prnt${200 + i}`,
        name: `Parent${i}`,
        surname: `Surname${i}`,
        email: `parent${i}@example.com`,
        phone: `555-02${i.toString().padStart(2, '0')}`,
        address: `Residence ${i}`,
      },
    });
  }

  // STUDENTS
  for (let i = 1; i <= 60; i++) {
    await prisma.student.create({
      data: {
        id: `STUD${300 + i}`,
        username: `stud${300 + i}`,
        name: `Student${i}`,
        surname: `Eng${i}`,
        email: `stud${i}@college.edu`,
        phone: `555-03${i.toString().padStart(2, '0')}`,
        address: `Hostel ${Math.ceil(i/10)}`,
        bloodType: ["A+","B-","O+","AB-","O-"][i % 5],
        sex: i % 2 === 0 ? UserSex.FEMALE : UserSex.MALE,
        birthday: new Date(2004, (i % 12), 10),
        parentId: `PRNT${200 + ((i - 1) % 40) + 1}`,
        gradeId: ((i - 1) % 6) + 1,
        classId: ((i - 1) % classNames.length) + 1,
        creditDeficiency: 0,
      },
    });
  }

  // EXAMS
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(2025, 8, i, 11, 0),
        endTime:   new Date(2025, 8, i, 12, 30),
        lessonId: (i % 20) + 1,
      },
    });
  }

  // ASSIGNMENTS
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(2025, 7, i),
        dueDate:   new Date(2025, 7, i + 7),
        lessonId: (i % 20) + 1,
      },
    });
  }

  // RESULTS
  for (let i = 1; i <= 15; i++) {
    const score = Math.floor(50 + Math.random() * 50);
    const lessonIndex = (i - 1) % 20 + 1;
    // determine subject from lesson
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonIndex }, select: { subjectId: true } });
    await prisma.result.create({
      data: {
        score,
        studentId: `STUD${300 + ((i - 1) % 60) + 1}`,
        ...(i <= 7 ? { examId: i } : { assignmentId: i - 7 }),
        subjectId: lesson!.subjectId,
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 30; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(2025, 7, (i % 28) + 1),
        present: i % 5 !== 0,
        studentId: `STUD${300 + ((i - 1) % 60) + 1}`,
        lessonId: (i - 1) % 20 + 1,
      },
    });
  }

  // EVENTS & ANNOUNCEMENTS
  for (let i = 1; i <= 3; i++) {
    await prisma.event.create({
      data: {
        title: `Workshop ${i}`,
        description: `Hands-on session for Lab`,
        startTime: new Date(2025, 7, 20 + i, 14, 0),
        endTime:   new Date(2025, 7, 20 + i, 16, 0),
        classId: (i % classNames.length) + 1,
      },
    });

    await prisma.announcement.create({
      data: {
        title: `Notice ${i}`,
        description: `Important update for class`,
        date: new Date(2025, 7, 15 + i),
        classId: (i % classNames.length) + 1,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

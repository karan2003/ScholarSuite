import { z } from "zod";


export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  subjectCode: z.string().min(1, { message: "Subject code is required!" }),
  credit: z.coerce.number().min(1, { message: "Credit must be at least 1" }),
  teachers: z.array(z.string()).optional(), // list of teacher IDs
});

export type SubjectSchema = z.infer<typeof subjectSchema>;
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters long!" }).max(20, { message: "Username must be at most 20 characters long!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }).optional().or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
  requiredCredits: z.coerce.number().min(1, {
    message: "Required Credits must be at least 1!",
  }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;


// formValidationSchemas.txt updates
export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number({ required_error: "Score is required" })
    .min(0, { message: "Score must be ≥ 0" })
    .max(100, { message: "Score must be ≤ 100" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.coerce.number({ required_error: "Subject is required" }),
}).refine(data => data.examId || data.assignmentId, {
  message: "Either exam or assignment must be selected",
  path: ["examId"]
});

export const lessonSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Lesson name is required!" }),
    day: z.enum(
      ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      { message: "Day is required!" }
    ),
    startTime: z.coerce.date({ message: "Start time is required!" }),
    endTime: z.coerce.date({ message: "End time is required!" }),
    subjectId: z
      .coerce.number({ required_error: "Subject is required!" })
      .min(1, { message: "Subject must be selected!" }),
    teacherId: z.string().min(1, { message: "Teacher is required!" }),
    classId: z
      .coerce.number({ required_error: "Class is required!" })
      .min(1, { message: "Class must be selected!" }),
  })
  // Optional: Uncomment the below refinement to ensure startTime is before endTime.
  // .refine(data => data.startTime < data.endTime, {
  //   message: "Start time must be before end time",
  //   path: ["startTime"],
  // });

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z
  .object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Assignment title is required!" }),
    startDate: z.coerce.date({ message: "Start date is required!" }),
    dueDate: z.coerce.date({ message: "Due date is required!" }),
    lessonId: z.coerce.number({ required_error: "Lesson is required!" }).min(1, { message: "Lesson must be selected!" }),
  })
  .refine((data) => data.startDate < data.dueDate, {
    message: "Start date must be before due date",
    path: ["startDate"],
  });
export type AssignmentSchema = z.infer<typeof assignmentSchema>;



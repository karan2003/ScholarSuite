import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = await auth();

  // Retrieve all classes where the student is enrolled.
  const classes = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  // If no class is found, display a fallback message.
  if (!classes || classes.length === 0) {
    return (
      <div className="p-4">
        <p className="text-lg text-gray-600">No class found for this student.</p>
      </div>
    );
  }

  // Use the first class for the schedule.
  const studentClass = classes[0];

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT: Student's Schedule */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-4">
            Schedule ({studentClass.name})
          </h1>
          <BigCalendarContainer
            type="classId"
            id={studentClass.id}
            className="h-[500px]"
          />
        </div>
      </div>
      {/* RIGHT: Event Calendar & Announcements */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-md shadow">
          <EventCalendar />
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
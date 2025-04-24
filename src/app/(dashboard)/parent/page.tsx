import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async () => {
  const { userId } = await auth();
  const currentUserId = userId;

  // Fetch all students for the currently authenticated parent.
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="p-4">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-gray-600">
          View your children's class schedules and the latest announcements.
        </p>
      </div>
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* LEFT COLUMN: Students' Schedules */}
        <div className="w-full xl:w-2/3 space-y-4">
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.id} className="bg-white rounded-md shadow-sm">
                <div className="p-4">
                  <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    Schedule for {student.name} {student.surname}
                  </h1>
                  <BigCalendarContainer
                    type="classId"
                    id={student.classId}
                    className="h-[500px]"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="text-gray-600">
                No student schedules available.
              </p>
            </div>
          )}
        </div>
        {/* RIGHT COLUMN: Announcements */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
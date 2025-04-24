import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = async () => {
  const { userId } = await auth();

  return (
    <div className="p-4">
      {/* Dashboard Header */}
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="flex gap-4 flex-col xl:flex-row">
        {/* LEFT COLUMN: Schedule */}
        <div className="w-full xl:w-2/3">
          <div className="bg-white p-4 rounded-md shadow-md h-full">
            <h2 className="text-xl font-semibold mb-4">Schedule</h2>
            <BigCalendarContainer
              type="teacherId"
              id={userId!}
              className="h-[500px]"
            />
          </div>
        </div>
        {/* RIGHT COLUMN: Announcements */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <div className="bg-white p-4 rounded-md shadow-md">
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
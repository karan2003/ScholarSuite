import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async () => {
  const { userId } = auth();
  const currentUserId = userId;
  
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 space-y-4">
        {students.map((student) => (
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
        ))}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
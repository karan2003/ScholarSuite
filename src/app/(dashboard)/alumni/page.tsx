import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Alumni } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";

const AlumniDashboardPage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  const alumni: Alumni | null = await prisma.alumni.findUnique({
    where: { id: userId },
  });

  if (!alumni) return notFound();

  return (
    <div className="flex justify-center p-6 bg-gradient-to-br from-blue-50 to-sky-100 min-h-screen">
      <div className="w-full max-w-screen-lg flex flex-col gap-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-6">
          <Image
            src={alumni.img || "/noAvatar.png"}
            alt="Profile Image"
            width={120}
            height={120}
            className="rounded-full border-4 border-blue-200 shadow"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-blue-900">Welcome, {alumni.name}</h1>
            <p className="text-sm text-gray-500">Graduated: {alumni.graduationYear}</p>
            <p className="text-sm text-gray-600">{alumni.position} at {alumni.company}</p>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Contact Info</h2>
            <p><strong>Email:</strong> {alumni.email}</p>
            <p><strong>Phone:</strong> {alumni.phone || "-"}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Job Info</h2>
            <p><strong>Current Job:</strong> {alumni.currentJob || "-"}</p>
            <p><strong>Company:</strong> {alumni.company || "-"}</p>
            <p><strong>Position:</strong> {alumni.position || "-"}</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">About You</h2>
          <p className="text-gray-700 text-sm whitespace-pre-line">{alumni.bio || "You haven’t added a bio yet."}</p>
        </div>

        {/* Update Profile */}
        <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">Update Your Profile</h2>
          <FormContainer table="alumni" type="update" data={alumni} />
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboardPage;
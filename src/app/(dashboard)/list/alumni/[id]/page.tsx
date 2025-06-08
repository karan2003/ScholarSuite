import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Alumni } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleAlumniPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const alumni: Alumni | null = await prisma.alumni.findUnique({
    where: { id },
  });

  if (!alumni) return notFound();

  const isEditable = role === "admin" || role === "alumni";

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-screen-xl flex flex-col xl:flex-row gap-4">
        {/* LEFT COLUMN */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Alumni Info Card */}
            <div className="bg-sky-50 py-6 px-4 rounded-md flex-1 flex gap-4 shadow-md">
              <div className="w-1/3">
                <Image
                  src={alumni.img || "/noAvatar.png"}
                  alt="Alumni Avatar"
                  width={144}
                  height={144}
                  className="w-36 h-36 rounded-full object-cover"
                />
              </div>
              <div className="w-2/3 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold">{alumni.name}</h1>
                  {isEditable && (
                    <FormContainer table="alumni" type="update" data={alumni} />
                  )}
                </div>
                <p className="text-sm text-gray-500">{alumni.bio || "-"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  <div><strong>Email:</strong> {alumni.email}</div>
                  <div><strong>Phone:</strong> {alumni.phone || "-"}</div>
                  <div><strong>Current Job:</strong> {alumni.currentJob || "-"}</div>
                  <div><strong>Company:</strong> {alumni.company || "-"}</div>
                  <div><strong>Position:</strong> {alumni.position || "-"}</div>
                  <div><strong>Graduation Year:</strong> {alumni.graduationYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[120px]">
            <div className="bg-white p-6 rounded-md flex items-center gap-4 shadow">
              <Image src="/singleBranch.png" alt="Job" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">{alumni.company || "-"}</h1>
                <span className="text-sm text-gray-400">
                  Current Job
                  <div>
                    <h1 className="text-xl font-semibold">{alumni.position || "-"}</h1>
                  </div>
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-md flex items-center gap-4 shadow">
              <Image src="/calendar.png" alt="Graduation" width={24} height={24} />
              <div>
                <h1 className="text-xl font-semibold">{alumni.graduationYear}</h1>
                <span className="text-sm text-gray-400">Graduation Year</span>
              </div>
            </div>
          </div>

          {/* Explore More */}
          <div className="bg-white rounded-md p-6 shadow">
            <h1 className="text-xl font-semibold mb-4">Explore More</h1>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
              <Link
                className="p-3 rounded-md bg-blue-50 text-center hover:underline"
                href={`/list/alumni?batch=${alumni.graduationYear}`}
              >
                View Batchmates
              </Link>
              <Link
                className="p-3 rounded-md bg-blue-50 text-center hover:underline"
                href={`/alumni-network?alumniId=${alumni.id}`}
              >
                Alumni Network
              </Link>
            </div>
          </div>

          {/* Connect Option */}
          <div className="bg-white rounded-md p-6 shadow">
            <h1 className="text-xl font-semibold mb-4">Connect</h1>
            <a
              href={`mailto:${alumni.email}`}
              className="p-3 rounded-md bg-green-100 text-center text-sm text-green-800 hover:underline block"
            >
              Send Mail to {alumni.name.split(" ")[0]}
            </a>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full xl:w-1/3 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-md shadow">
            <h1 className="text-xl font-semibold mb-4">Shortcuts</h1>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
              {alumni.linkedinUrl && (
                <Link
                  className="p-3 rounded-md bg-lamaSkyLight text-center"
                  href={alumni.linkedinUrl}
                  target="_blank"
                >
                  LinkedIn
                </Link>
              )}
              {alumni.githubUrl && (
                <Link
                  className="p-3 rounded-md bg-lamaPurpleLight text-center"
                  href={alumni.githubUrl}
                  target="_blank"
                >
                  GitHub
                </Link>
              )}
              {alumni.websiteUrl && (
                <Link
                  className="p-3 rounded-md bg-lamaYellowLight text-center"
                  href={alumni.websiteUrl}
                  target="_blank"
                >
                  Website
                </Link>
              )}
              {alumni.twitterUrl && (
                <Link
                  className="p-3 rounded-md bg-pink-50 text-center"
                  href={alumni.twitterUrl}
                  target="_blank"
                >
                  Twitter
                </Link>
              )}
            </div>
          </div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default SingleAlumniPage;

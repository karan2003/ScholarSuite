import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Alumni, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const AlumniListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Graduation Year", accessor: "graduationYear" },
    { header: "Job", accessor: "currentJob" },
    { header: "Company", accessor: "company" },
    { header: "Phone", accessor: "phone", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (alumni: Alumni) => (
    <tr
      key={alumni.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={alumni.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{alumni.name}</h3>
          <p className="text-xs text-gray-500">{alumni.email}</p>
        </div>
      </td>
      <td>{alumni.graduationYear}</td>
      <td>{alumni.currentJob || "-"}</td>
      <td>{alumni.company || "-"}</td>
      <td className="hidden md:table-cell">{alumni.phone || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/alumni/${alumni.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="alumni" type="delete" id={alumni.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AlumniWhereInput = {};
  if (queryParams.search) {
    query.name = { contains: queryParams.search, mode: "insensitive" };
  }

  const [data, count] = await prisma.$transaction([
    prisma.alumni.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.alumni.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-lg font-semibold">All Alumni</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex gap-2 sm:gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && (
              <div className="shrink-0">
                <FormContainer table="alumni" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-4">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AlumniListPage;

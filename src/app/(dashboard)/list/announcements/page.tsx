import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Announcement, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AnnouncementList = Announcement & { class: Class | null };

const AnnouncementListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.class?.name || "-"}</td>
      <td className="md:table-cell">{new Intl.DateTimeFormat("en-GB").format(item.date)}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams.search) {
    query.title = { contains: queryParams.search, mode: "insensitive" };
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      orderBy: { date: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {role === "admin" && <FormContainer table="announcement" type="create" />}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;

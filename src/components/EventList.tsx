    import prisma from "@/lib/prisma";

    const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
    const date = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const data = await prisma.event.findMany({
        where: {
        startTime: {
            gte: startOfDay,
            lte: endOfDay,
        },
        },
        orderBy: {
        startTime: "asc",
        },
    });

    if (data.length === 0) {
        return (
        <div className="p-4 text-sm text-gray-500 italic text-center">
            No events scheduled for this day.
        </div>
        );
    }

    return (
        <div className="space-y-4">
        {data.map((event, i) => (
            <div
            key={event.id}
            className={`relative p-5 rounded-xl border shadow-sm transition duration-300 hover:shadow-md group ${
                i % 2 === 0 ? "border-l-4 border-lamaSky" : "border-l-4 border-lamaPurple"
            } bg-white`}
            >
            <div className="flex justify-between items-start">
                <h2 className="text-md md:text-lg font-semibold text-gray-800 group-hover:text-lamaPurple">
                {event.title}
                </h2>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md shadow-sm">
                {event.startTime.toLocaleTimeString("en-UK", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{event.description}</p>
            </div>
        ))}
        </div>
    );
    };

    export default EventList;

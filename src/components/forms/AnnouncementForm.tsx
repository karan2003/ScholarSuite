    "use client";

    import { zodResolver } from "@hookform/resolvers/zod";
    import { useForm } from "react-hook-form";
    import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
    import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
    import { useFormState } from "react-dom";
    import { Dispatch, SetStateAction, useEffect } from "react";
    import { toast } from "react-toastify";
    import { useRouter } from "next/navigation";

    const AnnouncementForm = ({
    type,
    data,
    setOpen,
    relatedData,
    }: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
    }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AnnouncementSchema>({
        resolver: zodResolver(announcementSchema),
    });

    const [state, formAction] = useFormState(
        type === "create" ? createAnnouncement : updateAnnouncement,
        { success: false, error: false }
    );

    const onSubmit = handleSubmit((formData) => formAction(formData));

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
        toast.success(`Announcement ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
        router.refresh();
        }
    }, [state, router, setOpen, type]);

    const { classes } = relatedData;

    return (
        <form
        onSubmit={onSubmit}
        className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-white via-slate-50 to-white border border-gray-200 rounded-2xl shadow-xl"
        >
        <h1 className="text-3xl font-bold text-bluebag">
            {type === "create" ? "📣 New Announcement" : "✏️ Edit Announcement"}
        </h1>

        {/* Title */}
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-semibold">📌 Title</label>
            <input
            type="text"
            {...register("title")}
            defaultValue={data?.title}
            placeholder="Enter announcement title"
            className="w-full ring-1 ring-gray-300 p-3 rounded-md text-sm focus:ring-2 focus:ring-lamaSky transition bg-white"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-semibold">📝 Description</label>
            <textarea
            {...register("description")}
            defaultValue={data?.description}
            rows={3}
            placeholder="Write a short description"
            className="w-full ring-1 ring-gray-300 p-3 rounded-md text-sm focus:ring-2 focus:ring-lamaPurple transition bg-white resize-none"
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-semibold">📅 Date</label>
            <input
            type="date"
            {...register("date")}
            defaultValue={data?.date?.split("T")[0]}
            className="w-full ring-1 ring-gray-300 p-3 rounded-md text-sm focus:ring-2 focus:ring-lamaSky transition bg-white"
            />
            {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
        </div>

        {/* Class */}
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 font-semibold">🏫 Class (optional)</label>
            <select
            {...register("classId")}
            defaultValue={data?.classId || ""}
            className="w-full ring-1 ring-gray-300 p-3 rounded-md text-sm focus:ring-2 focus:ring-lamaYellow transition bg-white"
            >
            <option value="">Select Class</option>
            {classes?.map((cls: { id: number; name: string }) => (
                <option key={cls.id} value={cls.id}>
                {cls.name}
                </option>
            ))}
            </select>
            {errors.classId && <p className="text-xs text-red-400">{errors.classId.message}</p>}
        </div>

        {state.error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 border border-red-200 p-3 rounded-md">
            ❌ Something went wrong. Please try again.
            </div>
        )}

        <button
            type="submit"
            className="bg-gradient-to-r from-tb to-lamaPurple text-white font-semibold py-3 rounded-xl hover:brightness-110 transition w-full shadow-md"
        >
            {type === "create" ? "📣 Create Announcement" : "💾 Update Announcement"}
        </button>
        </form>
    );
    };

    export default AnnouncementForm;

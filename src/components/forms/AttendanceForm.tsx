    "use client";

    import { zodResolver } from "@hookform/resolvers/zod";
    import { useForm } from "react-hook-form";
    import { AttendanceSchema, attendanceSchema } from "@/lib/formValidationSchemas";
    import { createAttendance, updateAttendance } from "@/lib/actions";
    import { Dispatch, SetStateAction, useState } from "react";
    import { toast } from "react-toastify";
    import { useRouter } from "next/navigation";

    const AttendanceForm = ({
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
    } = useForm<AttendanceSchema>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
        ...data,
        present: data?.present ?? false,
        },
    });

    const router = useRouter();

    // Local state to explicitly track value
    const [presentValue, setPresentValue] = useState(
        data?.present ?? false
    );

    const onSubmit = async (formData: AttendanceSchema) => {
        const action = type === "create" ? createAttendance : updateAttendance;

        const payload = {
        ...formData,
        present: presentValue, // explicitly submit state boolean
        };

        console.log("📦 Submitting payload:", payload);

        const res = await action(null, payload);
        if (res.success) {
        toast(`${type === "create" ? "Created" : "Updated"} successfully!`);
        setOpen(false);
        router.refresh();
        } else {
        toast.error("Something went wrong!");
        }
    };

    const { students, lessons } = relatedData;

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-xl font-semibold">
            {type === "create" ? "Create Attendance" : "Update Attendance"}
        </h1>

        <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1 w-full md:w-1/2">
            <label className="text-sm">Student</label>
            <select {...register("studentId")} className="p-2 border rounded-md">
                <option value="">Select student</option>
                {students?.map((s: any) => (
                <option key={s.id} value={s.id}>
                    {s.name} {s.surname}
                </option>
                ))}
            </select>
            {errors.studentId && (
                <span className="text-xs text-red-500">{errors.studentId.message}</span>
            )}
            </div>

            <div className="flex flex-col gap-1 w-full md:w-1/2">
            <label className="text-sm">Lesson</label>
            <select {...register("lessonId")} className="p-2 border rounded-md">
                <option value="">Select lesson</option>
                {lessons?.map((l: any) => (
                <option key={l.id} value={l.id}>
                    {l.name}
                </option>
                ))}
            </select>
            {errors.lessonId && (
                <span className="text-xs text-red-500">{errors.lessonId.message}</span>
            )}
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Attendance Status</label>
            <div className="flex items-center gap-4">
            <label className="flex items-center gap-1">
                <input
                type="radio"
                name="present"
                checked={presentValue === true}
                onChange={() => setPresentValue(true)}
                />
                Present
            </label>
            <label className="flex items-center gap-1">
                <input
                type="radio"
                name="present"
                checked={presentValue === false}
                onChange={() => setPresentValue(false)}
                />
                Absent
            </label>
            </div>
        </div>

        {data?.id && <input type="hidden" {...register("id")} value={data.id} />}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            {type === "create" ? "Create" : "Update"}
        </button>
        </form>
    );
    };

    export default AttendanceForm;

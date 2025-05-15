    "use client";

    import { zodResolver } from "@hookform/resolvers/zod";
    import { useForm } from "react-hook-form";
    import InputField from "../InputField";
    import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
    import { createLesson, updateLesson } from "@/lib/actions";
    import { useFormState } from "react-dom";
    import { Dispatch, SetStateAction, useEffect } from "react";
    import { toast } from "react-toastify";
    import { useRouter } from "next/navigation";

    const LessonForm = ({
    type,
    data,
    setOpen,
    relatedData,
    }: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: {
        subjects: Array<{ id: number; name: string; subjectCode: string }>;
        teachers: Array<{ id: string; name: string; surname: string }>;
        classes: Array<{ id: number; name: string }>;
    };
    }) => {
    // Set default values for the lesson form.
    // For date fields, convert the Date object or ISO string to a format that the datetime-local input expects.
    const { register, handleSubmit, formState: { errors } } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
        name: data?.name || "",
        day: data?.day || "",
        startTime: data?.startTime
            ? new Date(data.startTime).toISOString().substring(0, 16)
            : "",
        endTime: data?.endTime
            ? new Date(data.endTime).toISOString().substring(0, 16)
            : "",
        subjectId: data?.subjectId || "",
        teacherId: data?.teacherId || "",
        classId: data?.classId || "",
        ...(data?.id ? { id: data.id } : {}),
        },
    });

    // Handle form action (create/update) using the provided functions.
    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson,
        { success: false, error: false }
    );

    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        console.log("Submitted form data:", formData);
        // Create a shallow copy of the form data. Remove "id" key if it is undefined.
        const payload = { ...formData };
        if (payload.id === undefined) {
        delete payload.id;
        }
        formAction(payload);
    });

    useEffect(() => {
        if (state.success) {
        toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
        }
    }, [state, router, type, setOpen]);

    // Destructure the related data used for select menus
    const { subjects, teachers, classes } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
            {type === "create" ? "Create a new lesson" : "Update the lesson"}
        </h1>

        <div className="flex justify-between flex-wrap gap-4">
            {/* Lesson Name */}
            <InputField
            label="Lesson Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            />

            {/* Day select field */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Day</label>
            <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("day")}
                defaultValue={data?.day}
            >
                <option value="">Select Day</option>
                <option value="MONDAY">MONDAY</option>
                <option value="TUESDAY">TUESDAY</option>
                <option value="WEDNESDAY">WEDNESDAY</option>
                <option value="THURSDAY">THURSDAY</option>
                <option value="FRIDAY">FRIDAY</option>
            </select>
            {errors.day?.message && (
                <p className="text-xs text-red-400">
                {errors.day.message.toString()}
                </p>
            )}
            </div>

            {/* Start Time */}
            <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            defaultValue={
                data?.startTime
                ? new Date(data.startTime).toISOString().substring(0, 16)
                : ""
            }
            register={register}
            error={errors?.startTime}
            />

            {/* End Time */}
            <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            defaultValue={
                data?.endTime
                ? new Date(data.endTime).toISOString().substring(0, 16)
                : ""
            }
            register={register}
            error={errors?.endTime}
            />

            {/* Render Id only in update mode */}
            {data && data.id && (
            <InputField
                label="Id"
                name="id"
                defaultValue={data?.id}
                register={register}
                error={errors?.id}
                hidden
            />
            )}

            {/* Subject select field */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subject</label>
            <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("subjectId")}
                defaultValue={data?.subjectId}
            >
                <option value="">Select Subject</option>
                {subjects &&
                subjects.map((subject: { id: number; name: string; subjectCode: string }) => (
                    <option value={subject.id} key={subject.id}>
                    {subject.name} ({subject.subjectCode})
                    </option>
                ))}
            </select>
            {errors.subjectId?.message && (
                <p className="text-xs text-red-400">
                {errors.subjectId.message.toString()}
                </p>
            )}
            </div>

            {/* Teacher select field */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Teacher</label>
            <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("teacherId")}
                defaultValue={data?.teacherId}
            >
                <option value="">Select Teacher</option>
                {teachers &&
                teachers.map(
                    (teacher: { id: string; name: string; surname: string }) => (
                    <option value={teacher.id} key={teacher.id}>
                        {teacher.name} {teacher.surname}
                    </option>
                    )
                )}
            </select>
            {errors.teacherId?.message && (
                <p className="text-xs text-red-400">
                {errors.teacherId.message.toString()}
                </p>
            )}
            </div>

            {/* Class select field */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("classId")}
                defaultValue={data?.classId}
            >
                <option value="">Select Class</option>
                {classes &&
                classes.map((clas: { id: number; name: string }) => (
                    <option value={clas.id} key={clas.id}>
                    {clas.name}
                    </option>
                ))}
            </select>
            {errors.classId?.message && (
                <p className="text-xs text-red-400">
                {errors.classId.message.toString()}
                </p>
            )}
            </div>
        </div>

        {state.error && (
            <span className="text-red-500">Something went wrong!</span>
        )}

        <button className="bg-blue-400 text-white p-2 rounded-md">
            {type === "create" ? "Create" : "Update"}
        </button>
        </form>
    );
    };

    export default LessonForm;
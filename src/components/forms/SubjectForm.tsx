    "use client";

    import { zodResolver } from "@hookform/resolvers/zod";
    import { useForm } from "react-hook-form";
    import InputField from "../InputField";
    import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
    import { createSubject, updateSubject } from "@/lib/actions";
    import { useFormState } from "react-dom";
    import { Dispatch, SetStateAction, useEffect } from "react";
    import { toast } from "react-toastify";
    import { useRouter } from "next/navigation";

    const SubjectForm = ({
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
    // Set defaultValues so that keys (even if empty) are always sent
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
        name: data?.name || "",
        subjectCode: data?.subjectCode || "",
        credit: data?.credit || 0,
        teachers: data?.teachers || [],
        // Only include id if it is provided
        ...(data?.id ? { id: data.id } : {}),
        },
    });

    // Use useFormState from react-dom for handling the create/update action.
    const [state, formAction] = useFormState(
        type === "create" ? createSubject : updateSubject,
        { success: false, error: false }
    );

    const onSubmit = handleSubmit((formData) => {
        console.log("Submitted form data:", formData);
        // Create a shallow copy and remove keys with undefined values (especially id)
        const payload = { ...formData };
        if (payload.id === undefined) {
        delete payload.id;
        }
        formAction(payload);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
        toast(
            `Subject has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { teachers } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
            {type === "create" ? "Create a new subject" : "Update the subject"}
        </h1>

        <div className="flex justify-between flex-wrap gap-4">
            {/* Subject Name */}
            <InputField
            label="Subject name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            />

            {/* Subject Code */}
            <InputField
            label="Subject Code"
            name="subjectCode"
            defaultValue={data?.subjectCode}
            register={register}
            error={errors?.subjectCode}
            />

            {/* Credit */}
            <InputField
            label="Credit"
            name="credit"
            type="number"
            defaultValue={data?.credit}
            register={register}
            error={errors?.credit}
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

            {/* Teachers multi-select field */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Teachers</label>
            <select
            multiple
            size={5} // Shows 5 rows
            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white overflow-y-auto h-auto max-h-52"
            {...register("teachers")}
            defaultValue={data?.teachers}
        >
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
            <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
            </option>
            ))}
        </select>
            {errors.teachers?.message && (
                <p className="text-xs text-red-400">
                {errors.teachers.message.toString()}
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

    export default SubjectForm;
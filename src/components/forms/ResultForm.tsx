    "use client";

    import { zodResolver } from "@hookform/resolvers/zod";
    import { useForm, useWatch } from "react-hook-form";
    import InputField from "../InputField";
    import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
    import { createResult, updateResult } from "@/lib/actions";
    import { useFormState } from "react-dom";
    import { Dispatch, SetStateAction, useEffect } from "react";
    import { toast } from "react-toastify";
    import { useRouter } from "next/navigation";

    const ResultForm = ({
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
        control,
        setValue,
        formState: { errors },
    } = useForm<ResultSchema>({
        resolver: zodResolver(resultSchema),
        defaultValues: {
        score: data?.score || 0,
        examId: data?.examId || undefined,
        assignmentId: data?.assignmentId || undefined,
        studentId: data?.studentId || "",
        subjectId: data?.subjectId || "",
        },
    });

    const [state, formAction] = useFormState(
        type === "create" ? createResult : updateResult,
        { success: false, error: false }
    );

    const router = useRouter();
    const examId = useWatch({ control, name: "examId" });
    const assignmentId = useWatch({ control, name: "assignmentId" });

    useEffect(() => {
        const setSubjectFromAssessment = async () => {
        if (examId) {
            const selectedExam = relatedData.exams.find((e: any) => e.id === Number(examId));
            if (selectedExam) {
            setValue("subjectId", selectedExam.lesson.subjectId);
            setValue("assignmentId", undefined);
            }
        }
        if (assignmentId) {
            const selectedAssignment = relatedData.assignments.find((a: any) => a.id === Number(assignmentId));
            if (selectedAssignment) {
            setValue("subjectId", selectedAssignment.lesson.subjectId);
            setValue("examId", undefined);
            }
        }
        };
        setSubjectFromAssessment();
    }, [examId, assignmentId, setValue, relatedData]);

    const onSubmit = handleSubmit((formData) => {
        // Ensure only one assessment type is selected
        if (formData.examId && formData.assignmentId) {
        toast.error("Please select only one assessment type");
        return;
        }
        
        // Clear empty strings from assessment IDs
        if (formData.examId === "") delete formData.examId;
        if (formData.assignmentId === "") delete formData.assignmentId;
        
        formAction(formData);
    });

    useEffect(() => {
        if (state.success) {
        toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">
            {type === "create" ? "Create New Result" : "Update Result"}
        </h1>

        <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Assessment Type</label>
            <div className="flex gap-4">
                <div className="flex-1">
                <select
                    {...register("examId", { valueAsNumber: true })}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                >
                    <option value="">Select Exam</option>
                    {relatedData?.exams?.map((exam: any) => (
                    <option key={exam.id} value={exam.id}>
                        {exam.title} (Subject: {exam.lesson.subject?.name})
                    </option>
                    ))}
                </select>
                {errors.examId && (
                    <p className="text-xs text-red-400">{errors.examId.message}</p>
                )}
                </div>
                <div className="flex-1">
                <select
                    {...register("assignmentId", { valueAsNumber: true })}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                >
                    <option value="">Select Assignment</option>
                    {relatedData?.assignments?.map((assignment: any) => (
                    <option key={assignment.id} value={assignment.id}>
                        {assignment.title} (Subject: {assignment.lesson.subject?.name})
                    </option>
                    ))}
                </select>
                {errors.assignmentId && (
                    <p className="text-xs text-red-400">{errors.assignmentId.message}</p>
                )}
                </div>
            </div>
            </div>

            <InputField
            label="Score"
            name="score"
            register={register}
            error={errors?.score}
            type="number"
            defaultValue={data?.score?.toString()}
            />

            <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Student</label>
            <select
                {...register("studentId")}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
                <option value="">Select Student</option>
                {relatedData?.students?.map((student: any) => (
                <option key={student.id} value={student.id}>
                    {student.name} {student.surname}
                </option>
                ))}
            </select>
            {errors.studentId && (
                <p className="text-xs text-red-400">{errors.studentId.message}</p>
            )}
            </div>

            <InputField
            label="Subject ID"
            name="subjectId"
            register={register}
            error={errors?.subjectId}
            type="number"
            hidden
            />

            {data?.id && (
            <InputField
                label="ID"
                name="id"
                register={register}
                error={errors?.id}
                defaultValue={data?.id}
                hidden
            />
            )}
        </div>

        {state.error && (
            <span className="text-red-500">Error processing result</span>
        )}
        <button className="bg-blue-400 text-white p-2 rounded-md">
            {type === "create" ? "Create" : "Update"}
        </button>
        </form>
    );
    };

    export default ResultForm;
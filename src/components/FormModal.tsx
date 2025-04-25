"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteResult,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

// Updated delete action map with result support
const deleteActionMap: { [key: string]: any } = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  result: deleteResult,
  parent: undefined,
  lesson: undefined,
  assignment: undefined,
  attendance: undefined,
  event: undefined,
  announcement: undefined,
};

// Dynamic (lazy) imports for form components
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Mapping table names to the corresponding form components
const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  // StudentForm now renders the "Required Credits" field regardless of create or update.
  student: (setOpen, type, data, relatedData) => (
    <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  // Set icon size based on action type
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  // Delete form handling using useFormState
  const DeleteForm = () => {
    const deleteAction = deleteActionMap[table];
    const [state, formAction] = useFormState(deleteAction, { success: false });

    useEffect(() => {
      if (state.success) {
        toast.success(`${table} deleted successfully`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router, table]);

    return (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="hidden" name="id" value={id} />
        <p className="text-center font-medium">
          Are you sure you want to delete this {table}? This action cannot be undone.
        </p>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-md self-center"
        >
          Confirm Delete
        </button>
      </form>
    );
  };

  return (
    <>
      {/* Trigger button */}
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt={`${type} icon`} width={16} height={16} />
      </button>

      {/* Modal container */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/close.png"
                alt="Close"
                width={20}
                height={20}
                className="invert"
              />
            </button>

            {/* Render content based on action type */}
            {type === "delete" ? (
              <DeleteForm />
            ) : (
              forms[table]?.(setOpen, type, data, relatedData) || (
                <div>Form not available for {table}</div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
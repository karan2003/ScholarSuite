// ✅ Final Updated AlumniForm.tsx (Styled like TeacherForm)

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { alumniSchema, AlumniSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAlumni, updateAlumni } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const AlumniForm = ({
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
  const { register, handleSubmit, formState: { errors } } = useForm<AlumniSchema>({
    resolver: zodResolver(alumniSchema),
    defaultValues: data || {},
  });

  const [img, setImg] = useState<any>(data?.img || null);
  const [state, formAction] = useFormState(
    type === "create" ? createAlumni : updateAlumni,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, img: img?.secure_url || img });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Alumni has been ${type === "create" ? "created" : "updated"}`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new alumni" : "Update the alumni"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Authentication Info</span>
      <div className="flex justify-between flex-wrap gap-4">
      <InputField label="Username" name="username" register={register} error={errors.username}/>
        <InputField label="Email" name="email" register={register} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
      </div>

      <span className="text-xs text-gray-400 font-medium">Personal Info</span>
      <div className="flex justify-between flex-wrap gap-4">
        
        <InputField label="Name" name="name" register={register} error={errors.name} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        <InputField label="Graduation Year" name="graduationYear" type="number" register={register} error={errors.graduationYear} />
        <InputField label="Current Job" name="currentJob" register={register} error={errors.currentJob} />
        <InputField label="Company" name="company" register={register} error={errors.company} />
        <InputField label="Position" name="position" register={register} error={errors.position} />
        <InputField label="LinkedIn URL" name="linkedinUrl" register={register} error={errors.linkedinUrl} />
        <InputField label="GitHub URL" name="githubUrl" register={register} error={errors.githubUrl} />
        <InputField label="Website URL" name="websiteUrl" register={register} error={errors.websiteUrl} />
        <InputField label="Twitter URL" name="twitterUrl" register={register} error={errors.twitterUrl} />
        <InputField label="Bio" name="bio" register={register} error={errors.bio} />

        {type === "update" && data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors.id}
            hidden
          />
        )}

        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="Upload" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          )}
        </CldUploadWidget>
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

export default AlumniForm;

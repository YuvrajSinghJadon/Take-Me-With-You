import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

const ReplyForm = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleReplySubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data); // Call the parent's onSubmit method
      reset(); // Clear the form after submission
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleReplySubmit)} className="w-full py-2">
      <input
        type="text"
        placeholder="Write your reply..."
        {...register("reply", { required: "Reply cannot be empty" })}
        className="w-full p-2 border border-gray-300 rounded"
      />
      {errors.reply && (
        <span className="text-sm text-red-600">{errors.reply.message}</span>
      )}
      <div className="flex justify-end mt-2">
        {loading ? (
          <Loading />
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
};

export default ReplyForm;

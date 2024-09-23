import React, { useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { NoProfile } from "../assets";

const CommentForm = ({ user, id, replyAt, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Call the backend API to submit the comment or reply
      await getComments(); // Optionally refresh comments after submission
      reset(); // Reset the form fields after successful submission
    } catch (error) {
      setErrMsg("Failed to submit comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full border-b border-[#66666645]"
    >
      <div className="w-full flex items-center gap-2 py-4">
        <img
          src={user?.profileUrl ?? NoProfile}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <TextInput
          name="comment"
          styles="w-full rounded-full py-3"
          placeholder={replyAt ? `Reply @${replyAt}` : "Comment on this post"}
          register={register("comment", {
            required: "Comment cannot be empty",
          })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg && (
        <span role="alert" className="text-sm text-red-600 mt-0.5">
          {errMsg}
        </span>
      )}
      <div className="flex justify-end pb-2">
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title="Submit"
            type="submit"
            containerStyles="bg-[#0444a4] text-white py-1 px-3 rounded-full font-semibold text-sm"
          />
        )}
      </div>
    </form>
  );
};

export default CommentForm;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment } from "react-icons/bi"; // For Queries
import { FaUserPlus } from "react-icons/fa"; // For Join Request
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";

// ReplyCard Component to display individual replies
const ReplyCard = ({ reply, user, handleLike }) => (
  <div className="w-full py-3 ml-12">
    <div className="flex gap-3 items-center mb-1">
      <Link to={"/profile/" + reply?.userId?._id}>
        <img
          src={reply?.userId?.profileUrl ?? NoProfile}
          alt={reply?.userId?.firstName}
          className="w-10 h-10 rounded-full object-cover"
        />
      </Link>

      <div>
        <Link to={"/profile/" + reply?.userId?._id}>
          <p className="font-medium text-base text-ascent-1">
            {reply?.userId?.firstName} {reply?.userId?.lastName}
          </p>
        </Link>
        <span className="text-ascent-2 text-sm">
          {moment(reply?.createdAt).fromNow()}
        </span>
      </div>
    </div>

    <div>
      <p className="text-ascent-2">{reply?.comment}</p>
      <div className="mt-2 flex gap-6">
        <p
          className="flex gap-2 items-center text-base text-ascent-2 cursor-pointer"
          onClick={handleLike}
        >
          {reply?.likes?.includes(user?._id) ? (
            <BiComment size={20} color="blue" />
          ) : (
            <BiComment size={20} />
          )}
          {reply?.likes?.length} Likes
        </p>
      </div>
    </div>
  </div>
);

// CommentForm Component to handle comment submission
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
    // Handle comment submit logic here
    try {
      // Call the backend API to submit comment
      await getComments(); // Optionally refresh comments after submission
      reset();
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

const PostCard = ({ post, user, deletePost, joinTrip }) => {
  const [showQueries, setShowQueries] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showReply, setShowReply] = useState(0);

  const getComments = async () => {
    setLoading(true);
    try {
      // Call API to fetch comments for the post
      setComments(post.comments); // Assume post.comments is an array of comments
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mb-2 bg-primary p-4 rounded-xl">
      <div className="flex gap-3 items-center mb-2">
        <Link to={"/profile/" + post?.userId?._id}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="w-full flex justify-between">
          <div>
            <Link to={"/profile/" + post?.userId?._id}>
              <p className="font-medium text-lg text-ascent-1">
                {post?.userId?.firstName} {post?.userId?.lastName}
              </p>
            </Link>
            <span className="text-ascent-2">{post?.userId?.location}</span>
          </div>
          <span className="text-ascent-2">
            {moment(post?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Trip Details */}
      <div>
        <p className="text-ascent-2 font-medium">
          Trip Start Date: {post?.startDate}
        </p>
        <p className="text-ascent-2 font-medium">
          Estimated Days: {post?.estimatedDays}
        </p>
        <p className="text-ascent-2 font-medium">
          Destinations: {post?.destinations?.join(", ")}
        </p>
        <p className="text-ascent-2 mt-2">{post?.description}</p>
        {post?.image && (
          <img
            src={post?.image}
            alt="Post"
            className="w-full mt-2 rounded-lg"
          />
        )}
      </div>

      {/* JOIN and QUERIES Buttons */}
      <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
        {/* Show "Request to Join" only if the logged-in user is not the post owner */}
        {user?._id !== post?.userId?._id && (
          <p
            className="flex gap-2 items-center text-base cursor-pointer"
            onClick={() => joinTrip(post._id)}
          >
            <FaUserPlus size={20} />
            Request to Join
          </p>
        )}

        <p
          className="flex gap-2 items-center text-base cursor-pointer"
          onClick={() => {
            setShowQueries(showQueries === post._id ? null : post._id);
            getComments(post._id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length} Queries
        </p>

        {/* Show Delete button if the logged-in user is the post owner */}
        {user?._id === post?.userId?._id && (
          <div
            className="flex gap-1 items-center text-base text-ascent-1 cursor-pointer"
            onClick={() => deletePost(post?._id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* Display Queries Section */}
      {showQueries === post?._id && (
        <div className="w-full mt-4 border-t border-[#66666645] pt-4">
          <CommentForm
            user={user}
            id={post?._id}
            getComments={() => getComments(post?._id)}
          />
          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className="w-full py-2" key={comment?._id}>
                <div className="flex gap-3 items-center mb-1">
                  <Link to={"/profile/" + comment?.userId?._id}>
                    <img
                      src={comment?.userId?.profileUrl ?? NoProfile}
                      alt={comment?.userId?.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link to={"/profile/" + comment?.userId?._id}>
                      <p className="font-medium text-base text-ascent-1">
                        {comment?.userId?.firstName} {comment?.userId?.lastName}
                      </p>
                    </Link>
                    <span className="text-ascent-2 text-sm">
                      {moment(comment?.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
                <div className="ml-12">
                  <p className="text-ascent-2">{comment?.comment}</p>
                  <div className="mt-2 flex gap-6">
                    <p
                      className="text-blue cursor-pointer"
                      onClick={() => setReplyComments(comment?._id)}
                    >
                      Reply
                    </p>
                  </div>
                  {replyComments === comment?._id && (
                    <CommentForm
                      user={user}
                      id={comment?._id}
                      replyAt={comment?.from}
                      getComments={() => getComments(post?._id)}
                    />
                  )}
                  <div className="py-2 px-8 mt-6">
                    {comment?.replies?.length > 0 && (
                      <p
                        className="text-base text-ascent-1 cursor-pointer"
                        onClick={() =>
                          setShowReply(
                            showReply === comment?._id ? 0 : comment?._id
                          )
                        }
                      >
                        Show Replies ({comment?.replies?.length})
                      </p>
                    )}
                    {showReply === comment?._id &&
                      comment?.replies?.map((reply) => (
                        <ReplyCard
                          reply={reply}
                          user={user}
                          key={reply?._id}
                          handleLike={() =>
                            console.log("Handle reply like logic")
                          }
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className="flex text-sm py-4 text-ascent-2 text-center">
              No Queries, be first to ask!
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;

import React from "react";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets"; // Fallback profile image

const FriendsCard = ({ friends }) => {
  return (
    <div>
      <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
        <div className="flex items-center justify-between text-ascent-1 pb-2 border-b border-[#66666645]">
          <span>Friends</span>
          <span>{friends?.length ?? 0}</span>
        </div>

        <div className="w-full flex flex-col gap-4 pt-4">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <Link
                to={"/profile/" + friend?._id}
                key={friend?._id}
                className="w-full flex gap-4 items-center cursor-pointer"
              >
                <img
                  src={friend?.profileUrl ?? NoProfile}
                  alt={friend?.firstName ?? "User"}
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div className="flex-1">
                  <p className="text-base font-medium text-ascent-1">
                    {friend?.firstName} {friend?.lastName}
                  </p>
                  <span className="text-sm text-ascent-2">
                    {friend?.profession ?? "No Profession"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-ascent-2 text-sm text-center py-4">
              No friends yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsCard;

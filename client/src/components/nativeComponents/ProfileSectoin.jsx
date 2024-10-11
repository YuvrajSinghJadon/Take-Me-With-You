const ProfileSection = ({ bio, city, languages }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">About You</h2>
      <p className="text-gray-700">{bio || "No bio available"}</p>
      <p className="mt-2 text-gray-500">City: {city || "Not specified"}</p>
      <p className="mt-2 text-gray-500">
        Languages:{" "}
        {languages?.length > 0 ? languages.join(", ") : "Not specified"}
      </p>
    </div>
  );
};

export default ProfileSection;

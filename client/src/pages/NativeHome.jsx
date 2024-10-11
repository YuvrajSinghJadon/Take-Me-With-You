import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ProfileSection,
  ServicesSection,
  EarningsSection,
  RatingsSection,
  ReviewsSection,
} from "../components/nativeComponents";

function NativeHome() {
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.user);
  const [nativeData, setNativeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`${import.meta.env.VITE_API_URL}/natives/homepage/${user._id}`);

    const fetchNativeData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/natives/homepage/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token in Authorization header
            },
          }
        );
        setNativeData(response.data); // Update state with fetched data
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Error fetching data");
        setLoading(false); // Set loading to false in case of an error
      }
    };

    fetchNativeData();
  }, [user._id, token]); // Add dependencies here

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!nativeData) return <div>No native data found</div>;

  return (
    <div className="bg-offWhite min-h-screen p-8 font-body">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <ProfileSection
            bio={nativeData.bio}
            city={nativeData.city}
            languages={nativeData.languages}
          />
        </div>

        {/* Stats Section */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EarningsSection earnings={nativeData.earnings} />
          <RatingsSection ratings={nativeData.ratings} />
          <ServicesSection services={nativeData.services} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <ReviewsSection reviews={nativeData.reviews} />
      </div>
    </div>
  );
}

export default NativeHome;

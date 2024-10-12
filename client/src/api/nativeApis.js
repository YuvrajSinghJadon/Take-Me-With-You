import axios from "axios";

// API call to add a new service (requires nativeId in the URL)
export const addService = async (nativeId, service, token) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/natives/${nativeId}/services`,
      service,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token from Redux state
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

// API call to update an existing service
export const updateService = async (
  nativeId,
  serviceId,
  updatedService,
  token
) => {
  try {
    const response = await axios.put(
      `${
        import.meta.env.VITE_API_URL
      }/natives/${nativeId}/services/${serviceId}`,
      updatedService,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token from Redux state
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// API call to get native services
export const getServices = async (nativeId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/natives/${nativeId}/services`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token from Redux state
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// API call to delete a service
export const deleteService = async (nativeId, serviceId, token) => {
  try {
    const response = await axios.delete(
      `${
        import.meta.env.VITE_API_URL
      }/natives/${nativeId}/services/${serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token from Redux state
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

////NATIVE PROFILE  API CALLS

// Get Native Profile Data
export const fetchNativeProfile = async (nativeId, token) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/natives/${nativeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Use token from the argument
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching native profile:", error);
    throw error;
  }
};

// Start or get an existing conversation between native and traveller
export const startConversation = async (nativeId, travellerId, token) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/natives/conversations`,
      {
        nativeId,
        travellerId,
      },
        {
            headers: {
                Authorization: `Bearer ${token}`, // Use token from the argument
            },
        }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
};

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { addService, updateService } from "../../api/nativeApis.js"; // API functions for services

const AddServiceForm = ({
  onServiceAdded,
  onServiceUpdated,
  editingService, // Service to edit if editing mode is active
}) => {
  const { user, token } = useSelector((state) => state.user); // Get user and token from Redux store
  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    price: "",
    availability: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prefill the form with the service data when editing a service
  useEffect(() => {
    if (editingService) {
      setServiceData({
        name: editingService.name || "",
        description: editingService.description || "",
        price: editingService.price || "",
        availability: editingService.availability || true,
      });
    }
  }, [editingService]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prevData) => ({
      ...prevData,
      [name]: name === "availability" ? value === "true" : value,
    }));
  };

  // Handle form submission for adding or updating service
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingService) {
        // If editing, update the service
        const updatedService = await updateService(
          user._id,
          editingService._id, // Use the service ID for the update
          serviceData,
          token
        );
        onServiceUpdated(updatedService); // Notify parent component of updated service
      } else {
        // If adding a new service
        const newService = await addService(user._id, serviceData, token);
        onServiceAdded(newService); // Notify parent component of added service
      }

      // Reset form after successful operation
      setServiceData({
        name: "",
        description: "",
        price: "",
        availability: true,
      });
    } catch (error) {
      console.error(error);
      setError("Error saving service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">
        {editingService ? "Edit Service" : "Add a New Service"}
      </h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* Service Name Input */}
      <div className="mb-4">
        <label className="block text-gray-700">Service Name</label>
        <input
          type="text"
          name="name"
          className="border rounded-lg w-full p-2 mt-1"
          value={serviceData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Service Description Input */}
      <div className="mb-4">
        <label className="block text-gray-700">Description</label>
        <textarea
          name="description"
          className="border rounded-lg w-full p-2 mt-1"
          value={serviceData.description}
          onChange={handleChange}
        />
      </div>

      {/* Service Price Input */}
      <div className="mb-4">
        <label className="block text-gray-700">Price</label>
        <input
          type="number"
          name="price"
          className="border rounded-lg w-full p-2 mt-1"
          value={serviceData.price}
          onChange={handleChange}
          required
        />
      </div>

      {/* Service Availability Input */}
      <div className="mb-4">
        <label className="block text-gray-700">Availability</label>
        <select
          name="availability"
          className="border rounded-lg w-full p-2 mt-1"
          value={serviceData.availability}
          onChange={handleChange}
        >
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`${
          loading ? "bg-gray-400" : "bg-primaryRed"
        } text-white font-bold py-2 px-4 rounded-lg`}
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : editingService
          ? "Update Service"
          : "Add Service"}
      </button>
    </form>
  );
};

export default AddServiceForm;

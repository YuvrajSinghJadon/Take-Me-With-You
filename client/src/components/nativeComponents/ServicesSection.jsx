import React, { useState } from "react";
import { useSelector } from "react-redux";
import AddServiceForm from "./AddServiceForm";
import { deleteService } from "../../api/nativeApis"; // Import API function for deleting service
import { FaEdit, FaTrash } from "react-icons/fa"; // Importing icons for edit and delete

const ServicesSection = ({ services }) => {
  const [serviceList, setServiceList] = useState(services);
  const [editingService, setEditingService] = useState(null); // For editing mode
  const { token, user } = useSelector((state) => state.user);
  const handleServiceAdded = (newService) => {
    setServiceList((prev) => [...prev, newService]);
  };

  const handleEditClick = (service) => {
    setEditingService(service); // Set the service to be edited
  };

  // Handle service deletion
  const handleDeleteClick = async (serviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (confirmed) {
      try {
        await deleteService(user._id, serviceId, token); // Make API call to delete the service
        setServiceList(
          serviceList.filter((service) => service._id !== serviceId)
        ); // Update the state
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleServiceUpdated = (updatedService) => {
    // Update the service in the list
    setServiceList((prevList) =>
      prevList.map((service) =>
        service._id === updatedService._id ? updatedService : service
      )
    );
    setEditingService(null); // Exit editing mode
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">Your Services</h2>

      {/* Display services */}
      {serviceList?.length > 0 ? (
        serviceList.map((service, index) => (
          <div key={service._id} className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-bold">{service.name}</h3>
                <p className="text-gray-600">
                  {service.description || "No description available"}
                </p>
                <p className="text-yellowAccent">Price: ${service.price}</p>
                <p
                  className={`text-sm ${
                    service.availability ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {service.availability ? "Available" : "Not Available"}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleEditClick(service)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit /> {/* Edit icon */}
                </button>
                <button
                  onClick={() => handleDeleteClick(service._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash /> {/* Delete icon */}
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No services listed yet.</p>
      )}

      {/* Add/Edit Service Form */}
      <div className="mt-8">
        <AddServiceForm
          onServiceAdded={handleServiceAdded}
          onServiceUpdated={handleServiceUpdated}
          editingService={editingService} // Pass service to edit
        />
      </div>
    </div>
  );
};

export default ServicesSection;

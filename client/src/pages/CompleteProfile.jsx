import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CustomButton, TextInput, Loading } from "../components";
import axios from "axios";

const CompleteProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [languages, setLanguages] = useState([]); // To store multiple languages
  const [languageInput, setLanguageInput] = useState(""); // Input for adding languages
  const [services, setServices] = useState([]); // To store multiple services
  const [serviceInput, setServiceInput] = useState({
    name: "",
    description: "",
    price: "",
    availability: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  // Handle adding a new language
  const handleAddLanguage = () => {
    if (languageInput.trim() !== "") {
      setLanguages((prev) => [...prev, languageInput.trim()]);
      setLanguageInput(""); // Clear input after adding
    }
  };

  // Handle removing a language
  const handleRemoveLanguage = (index) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle adding a service
  const handleAddService = () => {
    if (serviceInput.name && serviceInput.price) {
      setServices((prev) => [...prev, serviceInput]);
      setServiceInput({
        name: "",
        description: "",
        price: "",
        availability: true,
      }); // Clear inputs after adding
    }
  };

  // Handle removing a service
  const handleRemoveService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      // Send profile completion request to the backend
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/complete-profile`,
        {
          city: data.city,
          bio: data.bio,
          languages: languages,
          services: services,
        }
      );

      // Redirect to the dashboard after successful profile completion
      navigate("/dashboard");
    } catch (error) {
      setErrMsg("Profile completion failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-200 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* City Field */}
          <TextInput
            name="city"
            label="City"
            placeholder="Enter your city"
            type="text"
            styles="w-full border border-gray-300 rounded-lg px-4 py-2"
            register={register("city", { required: "City is required" })}
            error={errors.city ? errors.city.message : ""}
          />

          {/* Bio Field */}
          <TextInput
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself"
            type="text"
            styles="w-full border border-gray-300 rounded-lg px-4 py-2"
            register={register("bio", { required: "Bio is required" })}
            error={errors.bio ? errors.bio.message : ""}
          />

          {/* Languages Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Languages</label>
            <div className="flex gap-2 mb-4">
              <TextInput
                name="languageInput"
                placeholder="Enter a language"
                type="text"
                styles="flex-grow border border-gray-300 rounded-lg px-4 py-2"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
              />
              <CustomButton
                type="button"
                containerStyles="bg-primary text-white px-4 py-2 rounded-lg"
                title="Add Language"
                onClick={handleAddLanguage}
              />
            </div>
            {/* Display Added Languages */}
            <div className="space-y-2">
              {languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Services Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Services</label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Service Name */}
              <TextInput
                name="serviceName"
                placeholder="Service Name"
                type="text"
                styles="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={serviceInput.name}
                onChange={(e) =>
                  setServiceInput({ ...serviceInput, name: e.target.value })
                }
              />

              {/* Service Description */}
              <TextInput
                name="serviceDescription"
                placeholder="Service Description (optional)"
                type="text"
                styles="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={serviceInput.description}
                onChange={(e) =>
                  setServiceInput({
                    ...serviceInput,
                    description: e.target.value,
                  })
                }
              />

              {/* Service Price */}
              <TextInput
                name="servicePrice"
                placeholder="Service Price"
                type="number"
                styles="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={serviceInput.price}
                onChange={(e) =>
                  setServiceInput({ ...serviceInput, price: e.target.value })
                }
              />

              {/* Service Availability */}
              <div className="flex items-center gap-2">
                <label>Available:</label>
                <input
                  type="checkbox"
                  checked={serviceInput.availability}
                  onChange={(e) =>
                    setServiceInput({
                      ...serviceInput,
                      availability: e.target.checked,
                    })
                  }
                />
              </div>
            </div>
            <CustomButton
              type="button"
              containerStyles="bg-primary text-white px-4 py-2 rounded-lg mt-4"
              title="Add Service"
              onClick={handleAddService}
            />
          </div>

          {/* Display Added Services */}
          <div className="mt-4 space-y-2">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded-md">
                <div className="flex justify-between">
                  <div>
                    <p>
                      <strong>{service.name}</strong>
                    </p>
                    <p>{service.description}</p>
                    <p>{`Price: $${service.price}`}</p>
                    <p>{`Available: ${service.availability ? "Yes" : "No"}`}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errMsg && (
            <span className="text-sm text-red-500 mt-1">{errMsg}</span>
          )}

          {/* Submit Button */}
          {isSubmitting ? (
            <Loading />
          ) : (
            <CustomButton
              type="submit"
              containerStyles="w-full bg-primary text-white py-3 rounded-full text-sm font-medium"
              title="Complete Profile"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;

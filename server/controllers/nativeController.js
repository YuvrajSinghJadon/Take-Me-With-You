import Natives from "../models/nativeModel.js";
import Conversation from "../models/directConversationModel.js";
import DirectMessage from "../models/directMessageModel.js";
//Find Natives by Location
export const findNativesByLocation = async (req, res) => {
  const { location } = req.query;

  try {
    const natives = await Natives.find({
      city: { $regex: location, $options: "i" },
    });
    if (natives.length === 0) {
      return res
        .status(404)
        .json({ message: "No natives found in this location." });
    }
    res.status(200).json(natives);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Native Homepage Controller
export const getHomepage = async (req, res) => {
  try {
    console.log("Request User:");
    const native = await Natives.findOne({
      user: req.params.nativeId,
    }).populate("reviews.traveller", "firstName lastName");

    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      services: native.services,
      earnings: native.earnings,
      reviews: native.reviews,
      ratings: native.ratings,
      bio: native.bio,
      languages: native.languages,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Native Profile
export const getProfile = async (req, res) => {
  try {
    const native = await Natives.findById(req.params.nativeId)
      .populate("services")
      .populate("reviews.traveller", "name");
    if (!native) return res.status(404).json({ message: "Native not found" });
    res.json(native);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Update Native Profile
export const updateProfile = async (req, res) => {
  try {
    const updatedProfile = await Natives.findOneAndUpdate(
      { user: req.params.nativeId }, // Ensure you're finding the profile by user field
      { $set: req.body },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a New Service
export const addService = async (req, res) => {
  try {
    // Extracting nativeId from URL parameters, not from the JWT token
    const { nativeId } = req.params;
    const { name, description, price, availability } = req.body;

    // Find the native user by nativeId
    const native = await Natives.findOne({ user: nativeId });
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    // Creating the new service object
    const newService = { name, description, price, availability };

    // Push the new service to the native's services array
    native.services.push(newService);

    // Save the native user with the new service
    await native.save();

    // Respond with the new service data
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding service", error: error.message });
  }
};

// Get All Services
export const getServices = async (req, res) => {
  try {
    const native = await Natives.findById(req.params.nativeId);
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      success: true,
      data: native.services,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a Service
export const updateService = async (req, res) => {
  try {
    const { nativeId, serviceId } = req.params;
    const { name, description, price, availability } = req.body;

    // Find the native by nativeId
    const native = await Natives.findOne({ user: nativeId });
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    // Find the specific service by serviceId
    const service = native.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update the service fields if they are provided
    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = price; // Check for explicit undefined
    if (availability !== undefined) service.availability = availability;

    // Save the updated native document
    await native.save();

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Error updating service:", error.message);
    res
      .status(500)
      .json({ message: "Error updating service", error: error.message });
  }
};

// Delete a Service
export const deleteService = async (req, res) => {
  try {
    const { nativeId, serviceId } = req.params;

    // Find the native by nativeId
    const native = await Natives.findOne({ user: nativeId });
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    // Remove the service by serviceId
    const service = native.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Remove service from array
    native.services.pull({ _id: serviceId });
    await native.save(); // Save after removal

    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting service", error: error.message });
  }
};

// Get Native Earnings
export const getEarnings = async (req, res) => {
  try {
    const native = await Natives.findOne({ user: req.params.nativeId });
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      success: true,
      data: native.earnings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Reviews for Native
export const getReviews = async (req, res) => {
  try {
    const native = await Natives.findOne({
      user: req.params.nativeId,
    }).populate("reviews.traveller", "firstName lastName");
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      success: true,
      data: native.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const postReviews = async (req, res) => {
  const { nativeId } = req.params;
  const { rating, comment } = req.body;
  const travellerId = req.user.userId;

  try {
    // Check if the traveller has used any service from this native
    const serviceBooking = await Booking.findOne({
      nativeId,
      travellerId,
      status: "completed", // Only completed bookings
    });

    if (!serviceBooking) {
      return res
        .status(400)
        .json({ message: "You cannot review without completing a service." });
    }

    // Create a review
    const review = { traveller: travellerId, rating, comment };
    const native = await Natives.findById(nativeId);
    native.reviews.push(review);

    // Recalculate the average rating
    native.ratings.averageRating =
      (native.ratings.averageRating * native.ratings.numberOfRatings + rating) /
      (native.ratings.numberOfRatings + 1);
    native.ratings.numberOfRatings += 1;

    await native.save();
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: native.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error });
  }
};
// Get General Info for Native
export const getGeneralInfo = async (req, res) => {
  try {
    const native = await Natives.findOne({ user: req.params.nativeId });
    if (!native) {
      return res.status(404).json({ message: "Native not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        bio: native.bio,
        languages: native.languages,
        ratings: native.ratings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const searchNatives = async (req, res) => {
  const { location } = req.query;

  try {
    const natives = await Natives.find({
      city: { $regex: location, $options: "i" },
    });

    if (!natives.length) {
      return res
        .status(404)
        .json({ message: "No natives found in this location" });
    }

    res.status(200).json({ success: true, data: natives });
  } catch (error) {
    res.status(500).json({ message: "Error fetching natives", error });
  }
};

// Controller to start a new conversation or get an existing one
export const startConversation = async (req, res) => {
  const { nativeId, travellerId } = req.body;

  try {
    // Check if a conversation already exists between the native and traveller
    let conversation = await Conversation.findOne({
      nativeId,
      travellerId,
    });

    if (!conversation) {
      // Create a new conversation if none exists
      conversation = await Conversation.create({
        nativeId,
        travellerId,
        lastMessage: null,
        lastActiveAt: Date.now(),
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newMessageContent } = req.body;

  try {
    const updatedMessage = await DirectMessage.findByIdAndUpdate(
      messageId,
      { message: newMessageContent },
      { new: true }
    ).populate("sender", "firstName lastName");

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error editing message", error });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    await DirectMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error });
  }
};

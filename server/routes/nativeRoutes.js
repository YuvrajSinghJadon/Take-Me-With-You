import { Router } from "express";
import userAuth, { authorizeRoles } from "../middleware/authMiddleware.js";

// Import controllers
import {
  getProfile,
  updateProfile,
  addService,
  getServices,
  updateService,
  deleteService,
  getEarnings,
  getReviews,
  getGeneralInfo,
  getHomepage,
  findNativesByLocation,
  startConversation,
  editMessage,
  deleteMessage,
  submitReview,
  getNativeConversations,
  getMessagesByConversationId,
  getTravellerConversations,
  getConversationDetails,
} from "../controllers/nativeController.js";

const router = Router();

//Fetch Natives by location
router.get(`/`, userAuth, authorizeRoles(["traveller"]), findNativesByLocation);

// Native Homepage Route
router.get(
  `/homepage/:nativeId`,
  userAuth,
  authorizeRoles(["native"]),
  getHomepage
);

// Native Profile Routes
router.get(`/:nativeId`, userAuth, authorizeRoles(["traveller"]), getProfile);

router.put(
  `/update-profile/:nativeId`,
  userAuth,
  authorizeRoles(["native"]),
  updateProfile
);

// Native Services Routes
router.post(
  `/:nativeId/services`,
  userAuth,
  authorizeRoles(["native"]),
  addService
);
router.get(
  `/:nativeId/services`,
  userAuth,
  authorizeRoles(["native"]),
  getServices
);
router.put(
  `/:nativeId/services/:serviceId`,
  userAuth,
  authorizeRoles(["native"]),
  updateService
);
router.delete(
  `/:nativeId/services/:serviceId`,
  userAuth,
  authorizeRoles(["native"]),
  deleteService
);

// Native Earnings Route
router.get(
  `/:nativeId/earnings`,
  userAuth,
  authorizeRoles(["native"]),
  getEarnings
);

// Native Reviews Route
router.get(
  `/:nativeId/reviews`,
  userAuth,
  authorizeRoles(["native"]),
  getReviews
);

router.post(`/reviews`, userAuth, authorizeRoles(["traveller"]), submitReview);

// Native General Info Route
router.get(
  `/:nativeId/general-info`,
  userAuth,
  authorizeRoles(["native"]),
  getGeneralInfo
);

//conversations
router.post(`/conversations`, userAuth, startConversation);
router.put("/conversations/:messageId", userAuth, editMessage);
router.delete("/conversations/:messageId", userAuth, deleteMessage);

// Native Conversations Route
// get all conversations of a native
router.get(
  "/conversations/natives/:nativeId",
  userAuth,
  authorizeRoles(["native"]),
  getNativeConversations
);
//get conversatoin details
router.get(
  "/conversations/:conversationId",
  userAuth,
  authorizeRoles(["native"]),
  getConversationDetails
)
// get all messages of a conversation
router.get(
  "/conversations/messages/:conversationId",
  userAuth,
  authorizeRoles(["native", "traveller"]),
  getMessagesByConversationId
);

//get all conerstains of a traveller
router.get(
  "/conversations/travellers/:travellerId",
  userAuth,
  authorizeRoles(["traveller"]),
  getTravellerConversations
)

export default router;

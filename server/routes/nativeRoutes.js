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
} from "../controllers/nativeController.js";

const router = Router();

// Native Homepage Route
router.get(
  `/homepage/:nativeId`,
  userAuth,
  authorizeRoles(["native"]),
  getHomepage
);

// Native Profile Routes
router.get(
  `/:nativeId/profile`,
  userAuth,
  authorizeRoles(["native"]),
  getProfile
);
router.patch(
  `/:nativeId/profile`,
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

// Native General Info Route
router.get(
  `/:nativeId/general-info`,
  userAuth,
  authorizeRoles(["native"]),
  getGeneralInfo
);




export default router;

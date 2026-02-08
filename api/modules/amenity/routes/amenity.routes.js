import express from "express";
import {
  createAmenity,
  getAmenities,
  updateAmenity,
  deleteAmenity,
} from "../controllers/amenity.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

router.post("/", verifyTokenAndAdmin, createAmenity);
router.get("/room/:roomId", getAmenities);
router.put("/:id", verifyTokenAndAdmin, updateAmenity);
router.delete("/:id", verifyTokenAndAdmin, deleteAmenity);

export default router;

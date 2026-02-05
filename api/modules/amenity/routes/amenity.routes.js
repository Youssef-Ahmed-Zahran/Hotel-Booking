import express from "express";
import {
  createAmenity,
  getAmenities,
  updateAmenity,
  deleteAmenity,
} from "../controllers/amenity.controller.js";

const router = express.Router();

router.route("/").post(createAmenity).get(getAmenities);
router.get("/hotel/:hotelId", getAmenities);
router.route("/:id").put(updateAmenity).delete(deleteAmenity);

export default router;

import express from "express";
import {
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Ratings, Artist } from "../config.js"; // Adjust this path according to your structure

const router = express.Router();

// Add a new rating
router.post("/", async (req, res) => {
  try {
    const { userId, artistId, mark } = req.body;

    // Validate existing rating by the user for the same artist
    const existingRatingQuery = query(
      Ratings,
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    const existingRatingSnapshot = await getDocs(existingRatingQuery);

    if (!existingRatingSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Rating already submitted for this artist." });
    }

    // Save the new rating
    const newRating = await addDoc(Ratings, { userId, artistId, mark });

    // Fetch all ratings for the artist to calculate the average
    const artistRatingQuery = query(Ratings, where("artistId", "==", artistId));
    const ratingsSnapshot = await getDocs(artistRatingQuery);

    let totalMarks = 0;
    let ratingsCount = 0;

    ratingsSnapshot.forEach((ratingDoc) => {
      totalMarks += ratingDoc.data().mark;
      ratingsCount++;
    });

    const updatedAverage = Math.floor(totalMarks / ratingsCount); // Round down

    // Update the artist document with the new average rating
    const artistDocRef = doc(Artist, artistId);
    await updateDoc(artistDocRef, { rate: updatedAverage });

    res.send({
      message: "Rating successfully added",
      ratingId: newRating.id,
      updatedAverage,
    });
  } catch (err) {
    res.status(500).send({ message: "Error while adding rating", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ratingDocRef = doc(Ratings, req.params.id);
    const ratingDetails = await getDoc(ratingDocRef);

    if (ratingDetails.exists()) {
      res.send({ id: req.params.id, ...ratingDetails.data() });
    } else {
      res.status(404).send({ message: "Rating not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error fetching rating", error: err.message });
  }
});

// Update a rating
router.put("/:id", async (req, res) => {
  try {
    const ratingDocRef = doc(Ratings, req.params.id);
    await updateDoc(ratingDocRef, req.body);
    res.send({ message: "Rating updated successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error updating rating", error: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const ratingSnapshot = await getDocs(Ratings);
    const ratingList = ratingSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    res.send(ratingList);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving ratings",
      error: err.message,
    });
  }
});
// Delete a rating
router.delete("/:id", async (req, res) => {
  try {
    const ratingDocRef = doc(Ratings, req.params.id);
    await deleteDoc(ratingDocRef);
    res.send({ message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting rating", error: err.message });
  }
});

export default router;

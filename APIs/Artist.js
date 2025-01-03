import express from "express";
import {
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Artist } from "../config.js"; // Update based on your actual file structure

const router = express.Router();

// Add a new artist
router.post("/", async (req, res) => {
  try {
    const artistData = req.body;
    const result = await addDoc(Artist, artistData);
    res.send({ message: "Artist successfully added", id: result.id });
  } catch (err) {
    res.status(500).send({ message: "Error adding artist", error: err.message });
  }
});

// Retrieve all artists
router.get("/", async (req, res) => {
  try {
    const artistSnapshot = await getDocs(Artist);
    const artistList = artistSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    res.send(artistList);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving artists",
      error: err.message,
    });
  }
});

// Get an artist by their ID
router.get("/:id", async (req, res) => {
  try {
    const artistDocRef = doc(Artist, req.params.id);
    const artistDetails = await getDoc(artistDocRef);

    if (artistDetails.exists()) {
      res.send({ id: req.params.id, ...artistDetails.data() });
    } else {
      res.status(404).send({ message: "Artist not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error fetching artist", error: err.message });
  }
});

// Update an artist's data
router.put("/:id", async (req, res) => {
  try {
    const artistDocRef = doc(Artist, req.params.id);
    await updateDoc(artistDocRef, req.body);
    res.send({ message: "Artist information updated successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error updating artist",
      error: err.message,
    });
  }
});

// Delete an artist
router.delete("/:id", async (req, res) => {
  try {
    const artistDocRef = doc(Artist, req.params.id);
    await deleteDoc(artistDocRef);
    res.send({ message: "Artist deleted successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error deleting artist",
      error: err.message,
    });
  }
});

export default router;

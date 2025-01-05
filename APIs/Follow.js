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

const router = express.Router();


import { Follows } from "../config.js";  // Import your Firestore or DB models

/**
 * Follow or unfollow an artist
 */
router.post("/", async (req, res) => {
  try {
    const { userId, artistId, action } = req.body;

    if (!userId || !artistId || !['follow', 'unfollow'].includes(action)) {
      return res.status(400).send({ message: "Invalid request parameters" });
    }

    const followDoc = Follows.doc(`${userId}_${artistId}`); // Use a composite key for efficiency

    if (action === 'follow') {
      await followDoc.set({
        userId,
        artistId,
        createdAt: new Date().toISOString()
      });
      return res.send({ message: "Successfully followed the artist" });
    } else if (action === 'unfollow') {
      await followDoc.delete();
      return res.send({ message: "Successfully unfollowed the artist" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating follow status", error: err.message });
  }
});

/**
 * Get list of users an artist follows or their followers
 */
router.get("/list/:artistId", async (req, res) => {
  try {
    const artistId = req.params.artistId;
    const type = req.query.type; // 'followers' or 'following'

    if (!artistId || !['followers', 'following'].includes(type)) {
      return res.status(400).send({ message: "Invalid query parameters" });
    }

    const query = type === 'followers'
      ? Follows.where("artistId", "==", artistId)
      : Follows.where("userId", "==", artistId);

    const snapshot = await query.get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: "Error fetching follow data", error: err.message });
  }
});

/**
 * Get the count of followers and following
 */
router.get("/count/:artistId", async (req, res) => {
  try {
    const artistId = req.params.artistId;

    // Count followers
    const followersQuery = Follows.where("artistId", "==", artistId);
    const followersCount = (await followersQuery.get()).size;

    // Count following
    const followingQuery = Follows.where("userId", "==", artistId);
    const followingCount = (await followingQuery.get()).size;

    res.send({ followers: followersCount, following: followingCount });
  } catch (err) {
    res.status(500).send({ message: "Error fetching follow counts", error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const followsSnapshot = await getDocs(Follows);
    const followsList = followsSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    res.send(followsList);
  } catch (err) {
    res.status(500).send({ message: "Error fetching follows", error: err.message });
  }
});

export default router;

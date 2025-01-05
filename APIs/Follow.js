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
    writeBatch,
    arrayUnion, arrayRemove 
  } from "firebase/firestore";

const router = express.Router();


import { Follows,db } from "../config.js";  // Import your Firestore or DB models

/**
 * Follow or unfollow an artist
 */

router.post("/", async (req, res) => {
  try {
    const data = req.body; // Assume data contains userId and artistId
    const { userId, artistId } = data;

    // Check if the user is already following the artist
    const followQuery = query(
      Follows,
      where("userId", "==", userId),
      where("artistId", "==", artistId)
    );
    const existingFollow = await getDocs(followQuery);

    if (!existingFollow.empty) {
      // User is already following, so we unfollow by deleting the existing record
      const batch = writeBatch(db); // Assuming db is your Firestore instance
      existingFollow.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return res.send({ msg: "Unfollowed the artist successfully." });
    }

    // User is not following, so we add a new follow record
    const response = await addDoc(Follows, { userId, artistId });

    res.send({
      msg: "Followed the artist successfully.",
      id: response.id,
    });
  } catch (error) {
    res.status(500).send({ msg: "Failed to toggle follow status", error: error.message });
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

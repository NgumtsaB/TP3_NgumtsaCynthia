import express from "express";
import {
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Users } from "../config.js"; // Update this path based on your structure

const router = express.Router();

// Handle user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Search for the user by their email
    const userEmailQuery = query(Users, where("email", "==", email));
    const userSnapshot = await getDocs(userEmailQuery);

    if (userSnapshot.empty) {
      // No matching email found
      return res.status(200).send({ success: false });
    }

    const userDocument = userSnapshot.docs[0];
    const userData = userDocument.data();
    const userId = userDocument.id; // Extract unique user ID

    if (password !== userData.password) {
      // Password mismatch
      return res.status(200).send({ success: false });
    }

    // Successful login
    res.status(200).send({ success: true, userId });
  } catch (err) {
    // Internal error
    res.status(500).send({ success: false, error: err.message });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const newUser = req.body;

    // Validate email uniqueness
    const emailCheck = query(Users, where("email", "==", newUser.email));
    const emailExists = await getDocs(emailCheck);

    // Validate telephone uniqueness
    const phoneCheck = query(Users, where("telephone", "==", newUser.telephone));
    const phoneExists = await getDocs(phoneCheck);

    if (!emailExists.empty) {
      return res.status(400).send({ message: "Email is already registered" });
    }
    if (!phoneExists.empty) {
      return res.status(400).send({ message: "Phone number is already registered" });
    }

    // Generate a prefix based on the user's specialty
    let specialtyCode = "";
    switch (newUser.speciality) {
      case "Saint Jean Ingenieur":
        specialtyCode = "ISJ";
        break;
      case "Saint Jean Management":
        specialtyCode = "SJM";
        break;
      case "Licence":
        specialtyCode = "LIC";
        break;
      case "Master":
        specialtyCode = "MAS";
        break;
      default:
        return res.status(400).send({ message: "Invalid speciality provided" });
    }

    const year = new Date().getFullYear(); // Get the current year
    const level = newUser.level; // User's academic level

    const usersSnapshot = await getDocs(Users);
    const userCount = usersSnapshot.size + 1; // Total count with new user
    const paddedCount = String(userCount).padStart(3, "0"); // 3-digit user number

    // Construct a custom ID for the user
    const userId = `${year}${specialtyCode}${level}${paddedCount}`;

    // Save the user with the custom ID
    const userDoc = doc(Users, userId);
    await setDoc(userDoc, { ...newUser, id: userId });

    res.send({ message: "User successfully created", id: userId });
  } catch (err) {
    res.status(500).send({ message: "Error creating user", error: err.message });
  }
});

// Retrieve all users
router.get("/", async (req, res) => {
  try {
    const usersSnapshot = await getDocs(Users);
    const usersList = usersSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    res.send(usersList);
  } catch (err) {
    res.status(500).send({ message: "Error fetching users", error: err.message });
  }
});

// Get user details by ID
router.get("/:id", async (req, res) => {
  try {
    const userDoc = doc(Users, req.params.id);
    const userDetails = await getDoc(userDoc);

    if (userDetails.exists()) {
      res.send({ id: req.params.id, ...userDetails.data() });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error fetching user", error: err.message });
  }
});

// Update user information
router.put("/:id", async (req, res) => {
  try {
    const userDoc = doc(Users, req.params.id);
    await updateDoc(userDoc, req.body);
    res.send({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error updating user", error: err.message });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const userDoc = doc(Users, req.params.id);
    await deleteDoc(userDoc);
    res.send({ message: "User successfully deleted" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting user", error: err.message });
  }
});

export default router;

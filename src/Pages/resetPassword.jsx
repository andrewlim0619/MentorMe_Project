// ResetPassword.jsx

// Import necessary libraries and modules
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getDatabase, ref, update, get } from "firebase/database";
import {app} from "../../firebaseConfi";
import "../Styling/resetPassword.css";
import bcrypt from "bcryptjs"; // Import bcrypt

// Main component for ResetPassword
function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Both password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const db = getDatabase(app);
      const usersRef = ref(db, "account/user");
      const tutorsRef = ref(db, "tutors");

      // Check both databases for the user and update the password
      const [userSnapshot, tutorSnapshot] = await Promise.all([
        get(usersRef),
        get(tutorsRef),
      ]);

      let userKey = null;
      let updatePath = null;

      // Check in "account/user"
      if (userSnapshot.exists()) {
        const users = userSnapshot.val();
        userKey = Object.keys(users).find((key) => users[key].email === email);
        if (userKey) updatePath = `account/user/${userKey}`;
      }

      // Check in "tutors" if not found in "account/user"
      if (!updatePath && tutorSnapshot.exists()) {
        const tutors = tutorSnapshot.val();
        userKey = Object.keys(tutors).find(
          (key) => tutors[key].email === email
        );
        if (userKey) updatePath = `tutors/${userKey}`;
      }

      if (updatePath) {
        const userRef = ref(db, updatePath);
        await update(userRef, { password: hashedPassword });
        alert("Password has been reset successfully!");
        navigate("/login");
      } else {
        setErrorMessage("User not found in our records.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage("An error occurred while resetting your password. Please try again.");
    }
  };

  // Return JSX for the Reset Password page
  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h1>Reset Password</h1>
          <p>Please enter your new password and confirm it to reset.</p>

          {/* Form for entering the new password */}
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <input
              type="password"
              id="new-password"
              name="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>

          {/* Display error message if any */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Link to navigate back to the login page */}
          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;



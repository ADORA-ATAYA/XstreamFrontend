import React, { useState } from "react";
import { auth, googleProvider, signInWithPopup } from "../helper/FireBaseAuth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch= useDispatch()

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up successfully!");
      dispatch(setUser(userCredential.user))
      navigate("/"); // Redirect to home after signup
    } catch (error) {
      console.error("Signup Error:", error.message);
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Signup Success:", result.user);
      dispatch(setUser(result.user))
      navigate("/");
    } catch (error) {
      console.error("Google Sign-Up Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-purple-700 text-center">Sign Up</h2>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800"
          >
            Sign Up
          </button>
        </form>

        {/* Google Signup */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center border py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <img src="../img/google.svg" 
              alt="Google Logo" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account? <a href="/login" className="text-purple-700 font-semibold">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;

import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../helper/FireBaseAuth"; // Import Firebase auth
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        dispatch(setUser(userCredential.user));
        navigate('/')
    })
    .catch((error) => {
        console.log(error.message)
    });
    console.log("Logging in with:", email, password);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      dispatch(setUser(result.user))
      console.log("Google Login Success:", result.user);
      navigate('/');

    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-purple-700 text-center">Login</h2>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-4">
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

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800"
          >
            Login
          </button>
        </form>

        {/* Google Sign-In */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center border py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <img src="../img/google.svg" 
              alt="Google Logo" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </div>

        {/* Signup Link */}
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <a href="/signup" className="text-purple-700 font-semibold">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

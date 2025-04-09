import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate,} from "react-router-dom";
import { clearUser } from "../redux/slices/authSlice";
import { signOut } from "firebase/auth";
import { auth } from "../helper/FireBaseAuth";

function Navbar() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [Avtar, setAvtar] = useState("./img/Avtar.jpg" )
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.auth.user)
  const authuser = auth.currentUser
  
  useEffect(() =>{
    // console.log("SAFS",authuser);   
    if(authuser)setAvtar(authuser.photoURL)
  },[user])

  const handleLogout = async() => {
    await signOut(auth);
    dispatch(clearUser())
    setShowDropdown(false);
    setShowDropdown(!showDropdown)
    navigate('/');
  };

  const handleExistingRooms = ()=>{
    setShowDropdown(!showDropdown)
    navigate('/streamwindow')
  }

  return (
    <nav className="bg-purple-700 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/">
          <img src="./img/logo.png" alt="Logo" className="w-40 h-12" />
        </Link>
      </div>

      <div className="flex items-center">
        {user ? (
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)}>

              <img src={Avtar} alt="User Avatar" className="w-10 h-10 rounded-full cursor-pointer border-2 border-white" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-38 bg-white text-black rounded-md shadow-lg">
                <div className="block w-full px-4 py-2 text-left hover:bg-gray-200 hover:rounded-md">
                  <p>{user?.email}</p>
                </div>
                <hr></hr>
                <button onClick={handleExistingRooms} className="block w-full px-4 py-2 text-left text-black hover:bg-gray-200 hover:rounded-md">
                  Existing rooms
                </button>
                <hr></hr>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-700 hover:bg-gray-200 hover:rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/Login" className="px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-gray-100">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-purple-900 text-white rounded-lg font-semibold hover:bg-purple-800">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

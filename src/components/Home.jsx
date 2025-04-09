import axios from "axios";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {nanoid}  from  'nanoid'
import { useDispatch } from "react-redux";
import PopUp from "../helper/PopUp";

const Home = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomexists,setroomexists] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  

  const generateRoomCode = ()=>{
    let code = nanoid(8);
    return code;
  }

  useEffect(()=>{
    setTimeout(() => {
      setroomexists(false)
    }, 3000);
  },[roomexists])

  const handleCreateRoom = async()=>{
    if(videoUrl===""){
      return;
    }
    const auth  = getAuth();
    const user = auth.currentUser;
    // console.log('handle create room');
    
      if(!user){
        navigate('/login');
      }else{
        // console.log("user exists:",user);
        const token  = await user.getIdToken();
        let roomCode = generateRoomCode();
         
        const response1 = await axios.post(`${process.env.REACT_APP_BASE_URL}/createroom`,{
          roomCode,
          videoUrl,
          uid:user.uid,
        },{ headers: { Authorization: `Bearer ${token}` } })

        const response2 = await axios.post(`${process.env.REACT_APP_BASE_URL}/addroomcode`,{
          uid:user.uid,
          roomCode,
        },{ headers: { Authorization: `Bearer ${token}` } })
        console.log("all thing done");
        

        navigate('/streamwindow',{state:{roomCode}})
      }
  }

  const handleEnterRoom = async()=>{
    const auth  = getAuth();
    const user = auth.currentUser;
      if(!user){
        navigate('/login');
      }else{
        // console.log("inside enter room",roomCode);
        
        const token  = await user.getIdToken();
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/isroomexists/${roomCode}`
          ,{ headers: { Authorization: `Bearer ${token}` } })   ; 
        // console.log("resjs",res);
        if(res.data.message === "room found"){

          //adding new member
          await axios.post(`${process.env.REACT_APP_BASE_URL}/addnewmember/${roomCode}`
          ,{  uid:user.uid,username:user.displayName}
          ,{ headers: { Authorization: `Bearer ${token}` } }) 

          navigate('/secondwindow',{state:{roomCode,name:user.displayName}})
        }
        else {
          setroomexists(true)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 text-white p-6">

      {roomexists ?
        (<PopUp message={"Room does not exist!"} state={roomexists} type={"info"}></PopUp>
      ):(<></>)
      }

        {/* Tagline */}
      <p className="text-4xl md:text-5xl font-extrabold text-gray-200 mb-4">
        🎬 Platform to <span className="text-yellow-300">Watch Movies</span> with Your Distant One 💜
      </p>


      {/* Creative Heading */}
      <h1 className="text-lg md:text-xl font-semibold mb-6 text-center">
        🎥 Place Your <span className="text-yellow-300">Video URL</span>
      </h1>

      {/* Input for YouTube Video URL */}
      <input
        type="text"
        placeholder="Enter Google Drive Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-lg text-black border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-md"
      />

      {/* Create Room Button */}
      <button onClick={handleCreateRoom} className="mt-4 px-6 py-3 bg-yellow-400 text-purple-900 font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition">
        Create Room
      </button>

      {/* OR Divider */}
      <div className="flex items-center my-6">
        <div className="w-24 h-[2px] bg-white"></div>
        <span className="px-3 text-lg font-semibold">OR</span>
        <div className="w-24 h-[2px] bg-white"></div>
      </div>

      {/* Input for Room Code */}
      <div className="flex">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-64 px-4 py-3 rounded-l-lg text-black border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        />
        <button onClick={handleEnterRoom} className="px-6 py-3 bg-white text-purple-900 font-semibold rounded-r-lg shadow-md hover:bg-gray-200 transition">
          Enter Room
        </button>
      </div>
    </div>
  );
};

export default Home;

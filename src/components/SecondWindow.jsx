import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState, useRef } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const SecondWindow = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoUrl, setVideoUrl] = useState("https://www.w3schools.com/html/mov_bbb.mp4")
  const location = useLocation();
  const navigate = useNavigate();
  const {roomCode,name} = location.state || {}
  const ws = useRef(null); 
  
  const [members, setMembers] = useState([]);
  // console.log("secondwindow",members);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [ShowLeavePopup,setShowLeavePopup] = useState(false)
  const [LeavingMember, setLeavingMember] = useState(null)
  const [newMember, setNewMember] = useState(null);
  const videoRef = useRef(null);
  const auth = getAuth()
  const membersRef = useRef([]); 
  const user = auth.currentUser

  // Function to fetch room members
  const fetchMembers = async () => {
    try {
      const token = await user.getIdToken()
      const response =  await axios.get(`${process.env.REACT_APP_BASE_URL}/findroom-members/${roomCode}`
        ,{ headers: { Authorization: `Bearer ${token}` } })   ; 
      // console.log("room video link",response.data.rooms[0].originallink);
      
      const data = response.data.rooms[0].userslist;
      
      // detect newly added member;
      if (data && Array.isArray(data)) {
        const newJoiners = data.filter(member => 
          !membersRef.current.some(existing => existing.uid === member.uid)  // Compare correctly
        );
      
        if (newJoiners.length > 0) {
          setNewMember(newJoiners[0].username);
          setShowMemberPopup(true);
          setTimeout(() => setShowMemberPopup(false), 3000);
      
          // Update the state & also update the reference
          setMembers(prev => {
            const updatedMembers = [...prev, ...newJoiners.map(m => ({ uid: m.uid, username: m.username }))];
            membersRef.current = updatedMembers;  // Sync ref to prevent duplicate addition
            return updatedMembers;
          });
        }
      }


      //detect leaved member
      if (data && Array.isArray(data)) {
      // Detect left members
      const leftMembers = members.filter(member => 
        !data.find(newMember => newMember.uid === member.uid)
      );

      if (leftMembers.length > 0) {
        setLeavingMember(leftMembers[0].username);
        setShowLeavePopup(true);
        setTimeout(() => setShowLeavePopup(false),3000);
      }

      setMembers(data);
      membersRef.current = [...data];
    }


    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Function to leave the room
  const leaveRoom = async () => {
    try {
      const token = await user.getIdToken()
      await axios.post(`${process.env.REACT_APP_BASE_URL}/removemember/${roomCode}`,
        {uid:user.uid}
        ,{ headers: { Authorization: `Bearer ${token}` } })   ; 
      setMembers(prevMembers => prevMembers.filter(member => member.uid !== user.uid))


      navigate('/'); // Redirect to home or another page after leaving
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  // Polling mechanism to check for new members every 5 seconds
  useEffect(() => {
    fetchMembers(); // Initial fetch
    const interval = setInterval(fetchMembers, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  useEffect(()=>{
    const fectVideoUrl = async()=>{
      const token = await user.getIdToken()
      const response =  await axios.get(`${process.env.REACT_APP_BASE_URL}/findroom-members/${roomCode}`
          ,{ headers: { Authorization: `Bearer ${token}` } })   ;
          
      // console.log("url",response.data.rooms[0].originallink);
      
      setVideoUrl(response.data.rooms[0]?.originallink || "")
    }
    fectVideoUrl()
  },[roomCode,user])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };


  // webscoket connection 
  useEffect(() => {
    ws.current = new WebSocket('wss://localhost:8081');

    ws.current.onopen = () => {
        console.log("WebSocket connected");
        ws.current.send(JSON.stringify({ type: 'join', roomCode }));
    };

    ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'sync') {
            handleSync(data.videoState);
        }
    };

    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
}, [roomCode]);

const handleSync = (videoState) => {
    if (!videoRef.current || isNaN(videoState.currentTime) || videoState.currentTime == null) {
        console.error("Invalid videoState.currentTime:", videoState.currentTime);
        return;
    }

    videoRef.current.currentTime = videoState.currentTime;

    if (videoState.action === 'play') {
        videoRef.current.play();
    } else if (videoState.action === 'pause') {
        videoRef.current.pause();
    }
};



  return (
    <div className="flex flex-col items-center h-screen bg-gradient-to-br from-indigo-900 via-teal-800 to-purple-900 text-white p-6">
      {/* Video Player */}
      <div className="w-full max-w-2xl bg-black p-4 rounded-lg shadow-xl">
        <video key = {videoUrl} ref={videoRef} className="w-full" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls */}
        <div className="flex justify-center mt-4">
          <button  key={videoUrl}  onClick={handlePlayPause} className="text-white px-3 py-2 rounded-lg hover:bg-teal-500">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="mt-6 w-full max-w-2xl p-4 bg-indigo-700 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-teal-200">Room Members</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {members && members.map((member, index) => (
            <div key={index} className="p-3 bg-teal-600 rounded-lg text-center text-white">
              {member.username}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Room Button */}
      <button 
        onClick={leaveRoom} 
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700">
        Leave Room
      </button>

      {/* New Member Popup */}
      {showMemberPopup && newMember && (
        <div className="fixed top-5 right-5 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          {newMember} has joined the room!
        </div>
      )}

        {/* leaving member popup  */}
      {ShowLeavePopup && LeavingMember && (
        <div className="fixed top-5 right-5 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          {LeavingMember} has left the room!
        </div>
      )}
    </div>
  );
};

export default SecondWindow;

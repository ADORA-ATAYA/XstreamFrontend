import axios from "axios";
import { getAuth } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { FaCopy, FaPlay, FaPause, FaForward, FaBackward } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { deleteRoomCode, setRoomCodes } from "../redux/slices/roomSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import PopUp from "../helper/PopUp";

const StreamWindow = () => {
    const auth = getAuth();
    const rooms = useSelector((state) => state.userroom.roomcodes) || [];
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ws = useRef(null);
    const location = useLocation()
    // const {roomCode} = location.state
    
    const [user, setUser] = useState(null);
    const [token, setToken] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [videoUrl, setVideoUrl] = useState("https://www.w3schools.com/html/mov_bbb.mp4");
    const videoRef = useRef(null);

    // 🔹 Authentication Check
    useEffect(() => {
        try {
            const user = auth.currentUser;
            if (!user) navigate('/login');
            setUser(user);
            setToken(user.getIdToken());
        } catch (error) {
            console.error("Error authenticating user:", error);
        }
    }, []);

    // 🔹 Fetch user's available rooms
    useEffect(() => {
        if (user && token) {
            getCurrentRooms();
        }
    }, [user,token,dispatch]);



    // 🔹 WebSocket Connection (Updated to refresh on room selection)
    useEffect(() => {
        if (!selectedRoom) return;

        if (ws.current) ws.current.close(); // Close any previous WebSocket connection

        ws.current = new WebSocket('wss://localhost:8081');

        ws.current.onopen = () => {
            console.log("WebSocket connected to room:", selectedRoom);
            ws.current.send(JSON.stringify({ type: 'join', roomCode: selectedRoom }));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'sync') {
                handleSync(data.videoState);
            }
        };

        ws.current.onclose = () => console.log("WebSocket disconnected");

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [selectedRoom]);

    // 🔹 Handle Room Selection
    const handleRoomSelection = async (roomCode) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/getvideolink/${roomCode}`,
                { headers: { Authorization: `Bearer ${token}` } });

            setSelectedRoom(roomCode);
            console.log("roomcode:",roomCode);
            
            console.log("videourl",res.data.videoUrl);
            
            setVideoUrl(res.data.videoUrl);
        } catch (error) {
            console.error("Error fetching video URL:", error);
        }
    };

    // 🔹 Video Sync Function
    const handleSync = (videoState) => {
        if (!videoRef.current) return;

        if (videoState.action === 'play') {
            videoRef.current.play();
            setIsPlaying(true);
        } else if (videoState.action === 'pause') {
            videoRef.current.pause();
            setIsPlaying(false);
        } else if (videoState.action === 'forward' || videoState.action === 'backward') {
            videoRef.current.currentTime = videoState.currentTime;
        }
    };

    // 🔹 Play/Pause Handler
    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            sendVideoUpdate('play');
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            sendVideoUpdate('pause');
        }
    };

    // 🔹 Seek Handler
    const handleSeek = (direction) => {
        if (!videoRef.current) return;

        videoRef.current.currentTime += direction === 'forward' ? 5 : -5;
        sendVideoUpdate(direction);
    };

    // 🔹 Send Video State Updates to WebSocket
    const sendVideoUpdate = (action) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const videoState = {
                action,
                currentTime: videoRef.current.currentTime,
            };
            ws.current.send(JSON.stringify({ type: 'video-update', roomCode: selectedRoom, videoState }));
        }
    };

    // 🔹 Fetch Available Rooms for the User
    const getCurrentRooms = async () => {
        try {
            const uid = user.uid;
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/getroomcodes/${uid}`,
                { headers: { Authorization: `Bearer ${token}` } });

            dispatch(setRoomCodes(response.data.user.roomcodes));
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    // 🔹 Handle Copy Room Code
    const handleCopy = () => {
        if (!selectedRoom) return;
        navigator.clipboard.writeText(selectedRoom);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleDeleteRoom = async (roomcode)=>{
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/deleteroom`,{
                data:{roomcode,userId:user.uid},
                headers: { Authorization: `Bearer ${token}` } 
            });
            console.log("response",response);
            ws.current.send(JSON.stringify({ type: 'delete-room', roomCode :selectedRoom
            }));
            dispatch(deleteRoomCode(roomcode))
            setSelectedRoom(null)
        } catch (error) {
            console.error("Delete Room Error:", error.response?.data || error.message);
        }
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-teal-800 to-purple-900 text-white">
            {/* Left Sidebar */}
            <div className="w-1/4 bg-gradient-to-b from-indigo-800 to-teal-700 p-4 overflow-auto rounded-r-lg shadow-lg">
                <button className="bg-white text-black font-bold rounded-md py-1 px-2 mb-3" onClick={() =>navigate('/')}>Back</button>
                <h2 className="text-xl font-bold mb-4 text-teal-200">Your Rooms</h2>
                <ul>
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <li key={room} onClick={() => handleRoomSelection(room)}
                                className={`flex items-center justify-between  p-2 mb-2 rounded-lg cursor-pointer transition duration-300 hover:bg-teal-600
                                    ${selectedRoom === room ? "bg-teal-500" : "bg-teal-700"}`}>
                                {user?.displayName + "_" + room}
                                <div className="hover:text-red-600 " onClick={() => handleDeleteRoom(room)}>< RiDeleteBin6Line /></div>
                            </li>
                        ))
                    ) : (
                        <p>No rooms available.</p>
                    )}
                </ul>
            </div>

            {/* Right Content */}
            <div className="w-3/4 p-6 flex flex-col items-center">
                {selectedRoom ? (
                    <>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold mb-4 text-indigo-200">Room Code</h2>
                            <div className="flex items-center bg-indigo-700 p-2 rounded-lg mb-4 shadow-md relative">
                                <span className="mr-4 text-teal-100">{selectedRoom}</span>
                                <button onClick={handleCopy} className="text-white bg-teal-600 px-3 py-1 rounded-lg hover:bg-teal-500 relative">
                                    <FaCopy />
                                </button>
                                <span className={`absolute -top-5 right-0 text-sm font-bold text-green-300 transition-opacity duration-500 ${copied ? "opacity-100" : "opacity-0"}`}>
                                    Copied!
                                </span>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="w-full max-w-4xl bg-black p-4 rounded-lg shadow-xl">
                            <video key={videoUrl} ref={videoRef} className="w-full" controls>
                                <source src={videoUrl} type="video/mp4" />
                            </video>

                            {/* Video Controls */}
                            <div className="flex justify-center gap-4 mt-4">
                                <button onClick={() => handleSeek('backward')}><FaBackward /></button>
                                <button key={videoUrl} onClick={handlePlayPause}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
                                <button onClick={() => handleSeek('forward')}><FaForward /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <h2 className="text-2xl font-bold text-indigo-200">Select a room to see details</h2>
                )}
            </div>
        </div>
    );
};

export default StreamWindow;

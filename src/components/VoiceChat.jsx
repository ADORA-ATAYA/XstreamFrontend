import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const VoiceChat = ({ roomCode, ws }) => {
    const peerConnections = useRef({});
    const localStream = useRef(null);
    const [isMicOn, setIsMicOn] = useState(false);

    useEffect(() => {
        if (!ws) return;

        ws.onmessage = async (message) => {
            let data = JSON.parse(message.data);
            switch (data.type) {
                case "offer":
                    handleOffer(data);
                    break;
                case "answer":
                    handleAnswer(data);
                    break;
                case "candidate":
                    handleCandidate(data);
                    break;
            }
        };

        return () => {
            stopMic();
            ws.send(JSON.stringify({ type: "leave", roomCode }));
        };
    }, [ws, roomCode]);

    const toggleMic = async () => {
        if (!isMicOn) {
            await startMic();
        } else {
            stopMic();
        }
    };

    const startMic = async () => {
        try {
            localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsMicOn(true);
            createOffer();
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopMic = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        setIsMicOn(false);
    };

    const createOffer = async () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected.");
            return;
        }
    
        console.log("Creating offer...");
        let pc = new RTCPeerConnection();
        peerConnections.current[roomCode] = pc;
    
        localStream.current?.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE Candidate...");
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate, roomCode }));
                } else {
                    console.error("WebSocket is closed before sending ICE candidate.");
                }
            }
        };
    
        let offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
    
        console.log("Sending offer...");
        ws.send(JSON.stringify({ type: "offer", offer, roomCode }));
    };
    

    const handleOffer = async (data) => {
        let pc = new RTCPeerConnection();
        peerConnections.current[roomCode] = pc;

        localStream.current?.getTracks().forEach(track => pc.addTrack(track, localStream.current));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate, roomCode }));
            }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: "answer", answer, roomCode }));
    };

    const handleAnswer = async (data) => {
        await peerConnections.current[roomCode]?.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleCandidate = async (data) => {
        await peerConnections.current[roomCode]?.addIceCandidate(new RTCIceCandidate(data.candidate));
    };

    return (
        <button 
            onClick={toggleMic} 
            className={`flex items-center gap-2 px-6 py-3 mt-5 mb-5 text-lg font-semibold rounded-lg transition duration-300 shadow-lg ${
                isMicOn ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
        >
            {isMicOn ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>
    );
};

export default VoiceChat;

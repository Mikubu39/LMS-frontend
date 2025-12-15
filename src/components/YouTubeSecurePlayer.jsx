// src/components/YouTubeSecurePlayer.jsx
import React, { useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Slider, message, Spin } from 'antd';
import { 
  PlayCircleFilled, 
  PauseCircleFilled, 
  FullscreenOutlined, 
  FullscreenExitOutlined,
  SoundOutlined,
  MutedOutlined
} from '@ant-design/icons';
import { ProgressApi } from '@/services/api/progressApi';
import "../css/video.css"; 

const YouTubeSecurePlayer = ({ 
    videoId,      
    contextData,    
    initialData,    
    onComplete,     
    onProgress      
}) => {
    const playerRef = useRef(null); 
    const wrapperRef = useRef(null);
    
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // State Âm lượng
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(100);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0); 
    
    const [maxWatchedTime, setMaxWatchedTime] = useState(0);
    const [isReadyToTrack, setIsReadyToTrack] = useState(false);
    
    const lastSyncTime = useRef(Date.now());

    const opts = {
        height: '100%', 
        width: '100%',
        playerVars: {
            autoplay: 0, 
            controls: 0,    // Tắt controls gốc
            disablekb: 1,   
            modestbranding: 1, 
            rel: 0,         // Hạn chế video liên quan (nhưng vẫn hiện khi pause nếu không che)
            fs: 0, 
            iv_load_policy: 3, // Tắt chú thích video
            origin: window.location.origin, 
        },
    };

    // 1. KHÔI PHỤC VỊ TRÍ
    useEffect(() => {
        if (isPlayerReady && playerRef.current && !isReadyToTrack && initialData) {
            const savedPos = initialData.lastPosition || 0;
            const isCompleted = initialData.status === 'completed' || initialData.percentage >= 95;
            const savedMax = isCompleted ? 999999 : savedPos;

            setMaxWatchedTime(savedMax);
            setCurrentTime(savedPos);

            try {
                playerRef.current.seekTo(savedPos, true);
                playerRef.current.pauseVideo();
                // Set volume mặc định
                playerRef.current.setVolume(volume);
            } catch (err) {
                console.error("Seek fail:", err);
            }

            setTimeout(() => {
                setIsReadyToTrack(true);
            }, 800);
        }
    }, [isPlayerReady, initialData, isReadyToTrack]);

    // 2. TRACKING & SYNC (Đã thêm contextData vào dependency để cập nhật classId)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isReadyToTrack || !playerRef.current || !isPlaying) return;

            const time = playerRef.current.getCurrentTime();
            const totalDuration = playerRef.current.getDuration();

            if (totalDuration && duration !== totalDuration) setDuration(totalDuration);
            setCurrentTime(time);

            // Chặn tua
            if (time > maxWatchedTime + 3) { 
                playerRef.current.seekTo(maxWatchedTime, true);
                message.warning("Vui lòng không tua video!", 1.5);
            } else {
                if (time > maxWatchedTime) {
                    setMaxWatchedTime(time);
                }
            }

            // Sync API mỗi 5s
            if (Date.now() - lastSyncTime.current > 5000) {
                syncProgress(time, totalDuration);
                lastSyncTime.current = Date.now();
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, maxWatchedTime, duration, isReadyToTrack, contextData]); // <--- QUAN TRỌNG: Thêm contextData

    const syncProgress = async (currTime, totalTime) => {
        if (!totalTime) return;
        let percent = Math.floor((currTime / totalTime) * 100);
        if (percent > 100) percent = 100;
        const status = percent >= 95 ? 'completed' : 'in_progress';

        if (onProgress) onProgress(percent, currTime, totalTime);

        try {
             // contextData ở đây sẽ chứa classId nếu LessonPage truyền xuống đúng
             await ProgressApi.upsert({
                ...contextData, 
                percentage: percent,
                lastPosition: Math.floor(currTime),
                status: status
            });
            
            if (status === 'completed' && onComplete) onComplete();
        } catch (err) {
            console.warn("Save progress failed", err);
        }
    };

    // --- HANDLERS ---
    const onReady = (event) => {
        playerRef.current = event.target;
        setDuration(event.target.getDuration());
        event.target.setVolume(volume); // Set volume ban đầu
        setIsPlayerReady(true); 
    };

    const onStateChange = (event) => {
        // 1 = Playing, 2 = Paused, 0 = Ended
        setIsPlaying(event.data === 1); 
        if (event.data === 0) { 
            setIsPlaying(false);
            syncProgress(duration, duration);
            if(onComplete) onComplete();
        }
    };

    const togglePlay = () => {
        if (!playerRef.current || !isReadyToTrack) return;
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    const handleSeek = (value) => {
        if (!isReadyToTrack) return;
        if (value > maxWatchedTime) {
            message.warning("Bạn chưa học đến đoạn này!");
            return; 
        }
        playerRef.current.seekTo(value, true);
        setCurrentTime(value);
    };

    // --- VOLUME HANDLERS ---
    const handleVolumeChange = (value) => {
        setVolume(value);
        if (playerRef.current) {
            playerRef.current.setVolume(value);
        }
        if (value > 0 && isMuted) {
            setIsMuted(false);
            if (playerRef.current) playerRef.current.unMute();
        }
        if (value === 0) {
            setIsMuted(true);
            if (playerRef.current) playerRef.current.mute();
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            // Unmute -> Restore volume
            setIsMuted(false);
            const restoreVol = prevVolume === 0 ? 50 : prevVolume;
            setVolume(restoreVol);
            if (playerRef.current) {
                playerRef.current.unMute();
                playerRef.current.setVolume(restoreVol);
            }
        } else {
            // Mute
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
            if (playerRef.current) playerRef.current.mute();
        }
    };

    // --- FULLSCREEN LOGIC ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(err => {
                console.log("Error attempting to enable full-screen mode:", err);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div ref={wrapperRef} className="secure-yt-wrapper">
            
            {/* Loading Overlay */}
            {!isReadyToTrack && (
                <div className="yt-loading-overlay">
                    <Spin size="large" />
                    <span>Đang đồng bộ tiến độ học...</span>
                </div>
            )}

            {/* Video Area */}
            <div className="yt-video-container">
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="youtube-iframe-fix"
                />
                
                {/* Lớp chặn click trực tiếp vào iframe (luôn có để chặn share/watch later khi hover) */}
                <div className="yt-click-blocker" onClick={togglePlay} />

                {/* OVERLAY CHE GIAO DIỆN PAUSE CỦA YOUTUBE 
                   Khi Paused và đã Ready -> Hiển thị overlay này.
                   Nó che hoàn toàn iframe, người dùng không thấy được các nút Share/Related.
                */}
                {isReadyToTrack && !isPlaying && (
                    <div className="yt-pause-overlay" onClick={togglePlay}>
                        <div className="yt-big-play-btn">
                            <PlayCircleFilled />
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Controls Bar */}
            <div className="yt-custom-controls">
                {/* Play/Pause */}
                <div className="yt-control-btn" onClick={togglePlay}>
                    {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
                </div>

                {/* Volume Control (Mới) */}
                <div className="yt-volume-control">
                    <div className="yt-control-btn" onClick={toggleMute}>
                        {isMuted || volume === 0 ? <MutedOutlined /> : <SoundOutlined />}
                    </div>
                    <div className="yt-volume-slider">
                        <Slider 
                            min={0} max={100} 
                            value={volume} 
                            onChange={handleVolumeChange}
                            tooltip={{ open: false }} 
                        />
                    </div>
                </div>

                {/* Time Info */}
                <div className="yt-time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Seek Slider */}
                <div className="yt-seek-slider">
                    <Slider 
                        min={0} 
                        max={duration || 100} 
                        value={currentTime} 
                        onChange={handleSeek}
                        disabled={!isReadyToTrack}
                        tooltip={{ formatter: formatTime }}
                    />
                </div>

                {/* Fullscreen Button */}
                <div className="yt-control-btn" onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                </div>
            </div>
        </div>
    );
};

export default YouTubeSecurePlayer;
// src/components/YouTubeSecurePlayer.jsx
import React, { useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Slider, message, Spin } from 'antd';
import { 
  PlayCircleFilled, 
  PauseCircleFilled, 
  FullscreenOutlined, 
  FullscreenExitOutlined 
} from '@ant-design/icons';
import { ProgressApi } from '@/services/api/progressApi';
import "../css/video.css"; // Đảm bảo import CSS mới

const YouTubeSecurePlayer = ({ 
    videoId,      
    contextData,    
    initialData,    
    onComplete,     
    onProgress      
}) => {
    const playerRef = useRef(null); 
    const wrapperRef = useRef(null); // Ref để bọc fullscreen
    
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
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
            controls: 0,    
            disablekb: 1,   
            modestbranding: 1, 
            rel: 0, 
            fs: 0, // Tắt FS native
            origin: window.location.origin, 
        },
    };

    // 1. LOGIC KHÔI PHỤC VỊ TRÍ (RESUME)
    useEffect(() => {
        // Chỉ chạy khi Player sẵn sàng + Có dữ liệu ban đầu + CHƯA bật tracking
        if (isPlayerReady && playerRef.current && !isReadyToTrack && initialData) {
            
            const savedPos = initialData.lastPosition || 0;
            const isCompleted = initialData.status === 'completed' || initialData.percentage >= 95;
            const savedMax = isCompleted ? 999999 : savedPos;

            console.log(`🔄 Resuming at: ${savedPos}s | Max allowed: ${savedMax}s`);

            // Set state nội bộ trước
            setMaxWatchedTime(savedMax);
            setCurrentTime(savedPos);

            // Force Seek
            try {
                playerRef.current.seekTo(savedPos, true);
                playerRef.current.pauseVideo(); // Pause ngay để tránh tự chạy
            } catch (err) {
                console.error("Seek fail:", err);
            }

            // Đợi 1 chút để Youtube xử lý seek xong mới cho phép người dùng thao tác
            // Giúp tránh hiện tượng thanh slider nhảy về 0
            setTimeout(() => {
                setIsReadyToTrack(true);
            }, 800);
        }
    }, [isPlayerReady, initialData, isReadyToTrack]);

    // 2. LOGIC TRACKING & CHẶN TUA
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isReadyToTrack || !playerRef.current || !isPlaying) return;

            const time = playerRef.current.getCurrentTime();
            const totalDuration = playerRef.current.getDuration();

            if (totalDuration && duration !== totalDuration) setDuration(totalDuration);
            setCurrentTime(time);

            // Chặn tua
            if (time > maxWatchedTime + 3) { // Cho phép sai số 3s
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
    }, [isPlaying, maxWatchedTime, duration, isReadyToTrack]);

    const syncProgress = async (currTime, totalTime) => {
        if (!totalTime) return;
        let percent = Math.floor((currTime / totalTime) * 100);
        if (percent > 100) percent = 100;
        const status = percent >= 95 ? 'completed' : 'in_progress';

        if (onProgress) onProgress(percent, currTime, totalTime);

        try {
             await ProgressApi.upsert({
                ...contextData, // Bao gồm cả classId nếu có
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
        setIsPlayerReady(true); // Kích hoạt useEffect số 1
    };

    const onStateChange = (event) => {
        setIsPlaying(event.data === 1); 
        if (event.data === 0) { // Ended
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

    // Listen thoát fullscreen bằng phím ESC
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
            
            {/* Loading Overlay: Chỉ ẩn khi ĐÃ seek xong vị trí cũ */}
            {!isReadyToTrack && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 50, background: '#000', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column', gap: 10
                }}>
                    <Spin size="large" />
                    <span style={{color: '#fff', fontSize: 14}}>Đang đồng bộ tiến độ học...</span>
                </div>
            )}

            {/* Video Area */}
            <div style={{flex: 1, position: 'relative', width: '100%', height: '100%'}}>
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="youtube-iframe-fix"
                    style={{width: '100%', height: '100%'}}
                />
                {/* Lớp chặn click trực tiếp */}
                <div className="yt-click-blocker" onClick={togglePlay} />
            </div>

            {/* Custom Controls Bar */}
            <div className="yt-custom-controls">
                {/* Play/Pause */}
                <div className="yt-control-btn" onClick={togglePlay}>
                    {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
                </div>

                {/* Time Info */}
                <div className="yt-time-display">
                    {formatTime(currentTime)}
                </div>

                {/* Slider */}
                <Slider 
                    min={0} 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    disabled={!isReadyToTrack}
                    tooltip={{ formatter: formatTime }}
                />

                {/* Duration Info */}
                <div className="yt-time-display">
                    {formatTime(duration)}
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
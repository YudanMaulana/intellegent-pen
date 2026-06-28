import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronLeft, ChevronRight, Video } from 'lucide-react';

export default function TimelineController({
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  isMuted,
  setIsMuted,
  scenes,
  currentSceneId,
  jumpToScene
}) {
  const totalDuration = 60; // 60 seconds total script duration

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePrevScene = () => {
    const currentIndex = scenes.findIndex(s => s.id === currentSceneId);
    if (currentIndex > 0) {
      jumpToScene(scenes[currentIndex - 1].id);
    } else {
      setCurrentTime(0);
    }
  };

  const handleNextScene = () => {
    const currentIndex = scenes.findIndex(s => s.id === currentSceneId);
    if (currentIndex < scenes.length - 1) {
      jumpToScene(scenes[currentIndex + 1].id);
    }
  };

  return (
    <div className="timeline-controller-dock">
      {/* Time display & play controls */}
      <div className="timeline-top-row">
        <div className="time-display-wrapper">
          <span className="time-counter">{formatTime(currentTime)}</span>
          <span className="time-divider">/</span>
          <span className="time-total">{formatTime(totalDuration)}</span>
        </div>
        
        <div className="timeline-main-buttons">
          <button className="timeline-btn" onClick={handlePrevScene} title="Previous Scene">
            <ChevronLeft size={18} />
          </button>
          
          <button className="timeline-btn play-pause-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          
          <button className="timeline-btn" onClick={handleNextScene} title="Next Scene">
            <ChevronRight size={18} />
          </button>

          <button className="timeline-btn" onClick={handleReset} title="Reset Video">
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="timeline-right-controls">
          <button className="timeline-btn mute-btn" onClick={toggleMute} title={isMuted ? "Unmute Sound Synthesizer" : "Mute Sound Synthesizer"}>
            {isMuted ? <VolumeX size={18} className="text-red" /> : <Volume2 size={18} />}
          </button>
          
          <div className="recording-indicator-badge">
            <div className="pulse-red-dot"></div>
            <span>VGA SHOWCASE READY</span>
          </div>
        </div>
      </div>

      {/* Timeline track bar */}
      <div className="timeline-track-container">
        <input
          type="range"
          min="0"
          max={totalDuration}
          step="0.05"
          value={currentTime}
          onChange={handleSliderChange}
          className="timeline-slider-input"
          style={{
            background: `linear-gradient(to right, var(--accent-cyan) ${
              (currentTime / totalDuration) * 100
            }%, rgba(255, 255, 255, 0.1) ${(currentTime / totalDuration) * 100}%)`
          }}
        />

        {/* Scene break markers */}
        <div className="scene-markers-overlay">
          {scenes.map((s, idx) => {
            const leftPercent = (s.start / totalDuration) * 100;
            const isActive = currentSceneId === s.id;
            return (
              <div
                key={s.id}
                className={`scene-marker-notch ${isActive ? 'active' : ''}`}
                style={{ left: `${leftPercent}%` }}
                onClick={() => jumpToScene(s.id)}
                title={`${s.name} (${s.start}s - ${s.end}s)`}
              >
                <span className="notch-label">S{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quick Scene Switcher Tabs */}
      <div className="scene-tabs-row">
        {scenes.map((s, index) => {
          const isActive = currentSceneId === s.id;
          return (
            <button
              key={s.id}
              className={`scene-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => jumpToScene(s.id)}
            >
              <div className="scene-tab-num">0{index + 1}</div>
              <div className="scene-tab-name">{s.name}</div>
              <div className="scene-tab-range">{s.start}s - {s.end}s</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

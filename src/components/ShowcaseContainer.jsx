import React, { useState, useEffect, useRef } from 'react';
import Canvas3D from './Canvas3D';
import TimelineController from './TimelineController';
import { synth } from '../utils/audioSynth';
import { 
  Sparkles, CheckCircle, Play, Mic, AlertCircle, FileText, BarChart2,
  TrendingUp, Award, Clock, ArrowRight, RefreshCw, MessageSquare,
  Maximize, Minimize
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    scenes: [
      { id: 1, name: "The Problem", start: 0, end: 7, text: "Every day, we have conversations that shape our future... but most of them are forgotten." },
      { id: 2, name: "The Solution", start: 7, end: 15, text: "Meet the Intelligent Pen. Your AI-powered communication companion." },
      { id: 3, name: "Recording Mode", start: 15, end: 25, text: "With a single click, capture meetings, interviews, negotiations, lectures, and important conversations." },
      { id: 4, name: "AI Processing", start: 25, end: 38, text: "The companion app automatically transcribes every conversation, generates summaries, and extracts key insights." },
      { id: 5, name: "AI Analysis", start: 38, end: 50, text: "Discover how you communicate. Receive personalized feedback to improve your confidence, clarity, listening skills, and negotiation techniques." },
      { id: 6, name: "Final Showcase", start: 50, end: 60, text: "Every conversation becomes an opportunity to learn. Every interaction becomes a chance to grow." }
    ],
    headerBadge: "AI LABS",
    voBadge: "VOICE OVER",
    
    // Scene 1
    s1Pre: "THE DILEMMA",
    s1Title1: "Conversations are",
    s1TitleHighlight: "fleeting.",
    s1Desc: "Important insights, agreements, tasks, and moments of brilliance fade away the moment a conversation ends.",
    s1Words: [
      '"Action Item: Redesign..."',
      '"Due by next Friday..."',
      '"We decided to budget..."',
      '"Who is in charge of...?"',
      '"Let\'s reschedule that..."'
    ],
    
    // Scene 2
    s2Pre: "THE INNOVATION",
    s2Title: "A Click to Remember.",
    s2Activation: "Initiating device activation...",
    s2Active: "INTELLIGENT PEN ACTIVE",
    
    // Scene 3
    s3Pre: "ACTIVE CAPTURE",
    s3Subtitle: "Ambient Listening",
    s3Desc: "A dual-array beamforming microphone captures precise vocal frequencies, isolating voices even in noisy environments.",
    s3Status: "RECORDING",
    s3Client: "Client",
    s3You: "You",
    s3Lines: [
      '"We need a security system that works offline but syncs instantly when connected..."',
      '"Absolutely. Our architecture maintains localized databases, ensuring 100% security and zero data loss."',
      '"Excellent. Can we deploy the prototype to our sandbox server by next Thursday?"'
    ],
    
    // Scene 4
    s4Pre: "REALTIME PROCESSING",
    s4Subtitle: "Structured Summarization",
    s4Desc: "Speech-to-text tokens are instantly structured. Topic categorization, action item lists, and decisions are extracted in real-time.",
    s4Stream: "Audio Stream",
    s4Transcribe: "Transcription",
    s4Extract: "Entity Extraction",
    s4Title: "AI INSIGHTS",
    s4Model: "Pen Core v2.4",
    s4SummaryTitle: "MEETING SUMMARY",
    s4SummaryText: "The discussion centered on the offline-first security prototype deployment. System architecture will support localized storage and auto-sync.",
    s4ActionsTitle: "EXTRACTED ACTION ITEMS",
    s4ActionItems: [
      "Configure offline synchronization service",
      "Deploy sandbox build (Target: Next Thursday)",
      "Verify database encryption levels"
    ],
    
    // Scene 5
    s5Pre: "COMMUNICATION SCORES",
    s5Subtitle: "Personalized Coaching",
    s5Desc: "Receive live feedback on your speaking style. Understand structural communication patterns to level up your delivery.",
    s5Advice: '"Your speaking pace is perfectly optimized. To increase negotiation effectiveness, reduce conversational overlap in early agreement phases."',
    s5EvalTitle: "METRIC EVALUATION",
    s5Score: "Global Score",
    s5MetricDetails: {
      clarity: ["Clarity", "92%", "Articulate and concise speech."],
      confidence: ["Confidence", "88%", "Firm vocal tone and assertive vocabulary."],
      listening: ["Listening", "82%", "High engagement & active pause duration."],
      negotiation: ["Negotiation", "85%", "Win-win phrasing, high alignment index."],
      pace: ["Speaking Pace", "135 WPM", "Highly balanced speaking tempo (Optimal range: 130-150 WPM)."]
    },
    
    // Scene 6
    s6Title1: "Capture.",
    s6Title2: "Understand.",
    s6TitleHighlight: "Improve.",
    s6Tagline: '"Because great communicators aren\'t born... they\'re built."',
    s6Replay: "Replay Showcase",
    s6StartDemo: "Start Auto-Demo",
    s6PauseDemo: "Pause Demo",
    s6AppTitle: "PenSync Mobile",
    s6AppRecent: "Latest Conversation Analysis",
    s6AppMeetingTitle: "Product Alignment Meeting",
    s6AppMeetingDesc: "Key insight: Client confirmed sandboxed testing deadline next Thursday. Pace was stable at 135 WPM."
  },
  id: {
    scenes: [
      { id: 1, name: "Masalah", start: 0, end: 7, text: "Setiap hari, kita melakukan percakapan yang membentuk masa depan kita... namun sebagian besar terlupakan." },
      { id: 2, name: "Solusi", start: 7, end: 15, text: "Perkenalkan Intelligent Pen. Rekan komunikasi Anda yang didukung oleh AI." },
      { id: 3, name: "Mode Perekaman", start: 15, end: 25, text: "Dengan sekali klik, rekam rapat, wawancara, negosiasi, kuliah, dan percakapan penting lainnya." },
      { id: 4, name: "Pemrosesan AI", start: 25, end: 38, text: "Aplikasi pendamping secara otomatis mentranskripsikan setiap percakapan, membuat ringkasan, dan mengekstrak poin penting." },
      { id: 5, name: "Analisis AI", start: 38, end: 50, text: "Temukan cara Anda berkomunikasi. Terima umpan balik yang dipersonalisasi untuk meningkatkan kepercayaan diri, kejelasan, keterampilan mendengarkan, dan teknik negosiasi." },
      { id: 6, name: "Showcase Final", start: 50, end: 60, text: "Setiap percakapan menjadi kesempatan untuk belajar. Setiap interaksi menjadi peluang untuk berkembang." }
    ],
    headerBadge: "LAB AI",
    voBadge: "SUARA LATAR",
    
    // Scene 1
    s1Pre: "DILEMA",
    s1Title1: "Percakapan itu",
    s1TitleHighlight: "fana.",
    s1Desc: "Wawasan penting, kesepakatan, tugas, dan momen brilian memudar begitu percakapan berakhir.",
    s1Words: [
      '"Tugas: Desain Ulang..."',
      '"Batas waktu Jumat depan..."',
      '"Kami menyepakati anggaran..."',
      '"Siapa yang bertanggung jawab...?"',
      '"Ayo jadwalkan ulang..."'
    ],
    
    // Scene 2
    s2Pre: "INOVASI",
    s2Title: "Sekali Klik untuk Mengingat.",
    s2Activation: "Memulai aktivasi perangkat...",
    s2Active: "INTELLIGENT PEN AKTIF",
    
    // Scene 3
    s3Pre: "PEREKAMAN AKTIF",
    s3Subtitle: "Mendengarkan Sekitar",
    s3Desc: "Mikrofon beamforming larik-ganda menangkap frekuensi vokal yang tepat, menyaring suara bahkan di lingkungan bising.",
    s3Status: "MEREKAM",
    s3Client: "Klien",
    s3You: "Anda",
    s3Lines: [
      '"Kami membutuhkan sistem keamanan yang bekerja offline tetapi langsung sinkron saat terhubung..."',
      '"Tentu saja. Arsitektur kami memelihara basis data lokal, menjamin keamanan 100% dan tanpa kehilangan data."',
      '"Luar biasa. Bisakah kita menerapkan prototipe ke server sandbox pada hari Kamis depan?"'
    ],
    
    // Scene 4
    s4Pre: "PEMROSESAN REAL-TIME",
    s4Subtitle: "Ringkasan Terstruktur",
    s4Desc: "Token ucapan-ke-teks langsung terstruktur. Kategori topik, daftar tugas, dan keputusan diekstrak secara real-time.",
    s4Stream: "Aliran Audio",
    s4Transcribe: "Transkripsi",
    s4Extract: "Ekstraksi Entitas",
    s4Title: "WAWASAN AI",
    s4Model: "Inti Pena v2.4",
    s4SummaryTitle: "RINGKASAN RAPAT",
    s4SummaryText: "Diskusi berpusat pada penerapan prototipe keamanan offline-first. Arsitektur sistem mendukung penyimpanan lokal dan sinkronisasi otomatis.",
    s4ActionsTitle: "DAFTAR TUGAS DIKUMPULKAN",
    s4ActionItems: [
      "Konfigurasi layanan sinkronisasi offline",
      "Terapkan build sandbox (Target: Kamis Depan)",
      "Verifikasi tingkat enkripsi basis data"
    ],
    
    // Scene 5
    s5Pre: "SKOR KOMUNIKASI",
    s5Subtitle: "Pelatihan Khusus",
    s5Desc: "Terima umpan balik langsung tentang gaya bicara Anda. Pahami pola komunikasi struktural untuk meningkatkan penyampaian Anda.",
    s5Advice: '"Tempo bicara Anda sangat optimal. Untuk meningkatkan efektivitas negosiasi, kurangi tumpang tindih percakapan di awal fase kesepakatan."',
    s5EvalTitle: "EVALUASI METRIK",
    s5Score: "Skor Global",
    s5MetricDetails: {
      clarity: ["Kejelasan", "92%", "Ucapan yang artikulatif dan ringkas."],
      confidence: ["Kepercayaan Diri", "88%", "Nada vokal yang mantap dan kosakata yang tegas."],
      listening: ["Mendengarkan", "82%", "Keterlibatan tinggi & durasi jeda yang aktif."],
      negotiation: ["Negosiasi", "85%", "Ungkapan saling menguntungkan, indeks keselarasan tinggi."],
      pace: ["Tempo Bicara", "135 kata/mnt", "Tempo bicara yang sangat seimbang (Rentang optimal: 130-150 kata/mnt)."]
    },
    
    // Scene 6
    s6Title1: "Rekam.",
    s6Title2: "Pahami.",
    s6TitleHighlight: "Tingkatkan.",
    s6Tagline: '"Karena komunikator hebat tidak dilahirkan... melainkan dibentuk."',
    s6Replay: "Putar Ulang Showcase",
    s6StartDemo: "Mulai Auto-Demo",
    s6PauseDemo: "Jeda Demo",
    s6AppTitle: "PenSync Mobile",
    s6AppRecent: "Analisis Percakapan Terbaru",
    s6AppMeetingTitle: "Rapat Penyelarasan Produk",
    s6AppMeetingDesc: "Wawasan kunci: Klien mengonfirmasi batas waktu pengujian sandbox Kamis depan. Tempo stabil pada 135 kata/mnt."
  }
};

const FingerPointer = ({ translateY, scale, opacity, rippleScale, rippleOpacity }) => {
  return (
    <div 
      className="finger-anim-wrapper" 
      style={{
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        opacity: opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Contact Ripple ring */}
      <div 
        style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${rippleScale})`,
          opacity: rippleOpacity,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2.5px solid var(--accent-cyan)',
          boxShadow: '0 0 15px var(--accent-cyan)',
          pointerEvents: 'none',
          transition: 'none'
        }}
      />
      
      {/* Laser scanner target ring */}
      <div 
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(0, 242, 254, 0.2)',
          border: '1.5px solid var(--accent-cyan)',
          boxShadow: '0 0 8px rgba(0, 242, 254, 0.5)',
          position: 'absolute',
          top: '-12px',
          left: 'calc(50% - 12px)'
        }}
      />

      {/* Physical Hand Cursor */}
      <img 
        src="/hand-pointer.png" 
        alt="Physical Hand" 
        style={{
          width: '74px',
          height: 'auto',
          marginTop: '4px',
          mixBlendMode: 'screen',
          filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.45))'
        }}
      />
    </div>
  );
};

export default function ShowcaseContainer() {
  const [lang, setLang] = useState('en');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768 || window.innerWidth < window.innerHeight;
      return isMobile ? '9-16' : '16-9';
    }
    return '16-9';
  });
  
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  
  // Track clicks triggered to avoid repeating clicks in the same run of scene 2
  const clickTriggeredRef = useRef(false);
  const chimeTriggeredRef = useRef(false);

  const t = TRANSLATIONS[lang];
  const SCENES = t.scenes;

  // Global Keyboard Controls (Space to Play/Pause, F to Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spacebar plays or pauses
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      // F key toggles HTML Fullscreen
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync mute state with synth
  useEffect(() => {
    synth.setMute(isMuted);
  }, [isMuted]);

  // Determine active scene based on time
  useEffect(() => {
    const activeScene = SCENES.find(s => currentTime >= s.start && currentTime < s.end) || SCENES[SCENES.length - 1];
    if (activeScene.id !== currentSceneId) {
      setCurrentSceneId(activeScene.id);
    }
  }, [currentTime, currentSceneId, SCENES]);

  // Listen to standard fullscreen changes to sync React state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Audio trigger coordination based on scene changes & exact timestamps
  useEffect(() => {
    if (isMuted) return;

    if (currentSceneId === 1) {
      synth.stopHum();
      synth.stopAnalysisHum();
      clickTriggeredRef.current = false;
      chimeTriggeredRef.current = false;
    } 
    else if (currentSceneId === 2) {
      synth.stopHum();
      synth.stopAnalysisHum();
      chimeTriggeredRef.current = false;
    } 
    else if (currentSceneId === 3) {
      synth.stopAnalysisHum();
      synth.startHum();
      chimeTriggeredRef.current = false;
    } 
    else if (currentSceneId === 4) {
      synth.stopHum();
      synth.startAnalysisHum();
      chimeTriggeredRef.current = false;
    } 
    else if (currentSceneId === 5) {
      synth.stopHum();
      synth.stopAnalysisHum();
      // Trigger score complete chime once
      if (!chimeTriggeredRef.current) {
        synth.playChime();
        chimeTriggeredRef.current = true;
      }
    } 
    else if (currentSceneId === 6) {
      synth.stopHum();
      synth.stopAnalysisHum();
    }
  }, [currentSceneId, isMuted]);

  // Check specific timestamps for sub-scene actions (like pen click)
  useEffect(() => {
    // Pen click action occurs at 7.8s (0.8s into Scene 2)
    if (currentTime >= 7.8 && currentTime < 8.5 && !clickTriggeredRef.current) {
      synth.playClick();
      clickTriggeredRef.current = true;
    }
    
    // Reset click trigger ref if user seeks back before click timestamp
    if (currentTime < 7.5) {
      clickTriggeredRef.current = false;
    }
    if (currentTime < 38) {
      chimeTriggeredRef.current = false;
    }
  }, [currentTime]);

  // Animation frame loop to increment timer when playing
  const updateTimer = (time) => {
    if (previousTimeRef.current !== undefined && isPlaying) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      setCurrentTime(prevTime => {
        let nextTime = prevTime + deltaTime;
        if (nextTime >= 60) {
          nextTime = 0; // Loop around
          clickTriggeredRef.current = false;
          chimeTriggeredRef.current = false;
        }
        return nextTime;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  const jumpToScene = (sceneId) => {
    const targetScene = SCENES.find(s => s.id === sceneId);
    if (targetScene) {
      setCurrentTime(targetScene.start);
      // Clean triggers
      if (sceneId === 2) clickTriggeredRef.current = false;
      if (sceneId <= 4) chimeTriggeredRef.current = false;
    }
  };

  const getActiveSceneContent = () => {
    const currentScene = SCENES.find(s => s.id === currentSceneId);
    return currentScene ? currentScene.text : "";
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const activeSceneName = SCENES.find(s => s.id === currentSceneId)?.name || "";

  const handleMobileTap = (e) => {
    if (aspectRatio === '9-16') {
      // Avoid intercepting header control buttons, timeline inputs, etc.
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.lang-switcher')) {
        return;
      }
      
      const willPlay = !isPlaying;
      setIsPlaying(willPlay);
      
      // Auto-fullscreen when playing on mobile
      if (willPlay && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error enabling fullscreen on tap: ${err.message}`);
        });
      }
    }
  };

  // Calculate finger positioning keyframes for Scene 2 (7s - 15s)
  const localSec = currentTime - 7;
  const showFinger = currentSceneId === 2 && localSec >= 0.2 && localSec <= 1.8;
  
  let translateY = -150; // start offscreen above
  let opacity = 0;
  let scale = 1;
  let rippleScale = 0;
  let rippleOpacity = 0;

  if (showFinger) {
    if (localSec >= 0.2 && localSec < 0.6) {
      const progress = (localSec - 0.2) / 0.4;
      translateY = -150 + (progress * 130);
      opacity = progress;
    } else if (localSec >= 0.6 && localSec < 0.85) {
      const progress = (localSec - 0.6) / 0.25;
      translateY = -20 + (progress * 20);
      opacity = 1;
      scale = 1 - (progress * 0.12);
    } else if (localSec >= 0.85 && localSec < 1.1) {
      const progress = (localSec - 0.85) / 0.25;
      translateY = progress * -20;
      opacity = 1;
      scale = 0.88 + (progress * 0.12);
      rippleScale = progress * 3.5;
      rippleOpacity = 1 - progress;
    } else if (localSec >= 1.1 && localSec <= 1.8) {
      const progress = (localSec - 1.1) / 0.7;
      translateY = -20 - (progress * 130);
      opacity = 1 - progress;
    }
  }

  return (
    <div className={`showcase-viewport-wrapper ${aspectRatio === '9-16' ? 'mobile-viewport' : ''}`}>
      <div 
        className={`showcase-main-layout ${isFullscreen ? 'cinema-mode-active' : ''} ${aspectRatio === '9-16' ? 'aspect-9-16' : ''}`}
        onClick={handleMobileTap}
      >
        {/* Mobile Play Overlay (Tap to Play) */}
        {aspectRatio === '9-16' && !isPlaying && (
          <div 
            className="mobile-play-overlay" 
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsPlaying(true); 
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                  console.warn(`Error enabling fullscreen: ${err.message}`);
                });
              }
            }}
          >
            <div className="mobile-play-btn-glow">
              <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
            </div>
            <span className="mobile-play-label">
              {lang === 'en' ? 'TAP TO START SHOWCASE' : 'KETUK UNTUK MEMUTAR'}
            </span>
          </div>
        )}
        {/* 3D WebGL Canvas Layer */}
        <Canvas3D scene={currentSceneId} currentTime={currentTime} isPlaying={isPlaying} isPortrait={aspectRatio === '9-16'} />

        {/* Background Ambience Layer */}
        <div className="ambient-background-glow"></div>

        {/* Top Header Bar */}
        <header className="showcase-header player-controls-element">
          <div className="logo-section">
            <div className="logo-icon-glow">
              <div className="inner-dot"></div>
            </div>
            <span className="brand-name">INTELLIGENT PEN</span>
            <span className="badge-tag">{t.headerBadge}</span>
          </div>
          
          <div className="header-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
            {/* Sleek Language Switcher */}
            <div className="lang-switcher">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => setLang('id')}>ID</button>
            </div>

            {/* Aspect Ratio Switcher */}
            <div className="lang-switcher">
              <button className={`lang-btn ${aspectRatio === '16-9' ? 'active' : ''}`} onClick={() => setAspectRatio('16-9')}>16:9</button>
              <button className={`lang-btn ${aspectRatio === '9-16' ? 'active' : ''}`} onClick={() => setAspectRatio('9-16')}>9:16</button>
            </div>

            <div className="scene-indicator-pill">
              <span className="scene-idx">{lang === 'en' ? 'SCENE' : 'ADEGAN'} 0{currentSceneId}</span>
              <span className="scene-dash">—</span>
              <span className="scene-name">{activeSceneName}</span>
            </div>

            {/* Quick Exit Floating Icon when in fullscreen */}
            {isFullscreen && (
              <button className="timeline-btn minimize-float-btn" onClick={toggleFullscreen} title="Exit Fullscreen">
                <Minimize size={14} />
              </button>
            )}
          </div>
        </header>

      {/* Cinematic Scene HTML HUD Overlays */}
      <div className="cinematic-overlays-container">
        
        {/* SCENE 1: THE PROBLEM */}
        {currentSceneId === 1 && (
          <div className="overlay-wrapper fade-in-anim">
            <div className="scene-content-left">
              <span className="pre-title">{t.s1Pre}</span>
              <h1 className="cinematic-title text-gradient-grey">
                {t.s1Title1} <br />
                <span className="white-highlight">{t.s1TitleHighlight}</span>
              </h1>
              <p className="cinematic-description">
                {t.s1Desc}
              </p>
              
              <div className="fading-words-container">
                {t.s1Words.map((word, i) => (
                  <div key={i} className={`fade-word w${i+1}`}>{word}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCENE 2: THE SOLUTION */}
        {currentSceneId === 2 && (
          <div className="overlay-wrapper fade-in-anim">
            {/* Hand Pressing Button Animation */}
            {showFinger && (
              <div className="finger-anim-container">
                <FingerPointer 
                  translateY={translateY} 
                  scale={scale} 
                  opacity={opacity} 
                  rippleScale={rippleScale} 
                  rippleOpacity={rippleOpacity} 
                />
              </div>
            )}
            
            <div className="scene-content-center-top">
              <span className="pre-title cyan-glow-text">{t.s2Pre}</span>
              <h1 className="cinematic-title-center text-gradient-cyan">
                {t.s2Title}
              </h1>
              
              {currentTime - 7 < 0.8 ? (
                <div className="interactive-click-hint">
                  <div className="radar-ping"></div>
                  <span className="hint-label">{t.s2Activation}</span>
                </div>
              ) : (
                <div className="device-status-badge success-glow">
                  <Sparkles size={16} className="spin-slow" />
                  <span>{t.s2Active}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCENE 3: RECORDING MODE */}
        {currentSceneId === 3 && (
          <div className="overlay-wrapper fade-in-anim grid-2col">
            <div className="scene-content-left justify-center">
              <span className="pre-title cyan-glow-text">{t.s3Pre}</span>
              <h2 className="scene-subtitle">{t.s3Subtitle}</h2>
              <p className="cinematic-description">
                {t.s3Desc}
              </p>
              
              <div className="audio-wave-visualizer">
                {[...Array(16)].map((_, i) => {
                  const randomHeight = 10 + Math.abs(Math.sin((currentTime * 8) + i * 0.5)) * 60;
                  return (
                    <div 
                      key={i} 
                      className="wave-bar" 
                      style={{ height: `${randomHeight}%` }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="scene-content-right align-center justify-center">
              <div className="glass-panel recording-console">
                <div className="console-header">
                  <div className="indicator-group">
                    <div className="recording-led"></div>
                    <span className="console-status">{t.s3Status}</span>
                  </div>
                  <span className="console-timer">00:{Math.floor(currentTime - 15).toString().padStart(2, '0')}</span>
                </div>
                
                <div className="live-transcript-feed">
                  <div className="feed-line speaker-a">
                    <span className="speaker-label">{t.s3Client}:</span>
                    <span className="speech-text">{t.s3Lines[0]}</span>
                  </div>
                  {currentTime - 15 > 3 && (
                    <div className="feed-line speaker-b">
                      <span className="speaker-label">{t.s3You}:</span>
                      <span className="speech-text">{t.s3Lines[1]}</span>
                    </div>
                  )}
                  {currentTime - 15 > 6 && (
                    <div className="feed-line speaker-a">
                      <span className="speaker-label">{t.s3Client}:</span>
                      <span className="speech-text">{t.s3Lines[2]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 4: AI PROCESSING */}
        {currentSceneId === 4 && (
          <div className="overlay-wrapper fade-in-anim grid-2col">
            <div className="scene-content-left justify-center">
              <span className="pre-title purple-glow-text">{t.s4Pre}</span>
              <h2 className="scene-subtitle">{t.s4Subtitle}</h2>
              <p className="cinematic-description">
                {t.s4Desc}
              </p>
              
              <div className="token-stream-box">
                <span className="token active">{t.s4Stream}</span>
                <span className="token-arrow">→</span>
                <span className="token active">{t.s4Transcribe}</span>
                <span className="token-arrow">→</span>
                <span className="token highlight">{t.s4Extract}</span>
              </div>
            </div>

            <div className="scene-content-right justify-center">
              <div className="glass-panel dashboard-panel">
                <div className="dashboard-header">
                  <div className="tab-title">
                    <FileText size={16} className="text-cyan" />
                    <span>{t.s4Title}</span>
                  </div>
                  <span className="ai-model-tag">{t.s4Model}</span>
                </div>

                <div className="dashboard-content">
                  <div className="dashboard-section-title">{t.s4SummaryTitle}</div>
                  <div className="summary-bubble">
                    {t.s4SummaryText}
                  </div>

                  <div className="dashboard-section-title">{t.s4ActionsTitle}</div>
                  <ul className="action-list">
                    <li className="checked">
                      <CheckCircle size={14} className="text-cyan" />
                      <span>{t.s4ActionItems[0]}</span>
                    </li>
                    <li className={currentTime - 25 > 6 ? "checked" : "pending"}>
                      {currentTime - 25 > 6 ? <CheckCircle size={14} className="text-cyan" /> : <div className="dot-pending"></div>}
                      <span>{t.s4ActionItems[1]}</span>
                    </li>
                    <li className="pending">
                      <div className="dot-pending"></div>
                      <span>{t.s4ActionItems[2]}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 5: AI ANALYSIS */}
        {currentSceneId === 5 && (
          <div className="overlay-wrapper fade-in-anim grid-2col">
            <div className="scene-content-left-half justify-center">
              <span className="pre-title green-glow-text">{t.s5Pre}</span>
              <h2 className="scene-subtitle">{t.s5Subtitle}</h2>
              <p className="cinematic-description">
                {t.s5Desc}
              </p>
              
              <div className="coaching-quote-card">
                <div className="quote-icon">💡</div>
                <div className="quote-text">
                  {t.s5Advice}
                </div>
              </div>
            </div>

            <div className="scene-content-right-half justify-center">
              <div className="glass-panel scores-grid-panel">
                <div className="grid-header">
                  <div className="tab-title">
                    <BarChart2 size={16} className="text-emerald" />
                    <span>{t.s5EvalTitle}</span>
                  </div>
                  <div className="score-badge">91/100</div>
                </div>

                <div className="scores-grid">
                  {/* Clarity */}
                  <div className="score-card">
                    <div className="score-card-top">
                      <span className="card-name">{t.s5MetricDetails.clarity[0]}</span>
                      <span className="card-val text-cyan">{t.s5MetricDetails.clarity[1]}</span>
                    </div>
                    <div className="score-meter-bar">
                      <div className="meter-fill bg-cyan" style={{ width: '92%' }}></div>
                    </div>
                    <span className="card-detail">{t.s5MetricDetails.clarity[2]}</span>
                  </div>

                  {/* Confidence */}
                  <div className="score-card">
                    <div className="score-card-top">
                      <span className="card-name">{t.s5MetricDetails.confidence[0]}</span>
                      <span className="card-val text-purple">{t.s5MetricDetails.confidence[1]}</span>
                    </div>
                    <div className="score-meter-bar">
                      <div className="meter-fill bg-purple" style={{ width: '88%' }}></div>
                    </div>
                    <span className="card-detail">{t.s5MetricDetails.confidence[2]}</span>
                  </div>

                  {/* Listening */}
                  <div className="score-card">
                    <div className="score-card-top">
                      <span className="card-name">{t.s5MetricDetails.listening[0]}</span>
                      <span className="card-val text-green">{t.s5MetricDetails.listening[1]}</span>
                    </div>
                    <div className="score-meter-bar">
                      <div className="meter-fill bg-green" style={{ width: '82%' }}></div>
                    </div>
                    <span className="card-detail">{t.s5MetricDetails.listening[2]}</span>
                  </div>

                  {/* Negotiation */}
                  <div className="score-card">
                    <div className="score-card-top">
                      <span className="card-name">{t.s5MetricDetails.negotiation[0]}</span>
                      <span className="card-val text-amber">{t.s5MetricDetails.negotiation[1]}</span>
                    </div>
                    <div className="score-meter-bar">
                      <div className="meter-fill bg-amber" style={{ width: '85%' }}></div>
                    </div>
                    <span className="card-detail">{t.s5MetricDetails.negotiation[2]}</span>
                  </div>

                  {/* Speaking Pace */}
                  <div className="score-card col-span-2">
                    <div className="score-card-top">
                      <span className="card-name">{t.s5MetricDetails.pace[0]}</span>
                      <span className="card-val text-white">{t.s5MetricDetails.pace[1]}</span>
                    </div>
                    <div className="score-meter-bar">
                      <div className="meter-fill bg-white" style={{ width: '75%' }}></div>
                    </div>
                    <span className="card-detail">{t.s5MetricDetails.pace[2]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 6: FINAL SHOWCASE */}
        {currentSceneId === 6 && (
          <div className="overlay-wrapper fade-in-anim grid-2col-reverse">
            
            {/* Left side: Smartphone mockup + Logo and Replay */}
            <div className="scene-content-left justify-center flex-column">
              <div className="final-promo-content">
                <span className="promo-badge">INTELLIGENT PEN</span>
                <h1 className="final-title">
                  {t.s6Title1} <br />
                  {t.s6Title2} <br />
                  <span className="glow-cyan-title">{t.s6TitleHighlight}</span>
                </h1>
                
                <p className="final-tagline">
                  {t.s6Tagline}
                </p>

                <div className="final-actions-row">
                  <button className="cta-btn primary-btn" onClick={() => jumpToScene(1)}>
                    <RefreshCw size={16} />
                    <span>{t.s6Replay}</span>
                  </button>
                  <button className="cta-btn secondary-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    <span>{isPlaying ? t.s6PauseDemo : t.s6StartDemo}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Smartphone mockup rendered in gorgeous CSS glassmorphism */}
            <div className="scene-content-right align-center justify-center">
              <div className="smartphone-frame-glow">
                <div className="smartphone-body">
                  <div className="smartphone-screen">
                    <div className="camera-notch"></div>
                    
                    {/* App Internal GUI */}
                    <div className="app-gui">
                      <div className="app-nav">
                        <div className="app-logo-dot"></div>
                        <span className="app-nav-title">{t.s6AppTitle}</span>
                        <div className="battery-indicator">100%</div>
                      </div>

                      <div className="app-scroll-content">
                        <div className="app-score-circle">
                          <div className="circle-inner">
                            <span className="big-num">91</span>
                            <span className="small-lbl">{lang === 'en' ? 'Global Score' : 'Skor Global'}</span>
                          </div>
                        </div>

                        <div className="app-recent-title">{t.s6AppRecent}</div>
                        
                        <div className="app-card">
                          <div className="app-card-title">
                            <Clock size={12} className="text-cyan" />
                            <span>{t.s6AppMeetingTitle}</span>
                          </div>
                          <p className="app-card-p">
                            {t.s6AppMeetingDesc}
                          </p>
                        </div>

                        <div className="app-metric-row">
                          <div className="app-mini-stat">
                            <span className="app-stat-lbl">{t.s5MetricDetails.clarity[0]}</span>
                            <span className="app-stat-val">92%</span>
                          </div>
                          <div className="app-mini-stat">
                            <span className="app-stat-lbl">{t.s5MetricDetails.confidence[0]}</span>
                            <span className="app-stat-val">88%</span>
                          </div>
                          <div className="app-mini-stat">
                            <span className="app-stat-lbl">{t.s5MetricDetails.listening[0]}</span>
                            <span className="app-stat-val">82%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Cinematic Voice Over Subtitles at Bottom */}
      <div className="cinematic-subtitles-bar">
        <div className="vo-badge">{t.voBadge}</div>
        <p className="subtitle-text">
          "{getActiveSceneContent()}"
        </p>
      </div>

      {/* Timeline scrubbing controller */}
      <div className="player-controls-element">
        <TimelineController
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          scenes={SCENES}
          currentSceneId={currentSceneId}
          jumpToScene={jumpToScene}
        />
      </div>

      {/* Floating Fullscreen button on the page for easy access */}
      {!isFullscreen && (
        <button 
          className="fullscreen-floating-action-btn"
          onClick={toggleFullscreen}
          title="Enter Fullscreen Showcase Mode (F)"
        >
          <Maximize size={18} />
        </button>
      )}
      </div>
    </div>
  );
}

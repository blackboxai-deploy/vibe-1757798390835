"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface BeatmakerProps {
  onBack: () => void;
}

interface Track {
  id: string;
  name: string;
  pattern: boolean[];
  volume: number;
  muted: boolean;
  sample: string;
}

interface EffectSettings {
  reverb: number;
  delay: number;
  distortion: number;
  lowpass: number;
  highpass: number;
  autotune: boolean;
  autotuneKey: string;
  autotuneStrength: number;
}

export default function Beatmaker({ onBack }: BeatmakerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [recordedTracks, setRecordedTracks] = useState<string[]>([]);
  
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "kick",
      name: "Kick Drum",
      pattern: new Array(16).fill(false),
      volume: 80,
      muted: false,
      sample: "kick"
    },
    {
      id: "snare",
      name: "Snare",
      pattern: new Array(16).fill(false),
      volume: 70,
      muted: false,
      sample: "snare"
    },
    {
      id: "hihat",
      name: "Hi-Hat",
      pattern: new Array(16).fill(false),
      volume: 60,
      muted: false,
      sample: "hihat"
    },
    {
      id: "bass",
      name: "Bass",
      pattern: new Array(16).fill(false),
      volume: 75,
      muted: false,
      sample: "bass"
    },
    {
      id: "synth",
      name: "Synth Lead",
      pattern: new Array(16).fill(false),
      volume: 65,
      muted: false,
      sample: "synth"
    },
    {
      id: "vocal",
      name: "Vocal Sample",
      pattern: new Array(16).fill(false),
      volume: 85,
      muted: false,
      sample: "vocal"
    }
  ]);

  const [effects, setEffects] = useState<EffectSettings>({
    reverb: 20,
    delay: 15,
    distortion: 0,
    lowpass: 100,
    highpass: 0,
    autotune: false,
    autotuneKey: "C",
    autotuneStrength: 50
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = () => {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    };

    initAudio();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate synthetic audio samples
  const generateSample = useCallback((type: string, frequency: number = 60, duration: number = 0.2) => {
    if (!audioContextRef.current) return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContextRef.current.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case "kick":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 30);
          const oscillator = Math.sin(2 * Math.PI * frequency * t * (1 - t * 2));
          data[i] = oscillator * envelope * 0.8;
        }
        break;
      
      case "snare":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 20);
          const noise = (Math.random() * 2 - 1) * 0.5;
          const tone = Math.sin(2 * Math.PI * 200 * t);
          data[i] = (noise + tone * 0.3) * envelope * 0.6;
        }
        break;
      
      case "hihat":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 50);
          const noise = (Math.random() * 2 - 1);
          data[i] = noise * envelope * 0.3;
        }
        break;
      
      case "bass":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 5);
          const oscillator = Math.sin(2 * Math.PI * frequency * t);
          data[i] = oscillator * envelope * 0.7;
        }
        break;
      
      case "synth":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 3);
          const osc1 = Math.sin(2 * Math.PI * frequency * 2 * t);
          const osc2 = Math.sin(2 * Math.PI * frequency * 2.01 * t);
          data[i] = (osc1 + osc2) * envelope * 0.4;
        }
        break;
      
      case "vocal":
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const envelope = Math.sin(Math.PI * t / duration);
          const formant1 = Math.sin(2 * Math.PI * 800 * t);
          const formant2 = Math.sin(2 * Math.PI * 1200 * t);
          data[i] = (formant1 + formant2 * 0.5) * envelope * 0.5;
        }
        break;
    }

    return buffer;
  }, []);

  const playSound = useCallback((sampleType: string, trackVolume: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const buffer = generateSample(sampleType);
    if (!buffer) return;

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime((trackVolume / 100) * (volume[0] / 100), audioContextRef.current.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(gainNodeRef.current);
    
    source.start();
  }, [volume, generateSample]);

  const startSequencer = () => {
    if (!audioContextRef.current) {
      // Try to initialize audio context if it doesn't exist
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    
    // Resume audio context if it's suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsPlaying(true);
    const stepTime = (60 / bpm / 4) * 1000; // 16th notes

    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Play sounds for current step
        tracks.forEach(track => {
          if (track.pattern[nextStep] && !track.muted) {
            playSound(track.sample, track.volume);
          }
        });
        
        return nextStep;
      });
    }, stepTime);
  };

  const stopSequencer = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleStep = (trackId: string, stepIndex: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, pattern: track.pattern.map((step, i) => i === stepIndex ? !step : step) }
        : track
    ));
  };

  const updateTrackVolume = (trackId: string, newVolume: number[]) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume: newVolume[0] } : track
    ));
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const clearPattern = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, pattern: new Array(16).fill(false) } : track
    ));
  };

  const randomizePattern = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, pattern: new Array(16).fill(false).map(() => Math.random() > 0.7) }
        : track
    ));
  };

  const exportToWAV = () => {
    if (!audioContextRef.current) return;
    
    // Simulate WAV export
    const link = document.createElement('a');
    link.href = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBj2b3PLEeS0GK4fT8tiORwo='; // Sample base64 WAV data
    link.download = `street_empire_beat_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setRecordedTracks(prev => [...prev, `Beat ${prev.length + 1}`]);
  };

  const loadPreset = (presetName: string) => {
    const presets: { [key: string]: Track[] } = {
      "Hip Hop": [
        { ...tracks[0], pattern: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false] },
        { ...tracks[1], pattern: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
        { ...tracks[2], pattern: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false] },
        { ...tracks[3], pattern: [true, false, false, true, false, false, false, false, true, false, false, true, false, false, false, false] },
        { ...tracks[4], pattern: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] },
        { ...tracks[5], pattern: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] }
      ],
      "Trap": [
        { ...tracks[0], pattern: [true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false] },
        { ...tracks[1], pattern: [false, false, false, false, true, false, false, true, false, false, false, false, true, false, false, true] },
        { ...tracks[2], pattern: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true] },
        { ...tracks[3], pattern: [true, false, false, false, true, false, true, false, false, false, false, false, true, false, true, false] },
        { ...tracks[4], pattern: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
        { ...tracks[5], pattern: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] }
      ]
    };
    
    if (presets[presetName]) {
      setTracks(presets[presetName]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Street Empire Beatmaker
          </h1>
          <div className="flex gap-4">
            <Button onClick={onBack} variant="outline" className="text-white border-white">
              ← Back to Menu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Sequencer */}
          <div className="xl:col-span-3">
            <Card className="bg-gray-900/80 border-2 border-green-500/50 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">16-Step Sequencer</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-white font-bold text-lg">
                      BPM: <span className="text-green-400">{bpm}</span>
                    </div>
                    <div className="w-32">
                      <Slider
                        value={[bpm]}
                        onValueChange={(value) => setBpm(value[0])}
                        min={60}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-black/20 p-6">
                <div className="space-y-6">
                  {/* Step indicators - Make them more visible */}
                  <div className="flex gap-2 mb-6 pl-48">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-8 flex items-center justify-center text-sm font-bold rounded-lg border-2 transition-all ${
                          currentStep === i 
                            ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-400/50 scale-110' 
                            : 'bg-gray-800 text-white border-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Track rows - Improve visibility */}
                  {tracks.map((track, trackIndex) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div className="w-40 flex-shrink-0">
                        <div className="text-white text-base font-bold mb-2">{track.name}</div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant={track.muted ? "destructive" : "default"}
                            onClick={() => toggleTrackMute(track.id)}
                            className={`px-3 py-2 text-sm font-bold ${
                              track.muted 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {track.muted ? "🔇 MUTE" : "🔊 ON"}
                          </Button>
                          <div className="flex-1">
                            <div className="text-white text-xs mb-1">Vol: {track.volume}</div>
                            <Slider
                              value={[track.volume]}
                              onValueChange={(value) => updateTrackVolume(track.id, value)}
                              max={100}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {track.pattern.map((active, stepIndex) => (
                          <button
                            key={stepIndex}
                            onClick={() => toggleStep(track.id, stepIndex)}
                            className={`w-12 h-12 rounded-lg border-3 transition-all duration-200 font-bold text-xs ${
                              active
                                ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50 text-white scale-105' 
                                : 'bg-gray-700 border-gray-500 hover:border-gray-400 hover:bg-gray-600 text-gray-300'
                            } ${
                              currentStep === stepIndex ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
                            }`}
                          >
                            {active ? '●' : '○'}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => clearPattern(track.id)}
                          className="px-3 py-2 text-sm bg-red-700 hover:bg-red-800 text-white"
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => randomizePattern(track.id)}
                          className="px-3 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white"
                        >
                          Random
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel - Improve visibility */}
          <div className="space-y-6">
            {/* Transport Controls */}
            <Card className="bg-gray-900/80 border-2 border-green-500/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Transport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={isPlaying ? stopSequencer : startSequencer}
                    className={`flex-1 text-lg py-4 font-bold ${
                      isPlaying 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isPlaying ? "⏹ STOP" : "▶ PLAY"}
                  </Button>
                </div>
                
                <div>
                  <label className="text-white text-base font-semibold block mb-2">
                    Master Volume: {volume[0]}%
                  </label>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card className="bg-gray-900/80 border-2 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Beat Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="default"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                  onClick={() => loadPreset("Hip Hop")}
                >
                  🎵 Hip Hop Pattern
                </Button>
                <Button
                  variant="default"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
                  onClick={() => loadPreset("Trap")}
                >
                  🔥 Trap Pattern
                </Button>
              </CardContent>
            </Card>

            {/* Effects */}
            <Card className="bg-gray-900/80 border-2 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Effects & Autotune</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <label className="text-white text-base font-semibold">Autotune</label>
                  <Switch
                    checked={effects.autotune}
                    onCheckedChange={(checked) => 
                      setEffects(prev => ({ ...prev, autotune: checked }))
                    }
                  />
                </div>
                
                {effects.autotune && (
                  <div className="space-y-3 p-3 bg-purple-900/30 rounded-lg border border-purple-500/50">
                    <div>
                      <label className="text-white text-base font-semibold block mb-2">
                        Key: {effects.autotuneKey}
                      </label>
                      <select
                        value={effects.autotuneKey}
                        onChange={(e) => setEffects(prev => ({ ...prev, autotuneKey: e.target.value }))}
                        className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 text-base"
                      >
                        {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-white text-base font-semibold block mb-2">
                        Strength: {effects.autotuneStrength}%
                      </label>
                      <Slider
                        value={[effects.autotuneStrength]}
                        onValueChange={(value) => 
                          setEffects(prev => ({ ...prev, autotuneStrength: value[0] }))
                        }
                        max={100}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-white text-base font-semibold block mb-2">
                    Reverb: {effects.reverb}%
                  </label>
                  <Slider
                    value={[effects.reverb]}
                    onValueChange={(value) => 
                      setEffects(prev => ({ ...prev, reverb: value[0] }))
                    }
                    max={100}
                  />
                </div>
                
                <div>
                  <label className="text-white text-base font-semibold block mb-2">
                    Delay: {effects.delay}%
                  </label>
                  <Slider
                    value={[effects.delay]}
                    onValueChange={(value) => 
                      setEffects(prev => ({ ...prev, delay: value[0] }))
                    }
                    max={100}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="bg-gray-900/80 border-2 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Export & Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={exportToWAV}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-lg"
                >
                  💾 Export to WAV
                </Button>
                
                <div className="space-y-2">
                  <div className="text-white text-base font-semibold">Recorded Beats:</div>
                  <div className="max-h-32 overflow-y-auto">
                    {recordedTracks.map((track, index) => (
                      <div key={index} className="text-green-400 text-sm p-2 bg-green-900/20 rounded border border-green-500/30">
                        ✓ {track}
                      </div>
                    ))}
                    {recordedTracks.length === 0 && (
                      <div className="text-gray-400 text-sm italic">No beats recorded yet</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
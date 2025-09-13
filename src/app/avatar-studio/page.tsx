"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface AvatarLimb {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  baseX: number;
  baseY: number;
}

interface AvatarData {
  head: {
    x: number;
    y: number;
    width: number;
    height: number;
    faceImage?: string;
    skinTone: string;
  };
  torso: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  };
  leftArm: AvatarLimb;
  rightArm: AvatarLimb;
  leftLeg: AvatarLimb;
  rightLeg: AvatarLimb;
}

interface AnimationState {
  time: number;
  walkCycle: boolean;
  waving: boolean;
  dancing: boolean;
  jumping: boolean;
  speed: number;
  armIntensity: number;
  legIntensity: number;
}

export default function AvatarStudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number>();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [animationActive, setAnimationActive] = useState(false);
  
  const [avatar, setAvatar] = useState<AvatarData>({
    head: {
      x: 175,
      y: 50,
      width: 120,
      height: 140,
      skinTone: "#F5DEB3"
    },
    torso: {
      x: 150,
      y: 190,
      width: 170,
      height: 200,
      color: "#4A90E2"
    },
    leftArm: {
      x: 125,
      y: 200,
      width: 25,
      height: 120,
      rotation: 0,
      baseX: 125,
      baseY: 200
    },
    rightArm: {
      x: 320,
      y: 200,
      width: 25,
      height: 120,
      rotation: 0,
      baseX: 320,
      baseY: 200
    },
    leftLeg: {
      x: 175,
      y: 390,
      width: 35,
      height: 140,
      rotation: 0,
      baseX: 175,
      baseY: 390
    },
    rightLeg: {
      x: 260,
      y: 390,
      width: 35,
      height: 140,
      rotation: 0,
      baseX: 260,
      baseY: 390
    }
  });
  
  const [animation, setAnimation] = useState<AnimationState>({
    time: 0,
    walkCycle: true,
    waving: false,
    dancing: false,
    jumping: false,
    speed: 60,
    armIntensity: 40,
    legIntensity: 30
  });

  const [customization, setCustomization] = useState({
    skinTone: 2,
    torsoColor: 1,
    armColor: 0,
    legColor: 3
  });

  const skinTones = ["#FFEAA7", "#F5DEB3", "#DEB887", "#CD853F", "#A0522D", "#8B4513"];
  const bodyColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Camera access denied. Please allow camera permission and try again.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // File upload handling
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        extractFaceFromImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Advanced face extraction
  const extractFaceFromImage = async (imageData: string) => {
    try {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCanvas.width = 120;
          tempCanvas.height = 140;
          
          // Smart cropping - assume face is in center-top area
          const sourceX = img.width * 0.2;
          const sourceY = img.height * 0.1;
          const sourceWidth = img.width * 0.6;
          const sourceHeight = img.height * 0.7;
          
          // Draw cropped face
          tempCtx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, 120, 140
          );
          
          // Apply circular mask for better integration
          tempCtx.globalCompositeOperation = 'destination-in';
          tempCtx.beginPath();
          tempCtx.ellipse(60, 70, 55, 65, 0, 0, 2 * Math.PI);
          tempCtx.fill();
          
          const processedFace = tempCanvas.toDataURL();
          setAvatar(prev => ({
            ...prev,
            head: { ...prev.head, faceImage: processedFace }
          }));
        }
        setIsProcessing(false);
      };
      img.src = imageData;
    } catch (error) {
      console.error("Face extraction error:", error);
      setIsProcessing(false);
    }
  };

  // Animation engine
  const updateAnimation = useCallback(() => {
    if (!animationActive) return;
    
    const deltaTime = 0.016; // 60fps
    setAnimation(prev => ({ ...prev, time: prev.time + deltaTime * prev.speed / 50 }));
    
    // Update avatar positions based on animation
    setAvatar(prev => {
      const newAvatar = { ...prev };
      const time = animation.time;
      
      if (animation.walkCycle) {
        // Walking cycle
        const armSwing = Math.sin(time * 3) * animation.armIntensity / 100 * 45;
        const legSwing = Math.sin(time * 3) * animation.legIntensity / 100 * 30;
        
        newAvatar.leftArm.rotation = armSwing;
        newAvatar.rightArm.rotation = -armSwing;
        newAvatar.leftLeg.rotation = legSwing;
        newAvatar.rightLeg.rotation = -legSwing;
      }
      
      if (animation.waving) {
        // Waving animation
        newAvatar.rightArm.rotation = Math.sin(time * 5) * 60 - 20;
        newAvatar.leftArm.rotation = Math.sin(time * 4 + 1) * 30;
      }
      
      if (animation.dancing) {
        // Dancing motion
        const dance = Math.sin(time * 4);
        newAvatar.leftArm.rotation = dance * 45;
        newAvatar.rightArm.rotation = -dance * 45;
        newAvatar.head.x = 175 + Math.sin(time * 6) * 10;
        newAvatar.torso.x = 150 + Math.sin(time * 6) * 8;
      }
      
      if (animation.jumping) {
        // Jumping animation
        const jumpHeight = Math.abs(Math.sin(time * 2)) * 40;
        const baseY = [50, 190, 200, 200, 390, 390];
        
        newAvatar.head.y = baseY[0] - jumpHeight;
        newAvatar.torso.y = baseY[1] - jumpHeight;
        newAvatar.leftArm.y = baseY[2] - jumpHeight;
        newAvatar.rightArm.y = baseY[3] - jumpHeight;
        newAvatar.leftLeg.y = baseY[4] - jumpHeight;
        newAvatar.rightLeg.y = baseY[5] - jumpHeight;
        
        // Leg bend during jump
        if (jumpHeight > 20) {
          newAvatar.leftLeg.rotation = -30;
          newAvatar.rightLeg.rotation = -30;
        }
      }
      
      return newAvatar;
    });
    
    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [animationActive, animation]);

  const startAnimation = () => {
    setAnimationActive(true);
    updateAnimation();
  };

  const stopAnimation = () => {
    setAnimationActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    resetAvatarPosition();
  };

  const resetAvatarPosition = () => {
    setAvatar(prev => ({
      ...prev,
      head: { ...prev.head, x: 175, y: 50 },
      torso: { ...prev.torso, x: 150, y: 190 },
      leftArm: { ...prev.leftArm, x: 125, y: 200, rotation: 0 },
      rightArm: { ...prev.rightArm, x: 320, y: 200, rotation: 0 },
      leftLeg: { ...prev.leftLeg, x: 175, y: 390, rotation: 0 },
      rightLeg: { ...prev.rightLeg, x: 260, y: 390, rotation: 0 }
    }));
  };

  // Recording functionality
  const startRecording = async () => {
    if (!cameraActive) {
      await startCamera();
      // Wait a moment for camera to initialize
      setTimeout(() => startActualRecording(), 1000);
    } else {
      startActualRecording();
    }
  };

  const startActualRecording = () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (!stream) return;
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
      };
      
      mediaRecorderRef.current.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start animation during recording
      if (!animationActive) {
        startAnimation();
      }
      
      // Timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 60) { // Max 60 seconds
            stopRecording();
            clearInterval(timer);
            return 60;
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error("Recording error:", error);
      alert("Recording failed. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // Canvas rendering
  const renderAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#e3f2fd");
    gradient.addColorStop(1, "#bbdefb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Helper function to draw rotated limb
    const drawLimb = (limb: AvatarLimb, color: string) => {
      ctx.save();
      ctx.translate(limb.x + limb.width/2, limb.y);
      ctx.rotate(limb.rotation * Math.PI / 180);
      ctx.fillStyle = color;
      ctx.roundRect(-limb.width/2, 0, limb.width, limb.height, 8);
      ctx.fill();
      
      // Add joint
      ctx.fillStyle = "#8D6E63";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Draw legs (behind torso)
    drawLimb(avatar.leftLeg, bodyColors[customization.legColor]);
    drawLimb(avatar.rightLeg, bodyColors[customization.legColor]);
    
    // Draw torso
    ctx.fillStyle = avatar.torso.color;
    ctx.roundRect(avatar.torso.x, avatar.torso.y, avatar.torso.width, avatar.torso.height, 15);
    ctx.fill();
    
    // Add torso details
    ctx.fillStyle = "#34495e";
    ctx.roundRect(avatar.torso.x + 20, avatar.torso.y + 20, avatar.torso.width - 40, 15, 5);
    ctx.fill();
    
    // Draw arms
    drawLimb(avatar.leftArm, bodyColors[customization.armColor]);
    drawLimb(avatar.rightArm, bodyColors[customization.armColor]);
    
    // Draw head
    if (avatar.head.faceImage) {
      const img = new Image();
      img.onload = () => {
        // Draw face image
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          avatar.head.x + avatar.head.width/2, 
          avatar.head.y + avatar.head.height/2, 
          avatar.head.width/2 - 5, 
          avatar.head.height/2 - 5, 
          0, 0, 2 * Math.PI
        );
        ctx.clip();
        ctx.drawImage(img, avatar.head.x, avatar.head.y, avatar.head.width, avatar.head.height);
        ctx.restore();
        
        // Draw head outline
        ctx.strokeStyle = "#5D4E75";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          avatar.head.x + avatar.head.width/2, 
          avatar.head.y + avatar.head.height/2, 
          avatar.head.width/2, 
          avatar.head.height/2, 
          0, 0, 2 * Math.PI
        );
        ctx.stroke();
      };
      img.src = avatar.head.faceImage;
    } else {
      // Default head
      ctx.fillStyle = avatar.head.skinTone;
      ctx.beginPath();
      ctx.ellipse(
        avatar.head.x + avatar.head.width/2, 
        avatar.head.y + avatar.head.height/2, 
        avatar.head.width/2, 
        avatar.head.height/2, 
        0, 0, 2 * Math.PI
      );
      ctx.fill();
      
      // Draw face features
      ctx.fillStyle = "#000";
      // Eyes
      ctx.fillRect(avatar.head.x + 30, avatar.head.y + 50, 12, 12);
      ctx.fillRect(avatar.head.x + 78, avatar.head.y + 50, 12, 12);
      // Nose
      ctx.fillRect(avatar.head.x + 55, avatar.head.y + 75, 8, 8);
      // Mouth
      ctx.fillRect(avatar.head.x + 45, avatar.head.y + 95, 28, 6);
    }
    
    // Add shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.ellipse(avatar.head.x + avatar.head.width/2, 550, 80, 20, 0, 0, 2 * Math.PI);
    ctx.fill();
    
  }, [avatar, customization, bodyColors]);

  // Render avatar continuously
  useEffect(() => {
    const render = () => {
      renderAvatar();
      requestAnimationFrame(render);
    };
    render();
  }, [renderAvatar]);

  // Animation control
  const toggleAnimation = (type: keyof AnimationState) => {
    setAnimation(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const updateAnimationSetting = (setting: string, value: number[]) => {
    setAnimation(prev => ({
      ...prev,
      [setting]: value[0]
    }));
  };

  const downloadRecording = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `avatar_animation_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const exportAvatarImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `avatar_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-orbitron font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
            BLACKBOX AVATAR STUDIO
          </h1>
          <p className="text-xl text-gray-300">
            Advanced AI-Powered Avatar Creation with Full Animation & Video Recording
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge className="bg-green-600">📸 Free Photo Upload</Badge>
            <Badge className="bg-blue-600">🎭 Full Body Animation</Badge>
            <Badge className="bg-purple-600">🎥 Video Recording</Badge>
            <Badge className="bg-orange-600">💾 Export & Download</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Upload & Customization */}
          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-2 border-purple-500/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📸 Photo Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3"
                  disabled={isProcessing}
                >
                  {isProcessing ? "🔄 Processing..." : "📸 Upload Your Photo"}
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {uploadedImage && (
                  <div className="aspect-square bg-gray-700 rounded-lg p-2 border border-gray-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customization */}
            <Card className="bg-gray-900/80 border-2 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-white">🎨 Customize Avatar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm font-semibold block mb-2">
                    Skin Tone
                  </label>
                  <Slider
                    value={[customization.skinTone]}
                    onValueChange={(value) => {
                      setCustomization(prev => ({ ...prev, skinTone: value[0] }));
                      setAvatar(prev => ({ ...prev, head: { ...prev.head, skinTone: skinTones[value[0]] }}));
                    }}
                    max={skinTones.length - 1}
                    step={1}
                  />
                  <div className="flex justify-between mt-2">
                    {skinTones.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold block mb-2">
                    Torso Color
                  </label>
                  <Slider
                    value={[customization.torsoColor]}
                    onValueChange={(value) => {
                      setCustomization(prev => ({ ...prev, torsoColor: value[0] }));
                      setAvatar(prev => ({ ...prev, torso: { ...prev.torso, color: bodyColors[value[0]] }}));
                    }}
                    max={bodyColors.length - 1}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-semibold block mb-2">
                    Arm Color
                  </label>
                  <Slider
                    value={[customization.armColor]}
                    onValueChange={(value) => setCustomization(prev => ({ ...prev, armColor: value[0] }))}
                    max={bodyColors.length - 1}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Display */}
          <div className="xl:col-span-2">
            <Card className="bg-gray-900/80 border-2 border-green-500/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  🎭 Your Animated Avatar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <canvas
                    ref={canvasRef}
                    width={470}
                    height={580}
                    className="border-4 border-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl bg-gradient-to-b from-blue-50 to-purple-50"
                  />
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={exportAvatarImage}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3"
                    >
                      💾 Export Image
                    </Button>
                    <Button 
                      onClick={animationActive ? stopAnimation : startAnimation}
                      className={`font-bold px-6 py-3 ${
                        animationActive 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {animationActive ? "⏹ Stop Animation" : "▶ Start Animation"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Animation & Recording Controls */}
          <div className="space-y-6">
            {/* Animation Settings */}
            <Card className="bg-gray-900/80 border-2 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-white">🎬 Animation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <label className="text-white text-sm font-semibold">Walk Cycle</label>
                    <Switch
                      checked={animation.walkCycle}
                      onCheckedChange={() => toggleAnimation("walkCycle")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <label className="text-white text-sm font-semibold">Waving</label>
                    <Switch
                      checked={animation.waving}
                      onCheckedChange={() => toggleAnimation("waving")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <label className="text-white text-sm font-semibold">Dancing</label>
                    <Switch
                      checked={animation.dancing}
                      onCheckedChange={() => toggleAnimation("dancing")}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <label className="text-white text-sm font-semibold">Jumping</label>
                    <Switch
                      checked={animation.jumping}
                      onCheckedChange={() => toggleAnimation("jumping")}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold block mb-2">
                    Speed: {animation.speed}%
                  </label>
                  <Slider
                    value={[animation.speed]}
                    onValueChange={(value) => updateAnimationSetting("speed", value)}
                    min={10}
                    max={150}
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-semibold block mb-2">
                    Arm Movement: {animation.armIntensity}%
                  </label>
                  <Slider
                    value={[animation.armIntensity]}
                    onValueChange={(value) => updateAnimationSetting("armIntensity", value)}
                    min={0}
                    max={100}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Camera & Recording */}
            <Card className="bg-gray-900/80 border-2 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-white">🎥 Video Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={`w-full font-bold py-3 ${
                    cameraActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {cameraActive ? "📷 Stop Camera" : "📹 Start Camera"}
                </Button>

                {cameraActive && (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg border-2 border-gray-600"
                    />
                    
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full font-bold py-3 ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isRecording ? `🔴 Recording... ${recordingTime}s` : "🎥 Start Recording"}
                    </Button>
                  </div>
                )}

                {recordedVideoUrl && (
                  <div className="space-y-3 p-3 bg-green-900/30 rounded-lg border border-green-500/50">
                    <div className="text-green-400 font-semibold">✅ Recording Complete!</div>
                    <video
                      ref={recordedVideoRef}
                      src={recordedVideoUrl}
                      controls
                      className="w-full rounded-lg border border-gray-600"
                    />
                    <Button
                      onClick={downloadRecording}
                      className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                    >
                      💾 Download Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
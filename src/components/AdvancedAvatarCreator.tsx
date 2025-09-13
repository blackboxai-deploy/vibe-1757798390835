"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface AdvancedAvatarCreatorProps {
  onAvatarCreated: (avatarData: string) => void;
  onBack: () => void;
}

interface AvatarBody {
  head: {
    x: number;
    y: number;
    width: number;
    height: number;
    faceImage?: string;
  };
  torso: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  leftArm: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  rightArm: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  leftLeg: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  rightLeg: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
}

export default function AdvancedAvatarCreator({ onAvatarCreated, onBack }: AdvancedAvatarCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [animationActive, setAnimationActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [avatarBody, setAvatarBody] = useState<AvatarBody>({
    head: { x: 150, y: 50, width: 100, height: 120, faceImage: undefined },
    torso: { x: 125, y: 170, width: 150, height: 180 },
    leftArm: { x: 100, y: 180, width: 25, height: 100, rotation: 0 },
    rightArm: { x: 275, y: 180, width: 25, height: 100, rotation: 0 },
    leftLeg: { x: 150, y: 350, width: 30, height: 120, rotation: 0 },
    rightLeg: { x: 220, y: 350, width: 30, height: 120, rotation: 0 }
  });

  const [animationSettings, setAnimationSettings] = useState({
    speed: 50,
    armSwing: 30,
    legSwing: 25,
    walkCycle: true,
    wavingArms: false,
    jumpMotion: false
  });

  const animationRef = useRef<number>();

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
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

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        processImageToFace(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Process uploaded image and extract face
  const processImageToFace = async (imageData: string) => {
    try {
      // Create a temporary canvas to process the image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        tempCanvas.width = 100;
        tempCanvas.height = 120;
        
        // Draw and crop the image to focus on face area
        if (tempCtx) {
          // Assume face is in the center-top area of the uploaded image
          const cropX = img.width * 0.25;
          const cropY = img.height * 0.1;
          const cropWidth = img.width * 0.5;
          const cropHeight = img.height * 0.6;
          
          tempCtx.drawImage(
            img, 
            cropX, cropY, cropWidth, cropHeight, // Source crop
            0, 0, 100, 120 // Destination
          );
          
          const faceImageData = tempCanvas.toDataURL();
          setAvatarBody(prev => ({
            ...prev,
            head: { ...prev.head, faceImage: faceImageData }
          }));
        }
        setIsProcessing(false);
      };
      
      img.src = imageData;
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
    }
  };

  // Animation loop
  const startAnimation = () => {
    setAnimationActive(true);
    let animationTime = 0;
    
    const animate = () => {
      animationTime += animationSettings.speed / 1000;
      
      setAvatarBody(prev => {
        const newBody = { ...prev };
        
        if (animationSettings.walkCycle) {
          // Walking animation
          const armSwing = Math.sin(animationTime * 3) * (animationSettings.armSwing / 10);
          const legSwing = Math.sin(animationTime * 3) * (animationSettings.legSwing / 10);
          
          newBody.leftArm.rotation = armSwing;
          newBody.rightArm.rotation = -armSwing;
          newBody.leftLeg.rotation = legSwing;
          newBody.rightLeg.rotation = -legSwing;
        }
        
        if (animationSettings.wavingArms) {
          // Waving arms
          newBody.leftArm.rotation = Math.sin(animationTime * 4) * 45;
          newBody.rightArm.rotation = Math.sin(animationTime * 4 + Math.PI) * 45;
        }
        
        if (animationSettings.jumpMotion) {
          // Jumping motion
          const jumpOffset = Math.abs(Math.sin(animationTime * 2)) * 20;
          newBody.head.y = 50 - jumpOffset;
          newBody.torso.y = 170 - jumpOffset;
          newBody.leftArm.y = 180 - jumpOffset;
          newBody.rightArm.y = 180 - jumpOffset;
          newBody.leftLeg.y = 350 - jumpOffset;
          newBody.rightLeg.y = 350 - jumpOffset;
        }
        
        return newBody;
      });
      
      if (animationActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const stopAnimation = () => {
    setAnimationActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset to default positions
    setAvatarBody({
      head: { x: 150, y: 50, width: 100, height: 120, faceImage: avatarBody.head.faceImage },
      torso: { x: 125, y: 170, width: 150, height: 180 },
      leftArm: { x: 100, y: 180, width: 25, height: 100, rotation: 0 },
      rightArm: { x: 275, y: 180, width: 25, height: 100, rotation: 0 },
      leftLeg: { x: 150, y: 350, width: 30, height: 120, rotation: 0 },
      rightLeg: { x: 220, y: 350, width: 30, height: 120, rotation: 0 }
    });
  };

  // Start recording
  const startRecording = async () => {
    if (!cameraActive) {
      await startCamera();
    }
    
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      startAnimation(); // Start avatar animation during recording
      
      // Start timer
      let time = 0;
      const timer = setInterval(() => {
        time++;
        setRecordingTime(time);
        
        // Auto-stop after 30 seconds
        if (time >= 30) {
          stopRecording();
          clearInterval(timer);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      stopAnimation();
    }
  };

  // Render avatar on canvas
  const renderAvatar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw torso
    ctx.fillStyle = "#4A90E2";
    ctx.fillRect(avatarBody.torso.x, avatarBody.torso.y, avatarBody.torso.width, avatarBody.torso.height);
    
    // Draw limbs with rotation
    const drawLimb = (limb: typeof avatarBody.leftArm, color: string) => {
      ctx.save();
      ctx.translate(limb.x + limb.width/2, limb.y);
      ctx.rotate(limb.rotation * Math.PI / 180);
      ctx.fillStyle = color;
      ctx.fillRect(-limb.width/2, 0, limb.width, limb.height);
      ctx.restore();
    };

    // Draw arms
    drawLimb(avatarBody.leftArm, "#F5A623");
    drawLimb(avatarBody.rightArm, "#F5A623");
    
    // Draw legs
    drawLimb(avatarBody.leftLeg, "#7ED321");
    drawLimb(avatarBody.rightLeg, "#7ED321");

    // Draw head
    if (avatarBody.head.faceImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, avatarBody.head.x, avatarBody.head.y, avatarBody.head.width, avatarBody.head.height);
      };
      img.src = avatarBody.head.faceImage;
    } else {
      ctx.fillStyle = "#FFD93D";
      ctx.fillRect(avatarBody.head.x, avatarBody.head.y, avatarBody.head.width, avatarBody.head.height);
      
      // Draw basic face
      ctx.fillStyle = "#000";
      ctx.fillRect(avatarBody.head.x + 20, avatarBody.head.y + 30, 10, 10); // Left eye
      ctx.fillRect(avatarBody.head.x + 70, avatarBody.head.y + 30, 10, 10); // Right eye
      ctx.fillRect(avatarBody.head.x + 40, avatarBody.head.y + 60, 20, 5); // Mouth
    }
  };

  // Re-render avatar when body changes
  useEffect(() => {
    renderAvatar();
  }, [avatarBody]);

  const handleSaveAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const avatarData = canvas.toDataURL();
    onAvatarCreated(avatarData);
  };

  const downloadRecording = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `avatar_video_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Advanced Avatar Creator
          </h1>
          <Button onClick={onBack} variant="outline" className="text-white border-white">
            ← Back to Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Photo Upload & Processing */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Upload Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "📸 Upload Face Photo"}
                  </Button>
                  
                  {uploadedImage && (
                    <div className="aspect-square bg-gray-700 rounded-lg p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Animation Controls */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Animation Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm">Walk Cycle</label>
                  <Switch
                    checked={animationSettings.walkCycle}
                    onCheckedChange={(checked) => 
                      setAnimationSettings(prev => ({ ...prev, walkCycle: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm">Waving Arms</label>
                  <Switch
                    checked={animationSettings.wavingArms}
                    onCheckedChange={(checked) => 
                      setAnimationSettings(prev => ({ ...prev, wavingArms: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm">Jumping</label>
                  <Switch
                    checked={animationSettings.jumpMotion}
                    onCheckedChange={(checked) => 
                      setAnimationSettings(prev => ({ ...prev, jumpMotion: checked }))
                    }
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm block mb-2">
                    Animation Speed: {animationSettings.speed}%
                  </label>
                  <Slider
                    value={[animationSettings.speed]}
                    onValueChange={(value) => 
                      setAnimationSettings(prev => ({ ...prev, speed: value[0] }))
                    }
                    min={10}
                    max={100}
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm block mb-2">
                    Arm Swing: {animationSettings.armSwing}°
                  </label>
                  <Slider
                    value={[animationSettings.armSwing]}
                    onValueChange={(value) => 
                      setAnimationSettings(prev => ({ ...prev, armSwing: value[0] }))
                    }
                    min={0}
                    max={60}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={animationActive ? stopAnimation : startAnimation}
                    className={`flex-1 ${
                      animationActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {animationActive ? "⏹ Stop" : "▶ Animate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avatar Display */}
          <div className="xl:col-span-2">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Your Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={500}
                    className="border-2 border-gray-600 rounded-lg bg-white"
                  />
                  <div className="flex gap-4">
                    <Button onClick={handleSaveAvatar} className="bg-green-600 hover:bg-green-700">
                      ✓ Save Avatar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Camera & Recording */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Camera & Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`flex-1 ${
                      cameraActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {cameraActive ? "📷 Stop Camera" : "📹 Start Camera"}
                  </Button>
                </div>

                {cameraActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg border border-gray-600"
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!cameraActive}
                    className={`flex-1 ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isRecording ? `⏹ Stop (${recordingTime}s)` : "🎥 Record Video"}
                  </Button>
                </div>

                {recordedVideoUrl && (
                  <div className="space-y-2">
                    <video
                      ref={recordedVideoRef}
                      src={recordedVideoUrl}
                      controls
                      className="w-full rounded-lg border border-gray-600"
                    />
                    <Button
                      onClick={downloadRecording}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      💾 Download Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm space-y-2">
                <p>1. Upload a photo to create face</p>
                <p>2. Adjust animation settings</p>
                <p>3. Start camera for recording</p>
                <p>4. Record animated avatar</p>
                <p>5. Download or save results</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
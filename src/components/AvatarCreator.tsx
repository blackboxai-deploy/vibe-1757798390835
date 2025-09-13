"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface AvatarCreatorProps {
  onAvatarCreated: (avatarData: string) => void;
  onBack: () => void;
}

interface AvatarCustomization {
  skinTone: number;
  hairColor: number;
  hairStyle: number;
  clothingColor: number;
  clothingStyle: number;
  accessory: number;
}

export default function AvatarCreator({ onAvatarCreated, onBack }: AvatarCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customization, setCustomization] = useState<AvatarCustomization>({
    skinTone: 3,
    hairColor: 2,
    hairStyle: 1,
    clothingColor: 1,
    clothingStyle: 1,
    accessory: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const skinTones = ["#F5E6D3", "#E8C2A0", "#D4A574", "#C4915C", "#A17C56", "#8B6F47"];
  const hairColors = ["#2C1B18", "#8B4513", "#D2B48C", "#FFD700", "#DC143C"];
  const clothingColors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
  const hairStyles = ["Buzz Cut", "Modern", "Long", "Curly", "Spike"];
  const clothingStyles = ["T-Shirt", "Jacket", "Suit", "Hoodie", "Tank Top"];
  const accessories = ["None", "Glasses", "Hat", "Chain", "Earrings"];

  const processImageToAvatar = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate image processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate pixel art avatar
      generatePixelAvatar();
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        processImageToAvatar();
      };
      reader.readAsDataURL(file);
    }
  }, [processImageToAvatar]);

  const generatePixelAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size for pixel art
    canvas.width = 64;
    canvas.height = 64;
    
    // Disable image smoothing for pixel art effect
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 64, 64);

    // Draw avatar base (head)
    ctx.fillStyle = skinTones[customization.skinTone];
    ctx.fillRect(16, 12, 32, 32); // Head

    // Draw hair
    ctx.fillStyle = hairColors[customization.hairColor];
    if (customization.hairStyle === 0) { // Buzz cut
      ctx.fillRect(18, 10, 28, 8);
    } else if (customization.hairStyle === 1) { // Modern
      ctx.fillRect(16, 8, 32, 12);
    } else if (customization.hairStyle === 2) { // Long
      ctx.fillRect(14, 8, 36, 20);
    } else if (customization.hairStyle === 3) { // Curly
      ctx.fillRect(15, 6, 34, 16);
    } else { // Spike
      ctx.fillRect(18, 6, 28, 14);
    }

    // Draw eyes
    ctx.fillStyle = "#000000";
    ctx.fillRect(22, 20, 4, 4); // Left eye
    ctx.fillRect(38, 20, 4, 4); // Right eye

    // Draw nose
    ctx.fillRect(30, 26, 4, 4);

    // Draw mouth
    ctx.fillRect(28, 32, 8, 2);

    // Draw body/clothing
    ctx.fillStyle = clothingColors[customization.clothingColor];
    if (customization.clothingStyle === 0) { // T-Shirt
      ctx.fillRect(20, 44, 24, 20);
    } else if (customization.clothingStyle === 1) { // Jacket
      ctx.fillRect(18, 44, 28, 20);
    } else if (customization.clothingStyle === 2) { // Suit
      ctx.fillRect(19, 44, 26, 20);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(28, 48, 8, 12); // Shirt
    } else if (customization.clothingStyle === 3) { // Hoodie
      ctx.fillRect(18, 44, 28, 20);
      ctx.fillRect(16, 40, 32, 8); // Hood
    } else { // Tank Top
      ctx.fillRect(22, 44, 20, 20);
    }

    // Draw accessories
    if (customization.accessory === 1) { // Glasses
      ctx.fillStyle = "#000000";
      ctx.fillRect(20, 18, 8, 8);
      ctx.fillRect(36, 18, 8, 8);
      ctx.fillRect(28, 20, 8, 2);
    } else if (customization.accessory === 2) { // Hat
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(14, 4, 36, 8);
    } else if (customization.accessory === 3) { // Chain
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(28, 42, 8, 2);
    } else if (customization.accessory === 4) { // Earrings
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(14, 22, 2, 4); // Left earring
      ctx.fillRect(48, 22, 2, 4); // Right earring
    }
  };

  const handleCustomizationChange = (property: keyof AvatarCustomization, value: number[]) => {
    setCustomization(prev => ({
      ...prev,
      [property]: value[0]
    }));
    // Regenerate avatar with new customization
    setTimeout(generatePixelAvatar, 50);
  };

  const handleSaveAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const avatarData = canvas.toDataURL();
    onAvatarCreated(avatarData);
  };

  const handleRandomize = () => {
    const randomCustomization: AvatarCustomization = {
      skinTone: Math.floor(Math.random() * skinTones.length),
      hairColor: Math.floor(Math.random() * hairColors.length),
      hairStyle: Math.floor(Math.random() * hairStyles.length),
      clothingColor: Math.floor(Math.random() * clothingColors.length),
      clothingStyle: Math.floor(Math.random() * clothingStyles.length),
      accessory: Math.floor(Math.random() * accessories.length)
    };
    setCustomization(randomCustomization);
    setTimeout(generatePixelAvatar, 50);
  };

  // Generate initial avatar
  useState(() => {
    setTimeout(generatePixelAvatar, 100);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Avatar Creator
          </h1>
          <Button onClick={onBack} variant="outline">
            ← Back to Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Preview Section */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Photo Upload</CardTitle>
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
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Upload Your Photo"}
                  </Button>
                  
                  {uploadedImage && (
                    <div className="aspect-square bg-gray-700 rounded-lg p-4">
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

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Generated Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-600 rounded-lg bg-black"
                    style={{ 
                      width: "256px", 
                      height: "256px", 
                      imageRendering: "pixelated" 
                    }}
                  />
                  <div className="flex gap-4">
                    <Button onClick={handleRandomize} variant="secondary">
                      🎲 Randomize
                    </Button>
                    <Button onClick={handleSaveAvatar} className="bg-green-600 hover:bg-green-700">
                      ✓ Save Avatar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Customize Your Avatar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skin Tone */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Skin Tone
                  </label>
                  <Slider
                    value={[customization.skinTone]}
                    onValueChange={(value) => handleCustomizationChange("skinTone", value)}
                    max={skinTones.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    {skinTones.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Hair Color
                  </label>
                  <Slider
                    value={[customization.hairColor]}
                    onValueChange={(value) => handleCustomizationChange("hairColor", value)}
                    max={hairColors.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    {hairColors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Hair Style: {hairStyles[customization.hairStyle]}
                  </label>
                  <Slider
                    value={[customization.hairStyle]}
                    onValueChange={(value) => handleCustomizationChange("hairStyle", value)}
                    max={hairStyles.length - 1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Clothing Color */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Clothing Color
                  </label>
                  <Slider
                    value={[customization.clothingColor]}
                    onValueChange={(value) => handleCustomizationChange("clothingColor", value)}
                    max={clothingColors.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    {clothingColors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Clothing Style */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Clothing Style: {clothingStyles[customization.clothingStyle]}
                  </label>
                  <Slider
                    value={[customization.clothingStyle]}
                    onValueChange={(value) => handleCustomizationChange("clothingStyle", value)}
                    max={clothingStyles.length - 1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Accessories */}
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Accessory: {accessories[customization.accessory]}
                  </label>
                  <Slider
                    value={[customization.accessory]}
                    onValueChange={(value) => handleCustomizationChange("accessory", value)}
                    max={accessories.length - 1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
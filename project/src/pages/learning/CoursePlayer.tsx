import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings } from 'lucide-react';

const CoursePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 3600; // 1 hour in seconds

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-900">
        {/* Video Player Placeholder */}
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">Video Content</div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              className="p-3 bg-secondary rounded-full text-white hover:bg-secondary/90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Volume2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-secondary rounded-full"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
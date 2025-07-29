import React from 'react';
import { YouTubeVideo } from '../types';

interface VideoListProps {
  videos: YouTubeVideo[];
  onVideoSelect: (video: YouTubeVideo) => void;
  title: string;
}

const formatNumber = (numStr: string) => Number(numStr).toLocaleString();
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR');

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.986L5.5 8m7-3v5" />
    </svg>
);

export const VideoList: React.FC<VideoListProps> = ({ videos, onVideoSelect, title }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
      <div className="space-y-4 max-h-96 md:max-h-[40rem] overflow-y-auto pr-2">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="flex items-start space-x-4 bg-slate-900/50 p-3 rounded-lg transition-all duration-300 hover:bg-slate-700/50 cursor-pointer"
            onClick={() => onVideoSelect(video)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onVideoSelect(video) }}
          >
            <img src={video.thumbnails.medium.url} alt={video.title} className="w-24 h-14 sm:w-32 sm:h-18 object-cover rounded-md" />
            <div className="flex-1">
              <p className="font-semibold text-white line-clamp-2">{video.title}</p>
              <p className="text-xs text-slate-400 mt-1">게시일: {formatDate(video.publishedAt)}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-300">
                <div className="flex items-center">
                  <EyeIcon /> {formatNumber(video.statistics.viewCount)}
                </div>
                <div className="flex items-center">
                  <ThumbsUpIcon /> {formatNumber(video.statistics.likeCount)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useEffect, useState, useCallback } from 'react';
import { YouTubeVideo, CommentAnalysisResult, YouTubeComment } from '../types';
import { getCommentsForVideo } from '../services/youtubeService';
import { analyzeVideoComments } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Icons
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const ThumbsUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.986L5.5 8m7-3v5" />
    </svg>
);
const ChatBubbleLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const YouTubeIconSvg = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
const YouTubePlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white/90" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321l5.478.698a.562.562 0 01.31.95l-4.053 3.73a.562.562 0 00-.168.53l1.157 5.292a.562.562 0 01-.813.622l-4.743-2.684a.563.563 0 00-.525 0l-4.743-2.684a.562.562 0 01-.813-.622l1.157-5.292a.562.562 0 00-.168-.53L.54 10.557a.562.562 0 01.31-.95l5.478-.698a.563.563 0 00.475-.321L11.48 3.5z" /></svg>;

const formatNumber = (numStr: string) => Number(numStr).toLocaleString();
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

const SentimentChart: React.FC<{ data: { positive: number; negative: number; neutral: number } }> = ({ data }) => {
    const chartData = [
        { name: '긍정', value: data.positive, color: '#22c55e' },
        { name: '부정', value: data.negative, color: '#ef4444' },
        { name: '중립', value: data.neutral, color: '#64748b' },
    ];
    return (
        <div className="w-full">
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-700">
                <div className="transition-all" style={{ width: `${data.positive}%`, backgroundColor: '#22c55e' }}></div>
                <div className="transition-all" style={{ width: `${data.negative}%`, backgroundColor: '#ef4444' }}></div>
                <div className="transition-all" style={{ width: `${data.neutral}%`, backgroundColor: '#64748b' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                {chartData.map(item => (
                    <div key={item.name} className="flex items-center">
                        <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
                        {item.name} <span className="font-semibold ml-1 text-slate-300">{item.value.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface VideoDetailModalProps {
  video: YouTubeVideo | null;
  onClose: () => void;
  apiKey: string | null;
  useGeminiApi: boolean;
  geminiApiKey: string | null;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, onClose, apiKey, useGeminiApi, geminiApiKey }) => {
  const [analysis, setAnalysis] = useState<CommentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    if (video) {
        // Reset state when a new video is selected
        setAnalysis(null);
        setIsAnalyzing(false);
        setAnalysisError('');
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = video ? 'hidden' : 'auto';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [video, onClose]);

  const handleAnalyzeComments = useCallback(async () => {
    if (!video || !apiKey || !geminiApiKey) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysis(null);
    try {
        const comments = await getCommentsForVideo(video.id, apiKey);
        if (comments.length === 0) {
            setAnalysisError('분석할 댓글이 없습니다.');
            return;
        }
        const result = await analyzeVideoComments(video, comments, geminiApiKey);
        setAnalysis(result);
    } catch (err: any) {
        setAnalysisError(err.message || '댓글 분석 중 오류가 발생했습니다.');
    } finally {
        setIsAnalyzing(false);
    }
  }, [video, apiKey, geminiApiKey]);

  if (!video) return null;

  const canAnalyzeComments = useGeminiApi && !!geminiApiKey && video.statistics.commentCount && video.statistics.commentCount !== '0';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors z-20 bg-slate-900/50 rounded-full p-1" aria-label="닫기"><CloseIcon /></button>
        <div className="flex-grow overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[45%] flex-shrink-0 relative bg-slate-900 group">
                <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube에서 비디오 시청하기" className="block w-full h-full">
                    <img src={video.thumbnails.high.url} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/50 to-transparent md:bg-gradient-to-r md:from-slate-800 md:to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40"><YouTubePlayIcon /></div>
                </a>
            </div>
            <div className="p-6 md:p-8 flex-grow flex flex-col md:w-[55%] -mt-24 md:mt-0 relative z-10">
                <h2 id="video-modal-title" className="text-xl md:text-2xl font-bold text-white mb-2">{video.title}</h2>
                <p className="text-sm text-slate-400 mb-4">{formatDate(video.publishedAt)} 게시</p>
                <div className="grid grid-cols-3 gap-2 text-slate-300">
                    <div className="flex items-center text-sm"><EyeIcon /><span>{formatNumber(video.statistics.viewCount)}</span></div>
                    <div className="flex items-center text-sm"><ThumbsUpIcon /><span>{formatNumber(video.statistics.likeCount)}</span></div>
                    <div className="flex items-center text-sm"><ChatBubbleLeftIcon /><span>{formatNumber(video.statistics.commentCount)}</span></div>
                </div>
                 <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors w-full my-6 text-sm"><YouTubeIconSvg />YouTube에서 시청하기</a>
            </div>
          </div>
          <div className="p-6 md:p-8 pt-0 md:pt-0 space-y-6">
              <div>
                  <h3 className="text-base font-semibold text-white mb-2">설명</h3>
                  <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed max-h-24 overflow-y-auto">{video.description || '설명이 없습니다.'}</p>
              </div>
              {video.tags && video.tags.length > 0 && (
                  <div>
                      <h3 className="text-base font-semibold text-white mb-3">태그</h3>
                      <div className="flex flex-wrap gap-2">
                          {video.tags.map(tag => (
                              <a key={tag} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tag)}`} target="_blank" rel="noopener noreferrer" className="bg-slate-700 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-slate-600 hover:text-cyan-200 transition-colors"># {tag}</a>
                          ))}
                      </div>
                  </div>
              )}
              {useGeminiApi && (
                  <div className="bg-slate-900/50 p-5 rounded-xl mt-4">
                      <h3 className="text-base font-semibold text-white mb-4 flex items-center"><SparklesIcon /> <span className="ml-2">AI 댓글 반응 분석</span></h3>
                      
                      {isAnalyzing && (
                          <div className="flex items-center justify-center h-24">
                              <div className="flex items-center space-x-2 text-slate-400">
                                   <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   <span>댓글을 분석 중입니다...</span>
                              </div>
                          </div>
                      )}

                      {analysisError && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{analysisError}</div>}

                      {analysis && (
                          <div className="space-y-5 animate-fade-in">
                              <div>
                                  <h4 className="font-semibold text-slate-300 mb-2 text-sm">한줄 요약</h4>
                                  <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
                              </div>
                              <div>
                                  <h4 className="font-semibold text-slate-300 mb-3 text-sm">감성 분석</h4>
                                  <SentimentChart data={analysis.sentiment} />
                              </div>
                              <div>
                                  <h4 className="font-semibold text-slate-300 mb-2 text-sm">핵심 주제</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {analysis.keyTopics.map(topic => (
                                          <span key={topic} className="bg-slate-700 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">{topic}</span>
                                      ))}
                                  </div>
                              </div>
                               <div>
                                  <h4 className="font-semibold text-slate-300 mb-2 text-sm">✨ 제안 사항</h4>
                                   <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                      {analysis.suggestions.map(suggestion => (
                                          <li key={suggestion}>{suggestion}</li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      )}
                      
                      {!isAnalyzing && !analysis && !analysisError && (
                          <div className="text-center py-4">
                               <p className="text-slate-400 text-sm mb-4">
                                { !geminiApiKey ? 'Gemini API 키를 설정하면 댓글 분석이 가능합니다.' : 
                                  '이 영상의 댓글을 분석하여<br/>시청자 반응을 확인해보세요.'
                                }
                               </p>
                               <button onClick={handleAnalyzeComments} disabled={!canAnalyzeComments} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-5 rounded-lg transition-all inline-flex items-center justify-center disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                                   <SparklesIcon />
                                   <span className="ml-2">분석 시작</span>
                               </button>
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { YouTubeChannel, YouTubeVideo, RevenueAnalysisResult } from './types';
import { getChannelData, getVideosForChannel } from './services/youtubeService';
import { generateDashboardInsightsStream, analyzeChannelRevenue } from './services/geminiService';
import { StatCard } from './components/StatCard';
import { VideoViewsChart } from './components/Charts';
import { VideoList } from './components/VideoList';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { VideoDetailModal } from './components/VideoDetailModal';

// Helper functions and Icons
const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return '0';
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
    return num.toLocaleString();
};

const formatRevenue = (value: number) => {
    if (value >= 100000000) {
        return `${(value / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
    }
    if (value >= 10000) {
        return `${Math.floor(value / 10000)}만`;
    }
    return value.toLocaleString();
};

const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const VideoCameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321l5.478.698a.562.562 0 01.31.95l-4.053 3.73a.562.562 0 00-.168.53l1.157 5.292a.562.562 0 01-.813.622l-4.743-2.684a.563.563 0 00-.525 0l-4.743-2.684a.562.562 0 01-.813-.622l1.157-5.292a.562.562 0 00-.168-.53L.54 10.557a.562.562 0 01.31-.95l5.478-.698a.563.563 0 00.475-.321L11.48 3.5z" /></svg>;
const YouTubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>;
const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)\n/g, '<h3 class="text-md font-bold text-white mt-4 mb-2">$1</h3>')
        .replace(/## (.*?)\n/g, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>')
        .replace(/\n/g, '<br />');
    return <div className="prose prose-invert prose-sm max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

function App() {
    type Period = 'all' | '7d' | '30d' | '90d';
    type SortOrder = 'date' | 'viewCount';

    // API 키가 환경 변수에서 로드되었는지 여부를 추적하는 상태 변수
    const [isYoutubeKeyFromEnv, setIsYoutubeKeyFromEnv] = useState<boolean>(false);
    const [isGeminiKeyFromEnv, setIsGeminiKeyFromEnv] = useState<boolean>(false);

    // .env.local에서 API 키를 로드하거나 localStorage에서 로드
    const [apiKey, setApiKey] = useState<string | null>(() => {
        // 1. .env.local에서 YOUTUBE_API_KEY 확인
        const envApiKey = process.env.YOUTUBE_API_KEY;
        // 2. 환경 변수에 값이 있으면 사용, 없으면 localStorage에서 로드
        return envApiKey || localStorage.getItem('youtubeApiKey');
    });
    
    // Gemini API 키 로드
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(() => {
        const envGeminiApiKey = process.env.GEMINI_API_KEY;
        return envGeminiApiKey || localStorage.getItem('geminiApiKey');
    });
    
    // 환경 변수에서 API 키가 로드되었는지 확인
    useEffect(() => {
        // YouTube API 키가 환경 변수에서 로드되었는지 확인
        if (process.env.YOUTUBE_API_KEY) {
            setIsYoutubeKeyFromEnv(true);
        }
        
        // Gemini API 키가 환경 변수에서 로드되었는지 확인
        if (process.env.GEMINI_API_KEY) {
            setIsGeminiKeyFromEnv(true);
        }
    }, []);
    
    const [youtubeKeyInput, setYoutubeKeyInput] = useState<string>('');
    const [geminiKeyInput, setGeminiKeyInput] = useState<string>('');

    const [useGeminiApi, setUseGeminiApi] = useState<boolean>(() => JSON.parse(localStorage.getItem('useGeminiApi') || 'false'));
    const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
    
    // Channel A state
    const [channelInputA, setChannelInputA] = useState<string>(() => localStorage.getItem('lastChannelInputA') || '');
    const [channelDataA, setChannelDataA] = useState<YouTubeChannel | null>(null);
    const [videoDataA, setVideoDataA] = useState<YouTubeVideo[]>([]);
    const [geminiInsight, setGeminiInsight] = useState<string>('');
    const [revenueAnalysis, setRevenueAnalysis] = useState<RevenueAnalysisResult | null>(null);
    const [videoSortOrderA, setVideoSortOrderA] = useState<SortOrder>('date');
    const [videoPeriodA, setVideoPeriodA] = useState<Period>('all');
    const [isVideosLoadingA, setIsVideosLoadingA] = useState(false);

    // Channel B state (for comparison)
    const [channelInputB, setChannelInputB] = useState<string>(() => localStorage.getItem('lastChannelInputB') || '');
    const [channelDataB, setChannelDataB] = useState<YouTubeChannel | null>(null);
    const [videoDataB, setVideoDataB] = useState<YouTubeVideo[]>([]);
    const [videoSortOrderB, setVideoSortOrderB] = useState<SortOrder>('date');
    const [videoPeriodB, setVideoPeriodB] = useState<Period>('all');
    const [isVideosLoadingB, setIsVideosLoadingB] = useState(false);

    // Common state
    const [isLoading, setIsLoading] = useState(false);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [isRevenueLoading, setIsRevenueLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    
    const geminiInsightsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { localStorage.setItem('useGeminiApi', JSON.stringify(useGeminiApi)); }, [useGeminiApi]);

    const handleSaveApiKey = (type: 'youtube' | 'gemini') => {
        if (type === 'youtube' && youtubeKeyInput.trim()) {
            const key = youtubeKeyInput.trim();
            localStorage.setItem('youtubeApiKey', key);
            setApiKey(key);
            setYoutubeKeyInput('');
        } else if (type === 'gemini' && geminiKeyInput.trim()) {
            const key = geminiKeyInput.trim();
            localStorage.setItem('geminiApiKey', key);
            setGeminiApiKey(key);
            setGeminiKeyInput('');
        }
    };

    const handleDeleteApiKey = (type: 'youtube' | 'gemini') => {
        if (type === 'youtube') {
            // 환경 변수에서 로드된 키는 삭제할 수 없음
            if (isYoutubeKeyFromEnv) {
                setError('환경 변수(.env.local)에서 로드된 YouTube API 키는 UI에서 삭제할 수 없습니다. .env.local 파일을 직접 수정해주세요.');
                return;
            }
            localStorage.removeItem('youtubeApiKey');
            setApiKey(null);
            setChannelDataA(null); setChannelDataB(null); setVideoDataA([]); setVideoDataB([]); setError('');
        } else if (type === 'gemini') {
            // 환경 변수에서 로드된 키는 삭제할 수 없음
            if (isGeminiKeyFromEnv) {
                setError('환경 변수(.env.local)에서 로드된 Gemini API 키는 UI에서 삭제할 수 없습니다. .env.local 파일을 직접 수정해주세요.');
                return;
            }
            localStorage.removeItem('geminiApiKey');
            setGeminiApiKey(null);
            setUseGeminiApi(false);
            setGeminiInsight(''); setRevenueAnalysis(null);
        }
    };

    const fetchDataForChannel = async (input: string, apiKey: string) => {
        const channel = await getChannelData(input, apiKey);
        const videos = await getVideosForChannel(channel.id, apiKey, 'date');
        return { channel, videos };
    };

    const handleSearch = useCallback(async () => {
        if (!apiKey) { setError('YouTube API 키를 설정해주세요.'); return; }
        if (!channelInputA || (isCompareMode && !channelInputB)) { setError('분석할 채널 정보를 모두 입력해주세요.'); return; }

        localStorage.setItem('lastChannelInputA', channelInputA);
        if (isCompareMode) localStorage.setItem('lastChannelInputB', channelInputB);

        setIsLoading(true); setError('');
        setChannelDataA(null); setVideoDataA([]); setGeminiInsight(''); setRevenueAnalysis(null);
        setChannelDataB(null); setVideoDataB([]);

        try {
            const promises = [fetchDataForChannel(channelInputA, apiKey)];
            if (isCompareMode) promises.push(fetchDataForChannel(channelInputB, apiKey));
            
            const results = await Promise.all(promises);

            const { channel: channelA, videos: videosA } = results[0];
            setChannelDataA(channelA);
            setVideoDataA(videosA);

            if (!isCompareMode && useGeminiApi && geminiApiKey) {
                setIsRevenueLoading(true);
                analyzeChannelRevenue(channelA, videosA, geminiApiKey).then(setRevenueAnalysis).catch(() => setRevenueAnalysis(null)).finally(() => setIsRevenueLoading(false));
            }

            if (isCompareMode && results[1]) {
                const { channel: channelB, videos: videosB } = results[1];
                setChannelDataB(channelB);
                setVideoDataB(videosB);
            }
        } catch (err: any) {
            setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
            setChannelDataA(null); setVideoDataA([]);
            setChannelDataB(null); setVideoDataB([]);
        } finally {
            setIsLoading(false);
        }
    }, [channelInputA, channelInputB, apiKey, useGeminiApi, isCompareMode, geminiApiKey]);

    const updateVideoListForChannel = useCallback(async (channelId: string, order: SortOrder, period: Period, channelIdentifier: 'A' | 'B') => {
        if (!apiKey) return;
        
        const setIsLoading = channelIdentifier === 'A' ? setIsVideosLoadingA : setIsVideosLoadingB;
        const setVideos = channelIdentifier === 'A' ? setVideoDataA : setVideoDataB;
        const setSortOrder = channelIdentifier === 'A' ? setVideoSortOrderA : setVideoSortOrderB;
        const setPeriod = channelIdentifier === 'A' ? setVideoPeriodA : setVideoPeriodB;

        setIsLoading(true); setError('');
        if (channelIdentifier === 'A') setGeminiInsight('');

        let publishedAfter: string | undefined;
        if (period !== 'all') {
            const days = { '7d': 7, '30d': 30, '90d': 90 }[period];
            const date = new Date();
            date.setDate(date.getDate() - days);
            publishedAfter = date.toISOString();
        }

        try {
            const videos = await getVideosForChannel(channelId, apiKey, order, publishedAfter);
            setVideos(videos);
            setSortOrder(order);
            setPeriod(period);
        } catch (err: any) {
            setError(err.message || `채널 ${channelIdentifier}의 비디오 데이터를 불러오는 중 오류 발생`);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);
    
    const handleGenerateInsights = useCallback(async () => {
        if (!channelDataA || videoDataA.length === 0 || !useGeminiApi || !geminiApiKey) return;
        setIsGeminiLoading(true); setGeminiInsight(''); setError('');
        try {
            const insightsStream = generateDashboardInsightsStream(channelDataA, videoDataA, geminiApiKey);
            for await (const chunk of insightsStream) {
                setGeminiInsight((prev) => prev + chunk);
            }
        } catch (err: any) {
            setError('AI 인사이트 생성 중 오류 발생');
        } finally {
            setIsGeminiLoading(false);
        }
    }, [channelDataA, videoDataA, useGeminiApi, geminiApiKey]);

    const periodMap: Record<Period, string> = { 'all': '전체', '7d': '7일', '30d': '30일', '90d': '90일' };
    const sortMap: Record<SortOrder, string> = { 'date': '최신', 'viewCount': '인기' };

    const renderChannelColumn = (
        channelData: YouTubeChannel,
        videoData: YouTubeVideo[],
        videoSortOrder: SortOrder,
        videoPeriod: Period,
        isVideosLoading: boolean,
        channelIdentifier: 'A' | 'B',
        extraProps: { revenueAnalysis?: RevenueAnalysisResult | null, isRevenueLoading?: boolean } = {}
    ) => {
        const videoViewsData = videoData.map(v => ({ title: v.title.substring(0, 20) + (v.title.length > 20 ? '...' : ''), viewCount: parseInt(v.statistics.viewCount, 10) }));
        const listTitle = `${periodMap[videoPeriod]} ${sortMap[videoSortOrder]} 순`;
        const chartTitle = `${listTitle} 조회수`;
        
        return (
            <div className="space-y-6">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${!isCompareMode && useGeminiApi && geminiApiKey ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                    <StatCard icon={<UserGroupIcon />} title="총 구독자" value={formatNumber(channelData.statistics.subscriberCount)} />
                    <StatCard icon={<PlayIcon />} title="총 조회수" value={formatNumber(channelData.statistics.viewCount)} />
                    <StatCard icon={<VideoCameraIcon />} title="총 비디오 수" value={Number(channelData.statistics.videoCount).toLocaleString()} />
                    {!isCompareMode && useGeminiApi && geminiApiKey && (
                        <StatCard icon={<BanknotesIcon />} title="예상 월 수익 (KRW)" value={extraProps.isRevenueLoading ? '분석 중...' : extraProps.revenueAnalysis ? `${formatRevenue(extraProps.revenueAnalysis.estimatedMonthlyMin)} ~ ${formatRevenue(extraProps.revenueAnalysis.estimatedMonthlyMax)}원` : '분석 불가'} tooltip={extraProps.revenueAnalysis?.reasoning} />
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">기간:</span>
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            {(['all', '7d', '30d', '90d'] as Period[]).map(p => <button key={p} onClick={() => updateVideoListForChannel(channelData.id, videoSortOrder, p, channelIdentifier)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${videoPeriod === p ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/50'}`}>{periodMap[p]}</button>)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">정렬:</span>
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            {(['date', 'viewCount'] as SortOrder[]).map(s => <button key={s} onClick={() => updateVideoListForChannel(channelData.id, s, videoPeriod, channelIdentifier)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${videoSortOrder === s ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/50'}`}>{sortMap[s]} 순</button>)}
                        </div>
                    </div>
                </div>
                {isVideosLoading ? <DashboardSkeleton useGeminiApi={false} isCompareMode={false} /> : <VideoViewsChart data={videoViewsData} title={chartTitle} />}
                {isVideosLoading ? <DashboardSkeleton useGeminiApi={false} isCompareMode={false} part="videolist" /> : <VideoList videos={videoData} onVideoSelect={setSelectedVideo} title={listTitle} />}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 relative">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">YouTube 채널 분석 대시보드</h1>
                    <p className="text-slate-400 text-center mt-2">채널 데이터를 시각화하고 Gemini AI로 분석 인사이트를 얻어보세요.</p>
                </header>
                
                <div className="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        {/* YouTube API 키 입력 UI - 환경 변수에서 로드된 경우 숨김 처리 */}
                        {!isYoutubeKeyFromEnv && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 flex items-center mb-2">
                                    <YouTubeIcon />
                                    <span className="ml-1">YouTube Data API Key</span>
                                    {apiKey ? <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">활성</span> : <span className="ml-auto text-xs font-bold text-red-400 bg-red-900/50 px-2 py-0.5 rounded-full">미설정</span>}
                                </label>
                                <div className="flex gap-2">
                                    <input type="password" value={youtubeKeyInput} onChange={(e) => setYoutubeKeyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey('youtube')} placeholder="API 키 입력" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm" />
                                    <button onClick={() => handleSaveApiKey('youtube')} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-sm py-1.5 px-3 rounded-lg transition-colors">저장</button>
                                    {apiKey && <button onClick={() => handleDeleteApiKey('youtube')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm py-1.5 px-3 rounded-lg transition-colors">삭제</button>}
                                </div>
                            </div>
                        )}
                        {/* 환경 변수에서 YouTube API 키가 로드된 경우 표시하는 UI */}
                        {isYoutubeKeyFromEnv && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 flex items-center mb-2">
                                    <YouTubeIcon />
                                    <span className="ml-1">YouTube Data API Key</span>
                                    <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">환경 변수에서 로드됨</span>
                                </label>
                                <p className="text-sm text-slate-400 italic">.env.local 파일에서 자동으로 설정되었습니다.</p>
                            </div>
                        )}
                        
                        {/* Gemini API 키 입력 UI - 환경 변수에서 로드된 경우 숨김 처리 */}
                        {!isGeminiKeyFromEnv && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 flex items-center mb-2">
                                    <SparklesIcon />
                                    <span className="ml-1">Gemini API Key</span>
                                    {geminiApiKey ? <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">활성</span> : <span className="ml-auto text-xs font-bold text-red-400 bg-red-900/50 px-2 py-0.5 rounded-full">미설정</span>}
                                </label>
                                <div className="flex gap-2">
                                    <input type="password" value={geminiKeyInput} onChange={(e) => setGeminiKeyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey('gemini')} placeholder="API 키 입력" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm" />
                                    <button onClick={() => handleSaveApiKey('gemini')} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-sm py-1.5 px-3 rounded-lg transition-colors">저장</button>
                                    {geminiApiKey && <button onClick={() => handleDeleteApiKey('gemini')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-sm py-1.5 px-3 rounded-lg transition-colors">삭제</button>}
                                </div>
                            </div>
                        )}
                        
                        {/* 환경 변수에서 Gemini API 키가 로드된 경우 표시하는 UI */}
                        {isGeminiKeyFromEnv && (
                            <div>
                                <label className="text-sm font-medium text-slate-300 flex items-center mb-2">
                                    <SparklesIcon />
                                    <span className="ml-1">Gemini API Key</span>
                                    <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">환경 변수에서 로드됨</span>
                                </label>
                                <p className="text-sm text-slate-400 italic">.env.local 파일에서 자동으로 설정되었습니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center items-start gap-2 mb-2">
                    <div className={`w-full max-w-lg flex gap-2 ${isCompareMode ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                        <input type="text" value={channelInputA} onChange={(e) => setChannelInputA(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="채널 ID, 핸들(@handle) 또는 URL 입력" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50" disabled={!apiKey}/>
                        {isCompareMode && <input type="text" value={channelInputB} onChange={(e) => setChannelInputB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="비교할 채널 ID, 핸들 또는 URL 입력" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50" disabled={!apiKey}/>}
                    </div>
                    <button onClick={handleSearch} disabled={isLoading || !apiKey} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center justify-center h-[42px]">
                        {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : '분석'}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-6 mb-6 text-sm">
                    <label className="flex items-center cursor-pointer" title={!geminiApiKey ? 'Gemini API 키를 설정해주세요.' : ''}><span className="mr-2 text-slate-400">Gemini AI</span><div className="relative"><input type="checkbox" className="sr-only" checked={useGeminiApi} onChange={(e) => setUseGeminiApi(e.target.checked)} disabled={isCompareMode || !geminiApiKey} /><div className={`block w-10 h-6 rounded-full transition-colors ${useGeminiApi && !isCompareMode && geminiApiKey ? 'bg-cyan-600' : 'bg-slate-700'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useGeminiApi && !isCompareMode && geminiApiKey ? 'translate-x-4' : ''}`}></div></div><span className={`ml-2 w-8 text-left font-semibold ${useGeminiApi && !isCompareMode && geminiApiKey ? 'text-cyan-400' : 'text-slate-500'}`}>{useGeminiApi && !isCompareMode && geminiApiKey ? 'ON' : 'OFF'}</span></label>
                    <label className="flex items-center cursor-pointer"><span className="mr-2 text-slate-400">채널 비교</span><div className="relative"><input type="checkbox" className="sr-only" checked={isCompareMode} onChange={(e) => setIsCompareMode(e.target.checked)}/><div className={`block w-10 h-6 rounded-full transition-colors ${isCompareMode ? 'bg-purple-600' : 'bg-slate-700'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isCompareMode ? 'translate-x-4' : ''}`}></div></div><span className={`ml-2 w-8 text-left font-semibold ${isCompareMode ? 'text-purple-400' : 'text-slate-500'}`}>{isCompareMode ? 'ON' : 'OFF'}</span></label>
                </div>
                
                {error && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mb-6">{error}</div>}

                {isLoading && <DashboardSkeleton useGeminiApi={useGeminiApi && !isCompareMode} isCompareMode={isCompareMode} />}
                
                {!isLoading && !channelDataA && !error && (
                    <div className="text-center text-slate-500 mt-16">
                        {!apiKey ? (
                            <>
                                <p>시작하려면 먼저 YouTube API 키를 설정해주세요.</p>
                                <p className="text-sm mt-2">상단의 'API 키 설정'에서 키를 입력할 수 있습니다.</p>
                            </>
                        ) : (
                             <>
                                <p>분석할 YouTube 채널의 ID, 핸들(@handle) 또는 전체 URL을 입력하고 '분석' 버튼을 클릭하세요.</p>
                                <p className="text-sm mt-2">(예: UC_x5XG1OV2P6uZZ5FSM9Ttw, @googledevelopers)</p>
                             </>
                        )}
                    </div>
                )}
                
                {!isLoading && channelDataA && !isCompareMode && (
                    <main className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2">
                                {renderChannelColumn(channelDataA, videoDataA, videoSortOrderA, videoPeriodA, isVideosLoadingA, 'A', { revenueAnalysis, isRevenueLoading })}
                            </div>
                            {useGeminiApi && (
                                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                                    <div className="flex items-center space-x-2 mb-4"><div className="w-5 h-5 flex items-center justify-center"><SparklesIcon /></div><h3 className="text-lg font-bold text-white">Gemini AI 분석 인사이트</h3></div>
                                    <div ref={geminiInsightsContainerRef} className="overflow-y-auto pr-2 max-h-[calc(100vh-20rem)]">
                                        {!geminiInsight && !isGeminiLoading && <div className="text-center py-8 flex flex-col items-center justify-center h-full"><p className="text-slate-400 mb-4">{!geminiApiKey ? 'Gemini API 키를 설정해주세요.' : '버튼을 클릭하여 AI 분석 리포트를 생성하세요.'}</p><button onClick={handleGenerateInsights} disabled={!channelDataA || videoDataA.length === 0 || !geminiApiKey} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 px-5 rounded-lg transition-all inline-flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"><SparklesIcon /><span className="ml-2">인사이트 생성</span></button></div>}
                                        {isGeminiLoading && !geminiInsight && <div className="flex items-center justify-center h-48"><div className="space-y-3 animate-pulse w-full"><div className="h-4 bg-slate-700 rounded w-3/4"></div><div className="h-4 bg-slate-700 rounded"></div><div className="h-4 bg-slate-700 rounded w-5/6"></div></div></div>}
                                        {geminiInsight && <div><MarkdownRenderer content={geminiInsight} />{isGeminiLoading && <div className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-bottom"></div>}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {!isLoading && isCompareMode && channelDataA && channelDataB && (
                    <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                             <h2 className="text-xl font-bold text-white text-center mb-4 truncate">{channelDataA.title}</h2>
                            {renderChannelColumn(channelDataA, videoDataA, videoSortOrderA, videoPeriodA, isVideosLoadingA, 'A')}
                        </div>
                         <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-bold text-white text-center mb-4 truncate">{channelDataB.title}</h2>
                            {renderChannelColumn(channelDataB, videoDataB, videoSortOrderB, videoPeriodB, isVideosLoadingB, 'B')}
                        </div>
                    </main>
                )}

                <VideoDetailModal video={selectedVideo} onClose={() => setSelectedVideo(null)} apiKey={apiKey} useGeminiApi={useGeminiApi && !isCompareMode} geminiApiKey={geminiApiKey} />
            </div>
        </div>
    );
}

export default App;

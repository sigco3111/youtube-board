import { YouTubeChannel, YouTubeVideo, YouTubeComment } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const fetchYouTubeAPI = async (endpoint: string, params: Record<string, string>, apiKey: string) => {
    if (!apiKey) {
        throw new Error('YouTube API 키가 제공되지 않았습니다. API 키를 설정해주세요.');
    }
    const query = new URLSearchParams({ ...params, key: apiKey }).toString();
    const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API 요청에 실패했습니다.');
    }
    return data;
};

const resolveInputToChannelId = async (input: string, apiKey: string): Promise<string> => {
    const cleanedInput = input.trim();

    if (cleanedInput.startsWith('UC') && cleanedInput.length > 20) {
        return cleanedInput;
    }

    const urlMatch = cleanedInput.match(/youtube\.com\/@([^/?]+)/);
    const handle = urlMatch ? urlMatch[1] : (cleanedInput.startsWith('@') ? cleanedInput.substring(1) : cleanedInput);
    
    const searchData = await fetchYouTubeAPI('search', {
        part: 'id',
        q: `@${handle}`,
        type: 'channel',
        maxResults: '1',
    }, apiKey);

    if (searchData.items && searchData.items.length > 0 && searchData.items[0].id.channelId) {
        return searchData.items[0].id.channelId;
    }

    throw new Error('채널을 찾을 수 없습니다. ID, 핸들(@handle) 또는 URL을 확인해주세요.');
};


export const getChannelData = async (input: string, apiKey: string): Promise<YouTubeChannel> => {
    const channelId = await resolveInputToChannelId(input, apiKey);
    
    const data = await fetchYouTubeAPI('channels', {
        part: 'snippet,statistics',
        id: channelId,
    }, apiKey);

    if (!data.items || data.items.length === 0) {
        throw new Error('채널 데이터를 가져올 수 없습니다.');
    }

    const item = data.items[0];
    
    return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        customUrl: item.snippet.customUrl,
        thumbnails: item.snippet.thumbnails,
        statistics: item.statistics,
    };
};

export const getVideosForChannel = async (
    channelId: string, 
    apiKey: string, 
    order: 'date' | 'viewCount' = 'date',
    publishedAfter?: string
): Promise<YouTubeVideo[]> => {
    const params: Record<string, string> = {
        part: 'id',
        channelId: channelId,
        maxResults: '10', // Increased from 5
        order: order,
        type: 'video',
    };

    if (publishedAfter) {
        params.publishedAfter = publishedAfter;
    }
    
    const searchData = await fetchYouTubeAPI('search', params, apiKey);

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    if (!videoIds) {
        return [];
    }
    
    const videoData = await fetchYouTubeAPI('videos', {
        part: 'snippet,statistics',
        id: videoIds,
    }, apiKey);

    return videoData.items.map((item: any) => ({
        id: item.id,
        publishedAt: item.snippet.publishedAt,
        title: item.snippet.title,
        description: item.snippet.description,
        tags: item.snippet.tags,
        thumbnails: item.snippet.thumbnails,
        statistics: {
            viewCount: item.statistics.viewCount || '0',
            likeCount: item.statistics.likeCount || '0',
            commentCount: item.statistics.commentCount || '0',
        },
    }));
};

export const getCommentsForVideo = async (videoId: string, apiKey: string): Promise<YouTubeComment[]> => {
    const data = await fetchYouTubeAPI('commentThreads', {
        part: 'snippet',
        videoId: videoId,
        maxResults: '50', // Fetch up to 50 comments
        order: 'relevance', // Get most relevant comments
        textFormat: 'plainText',
    }, apiKey);

    if (!data.items) {
        return [];
    }

    return data.items.map((item: any) => ({
        id: item.id,
        textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
        authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
    }));
};
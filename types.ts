
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
  statistics: YouTubeChannelStatistics;
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface YouTubeVideo {
  id: string;
  publishedAt: string;
  title: string;
  description: string;
  tags?: string[];
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
  statistics: YouTubeVideoStatistics;
}

export interface YouTubeComment {
    id: string;
    textDisplay: string;
    authorDisplayName: string;
    authorProfileImageUrl: string;
    publishedAt: string;
}

export interface RevenueAnalysisResult {
    estimatedMonthlyMin: number;
    estimatedMonthlyMax: number;
    estimatedYearlyMin: number;
    estimatedYearlyMax: number;
    currency: string;
    reasoning: string;
}

export interface CommentAnalysisResult {
    summary: string;
    sentiment: {
        positive: number;
        negative: number;
        neutral: number;
    };
    keyTopics: string[];
    suggestions: string[];
}
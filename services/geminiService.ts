import { GoogleGenAI, Type } from "@google/genai";
import { YouTubeChannel, YouTubeVideo, YouTubeComment, CommentAnalysisResult, RevenueAnalysisResult } from '../types';

export async function* generateDashboardInsightsStream(
  channel: YouTubeChannel,
  videos: YouTubeVideo[],
  apiKey: string
): AsyncGenerator<string, void, undefined> {
  if (!apiKey) {
    yield "\n\n**오류:** Gemini API 키가 설정되지 않았습니다. 'API 키 설정'에서 키를 입력해주세요.";
    return;
  }
  const ai = new GoogleGenAI({ apiKey });

  const channelStats = channel.statistics;
  const recentVideosSummary = videos.map(v => 
    `- "${v.title}" (조회수: ${Number(v.statistics.viewCount).toLocaleString()})`
  ).join('\n');

  const prompt = `
    당신은 전문 YouTube 채널 분석가입니다. 다음 YouTube 채널 데이터를 분석하고, 한국어로 비전문가도 이해하기 쉽게 분석 리포트를 작성해주세요.

    **채널 정보:**
    - 채널명: ${channel.title}
    - 구독자 수: ${Number(channelStats.subscriberCount).toLocaleString()} 명
    - 총 조회수: ${Number(channelStats.viewCount).toLocaleString()} 회
    - 총 비디오 수: ${Number(channelStats.videoCount).toLocaleString()} 개

    **최신/인기 비디오 목록:**
    ${recentVideosSummary}

    **분석 요청 사항:**
    1.  **종합 평가:** 채널의 현재 성과(구독자, 조회수)를 기반으로 전반적인 평가를 내려주세요.
    2.  **강점 분석:** 이 채널의 명확한 강점은 무엇인가요? (예: 특정 주제 전문성, 높은 조회수, 시청자 참여도 등)
    3.  **개선 제안:** 데이터를 기반으로 채널이 더 성장하기 위한 구체적인 액션 아이템 2-3가지를 제안해주세요.
    4.  **결론:** 분석 내용을 요약하고 채널의 미래에 대한 긍정적인 전망으로 마무리해주세요.

    **출력 형식:**
    - 마크다운 형식을 사용하여 명확하고 읽기 쉽게 작성해주세요.
    - 각 섹션(종합 평가, 강점 분석 등)에 제목을 붙여주세요.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.5,
        }
    });

    for await (const chunk of responseStream) {
        if (chunk && chunk.text) {
          yield chunk.text;
        }
    }
  } catch (error) {
    console.error("Gemini API 스트리밍 중 오류 발생:", error);
    yield "\n\n**오류:** AI 인사이트를 생성하는 데 실패했습니다. Gemini API 키가 유효한지 확인해주세요.";
  }
};

const revenueAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedMonthlyMin: { type: Type.NUMBER, description: "예상 월 수익 (최소, KRW 단위). (Estimated minimum monthly revenue in KRW.)" },
        estimatedMonthlyMax: { type: Type.NUMBER, description: "예상 월 수익 (최대, KRW 단위). (Estimated maximum monthly revenue in KRW.)" },
        estimatedYearlyMin: { type: Type.NUMBER, description: "예상 연 수익 (최소, KRW 단위). (Estimated minimum yearly revenue in KRW.)" },
        estimatedYearlyMax: { type: Type.NUMBER, description: "예상 연 수익 (최대, KRW 단위). (Estimated maximum yearly revenue in KRW.)" },
        currency: { type: Type.STRING, description: "수익 통화 단위 (예: 'KRW'). (The currency for the revenue, e.g., 'KRW')." },
        reasoning: { type: Type.STRING, description: "한국어로 작성된 예상 수익의 근거. (The reasoning for the estimation in Korean.)" }
    },
    required: ["estimatedMonthlyMin", "estimatedMonthlyMax", "estimatedYearlyMin", "estimatedYearlyMax", "currency", "reasoning"]
};

export const analyzeChannelRevenue = async (
    channel: YouTubeChannel,
    videos: YouTubeVideo[],
    apiKey: string
): Promise<RevenueAnalysisResult> => {
    if (!apiKey) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const recentViews = videos.map(v => parseInt(v.statistics.viewCount, 10)).filter(v => v > 0);
    const averageViews = recentViews.length > 0 ? recentViews.reduce((a, b) => a + b, 0) / recentViews.length : 0;

    const prompt = `
        당신은 전문 YouTube 수익 분석가입니다. 제공된 채널 데이터를 기반으로 예상 광고 수익을 분석해주세요.

        **채널 정보:**
        - 채널명: ${channel.title}
        - 구독자 수: ${Number(channel.statistics.subscriberCount).toLocaleString()} 명
        - 총 조회수: ${Number(channel.statistics.viewCount).toLocaleString()} 회
        - 총 비디오 수: ${Number(channel.statistics.videoCount).toLocaleString()} 개
        - 최근 비디오 평균 조회수: ${Math.round(averageViews).toLocaleString()} 회

        **분석 요청:**
        위 데이터를 바탕으로 채널의 예상 월간 및 연간 광고 수익 범위를 KRW(원) 단위로 추정해주세요.
        추정 시, 채널의 주제(영상 제목들로 유추), 구독자 규모, 평균 조회수 등을 고려하여 일반적인 CPM(1,000회 노출당 비용) 및 RPM(1,000회 조회당 수익) 범위를 가정해야 합니다.
        결과는 반드시 지정된 JSON 스키마 형식으로 응답해주세요.
        모든 텍스트 결과(reasoning)는 한국어로 작성해주세요.
        예상 수익은 현실적이고 보수적으로 추정해주세요.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: revenueAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error with Gemini revenue analysis:", e);
        throw new Error("AI의 예상 수익 분석 중 오류가 발생했습니다. Gemini API 키가 유효한지 확인해주세요.");
    }
};

const commentAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "한국어로 시청자 반응에 대한 2-3문장의 전반적인 요약. (A 2-3 sentence overall summary of viewer reactions in Korean.)"
        },
        sentiment: {
            type: Type.OBJECT,
            description: "댓글의 감성 분석 결과. 긍정, 부정, 중립의 합은 100이 되어야 함. (Sentiment analysis result of the comments. The sum of positive, negative, and neutral should be 100.)",
            properties: {
                positive: { type: Type.NUMBER, description: "긍정적인 댓글의 비율 (백분율). (Percentage of positive comments.)" },
                negative: { type: Type.NUMBER, description: "부정적인 댓글의 비율 (백분율). (Percentage of negative comments.)" },
                neutral: { type: Type.NUMBER, description: "중립적인 댓글의 비율 (백분율). (Percentage of neutral comments.)" }
            },
            required: ["positive", "negative", "neutral"]
        },
        keyTopics: {
            type: Type.ARRAY,
            description: "댓글에서 가장 자주 언급되는 한국어 핵심 주제 또는 키워드 3-5개. (3-5 key topics or keywords in Korean most frequently mentioned in the comments.)",
            items: { type: Type.STRING }
        },
        suggestions: {
            type: Type.ARRAY,
            description: "시청자 피드백을 바탕으로 크리에이터에게 제안할 만한 구체적인 한국어 액션 아이템 2개. (Two specific action items in Korean to suggest to the creator based on viewer feedback.)",
            items: { type: Type.STRING }
        }
    },
    required: ["summary", "sentiment", "keyTopics", "suggestions"]
};

export const analyzeVideoComments = async (
    video: YouTubeVideo, 
    comments: YouTubeComment[],
    apiKey: string
): Promise<CommentAnalysisResult> => {
    if (!apiKey) {
        throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const commentsText = comments.map(c => `- ${c.textDisplay}`).join('\n');

    const prompt = `
        당신은 전문 YouTube 동영상 분석가입니다.
        다음 영상의 댓글들을 분석하여 시청자들의 반응을 요약하고 인사이트를 제공해주세요.

        **영상 제목:** ${video.title}

        **댓글 목록 (최대 50개):**
        ${commentsText}

        **분석 요청:**
        위 댓글들을 기반으로 아래 요청사항에 대해 JSON 형식으로 응답해주세요.
        1.  **summary**: 시청자 반응에 대한 2-3문장의 한국어 요약.
        2.  **sentiment**: 댓글의 긍정/부정/중립 비율(%). 합계는 100%.
        3.  **keyTopics**: 댓글에서 자주 언급된 핵심 주제(키워드) 3-5개.
        4.  **suggestions**: 분석을 바탕으로 크리에이터에게 제안할 만한 구체적인 액션 아이템 2가지.

        모든 텍스트 결과는 반드시 한국어로 작성해주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: commentAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        // Ensure the sum of sentiment is 100, adjusting neutral if needed.
        const { positive, negative } = result.sentiment;
        let neutral = result.sentiment.neutral;
        const sum = positive + negative + neutral;
        if (sum !== 100) {
            neutral = 100 - positive - negative;
        }
        result.sentiment.neutral = Math.max(0, neutral); // Ensure not negative
        result.sentiment.positive = Math.max(0, positive);
        result.sentiment.negative = Math.max(0, negative);

        return result;
    } catch (e) {
        console.error("Error parsing Gemini JSON response:", e);
        throw new Error("AI의 댓글 분석 결과를 파싱하는 중 오류가 발생했습니다. Gemini API 키가 유효한지 확인해주세요.");
    }
};

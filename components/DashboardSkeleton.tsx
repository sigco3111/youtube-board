
import React from 'react';

const SkeletonCard = () => (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-700 h-12 w-12"></div>
            <div className="flex-1 space-y-3 py-1">
                <div className="h-2 bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

const SkeletonChart = () => (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-64 sm:h-80 animate-pulse">
         <div className="h-4 bg-slate-700 rounded w-1/3 mb-6"></div>
         <div className="flex flex-col justify-between h-full pb-10">
            {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="h-4 bg-slate-700 rounded w-20"></div>
                    <div className="h-4 bg-slate-700 rounded flex-grow"></div>
                 </div>
            ))}
         </div>
    </div>
);

const SkeletonVideoListItem = () => (
    <div className="flex items-start space-x-4 p-3 animate-pulse">
        <div className="w-24 h-14 sm:w-32 sm:h-18 bg-slate-700 rounded-md shrink-0"></div>
        <div className="flex-1 space-y-3 py-1">
            <div className="h-3 bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-2 bg-slate-700 rounded w-1/4 mt-2"></div>
        </div>
    </div>
);

const SkeletonVideoList = () => (
     <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="h-5 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="space-y-4">
            <SkeletonVideoListItem />
            <SkeletonVideoListItem />
            <SkeletonVideoListItem />
        </div>
    </div>
);


interface DashboardSkeletonProps {
    useGeminiApi: boolean;
    isCompareMode: boolean;
    part?: 'all' | 'videolist';
}

const SingleChannelSkeleton: React.FC<{ useGeminiApi: boolean }> = ({ useGeminiApi }) => (
    <div className={`grid grid-cols-1 ${useGeminiApi ? 'xl:grid-cols-3' : ''} gap-6`}>
        <div className={useGeminiApi ? "xl:col-span-2 space-y-6" : "space-y-6"}>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${useGeminiApi ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                {useGeminiApi && <SkeletonCard />}
            </div>
            <SkeletonChart />
            <SkeletonVideoList />
        </div>
        {useGeminiApi && (
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
                <div className="animate-pulse space-y-4">
                     <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                     </div>
                     <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-700 rounded"></div>
                     <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
            </div>
        )}
    </div>
);


const CompareChannelSkeleton = () => {
    const Column = () => (
         <div className="space-y-6 bg-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
            <SkeletonChart />
            <SkeletonVideoList />
        </div>
    );
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Column />
            <Column />
        </div>
    );
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ useGeminiApi, isCompareMode, part = 'all' }) => {
    if (part === 'videolist') {
        return <SkeletonVideoList />;
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
           {isCompareMode ? <CompareChannelSkeleton /> : <SingleChannelSkeleton useGeminiApi={useGeminiApi} />}
        </div>
    );
};

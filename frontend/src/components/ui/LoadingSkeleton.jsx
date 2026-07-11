export const CardSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-48 bg-slate-800 w-full"></div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-6 bg-slate-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
        
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-slate-800 rounded-md"></div>
          <div className="h-6 w-16 bg-slate-800 rounded-md"></div>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 w-20 bg-slate-800 rounded"></div>
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-pulse">
      <div className="md:flex">
        <div className="md:flex-shrink-0 md:w-1/3 bg-slate-800 h-64 md:h-auto"></div>
        <div className="p-8 w-full">
          <div className="flex justify-between items-start mb-4">
            <div className="w-full">
              <div className="h-8 bg-slate-800 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-slate-800 rounded w-1/3"></div>
            </div>
          </div>
          <div className="flex gap-2 my-4">
            <div className="h-6 w-20 bg-slate-800 rounded-md"></div>
            <div className="h-6 w-20 bg-slate-800 rounded-md"></div>
          </div>
          <div className="h-10 bg-slate-800 rounded w-1/4 mb-6"></div>
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

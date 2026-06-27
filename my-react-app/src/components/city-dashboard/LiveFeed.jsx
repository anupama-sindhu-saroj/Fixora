import IssueCard from "./IssueCard";

export default function LiveFeed({ issues, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <h3 className="text-base font-semibold text-slate-800">Live Feed</h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Last 5 minutes submissions</p>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No recent submissions.</p>
          </div>
        ) : (
          issues.map((issue, i) => (
            <IssueCard key={issue._id || i} issue={issue} onViewDetails={onViewDetails} />
          ))
        )}
      </div>
    </div>
  );
}

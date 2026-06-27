import IssueCard from "./IssueCard";

export default function RecentActivity({ issues, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">All submitted issues</p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
          {issues.length} issues
        </span>
      </div>
      <div className="overflow-y-auto max-h-96 p-4 space-y-3">
        {issues.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No recent activity yet.</p>
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

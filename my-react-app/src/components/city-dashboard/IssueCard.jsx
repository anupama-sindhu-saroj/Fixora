const statusColors = {
  pending: "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

export default function IssueCard({ issue, onViewDetails }) {
  const timeAgo = Math.floor((Date.now() - new Date(issue.createdAt)) / 60000);
  const firstImage = issue.imageUrls?.length ? issue.imageUrls[0] : "https://placehold.co/600x400";
  const statusClass = statusColors[issue.status?.toLowerCase()] || "bg-gray-100 text-gray-700";

  const handleView = () => {
    onViewDetails({
      title: issue.issueType,
      category: issue.issueType,
      date: new Date(issue.createdAt).toLocaleString(),
      status: issue.status,
      reporter: issue.reportedBy?.name || "Anonymous",
      description: issue.description,
      image: firstImage,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 new-request">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {issue.issueType}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
              {issue.status}
            </span>
          </div>
          <p className="font-semibold text-slate-800 mt-2 text-sm truncate">📍 {issue.location}</p>
          <p className="text-xs text-slate-400 mt-0.5">{timeAgo}m ago</p>
        </div>
      </div>
      <button
        onClick={handleView}
        className="mt-3 w-full text-xs font-semibold py-2 text-white rounded-lg transition-all duration-200"
        style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
      >
        View Details
      </button>
    </div>
  );
}

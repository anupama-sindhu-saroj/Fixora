const statConfig = [
  {
    label: "Total Work Orders",
    key: "total",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
    border: "border-blue-100",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    label: "Pending Issues",
    key: "pending",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
    border: "border-red-100",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "In Progress",
    key: "inProgress",
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    valueColor: "text-yellow-600",
    border: "border-yellow-100",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    label: "Total Resolved",
    key: "resolved",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
    border: "border-green-100",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function StatsGrid({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {statConfig.map(({ label, key, bg, iconBg, iconColor, valueColor, border, icon }) => (
        <div
          key={key}
          className={`${bg} border ${border} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
        >
          <div className={`${iconBg} p-3 rounded-xl shrink-0`}>
            <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            {loading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded mt-1" />
            ) : (
              <p className={`text-3xl font-bold ${valueColor} mt-0.5`}>{stats[key]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Initialize Lucide Icons
lucide.createIcons();

let allIssues = []; // Store all issues globally for filtering and modal

/**
 * Fetches real resolved issues from backend and renders archive
 */
async function fetchResolvedIssues() {
    try {
        const response = await fetch("http://localhost:5001/api/solutions/chronicles");
        if (!response.ok) throw new Error("Failed to fetch chronicles");
        const data = await response.json();

        console.log("✅ Fetched Chronicles:", data);

        // Transform backend data to match frontend card structure
        allIssues = data.map((item, index) => ({
            id: index + 1,
            title: item.issueId?.issueType || "Resolved Issue",
            category: item.issueId?.category || "General",
            year: new Date(item.issueId?.createdAt).getFullYear().toString(),
            quarter: getQuarter(new Date(item.issueId?.createdAt)),
            resolved_at: new Date(item.resolvedAt).toISOString().split("T")[0],
            resolutionTime: calculateResolutionTime(item.issueId?.createdAt, item.resolvedAt),
            authority: item.resolvedBy?.department || "Unknown Department",
            summary: item.summary || "No summary provided.",
            imageBefore: item.issueId?.imageUrls?.[0] || "https://placehold.co/600x400/008080/ffffff?text=BEFORE",
            imageAfter: item.imageUrl || "https://placehold.co/600x400/473bd0/ffffff?text=AFTER"
        }));

        renderArchive(allIssues);
    } catch (error) {
        console.error("❌ Error fetching chronicles:", error);
        document.getElementById("archive-container").innerHTML = `
            <p class="text-center text-red-600 mt-12">Failed to load Chronicles. Please try again later.</p>
        `;
    }
}

/**
 * Helper: Determine Quarter
 */
function getQuarter(date) {
    const month = date.getMonth() + 1;
    if (month <= 3) return "Q1 " + date.getFullYear();
    if (month <= 6) return "Q2 " + date.getFullYear();
    if (month <= 9) return "Q3 " + date.getFullYear();
    return "Q4 " + date.getFullYear();
}

/**
 * Helper: Calculate resolution time in hours/days
 */
function calculateResolutionTime(start, end) {
    const diffMs = new Date(end) - new Date(start);
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 24) return `${Math.round(diffHrs)} hours`;
    return `${Math.round(diffHrs / 24)} days`;
}

/**
 * Render resolved issues in the archive container
 */
function renderArchive(issues) {
    const container = document.getElementById("archive-container");
    container.innerHTML = "";

    document.getElementById("total-count").textContent = issues.length;

    if (issues.length === 0) {
        container.innerHTML = `<p class="text-xl text-center text-gray-700 mt-12">No resolved issues found.</p>`;
        return;
    }

    issues.sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));

    issues.forEach(issue => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "relative mb-12 p-4 sm:p-6 bg-white/70 rounded-xl shadow-xl hover:shadow-lg transition duration-300 transform hover:scale-[1.01]";

        cardDiv.innerHTML = `
            <div class="absolute left-[-2rem] top-1 sm:hidden w-4 h-4 rounded-full timeline-pin"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1">
                    <span class="text-xs font-mono tracking-widest uppercase text-gray-500">${issue.category} | ID: FIX-${issue.id}</span>
                    <h2 class="text-2xl font-bold mt-1 mb-4 text-gray-900">${issue.title}</h2>
                    <p class="text-gray-700 mb-4">${issue.summary}</p>
                    <div class="space-y-2 text-sm text-gray-800">
                        <p><i data-lucide="clock" class="inline-block w-4 h-4 mr-2 text-neon-blue"></i> Resolved in: <span class="font-semibold">${issue.resolutionTime}</span></p>
                        <p><i data-lucide="calendar" class="inline-block w-4 h-4 mr-2 text-neon-blue"></i> Resolved Date: <span class="font-semibold">${issue.resolved_at}</span></p>
                    </div>
                </div>
                <div class="md:col-span-2">
                    <div class="flex gap-4">
                        <img src="${issue.imageBefore}" alt="Before image" class="w-1/2 h-60 object-cover rounded-lg shadow-md">
                        <img src="${issue.imageAfter}" alt="After image" class="w-1/2 h-60 object-cover rounded-lg shadow-md">
                    </div>

                    <button onclick="openCaseStudyModal(${issue.id})"
                        class="mt-4 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-purple transition duration-300">
                        View Full Details
                    </button>
                </div>
            </div>
        `;
        container.appendChild(cardDiv);
    });

    lucide.createIcons();
}

/**
 * Filter issues based on search, category, and year
 */
function filterIssues() {
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    const categoryValue = document.getElementById("category-filter").value;
    const yearValue = document.getElementById("year-filter").value;

    const filtered = allIssues.filter(issue => {
        const matchesSearch =
            issue.title.toLowerCase().includes(searchValue) ||
            issue.summary.toLowerCase().includes(searchValue);

        const matchesCategory = categoryValue ? issue.category === categoryValue : true;
        const matchesYear = yearValue ? issue.year === yearValue : true;

        return matchesSearch && matchesCategory && matchesYear;
    });

    renderArchive(filtered);
}

/**
 * Opens the modal with issue details
 */
function openCaseStudyModal(issueId) {
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return;

    document.getElementById("modal-title").textContent = issue.title;
    document.getElementById("modal-summary").textContent = issue.summary;
    document.getElementById("modal-resolution").textContent = issue.resolutionTime;
    document.getElementById("modal-authority").textContent = issue.authority;
    document.getElementById("modal-date").textContent = issue.resolved_at;
    document.getElementById("modal-image-before").src = issue.imageBefore;
    document.getElementById("modal-image-after").src = issue.imageAfter;

    document.getElementById("case-study-modal").classList.remove("hidden");
}

/**
 * Closes the modal
 */
function closeCaseStudyModal() {
    document.getElementById("case-study-modal").classList.add("hidden");
}

// Initial load
window.onload = fetchResolvedIssues;

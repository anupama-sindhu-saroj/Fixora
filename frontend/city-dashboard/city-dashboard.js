import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

document.addEventListener('DOMContentLoaded', function () {
    // --- Socket.IO Real-Time Setup ---
    const socket = io("http://localhost:5001");

    socket.on("connect", () => {
        console.log("✅ Connected to server via Socket.IO:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket.IO connect error:", err);
    });

    // --- Element Selectors ---
    const liveTimeElement = document.getElementById('live-time');
    const liveFeedContainer = document.getElementById('live-feed-container');
    const recentActivityContainer = document.getElementById('recent-activity-container');
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');

    // Dashboard summary boxes
    const totalWorkOrders = document.getElementById("totalWorkOrders");
    const pendingIssues = document.getElementById("pendingIssues");
    const inProgress = document.getElementById("inProgress");
    const resolvedTotal = document.getElementById("resolvedTotal");

    // Modal elements
    const issueModal = document.getElementById('issue-modal');
    const modalContentBox = document.getElementById('modal-content-box');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // --- Mobile Menu Toggle ---
    menuButton.addEventListener('click', function () {
        sidebar.classList.toggle('-translate-x-full');
    });

    // --- Dashboard Summary Data ---
    async function loadDashboardData() {
        try {
            const res = await fetch("http://localhost:5001/api/issues/summary");
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            const data = await res.json();

            totalWorkOrders.textContent = data.total ?? 0;
            pendingIssues.textContent = data.pending ?? 0;
            inProgress.textContent = data.inProgress ?? 0;
            resolvedTotal.textContent = data.resolved ?? 0;

        } catch (err) {
            console.error("Error loading dashboard data:", err);
        }
    }

    // Load immediately and refresh every 15 seconds
    loadDashboardData();
    setInterval(loadDashboardData, 15000);

    // --- Live Date & Time ---
    function updateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        liveTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
    updateTime();
    setInterval(updateTime, 1000);

    // --- Check if issue is recent (last 5 minutes) ---
    function isRecent(issue) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return new Date(issue.createdAt).getTime() >= fiveMinutesAgo;
    }

    // --- Fetch Issues from Backend ---
    async function fetchIssues() {
        try {
            const res = await fetch("http://localhost:5001/api/issues");
            if (!res.ok) throw new Error("Failed to fetch issues");
            return await res.json();
        } catch (err) {
            console.error("Error fetching issues:", err);
            return [];
        }
    }

    // --- Add a report card to a container ---
    function addReport(issue, container) {
        const timeAgo = Math.floor((Date.now() - new Date(issue.createdAt)) / 60000); // minutes
        const firstImage = issue.imageUrls && issue.imageUrls.length ? issue.imageUrls[0] : "https://placehold.co/600x400";

        const reportCard = document.createElement('div');
        reportCard.className = 'p-4 rounded-lg border bg-slate-50 new-request';
        reportCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">${issue.issueType}</span>
                    <p class="font-semibold text-slate-700 mt-2">${issue.location}</p>
                    <p class="text-xs text-slate-500">${timeAgo}m ago</p>
                </div>
                <button class="text-slate-400 hover:text-blue-500">
                     <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                     </svg>
                </button>
            </div>
            <div class="mt-4 flex">
                <button class="view-details-btn w-full text-xs font-semibold py-1.5 text-white bg-slate-700 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                    data-title="${issue.issueType}"
                    data-category="${issue.issueType}"
                    data-date="${new Date(issue.createdAt).toLocaleString()}"
                    data-status="${issue.status}"
                    data-reporter="${issue.reportedBy?.name || 'Anonymous'}"
                    data-description="${issue.description}"
                    data-image="${firstImage}">
                    View Details
                </button>
            </div>
        `;

        container.insertBefore(reportCard, container.firstChild);

        // Limit container to 10 items
        if (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
    }

    // --- Load Issues Initially ---
    async function loadIssues() {
        const issues = await fetchIssues();
        issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // most recent first

        // Add to Recent Activity (all issues)
        issues.forEach(issue => addReport(issue, recentActivityContainer));

        // Add to Live Feed (only recent issues)
        issues.filter(isRecent).forEach(issue => addReport(issue, liveFeedContainer));
    }

    loadIssues();

    // --- Socket.IO: Handle new issues ---
    socket.on("newIssue", (issue) => {
        console.log("📢 New issue received:", issue);

        // Add to Recent Activity always
        addReport(issue, recentActivityContainer);

        // Add to Live Feed if recent
        if (isRecent(issue)) {
            addReport(issue, liveFeedContainer);
        }

        // Refresh dashboard data on every new issue
        loadDashboardData();
    });

    // --- Modal Logic ---
    function openModal(data) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = `
            <div class="mb-4">
                <img src="${data.image}" alt="Issue image" class="rounded-lg w-full h-auto max-h-64 object-cover border">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <p class="font-semibold text-slate-600">Category</p>
                    <p>${data.category}</p>
                </div>
                <div>
                    <p class="font-semibold text-slate-600">Date Reported</p>
                    <p>${data.date}</p>
                </div>
                <div>
                    <p class="font-semibold text-slate-600">Status</p>
                    <p>${data.status}</p>
                </div>
            </div>
            <div class="mt-4">
                <p class="font-semibold text-slate-600">Reported By</p>
                <p>${data.reporter}</p>
            </div>
            <div class="mt-4">
                <p class="font-semibold text-slate-600">Description</p>
                <p class="text-slate-700 bg-slate-50 p-3 rounded-lg">${data.description}</p>
            </div>
        `;
        issueModal.classList.remove('hidden');
        setTimeout(() => {
            modalContentBox.classList.remove('opacity-0', '-translate-y-10');
        }, 10);
    }

    function closeModal() {
        modalContentBox.classList.add('opacity-0', '-translate-y-10');
        setTimeout(() => {
            issueModal.classList.add('hidden');
        }, 200);
    }

    document.body.addEventListener('click', function (event) {
        const target = event.target.closest('.view-details-btn');
        if (target) {
            const issueData = {
                title: target.dataset.title,
                category: target.dataset.category,
                date: target.dataset.date,
                status: target.dataset.status,
                reporter: target.dataset.reporter,
                description: target.dataset.description,
                image: target.dataset.image,
            };
            openModal(issueData);
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    issueModal.addEventListener('click', function (event) {
        if (event.target === issueModal) closeModal();
    });
});

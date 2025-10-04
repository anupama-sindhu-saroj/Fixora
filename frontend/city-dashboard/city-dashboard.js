document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selectors ---
    const liveTimeElement = document.getElementById('live-time');
    const liveFeedContainer = document.getElementById('live-feed-container');
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');

    // Modal elements
    const issueModal = document.getElementById('issue-modal');
    const modalContentBox = document.getElementById('modal-content-box');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // --- Mobile Menu Toggle ---
    menuButton.addEventListener('click', function() {
        sidebar.classList.toggle('-translate-x-full');
    });

    // --- Live Date & Time ---
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        liveTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
    updateTime(); // Initial call
    setInterval(updateTime, 1000); // Update every second

    // --- Live Feed Logic ---
    function addReportToFeed() {
        const reports = [
            { location: 'Overflowing bin on Park Ave', category: 'Waste', tagColor: 'bg-gray-100 text-gray-800', image: 'https://placehold.co/600x400/CBD5E0/4A5568?text=Overflowing+Bin' },
            { location: 'Graffiti on bridge at 12th St', category: 'Vandalism', tagColor: 'bg-purple-100 text-purple-800', image: 'https://placehold.co/600x400/D6BCFA/4A5568?text=Graffiti' },
            { location: 'Malfunctioning traffic signal at Grand & 3rd', category: 'Signals', tagColor: 'bg-pink-100 text-pink-800', image: 'https://placehold.co/600x400/FBB6CE/4A5568?text=Broken+Signal' },
            { location: 'Abandoned vehicle on Maple Rd', category: 'Vehicles', tagColor: 'bg-indigo-100 text-indigo-800', image: 'https://placehold.co/600x400/B3C5F7/4A5568?text=Abandoned+Car' }
        ];
        const report = reports[Math.floor(Math.random() * reports.length)];
        const timeAgo = Math.floor(Math.random() * 5) + 1;

        const reportCard = document.createElement('div');
        reportCard.className = 'p-4 rounded-lg border bg-slate-50 new-request';
        reportCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${report.tagColor}">${report.category}</span>
                    <p class="font-semibold text-slate-700 mt-2">${report.location}</p>
                    <p class="text-xs text-slate-500">${timeAgo}m ago</p>
                </div>
                <button class="text-slate-400 hover:text-blue-500">
                     <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                </button>
            </div>
            <div class="mt-4 flex">
                <button class="view-details-btn w-full text-xs font-semibold py-1.5 text-white bg-slate-700 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                    data-title="${report.location}"
                    data-category="${report.category}"
                    data-date="Just now"
                    data-status="New"
                    data-reporter="Live Feed"
                    data-description="A new issue has been submitted by a citizen via the mobile app. Location and category are noted above. Please review for action."
                    data-image="${report.image}">
                    View Details
                </button>
            </div>
        `;

        if (liveFeedContainer.firstChild) {
            liveFeedContainer.insertBefore(reportCard, liveFeedContainer.firstChild);
        } else {
            liveFeedContainer.appendChild(reportCard);
        }

        // Keep the feed to a max of 10 items
        if (liveFeedContainer.children.length > 10) {
            liveFeedContainer.removeChild(liveFeedContainer.lastChild);
        }
    }
    
    // Add a few initial reports
    addReportToFeed();
    setTimeout(addReportToFeed, 2500);

    // Simulate a new report every 5 seconds
    setInterval(addReportToFeed, 5000);

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

    // Event listener for opening the modal (using event delegation for performance)
    document.body.addEventListener('click', function(event) {
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
    
    // Event listeners for closing the modal
    closeModalBtn.addEventListener('click', closeModal);
    issueModal.addEventListener('click', function(event) {
        // Close modal if the outer background is clicked
        if (event.target === issueModal) {
            closeModal();
        }
    });
});
// Initialize Lucide Icons
lucide.createIcons();

// --- Mock Data ---
const mockResolvedIssues = [
    { id: 1, title: "Large Pothole on MG Road", category: "Road", year: "2025", quarter: "Q3 2025", resolved_at: '2025-09-28', resolutionTime: "36 hours", authority: "Public Works Dept.", summary: "Citizen-reported high-priority road hazard outside the school was addressed by PWD within the 72-hour SLA.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Pothole)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Fixed)" },
    { id: 2, title: "Overflowing Recycling Bins", category: "Waste", year: "2025", quarter: "Q3 2025", resolved_at: '2025-08-15', resolutionTime: "12 hours", authority: "Sanitation Dept.", summary: "Multiple bins reported full, contributing to litter. Fast resolution achieved by Sanitation on the same day.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Waste)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Cleaned)" },
    { id: 3, title: "Broken Streetlight on 5th Ave", category: "Lighting", year: "2025", quarter: "Q2 2025", resolved_at: '2025-05-01', resolutionTime: "60 hours", authority: "Electrical Dept.", summary: "Reported outage fixed ahead of schedule, improving neighborhood safety and visibility at night.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Dark)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Lit)" },
    { id: 4, title: "Leaking Water Main", category: "Water", year: "2024", quarter: "Q4 2024", resolved_at: '2024-11-20', resolutionTime: "4 days", authority: "Water & Utilities", summary: "Major water leak contained and repaired, preventing significant water loss and road damage.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Leak)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Repaired)" },
    { id: 5, title: "Graffiti Removal on Public Wall", category: "Other", year: "2025", quarter: "Q3 2025", resolved_at: '2025-07-05', resolutionTime: "7 days", authority: "Sanitation Dept.", summary: "Public wall defaced with graffiti was quickly cleaned as part of the 'Fix It Clean' initiative.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Graffiti)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Clean)" },
    { id: 6, title: "Park Bench Repair", category: "Road", year: "2024", quarter: "Q4 2024", resolved_at: '2024-10-10', resolutionTime: "1 day", authority: "Public Works Dept.", summary: "Damaged park bench fixed promptly, restoring functionality to the local community area.", imageBefore: "https://placehold.co/600x400/008080/ffffff?text=BEFORE%20(Damaged)", imageAfter: "https://placehold.co/600x400/473bd0/ffffff?text=AFTER%20(Fixed)" }
];

/**
 * Renders the issues into the Archive container based on current filters.
 */
function renderArchive(issues) {
    const container = document.getElementById('archive-container');
    container.innerHTML = '';
    
    document.getElementById('total-count').textContent = issues.length;

    if (issues.length === 0) {
        container.innerHTML = '<p class="text-xl text-center text-gray-700 mt-12">No resolved issues match your criteria. Keep reporting!</p>';
        return;
    }

    issues.sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));

    issues.forEach(issue => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'relative mb-12 p-4 sm:p-6 bg-white/70 rounded-xl shadow-xl hover:shadow-[0_0_20px_rgba(240,0,170,0.7)] transition duration-300 transform hover:scale-[1.01]';
        cardDiv.innerHTML = `
            <div class="absolute left-[-2rem] top-1 sm:hidden w-4 h-4 rounded-full timeline-pin"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1">
                    <span class="text-xs font-mono tracking-widest uppercase text-gray-500">${issue.category} | ID: FIX-${issue.id}</span>
                    <h2 class="text-2xl font-bold mt-1 mb-4 text-gray-900">${issue.title}</h2>
                    <p class="text-gray-700 mb-4">${issue.summary}</p>
                    <div class="space-y-2 text-sm text-gray-800">
                        <p><i data-lucide="clock" class="inline-block w-4 h-4 mr-2 text-neon-blue"></i> Resolved in: <span class="font-semibold">${issue.resolutionTime}</span></p>
                        <p><i data-lucide="building-2" class="inline-block w-4 h-4 mr-2 text-neon-blue"></i> Authority: <span class="font-semibold">${issue.authority}</span></p>
                        <p><i data-lucide="calendar" class="inline-block w-4 h-4 mr-2 text-neon-blue"></i> Resolved Date: <span class="font-semibold">${issue.resolved_at}</span></p>
                    </div>
                    <button id="case-study-btn-${issue.id}" class="mt-4 px-4 py-2 bg-neon-purple rounded-lg text-white font-semibold transition duration-300 hover:bg-fuchsia-700 hover:shadow-lg">
                        VIEW FULL CASE STUDY
                    </button>
                </div>
                <div class="md:col-span-2">
                    <div class="slider-container rounded-lg overflow-hidden relative shadow-2xl" id="slider-${issue.id}" style="height: 300px;">
                        <img src="${issue.imageBefore}" alt="Before image of the issue" class="slider-image absolute top-0 left-0 w-full h-full object-cover">
                        <div class="slider-after" data-issue-id="${issue.id}">
                            <img src="${issue.imageAfter}" alt="After image of the fix" class="slider-image absolute top-0 left-0">
                        </div>
                        <div class="slider-handle" data-issue-id="${issue.id}"></div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(cardDiv);

        document.getElementById(`case-study-btn-${issue.id}`).onclick = () => openCaseStudyModal(issue);
        lucide.createIcons();
    });

    initSliders();
}

// Modal Logic
function openCaseStudyModal(issue) {
    const modal = document.getElementById('case-study-modal');
    document.getElementById('modal-title').textContent = issue.title;
    document.getElementById('modal-summary').textContent = issue.summary + '. This case involved comprehensive action by the credited authority, demonstrating Fixora\'s capability to track issues from report to verified resolution.';
    document.getElementById('modal-resolution').textContent = issue.resolutionTime;
    document.getElementById('modal-authority').textContent = issue.authority;
    document.getElementById('modal-date').textContent = issue.resolved_at;
    document.getElementById('modal-image-before').src = issue.imageBefore;
    document.getElementById('modal-image-after').src = issue.imageAfter;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeCaseStudyModal() {
    document.getElementById('case-study-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

document.getElementById('case-study-modal').addEventListener('click', (event) => {
    if (event.target.id === 'case-study-modal') closeCaseStudyModal();
});

// Slider Functionality
function initSliders() {
    document.querySelectorAll('.slider-container').forEach(container => {
        const handle = container.querySelector('.slider-handle');
        const afterDiv = container.querySelector('.slider-after');
        const afterImg = afterDiv.querySelector('.slider-image');
        let isDragging = false;

        function getNewPosition(clientX) {
            const rect = container.getBoundingClientRect();
            let x = clientX - rect.left;
            return Math.max(0, Math.min(x, rect.width));
        }

        function updateSlider(x) {
            const percent = (x / container.offsetWidth) * 100;
            afterDiv.style.width = `${percent}%`;
            handle.style.left = `${percent}%`;
            afterImg.style.width = `${container.offsetWidth}px`;
        }

        const startDrag = (e) => { e.preventDefault(); isDragging = true; container.style.cursor = 'grabbing'; };
        const onDrag = (e) => { if (!isDragging) return; e.preventDefault(); updateSlider(getNewPosition(e.clientX || e.touches[0].clientX)); };
        const stopDrag = () => { isDragging = false; container.style.cursor = 'ew-resize'; };

        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        handle.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => onDrag(e.touches[0]));
        document.addEventListener('touchend', stopDrag);
    });
}

// Filtering
function filterIssues() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const year = document.getElementById('year-filter').value;

    const filtered = mockResolvedIssues.filter(issue => {
        const searchMatch = issue.title.toLowerCase().includes(searchText) || issue.summary.toLowerCase().includes(searchText) || issue.authority.toLowerCase().includes(searchText);
        const categoryMatch = !category || issue.category === category;
        const yearMatch = !year || issue.year === year;
        return searchMatch && categoryMatch && yearMatch;
    });

    renderArchive(filtered);
}

// Initial render
window.onload = () => { filterIssues(); };

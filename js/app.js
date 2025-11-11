// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    // Add click event listener to the hamburger button
    if (menuToggle && navLinks) { // Add a safety check
        menuToggle.addEventListener('click', () => {
            // Toggle the 'open' class on the nav links container
            navLinks.classList.toggle('open');

            // Update ARIA attribute for accessibility
            const isExpanded = navLinks.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Check if we are on the projects page
    if (document.getElementById('project-container')) {
        loadProjects();
    }
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Check if we are on the education page
    if (document.getElementById('timeline-container') && page === "education.html") {
        loadEducation();
    }else if(document.getElementById('timeline-container')){
        loadExperience();
    }

    // Check if we are on the project detail page
    if (document.getElementById('project-detail-container')) {
        loadProjectDetails();
    }

});



// --- Function to load PROJECTS ---
async function loadProjects() {
    const container = document.getElementById('project-container');
    if (!container) return; // Safety check

    try {
        const response = await fetch('./data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projects = await response.json();

        container.innerHTML = ''; // Clear loading message
        projects.forEach(project => {
            // Create an optional link
            let detailLink = '';
            if (project.has_details) {
                // Link to the detail page, passing the project 'id' as a URL parameter
                detailLink = `<a href="project-detail.html?id=${project.id}" class="project-detail-link">Read more...</a>`;
            }

            // Create the HTML for the project card
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
        <img src="${project.image}" alt="${project.title}" onerror="this.src='https://placehold.co/300x180/1e1e1e/bb86fc?text=Image+Not+Found';">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div>
          <a href="${project.github_url}" target="_blank">GitHub</a>
          <br>
          ${detailLink}
        </div>
      `;
            container.appendChild(projectCard);
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading projects. Please try again later.</p>';
        console.error('Failed to load projects:', error);
    }
}

// --- Function to load EDUCATION ---
async function loadEducation() {
    const container = document.getElementById('timeline-container');
    if (!container) return; // Safety check

    try {
        const response = await fetch('./data/education.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const timelineData = await response.json();

        container.innerHTML = ''; // Clear loading message
        timelineData.forEach(entry => {
            // Loop over subjects to create a list
            let subjectList = '<ul>';
            entry.items.forEach(item => {
                subjectList += `<li><strong>${item.subject}:</strong> ${item.grade}</li>`;
            });
            subjectList += '</ul>';

            // Create the HTML for the timeline entry
            const timelineEntry = document.createElement('div');
            timelineEntry.className = 'timeline-entry';
            timelineEntry.innerHTML = `
        <h2>${entry.year}
                    <a href="${entry.link}"target="_blank">
        <img src="${entry.image}" onerror="this.src='https://placehold.co/600x400/1e1e1e/bb86fc?text=Image+Not+Found';">
        </a>
        <h3>${entry.school}</h3>
        ${subjectList}
      `;
            container.appendChild(timelineEntry);
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading education history. Please try again later.</p>';
        console.error('Failed to load education:', error);
    }
}

// --- Function to load ONE PROJECT'S DETAILS ---
async function loadProjectDetails() {
    const container = document.getElementById('project-detail-container');
    if (!container) return; // Safety check

    try {
        // Get the 'id' from the URL (e.g., ?id=my-cool-project)
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');

        if (!projectId) {
            throw new Error('No project ID provided in URL.');
        }

        // Fetch the specific detail file
        const response = await fetch(`./data/details/${projectId}.json`);
        if (!response.ok) throw new Error(`Project file not found. (Status: ${response.status})`);
        const details = await response.json();

        // --- Build the HTML ---

        // 1. Process description paragraphs
        const descriptionHtml = details.long_description
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');

        // 2. Process technology list (now wrapped in its own <ul>)
        const techHtml = `
      <ul>
        ${details.technologies.map(tech => `<li>${tech}</li>`).join('')}
      </ul>
    `;

        // 3. Process image gallery (UPDATED for alternating layout)
        // Check if gallery exists and has items
        const galleryHtml = details.gallery && details.gallery.length > 0
            ? details.gallery.map((item, index) => `
        <div class="gallery-item-alternating">
          <img src="${item.image}" alt="${item.caption}" onerror="this.src='https://placehold.co/600x400/1e1e1e/bb86fc?text=Image+Not+Found';">
          <br>
          <div class="gallery-item-text">
          
            <strong>${item.caption}</strong>
            ${item.description ? `<span class="image-description"><br>${item.description}</span>` : ''}
            <br><br>
            
       
            
          </div>
        </div>
      `).join('')
            : '<p>No additional images for this project.</p>'; // Fallback message if no gallery

        // 4. Assemble all parts (New Structure)
        const detailHtml = `
      <h1>${details.title}</h1>
      <img src="${details.main_image}" alt="${details.title} main image" class="project-detail-main-image" onerror="this.src='https.placehold.co/800x400/1e1e1e/bb86fc?text=Main+Image+Not+Found';">
      
      <div class="project-detail-description">
        <h2>About ${projectId}</h2>
        ${descriptionHtml}
      </div>
      
      <aside class="project-detail-tech">
        <h3>Technologies Used</h3>
        ${techHtml}
      </aside>
      
      <div class="project-detail-gallery">
        <h1>Explanation</h1>
        ${galleryHtml}
      </div>
    `;

        // 5. Add to page
        container.innerHTML = detailHtml;

    } catch (error) {
        container.innerHTML = `<p style="color: #ff8a80;">Error loading project details: ${error.message}</p>`;
        console.error('Failed to load project details:', error);
    }
}



async function loadExperience() {
    const container = document.getElementById('timeline-container');
    if (!container) return; // Safety check

    try {
        const response = await fetch('./data/experience.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const timelineData = await response.json();

        container.innerHTML = ''; // Clear loading message
        timelineData.forEach(entry => {
            // Loop over subjects to create a list
            let subjectList = '<ul>';
            
            subjectList += '</ul>';

            // Create the HTML for the timeline entry
            const timelineEntry = document.createElement('div');
            timelineEntry.className = 'timeline-entry';
            timelineEntry.innerHTML = `
        <h2>${entry.year}
            <a href="${entry.link}"target="_blank">
        <img src="${entry.image}" onerror="this.src='https://placehold.co/600x400/1e1e1e/bb86fc?text=Image+Not+Found';">
        </a>

        
        <h3>${entry.place}</h3>
        <div class = "job-box" >
        ${entry.description}
        </div>
     
        ${subjectList}
      `;
            container.appendChild(timelineEntry);
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading education history. Please try again later.</p>';
        console.error('Failed to load experience:', error);
    }
}
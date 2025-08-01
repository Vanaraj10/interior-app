let authToken = localStorage.getItem('adminToken');
let currentProject = null;
let workers = [];
let projects = [];

const API_BASE_URL = 'https://interior-app-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        if (!authToken) {
            window.location.href = 'index.html';
            return;
        }
        initDashboard();
    } else {
        if (authToken) {
            window.location.href = 'dashboard.html';
            return;
        }
        initLogin();
    }
});

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");

  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";

      toggleBtn.classList.toggle("fa-eye");
      toggleBtn.classList.toggle("fa-eye-slash");
    });
  }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        if (show) {
            loader.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            loader.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoader(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUsername', username);            
            showToast('Login successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast(data.error || 'Login failed', 'error');            
            alert('Invalid Username or Password');
            window.location.reload();
        }    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoader(false);
    }
}

function initDashboard() {
    setupEventListeners();
    loadDashboardData();

    const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('adminUsername').textContent = adminUsername;
}

function setupEventListeners() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    const createWorkerForm = document.getElementById('createWorkerForm');
    if (createWorkerForm) {
        createWorkerForm.addEventListener('submit', handleCreateWorker);
    }

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

async function loadDashboardData() {
    showLoading(true);
    
    try {
        Promise.all([
            loadWorkers(),
            loadProjects()
        ]).then(() => {
            updateDashboardStats();
            loadRecentProjects();
        });
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/projects`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            projects = await response.json();
            renderProjectsTable();
        } else if (response.status === 401) {
            handleUnauthorized();
        } else {
            throw new Error('Failed to load projects');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = [];
    }
}

async function loadWorkers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/workers`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            workers = await response.json();
            renderWorkersGrid();
        } else if (response.status === 401) {
            handleUnauthorized();
        } else {
            throw new Error('Failed to load workers');
        }
    } catch (error) {
        console.error('Error loading workers:', error);
        workers = [];
    }
}

function updateDashboardStats() {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.isCompleted).length;
    const pendingProjects = totalProjects - completedProjects;
    const totalWorkers = workers.length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('completedProjects').textContent = completedProjects;
    document.getElementById('pendingProjects').textContent = pendingProjects;
    document.getElementById('totalWorkers').textContent = totalWorkers;
}

function loadRecentProjects() {
    const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const container = document.getElementById('recentProjectsList');
    
    if (recentProjects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No projects found</p>';
        return;
    }
    
    container.innerHTML = recentProjects.map(project => {
        const worker = workers.find(w => w.id == project.workerId);
        const workerName = worker ? worker.name : 'Unknown Worker';
        
        return `
            <div class="project-item">
                <div class="project-info">
                    <h4>${project.clientName}</h4>
                    <p>Worker: ${workerName} • ${formatDate(project.createdAt)}</p>
                </div>
                <span class="status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}">
                    ${project.isCompleted ? 'Completed' : 'Pending'}
                </span>
            </div>
        `;
    }).join('');
}

function renderProjectsTable() { 
    const tbody = document.getElementById('projectsTableBody');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No projects found</td></tr>';
        return;
    }
      tbody.innerHTML = projects.map(project => {
        const worker = workers.find(w => w.id === project.workerId);
        const workerName = worker ? worker.name : 'Unknown Worker';
        
        return `
            <tr>
                <td data-label="Client Name">${project.clientName}</td>
                <td data-label="Phone">${project.phone}</td>
                <td data-label="Address">${project.address}</td>
                <td data-label="Worker">${workerName}</td>
                <td data-label="Created Date">${formatDate(project.createdAt)}</td>
                <td data-label="Status">
                    <span class="status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}">
                        ${project.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="btn-small btn-view" onclick="viewProject('${project.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-small btn-toggle" onclick="toggleProjectStatus('${project.id}', ${!project.isCompleted})">
                            <i class="fas fa-toggle-${project.isCompleted ? 'on' : 'off'}"></i>
                        </button>
                        <button class="btn-small btn-delete" onclick="deleteProject('${project.id}', '${project.clientName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderWorkersGrid() {
    const container = document.getElementById('workersGrid');
    
    if (workers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem; grid-column: 1/-1;">No workers found</p>';
        return;
    }
    
    container.innerHTML = workers.map(worker => {
        const workerProjects = projects.filter(p => p.workerId === worker.id);
        const completedProjects = workerProjects.filter(p => p.isCompleted).length;
        
        return `
            <div class="worker-card">
                <div class="worker-header">
                    <div class="worker-info">
                        <h3>${worker.name}</h3>
                        <p>@${worker.username}</p>
                        <p>${worker.phone}</p>
                    </div>
                    <div class="worker-actions">
                        <button class="btn-small btn-delete" onclick="deleteWorker('${worker.id}', '${worker.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="worker-stats">
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <span style="color: var(--text-secondary);">Total Projects:</span>
                        <span style="color: var(--text-primary); font-weight: 600;">${workerProjects.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: var(--text-secondary);">Completed:</span>
                        <span style="color: var(--success-color); font-weight: 600;">${completedProjects}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Project functionality
async function viewProject(projectId) {
    try {
        showLoading(true);
        
        // Fetch the specific project to get reconstructed HTML
        const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            throw new Error('Failed to load project details');
        }
        
        const project = await response.json();
        currentProject = project;
        
        // Debug log
        console.log('Fetched project:', project);
        console.log('HTML content preview:', project.html ? project.html.substring(0, 200) : 'No HTML');
        
        // Populate modal
        document.getElementById('modalClientName').textContent = project.clientName;
        document.getElementById('modalClientPhone').textContent = project.phone;
        document.getElementById('modalClientAddress').textContent = project.address;
        
        const statusBadge = document.getElementById('modalProjectStatus');
        statusBadge.textContent = project.isCompleted ? 'Completed' : 'Pending';
        statusBadge.className = `status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}`;
        
        // Update toggle button
        const toggleBtn = document.getElementById('toggleStatusBtn');
        toggleBtn.innerHTML = `<i class="fas fa-toggle-${project.isCompleted ? 'on' : 'off'}"></i> ${project.isCompleted ? 'Mark Pending' : 'Mark Complete'}`;
          // Load HTML content with global.css applied
        const htmlContainer = document.getElementById('projectHtmlContainer');
        PDFUtils.displayProjectHTML(project, htmlContainer);
          // Check if project contains curtains and show/hide stitching button
        const stitchingBtn = document.getElementById('stitchingQuotationBtn');
        const hasCurtains = checkIfProjectHasCurtains(project);
        
        console.log('Stitching button debug:', {
            buttonFound: !!stitchingBtn,
            hasCurtains: hasCurtains,
            rawDataExists: !!project.rawData,
            rawDataPreview: project.rawData ? project.rawData.substring(0, 200) : 'No rawData'
        });
        
        if (hasCurtains) {
            stitchingBtn.style.display = 'inline-block';
            console.log('Stitching button shown');
        } else {
            stitchingBtn.style.display = 'none';
            console.log('Stitching button hidden - no curtains found');
        }
        
        showModal('projectViewModal');
        
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Failed to load project details', 'error');
    } finally {
        showLoading(false);
    }
}

async function toggleProjectStatus(projectId, newStatus) {
    if (!projectId) {
        projectId = currentProject?.id;
        newStatus = !currentProject?.isCompleted;
    }
    
    if (!projectId) {
        showToast('Project not found', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}/completed`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isCompleted: newStatus }),
        });
        
        if (response.ok) {
            showToast(`Project marked as ${newStatus ? 'completed' : 'pending'}`, 'success');
            await loadProjects();
            updateDashboardStats();
            
            // Update modal if open
            if (currentProject && currentProject.id === projectId) {
                currentProject.isCompleted = newStatus;
                const statusBadge = document.getElementById('modalProjectStatus');
                statusBadge.textContent = newStatus ? 'Completed' : 'Pending';
                statusBadge.className = `status-badge ${newStatus ? 'status-completed' : 'status-pending'}`;
                
                const toggleBtn = document.getElementById('toggleStatusBtn');
                toggleBtn.innerHTML = `<i class="fas fa-toggle-${newStatus ? 'on' : 'off'}"></i> ${newStatus ? 'Mark Pending' : 'Mark Complete'}`;
            }
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to update project status', 'error');
        }
    } catch (error) {
        console.error('Error toggling project status:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Admin deletes a project
async function deleteProject(projectId, clientName) {
    if (!confirm(`Are you sure you want to delete the project for "${clientName}"? This action cannot be undone.`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
          if (response.ok) {
            showToast('Project deleted successfully', 'success');
            await loadProjects();
            updateDashboardStats();
            
            // Close project modal if the deleted project was being viewed
            if (currentProject && currentProject.id === projectId) {
                closeModal('projectViewModal');
                currentProject = null;
            }
        } else {
            let errorMessage = 'Failed to delete project';
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (parseError) {
                // If response is not JSON (like 404 HTML page), use status text
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
                console.error('Delete project response:', response.status, response.statusText);
                console.error('Response URL:', response.url);
            }
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Worker functionality
async function handleCreateWorker(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const workerData = {
        username: formData.get('username'),
        password: formData.get('password'),
        name: formData.get('name'),
        phone: formData.get('phone'),
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/workers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workerData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Worker created successfully', 'success');
            closeModal('createWorkerModal');
            e.target.reset();
            await loadWorkers();
            updateDashboardStats();
        } else {
            showToast(data.error || 'Failed to create worker', 'error');
        }
    } catch (error) {
        console.error('Error creating worker:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteWorker(workerId, workerName) {
    if (!confirm(`Are you sure you want to delete worker "${workerName}"? This action cannot be undone.`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            showToast('Worker deleted successfully', 'success');
            await loadWorkers();
            await loadProjects(); // Reload projects as worker assignments might change
            updateDashboardStats();
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to delete worker', 'error');
        }
    } catch (error) {
        console.error('Error deleting worker:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Password change functionality
async function handleChangePassword(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Password changed successfully', 'success');
            closeModal('changePasswordModal');
            e.target.reset();
            window.location.href = 'dashboard.html'; 
        } else {
            showToast(data.error || 'Failed to change password', 'error');
             closeModal('changePasswordModal');
            
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Network error. Please try again.', 'error');
         closeModal('changePasswordModal');
         
    } finally {
        showLoading(false);
    }
}

// Navigation functionality
function showSection(sectionName) {
    // Remove active class from all nav items and sections
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    // Add active class to clicked nav item and corresponding section
    event.target.closest('.nav-item').classList.add('active');
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Load data for specific sections
    if (sectionName === 'projects') {
        filterProjects();
    }
}

// Filter functionality
function filterProjects() {
    const searchTerm = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('projectFilter')?.value || 'all';
    
    let filteredProjects = projects;
    
    // Filter by search term
    if (searchTerm) {
        filteredProjects = filteredProjects.filter(project =>
            project.clientName.toLowerCase().includes(searchTerm) ||
            project.phone.toLowerCase().includes(searchTerm) ||
            project.address.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
        const isCompleted = statusFilter === 'completed';
        filteredProjects = filteredProjects.filter(project => project.isCompleted == isCompleted);
    }
    
    // Render filtered projects
    const tbody = document.getElementById('projectsTableBody');
    
    if (filteredProjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No projects found</td></tr>';
        return;
    }
      tbody.innerHTML = filteredProjects.map(project => {
        const worker = workers.find(w => w.id === project.workerId);
        const workerName = worker ? worker.name : 'Unknown Worker';
        
        return `
            <tr>
                <td data-label="Client Name">${project.clientName}</td>
                <td data-label="Phone">${project.phone}</td>
                <td data-label="Address">${project.address}</td>
                <td data-label="Worker">${workerName}</td>
                <td data-label="Created Date">${formatDate(project.createdAt)}</td>
                <td data-label="Status">
                    <span class="status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}">
                        ${project.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td data-label="Actions">
                    <div class="action-buttons">
                        <button class="btn-small btn-view" onclick="viewProject('${project.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-small btn-toggle" onclick="toggleProjectStatus('${project.id}', ${!project.isCompleted})">
                            <i class="fas fa-toggle-${project.isCompleted ? 'on' : 'off'}"></i>
                        </button>
                        <button class="btn-small btn-delete" onclick="deleteProject('${project.id}', '${project.clientName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function showCreateWorker() {
    showModal('createWorkerModal');
}

function showChangePassword() {
    showModal('changePasswordModal');
}

// Dropdown functionality
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}




// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function togglePasswordWithIcon(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }
}

function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const toastId = Date.now().toString();
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="toast-close" onclick="removeToast('${toastId}')">&times;</span>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    toast.id = toastId;
    container.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove toast
    setTimeout(() => removeToast(toastId), duration);
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
}

function refreshData() {
    loadDashboardData();
    showToast('Data refreshed', 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        window.location.href = 'index.html';
    }
    else {
        // Reload the page if cancel is clicked
        window.location.href= 'dashboard.html' ;
    }
}

function handleUnauthorized() {
    showToast('Session expired. Please login again.', 'error');
    setTimeout(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        window.location.href = 'index.html';
    }, 2000);
}

// Download functionality for quotation content
async function downloadQuotation(format) {
    if (!currentProject || !currentProject.html) {
        showToast('No quotation content available for download', 'error');
        return;
    }

    const clientName = currentProject.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Quotation_${clientName}_${timestamp}`;

    if (format === 'html') {
        PDFUtils.downloadAsHTML(currentProject, filename);
    } else if (format === 'pdf') {
        await PDFUtils.downloadAsPDF(currentProject, filename);
    }
}

function createStandaloneHTML() {
    return PDFUtils.createStandaloneHTML(currentProject);
}

// Check if project contains curtain measurements
function checkIfProjectHasCurtains(project) {
    try {
        console.log('Checking project for curtains:', {
            projectId: project.id,
            clientName: project.clientName,
            hasRawData: !!project.rawData
        });
        
        if (!project.rawData) {
            console.log('No rawData found in project');
            return false;
        }
        
        const rawData = JSON.parse(project.rawData);
        const measurements = rawData.measurements || [];
        
        console.log('Project measurements:', {
            measurementsCount: measurements.length,
            measurements: measurements.map(m => ({
                interiorType: m.interiorType,
                roomName: m.roomName || m.room
            }))
        });
        
        const hasCurtains = measurements.some(measurement => 
            measurement.interiorType === 'curtains'
        );
        
        console.log('Curtains found:', hasCurtains);
        return hasCurtains;
    } catch (error) {
        console.error('Error checking for curtains:', error);
        return false;
    }
}

// Generate stitching unit quotation
async function generateStitchingQuotation() {
    if (!currentProject) {
        showToast('No project selected', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/admin/projects/${currentProject.id}/stitching-quotation`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate stitching quotation');
        }
        
        const data = await response.json();
        
        // Display the stitching quotation in a modal
        displayStitchingQuotation(data.html, `Stitching Unit Quotation - ${data.clientName}`);
        
        showToast('Stitching quotation generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating stitching quotation:', error);
        showToast(error.message || 'Failed to generate stitching quotation', 'error');
    } finally {
        showLoading(false);
    }
}

// Display stitching quotation in a modal with print functionality
function displayStitchingQuotation(stitchingHTML, title = 'Stitching Unit Quotation') {
    console.log('displayStitchingQuotation called with:', { 
        htmlLength: stitchingHTML?.length, 
        title,
        htmlPreview: stitchingHTML?.substring(0, 200) 
    });

    // Remove any existing modal
    const existingModal = document.getElementById('stitching-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'stitching-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        padding: 20px;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 90vh;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Create header with title, print button and close button
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
    `;

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = 'margin: 0; color: #333; font-size: 18px;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;';

    const printButton = document.createElement('button');
    printButton.innerHTML = '<i class="fas fa-print"></i> Print';
    printButton.style.cssText = `
        background: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    printButton.onclick = () => printStitchingQuotation(stitchingHTML, title);

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeButton.onclick = () => modal.remove();

    buttonContainer.appendChild(printButton);
    buttonContainer.appendChild(closeButton);
    header.appendChild(titleElement);
    header.appendChild(buttonContainer);

    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
        flex: 1;
        padding: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
    `;

    // Set iframe content
    iframe.onload = () => {
        console.log('Stitching quotation iframe loaded successfully');
    };

    // Write content to iframe
    iframe.onload = () => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(stitchingHTML);
            iframeDoc.close();
            console.log('Stitching quotation HTML content written to iframe successfully');
        } catch (error) {
            console.error('Error writing to iframe:', error);
            // Fallback: use srcdoc
            iframe.srcdoc = stitchingHTML;
        }
    };

    // Also set srcdoc as fallback
    iframe.srcdoc = stitchingHTML;

    // Assemble modal
    iframeContainer.appendChild(iframe);
    modalContent.appendChild(header);
    modalContent.appendChild(iframeContainer);
    modal.appendChild(modalContent);

    // Add to document
    document.body.appendChild(modal);

    // Close modal on escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Close modal on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };

    console.log('Stitching quotation modal displayed successfully');
}

// Print stitching quotation
function printStitchingQuotation(stitchingHTML, title) {
    try {
        // Create a printable version of the content
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        // Write the HTML content
        printWindow.document.open();
        printWindow.document.write(stitchingHTML);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.addEventListener('load', () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                
                // Show success message
                showToast('Print dialog opened for stitching quotation', 'success');
                
                // Close the print window after some time
                setTimeout(() => {
                    if (printWindow && !printWindow.closed) {
                        printWindow.close();
                    }
                }, 5000);
            }, 1000);
        });
        
    } catch (error) {
        console.error('Error printing stitching quotation:', error);
        showToast('Failed to print stitching quotation', 'error');
    }
}

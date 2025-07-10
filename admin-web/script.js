// Global variables
let authToken = localStorage.getItem('adminToken');
let currentProject = null;
let workers = [];
let projects = [];

// API Configuration
const API_BASE_URL = 'https://interior-app.onrender.com/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        if (!authToken) {
            window.location.href = 'index.html';
            return;
        }
        initDashboard();
    } else {
        // If user is on login page but has a valid token, redirect to dashboard
        if (authToken) {
            window.location.href = 'dashboard.html';
            return;
        }
        initLogin();
    }
});

// Login functionality
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


async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
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
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Dashboard functionality
function initDashboard() {
    setupEventListeners();
    loadDashboardData();
    
    // Set admin username in header
    const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('adminUsername').textContent = adminUsername;
}

function setupEventListeners() {
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Create worker form
    const createWorkerForm = document.getElementById('createWorkerForm');
    if (createWorkerForm) {
        createWorkerForm.addEventListener('submit', handleCreateWorker);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

async function loadDashboardData() {
    showLoading(true);
    
    try {
        // Load workers first, then projects, then update dashboard
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
        // Fix: handle string/number id mismatch
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
                <td>${project.clientName}</td>
                <td>${project.phone}</td>
                <td>${project.address}</td>
                <td>${workerName}</td>
                <td>${formatDate(project.createdAt)}</td>
                <td>
                    <span class="status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}">
                        ${project.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td>
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
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showToast('Project not found', 'error');
        return;
    }
    
    currentProject = project;
    
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
    if (project.html) {
        // Create iframe for isolated HTML rendering
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.minHeight = '400px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0.5rem';
        
        htmlContainer.innerHTML = '';
        htmlContainer.appendChild(iframe);
        
        // Write HTML content to iframe with global.css
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="./global.css">
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                </style>
            </head>
            <body>
                ${project.html}
            </body>
            </html>
        `;
        
        iframeDoc.open();
        iframeDoc.write(htmlWithStyles);
        iframeDoc.close();
        
        // Adjust iframe height after content loads
        iframe.onload = function() {
            const body = iframeDoc.body;
            const height = Math.max(body.scrollHeight, body.offsetHeight, 400);
            iframe.style.height = height + 'px';
        };
    } else {
        htmlContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No HTML content available</p>';
    }
    
    showModal('projectViewModal');
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
        } else {
            showToast(data.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Network error. Please try again.', 'error');
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
                <td>${project.clientName}</td>
                <td>${project.phone}</td>
                <td>${project.address}</td>
                <td>${workerName}</td>
                <td>${formatDate(project.createdAt)}</td>
                <td>
                    <span class="status-badge ${project.isCompleted ? 'status-completed' : 'status-pending'}">
                        ${project.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td>
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

function closeDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown')) {
        closeDropdown();
    }
});

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
}

function handleUnauthorized() {
    showToast('Session expired. Please login again.', 'error');
    setTimeout(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        window.location.href = 'index.html';
    }, 2000);
}

let authToken = localStorage.getItem('adminToken');
let currentProject = null;
let workers = [];
let projects = [];

const API_BASE_URL = 'https://interior-app.onrender.com/api';

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
    const project = projects.find(p => p.id == projectId);
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
        downloadAsHTML(filename);
    } else if (format === 'pdf') {
        await downloadAsPDF(filename);
    }
}

async function downloadAsPDF(filename) {
    try {
        showLoading(true);
        
        // Create a printable version of the content
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        const fullHtml = createStandaloneHTML();
        
        // Write the HTML content
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        
        await new Promise(resolve => {
            const checkLoaded = () => {
                if (printWindow.document.readyState === 'complete') {
                    setTimeout(resolve, 1500);
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            
            if (printWindow.document.readyState === 'complete') {
                setTimeout(resolve, 1500);
            } else {
                printWindow.addEventListener('load', () => {
                    setTimeout(resolve, 1500);
                });

                setTimeout(resolve, 3000);
            }
        });

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            showToast('Print dialog opened. Choose "Save as PDF" to download as PDF', 'info', 7000);
            setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                    printWindow.close();
                }
            }, 5000);
        }, 500);
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        showToast('Failed to create PDF. Please try downloading as HTML instead.', 'error');
    } finally {
        showLoading(false);
    }
}

function createStandaloneHTML() {
    const project = currentProject;
    
    // Get the exact global.css styles
    const globalCSS = `
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
        }

        .header {
            background-color: #f0f9ff;
            padding: 10px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e0e7ff;
        }

        .client-info {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fafafa;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }

        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .bold { font-weight: bold; }
        .text-xs { font-size: 10px; }
        .text-sm { font-size: 12px; }
        .text-base { font-size: 14px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 20px; }
        .text-2xl { font-size: 24px; }
        .text-primary { color: #3b82f6; }
        .text-muted { color: #666; }
        .text-success { color: #10b981; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #ef4444; }
        .bg-summary { background-color: #f0f9ff; }
        .bg-light { background-color: #f8f9fa; }
        .bg-primary { background-color: #3b82f6; color: white; }
        .rounded { border-radius: 8px; }
        .rounded-sm { border-radius: 4px; }
        .rounded-lg { border-radius: 12px; }
        .border { border: 1px solid #ddd; }
        .border-thick { border: 2px solid #ddd; }
        .p-1 { padding: 4px; }
        .p-2 { padding: 8px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .px-2 { padding-left: 8px; padding-right: 8px; }
        .px-3 { padding-left: 12px; padding-right: 12px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .m-1 { margin: 4px; }
        .m-2 { margin: 8px; }
        .m-3 { margin: 12px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }

        .cell-center {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: center;
            background-color: #fafafa;
        }

        .cell-right {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: right;
            background-color: #fafafa;
        }

        .cell-left {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
            background-color: #fafafa;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #2563eb;
            position: relative;
        }

        th::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
        }

        td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            background-color: #fff;
            transition: background-color 0.2s ease;
        }

        tr:nth-child(even) td {
            background-color: #f8f9fa;
        }

        tr:hover td {
            background-color: #e3f2fd;
        }

        .cost-summary {
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 8px;
            border: 1px solid #c7d2fe;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .cost-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
            border-bottom: 1px solid #e0e7ff;
        }

        .cost-row:last-child {
            border-bottom: 2px solid #3b82f6;
            font-weight: bold;
            font-size: 16px;
            padding-top: 8px;
            margin-top: 8px;
        }

        .cost-row .cost-label {
            color: #374151;
            font-weight: 500;
        }

        .cost-row .cost-value {
            color: #1f2937;
            font-weight: 600;
        }

        .section-header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 16px;
            margin: 20px 0 10px 0;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .measurement-section {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        .measurement-header {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            padding: 10px 15px;
            font-weight: 600;
            font-size: 14px;
        }

        .measurement-content {
            padding: 15px;
            background-color: #fff;
        }

        .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
        }

        .item-row:last-child {
            border-bottom: none;
        }

        .item-row:nth-child(even) {
            background-color: #f9fafb;
        }

        .item-description {
            font-weight: 500;
            color: #374151;
        }

        .item-measurement {
            text-align: center;
            color: #6b7280;
            font-family: 'Courier New', monospace;
        }

        .item-quantity {
            text-align: center;
            font-weight: 600;
            color: #1f2937;
        }

        .item-rate {
            text-align: right;
            color: #059669;
            font-weight: 500;
        }

        .item-total {
            text-align: right;
            font-weight: 700;
            color: #1f2937;
        }

        .summary-table {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .summary-table th {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .summary-table .total-row td {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            font-weight: bold;
            font-size: 14px;
            color: #1f2937;
            border-top: 2px solid #3b82f6;
        }

        @media (max-width: 768px) {
            table {
                font-size: 10px;
            }
            
            th, td {
                padding: 6px 4px;
            }
            
            .item-row {
                grid-template-columns: 1fr;
                gap: 4px;
                text-align: left;
            }
            
            .item-row > div {
                padding: 2px 0;
            }
            
            .item-row > div:before {
                font-weight: bold;
                margin-right: 8px;
            }
            
            .item-description:before { content: "Item: "; }
            .item-measurement:before { content: "Size: "; }
            .item-quantity:before { content: "Qty: "; }
            .item-rate:before { content: "Rate: "; }
            .item-total:before { content: "Total: "; }
        }

        .w-full { width: 100%; }
        .w-half { width: 50%; }
        .w-quarter { width: 25%; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
        .shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }
        .opacity-50 { opacity: 0.5; }
        .opacity-75 { opacity: 0.75; }

        /* Custom project-specific classes */
        .project-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            color: #1f2937;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 8px;
            border: 1px solid #c7d2fe;
        }

        .client-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .client-details h3 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 600;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }

        .measurement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .total-summary {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }

        .total-summary h3 {
            margin-bottom: 15px;
            font-size: 20px;
        }

        .grand-total {
            font-size: 28px;
            font-weight: bold;
            color: #0b5cff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 15px !important;
                font-size: 12px !important;
            }
            
            .header {
                background-color: #f0f9ff !important;
                border: 1px solid #e0e7ff !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            table {
                page-break-inside: auto !important;
                border-collapse: collapse !important;
                width: 100% !important;
                font-size: 10px !important;
                box-shadow: none !important;
            }
            
            th {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                color: white !important;
                border: 1px solid #2563eb !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
            
            th::after {
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%) !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            td {
                border: 1px solid #ddd !important;
                background-color: white !important;
                page-break-inside: avoid !important;
            }
            
            tr:nth-child(even) td {
                background-color: #f8f9fa !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .cost-summary {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%) !important;
                border: 1px solid #c7d2fe !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
                box-shadow: none !important;
            }
            
            .section-header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                box-shadow: none !important;
            }
            
            .measurement-header {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .client-info {
                background-color: #fafafa !important;
                border: 1px solid #ddd !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .total-summary {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .project-title {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%) !important;
                border: 1px solid #c7d2fe !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .client-details {
                background: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .summary-table th {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .summary-table .total-row td {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%) !important;
                border-top: 2px solid #3b82f6 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
              /* Prevent page breaks in important sections */
            .measurement-section {
                page-break-inside: avoid !important;
            }
        }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="print-color-adjust" content="exact">
    <title>Interior Quotation - ${project.clientName}</title>
    <style>
        ${globalCSS}
        
        /* Additional rendering optimizations for PDF */
        @page {
            margin: 0.5in;
            size: A4;
        }
        
        body {
            margin: 0 !important;
            padding: 20px !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* Ensure all elements render colors properly */
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* Force gradients and backgrounds to print */
        th, .section-header, .measurement-header, .total-summary, 
        .cost-summary, .header, .client-info, .project-title {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
</head>
<body>
    ${project.html}
    
    <script>
        // Ensure styles are fully loaded before any print operation
        window.addEventListener('beforeprint', function() {
            // Force style recalculation
            document.body.offsetHeight;
        });
        
        // Wait for all content to load
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.body.style.visibility = 'visible';
            }, 100);
        });
        
        // Force color rendering for all elements
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                el.style.webkitPrintColorAdjust = 'exact';
                el.style.colorAdjust = 'exact';
                el.style.printColorAdjust = 'exact';
            });
        });
    </script>
</body>
</html>`;
}

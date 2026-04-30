// ===== Authentication Check =====
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
    window.location.href = 'index.html';
}

const user = JSON.parse(userStr);

// ===== DOM Elements =====
const userGreeting = document.getElementById('user-greeting');
const btnLogout = document.getElementById('btn-logout');
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const progressContainer = document.getElementById('upload-progress-container');
const progressBar = document.getElementById('upload-progress-bar');
const progressFilename = document.getElementById('upload-filename');
const progressPercentage = document.getElementById('upload-percentage');
const fileGrid = document.getElementById('file-grid');
const emptyState = document.getElementById('empty-state');
const fileCount = document.getElementById('file-count');
const searchInput = document.getElementById('search-input');
const previewModal = document.getElementById('preview-modal');
const closePreview = document.getElementById('close-preview');
const previewContainer = document.getElementById('preview-container');
const previewTitle = document.getElementById('preview-title');

// Initialize
userGreeting.textContent = `Hello, ${user.fullname.split(' ')[0]}`;
let filesList = [];

// ===== Fetch Files =====
async function fetchFiles() {
    try {
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            handleLogout();
            return;
        }

        filesList = await response.json();
        renderFiles(filesList);
    } catch (error) {
        console.error('Failed to fetch files:', error);
    }
}

// ===== Render Files =====
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    } else if (mimeType.includes('pdf')) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    } else if (mimeType.startsWith('video/')) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
    } else {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
    }
}

function getFileTypeClass(mimeType) {
    if (mimeType.startsWith('image/')) return 'type-image';
    if (mimeType.includes('pdf')) return 'type-pdf';
    if (mimeType.startsWith('video/')) return 'type-video';
    return '';
}

function renderFiles(files) {
    fileGrid.innerHTML = '';
    
    if (files.length === 0) {
        emptyState.style.display = 'flex';
        fileCount.textContent = '0 items';
        return;
    }

    emptyState.style.display = 'none';
    fileCount.textContent = `${files.length} item${files.length !== 1 ? 's' : ''}`;

    files.forEach(file => {
        const date = new Date(file.uploaded_at).toLocaleDateString();
        const typeClass = getFileTypeClass(file.mime_type);
        const icon = getFileIcon(file.mime_type);

        const card = document.createElement('div');
        card.className = `file-card ${typeClass}`;
        card.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name" title="${file.original_name}">${file.original_name}</div>
                <div class="file-meta">
                    <span>${formatSize(file.size)}</span>
                    <span>${date}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-action" title="Preview" onclick="previewFile(${file.id}, '${file.original_name}', '${file.mime_type}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-action" title="Download" onclick="downloadFile(${file.id}, '${file.original_name}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                <button class="btn-action delete" title="Delete" onclick="deleteFile(${file.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        fileGrid.appendChild(card);
    });
}

// ===== Upload Flow =====
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleUpload(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleUpload(fileInput.files[0]);
    }
    fileInput.value = ''; // reset
});

function handleUpload(file) {
    if (file.size > 50 * 1024 * 1024) {
        alert('File is too large. Maximum size is 50MB.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    progressContainer.style.display = 'block';
    progressFilename.textContent = file.name;
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';

    // Using XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/files/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressPercentage.textContent = percentComplete + '%';
        }
    };

    xhr.onload = function() {
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);

        if (xhr.status === 201) {
            fetchFiles(); // Refresh list
        } else {
            alert('Upload failed: ' + (xhr.responseText || 'Unknown error'));
        }
    };

    xhr.onerror = function() {
        alert('Upload failed due to network error.');
        progressContainer.style.display = 'none';
    };

    xhr.send(formData);
}

// ===== File Actions =====
function downloadFile(id, filename) {
    fetch(`/api/files/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(() => alert('Failed to download file.'));
}

async function deleteFile(id) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        const response = await fetch(`/api/files/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchFiles();
        } else {
            alert('Failed to delete file.');
        }
    } catch (error) {
        alert('Server error.');
    }
}

// ===== Preview Modal =====
function previewFile(id, filename, mimeType) {
    previewTitle.textContent = filename;
    previewContainer.innerHTML = '<div class="spinner"></div>';
    previewModal.classList.add('active');

    const previewUrl = `/api/files/${id}/preview`;

    // Fetch the file as a blob to include the Auth header
    fetch(previewUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error('Preview not available');
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        renderPreviewContent(url, mimeType);
    })
    .catch(() => {
        previewContainer.innerHTML = '<div class="preview-unsupported">Preview not available</div>';
    });
}

function renderPreviewContent(url, mimeType) {
    if (mimeType.startsWith('image/')) {
        previewContainer.innerHTML = `<img src="${url}" alt="Preview">`;
    } else if (mimeType.startsWith('video/')) {
        previewContainer.innerHTML = `<video controls autoplay><source src="${url}" type="${mimeType}"></video>`;
    } else if (mimeType === 'application/pdf') {
        previewContainer.innerHTML = `<iframe src="${url}#toolbar=0"></iframe>`;
    } else {
        previewContainer.innerHTML = `
            <div class="preview-unsupported">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:1rem;opacity:0.5">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
                </svg>
                <p>No preview available for this file type.</p>
                <button class="btn-logout" style="margin-top:1rem" onclick="document.querySelector('#close-preview').click()">Close</button>
            </div>
        `;
    }
}

closePreview.addEventListener('click', () => {
    previewModal.classList.remove('active');
    // Clear blob URLs if any
    const img = previewContainer.querySelector('img');
    const vid = previewContainer.querySelector('video source');
    const iframe = previewContainer.querySelector('iframe');
    if (img) URL.revokeObjectURL(img.src);
    if (vid) URL.revokeObjectURL(vid.src);
    if (iframe) URL.revokeObjectURL(iframe.src);
    
    previewContainer.innerHTML = '';
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = filesList.filter(file => 
        file.original_name.toLowerCase().includes(term)
    );
    renderFiles(filtered);
});

// ===== Logout =====
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

btnLogout.addEventListener('click', handleLogout);

// Start
fetchFiles();

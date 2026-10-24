const GITHUB_USERNAME = 'live-by-unix';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const PINNED_REPOS_URL = `https://pinned.berrysauce.dev/get/${GITHUB_USERNAME}`;

const cache = new Map();
const THEME_STORAGE_KEY = 'portfolio-theme';

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function initTheme() {
    const theme = getPreferredTheme();
    setTheme(theme);
}

async function fetchWithCache(url, options = {}) {
    if (cache.has(url)) {
        return cache.get(url);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cache.set(url, data);
        return data;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setElementText(elementId, text, fallback = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || fallback;
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = '';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

async function loadGitHubProfile() {
    try {
        const profile = await fetchWithCache(GITHUB_API_URL);

        if (profile.avatar_url) {
            const avatar = document.getElementById('avatar');
            if (avatar) {
                avatar.src = profile.avatar_url;
                avatar.alt = `${GITHUB_USERNAME} GitHub avatar`;
            }
        }

        if (profile.bio) {
            setElementText('heroBio', profile.bio, 'Developer building open source projects.');
        } else {
            setElementText('heroBio', 'Developer building open source projects.');
        }

        hideElement('statsLoading');
        hideElement('statsError');
        showElement('statsContent');

        if (profile.public_repos !== undefined) {
            setElementText('statRepos', profile.public_repos);
        }
        if (profile.followers !== undefined) {
            setElementText('statFollowers', profile.followers);
        }
        if (profile.following !== undefined) {
            setElementText('statFollowing', profile.following);
        }

    } catch (error) {
        console.error('Failed to load GitHub profile:', error);
        hideElement('statsLoading');
        showElement('statsError');
        setElementText('heroBio', 'Developer building open source projects.');
    }
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'C++': '#f34b7d',
        'C': '#555555',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#F05138',
        'Kotlin': '#A97BFF',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Vue': '#41b883',
        'React': '#61dafb',
    };
    return colors[language] || '#8b949e';
}

function createProjectCard(repo, index) {
    const card = document.createElement('a');
    const repoName = repo.name || repo.repo;
    card.href = repo.url || `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    card.className = 'project-card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.animationDelay = `${index * 0.1}s`;

    const language = repo.language || 'Unknown';
    const languageColor = repo.languageColor || getLanguageColor(language);
    const description = repo.description || 'No description available.';
    const stars = repo.stars || 0;
    const forks = repo.forks || 0;

    card.innerHTML = `
        <div class="project-card-header">
            <span class="project-card-name">${escapeHtml(repoName)}</span>
            <div class="project-card-icon">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3..95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
            </div>
        </div>
        <p class="project-card-description">${escapeHtml(description)}</p>
        <div class="project-card-meta">
            <span class="project-card-language">
                <span class="project-card-language-dot" style="background-color: ${languageColor}"></span>
                ${escapeHtml(language)}
            </span>
            <div class="project-card-stats">
                <span class="project-card-stat">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.715 3.865.636a.75.75 0 01.416 1.279l-2.8 2.734.66 3.861a.75.75 0 01-1.088.791L8 12.347l-3.61 1.894a.75.75 0 01-1.088-.79l.66-3.862L.165 8.298a.75.75 0 01.416-1.28l3.865-.636L7.327.668A.75.75 0 018 .25z"/>
                    </svg>
                    ${stars}
                </span>
                <span class="project-card-stat">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                    </svg>
                    ${forks}
                </span>
            </div>
        </div>
    `;

    return card;
}

async function loadPinnedRepos() {
    try {
        const data = await fetchWithCache(PINNED_REPOS_URL);
        const repos = Array.isArray(data) ? data : (data.pinned || []);

        hideElement('projectsLoading');
        hideElement('projectsError');

        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        if (repos.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'projects-error';
            emptyMessage.innerHTML = '<p>No pinned repositories found.</p>';
            grid.appendChild(emptyMessage);
            return;
        }

        repos.forEach((repo, index) => {
            const card = createProjectCard(repo, index);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to load pinned repositories:', error);
        hideElement('projectsLoading');
        showElement('projectsError');
    }
}

function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }
}

function init() {
    initTheme();
    initNavigation();
    loadGitHubProfile();
    loadPinnedRepos();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

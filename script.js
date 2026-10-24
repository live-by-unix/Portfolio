
"use strict";

const GITHUB_USERNAME = "live-by-unix";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`;
const BERRIES_API = `https://pinned.berrysauce.dev/get/${GITHUB_USERNAME}`;

const elements = {
    projectsGrid: document.getElementById("projectsGrid"),
    projectsLoading: document.getElementById("projectsLoading"),
    projectsError: document.getElementById("projectsError"),
    avatar: document.getElementById("avatar"),
    heroBio: document.getElementById("heroBio"),
    followers: document.getElementById("followers"),
    publicRepos: document.getElementById("publicRepos"),
    totalStars: document.getElementById("totalStars"),
    themeToggle: document.getElementById("themeToggle"),
    mobileMenuToggle: document.getElementById("mobileMenuToggle"),
    navLinks: document.getElementById("navLinks")
};

const state = {
    repositories: [],
    search: "",
    category: "all",
    topic: "all",
    sort: "pinned"
};

const CATEGORY_RULES = [
    {
        name: "AI & Machine Learning",
        keywords: [
            "ai", "artificial-intelligence", "machine-learning", "llm",
            "llms", "rag", "chatbot", "gpt", "deep-learning", "neural-network"
        ]
    },
    {
        name: "Developer Tools",
        keywords: [
            "developer-tools", "devtools", "cli", "terminal", "compiler",
            "formatter", "linter", "editor", "ide", "benchmark", "debugging"
        ]
    },
    {
        name: "Web & APIs",
        keywords: [
            "web", "website", "webapp", "web-app", "frontend", "backend",
            "api", "rest-api", "cloudflare", "workers", "pages", "html",
            "css", "javascript", "typescript"
        ]
    },
    {
        name: "Games",
        keywords: [
            "game", "games", "gaming", "godot", "gamedev", "game-development",
            "platformer", "multiplayer"
        ]
    },
    {
        name: "Desktop Applications",
        keywords: [
            "desktop", "desktop-app", "electron", "tauri", "avalonia",
            "dotnet", "csharp", "c-sharp", "windows", "macos", "linux-app"
        ]
    },
    {
        name: "Libraries & Frameworks",
        keywords: [
            "library", "libraries", "framework", "frameworks", "sdk",
            "package", "npm", "rust-crate", "middleware"
        ]
    },
    {
        name: "Open Source & Utilities",
        keywords: [
            "utility", "utilities", "tool", "tools", "automation",
            "open-source", "opensource", "self-hosted", "productivity"
        ]
    }
];

const CATEGORY_COLORS = {
    "AI & Machine Learning": "purple",
    "Developer Tools": "blue",
    "Web & APIs": "cyan",
    "Games": "green",
    "Desktop Applications": "orange",
    "Libraries & Frameworks": "pink",
    "Open Source & Utilities": "gray",
    "Other": "gray"
};

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#.-]+/g, " ")
        .trim();
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatNumber(value) {
    return new Intl.NumberFormat("en", {
        notation: Number(value) >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1
    }).format(Number(value) || 0);
}

async function fetchJSON(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${url}`);
    }

    return response.json();
}

function getRepositoryName(repository) {
    return repository.name || repository.repo || "";
}

function getRepositoryURL(repository) {
    return repository.html_url ||
        repository.url ||
        `https://github.com/${GITHUB_USERNAME}/${getRepositoryName(repository)}`;
}

function normalizeRepository(repository, index) {
    const name = getRepositoryName(repository);
    const url = getRepositoryURL(repository);

    return {
        id: repository.id || `${name}-${index}`,
        name,
        fullName: repository.full_name || `${GITHUB_USERNAME}/${name}`,
        description: repository.description || "No description provided yet.",
        url,
        homepage: repository.homepage || "",
        language: repository.language || null,
        languageColor: repository.languageColor || repository.language_color || null,
        stars: Number(repository.stargazers_count ?? repository.stars ?? 0),
        forks: Number(repository.forks_count ?? repository.forks ?? 0),
        topics: Array.isArray(repository.topics) ? repository.topics : [],
        category: "Other",
        isPinned: true,
        updatedAt: repository.updated_at || null,
        archived: Boolean(repository.archived),
        fork: Boolean(repository.fork)
    };
}

function classifyRepository(repository) {
    const text = normalizeText([
        repository.name,
        repository.description,
        repository.language,
        ...(repository.topics || [])
    ].join(" "));

    let bestCategory = "Other";
    let bestScore = 0;

    for (const rule of CATEGORY_RULES) {
        let score = 0;

        for (const keyword of rule.keywords) {
            if (text.includes(normalizeText(keyword))) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestCategory = rule.name;
        }
    }

    repository.category = bestCategory;
    return repository;
}

async function loadPinnedRepositories() {
    const pinnedData = await fetchJSON(BERRIES_API);

    const pinnedRepositories = Array.isArray(pinnedData)
        ? pinnedData
        : Array.isArray(pinnedData?.pinned)
            ? pinnedData.pinned
            : [];

    if (pinnedRepositories.length === 0) {
        throw new Error("BerrySauce did not return any pinned repositories.");
    }

    const repositories = pinnedRepositories
        .map((repository, index) => normalizeRepository(repository, index))
        .filter(repository => repository.name);

    const details = await Promise.all(
        repositories.map(async repository => {
            try {
                const detail = await fetchJSON(
                    `https://api.github.com/repos/${repository.fullName}`
                );

                return {
                    ...repository,
                    description: detail.description || repository.description,
                    url: detail.html_url || repository.url,
                    homepage: detail.homepage || repository.homepage,
                    language: detail.language || repository.language,
                    stars: Number(detail.stargazers_count ?? repository.stars),
                    forks: Number(detail.forks_count ?? repository.forks),
                    topics: Array.isArray(detail.topics)
                        ? detail.topics
                        : repository.topics,
                    updatedAt: detail.updated_at || repository.updatedAt,
                    archived: Boolean(detail.archived),
                    fork: Boolean(detail.fork),
                    isPinned: true
                };
            } catch (error) {
                console.warn(`Could not load details for ${repository.name}:`, error);
                return repository;
            }
        })
    );

    return details.map(classifyRepository);
}

async function loadProfile() {
    try {
        const profile = await fetchJSON(GITHUB_API);

        if (elements.avatar && profile.avatar_url) {
            elements.avatar.src = profile.avatar_url;
            elements.avatar.alt = `${GITHUB_USERNAME}'s GitHub avatar`;
        }

        if (elements.heroBio) {
            elements.heroBio.textContent =
                profile.bio || "Building software, tools, and creative projects.";
        }

        if (elements.followers) {
            elements.followers.textContent = formatNumber(profile.followers);
        }

        if (elements.publicRepos) {
            elements.publicRepos.textContent = formatNumber(profile.public_repos);
        }

        if (elements.totalStars) {
            elements.totalStars.textContent = "—";
        }

        return profile;
    } catch (error) {
        console.warn("Could not load GitHub profile:", error);
        return null;
    }
}

function calculateTotalStars(repositories) {
    return repositories.reduce((total, repository) => total + repository.stars, 0);
}

function updateTotalStars() {
    if (elements.totalStars) {
        elements.totalStars.textContent = formatNumber(
            calculateTotalStars(state.repositories)
        );
    }
}

function getAllTopics() {
    const topics = new Set();

    for (const repository of state.repositories) {
        for (const topic of repository.topics) {
            if (topic) topics.add(topic);
        }
    }

    return [...topics].sort((a, b) => a.localeCompare(b));
}

function getAllCategories() {
    return [...new Set(state.repositories.map(repository => repository.category))]
        .sort((a, b) => a.localeCompare(b));
}

function ensureFilterControls() {
    const projectsSection = elements.projectsGrid?.parentElement;
    if (!projectsSection) return;

    let controls = document.getElementById("projectControls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "projectControls";
        controls.className = "project-controls";

        controls.innerHTML = `
            <div class="project-search">
                <label class="sr-only" for="projectSearch">Search projects</label>
                <input
                    id="projectSearch"
                    type="search"
                    placeholder="Search projects, languages, or topics..."
                    autocomplete="off"
                >
            </div>
            <div class="project-filter-row">
                <label>
                    <span>Category</span>
                    <select id="categoryFilter">
                        <option value="all">All categories</option>
                    </select>
                </label>
                <label>
                    <span>GitHub topic</span>
                    <select id="topicFilter">
                        <option value="all">All topics</option>
                    </select>
                </label>
                <label>
                    <span>Sort</span>
                    <select id="projectSort">
                        <option value="pinned">Pinned order</option>
                        <option value="stars">Most stars</option>
                        <option value="forks">Most forks</option>
                        <option value="name">Name A–Z</option>
                        <option value="updated">Recently updated</option>
                    </select>
                </label>
            </div>
        `;

        elements.projectsGrid.parentElement.insertBefore(
            controls,
            elements.projectsGrid
        );
    }

    const searchInput = document.getElementById("projectSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const topicFilter = document.getElementById("topicFilter");
    const sortFilter = document.getElementById("projectSort");

    if (categoryFilter) {
        const previous = categoryFilter.value;

        categoryFilter.innerHTML = `
            <option value="all">All categories</option>
            ${getAllCategories().map(category => `
                <option value="${escapeHTML(category)}">${escapeHTML(category)}</option>
            `).join("")}
        `;

        categoryFilter.value = getAllCategories().includes(previous)
            ? previous
            : "all";
    }

    if (topicFilter) {
        const previous = topicFilter.value;

        topicFilter.innerHTML = `
            <option value="all">All topics</option>
            ${getAllTopics().map(topic => `
                <option value="${escapeHTML(topic)}">${escapeHTML(topic)}</option>
            `).join("")}
        `;

        topicFilter.value = getAllTopics().includes(previous) ? previous : "all";
    }

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.addEventListener("input", event => {
            state.search = event.target.value.toLowerCase().trim();
            renderRepositories();
        });
        searchInput.dataset.bound = "true";
    }

    if (categoryFilter && !categoryFilter.dataset.bound) {
        categoryFilter.addEventListener("change", event => {
            state.category = event.target.value;
            renderRepositories();
        });
        categoryFilter.dataset.bound = "true";
    }

    if (topicFilter && !topicFilter.dataset.bound) {
        topicFilter.addEventListener("change", event => {
            state.topic = event.target.value;
            renderRepositories();
        });
        topicFilter.dataset.bound = "true";
    }

    if (sortFilter && !sortFilter.dataset.bound) {
        sortFilter.addEventListener("change", event => {
            state.sort = event.target.value;
            renderRepositories();
        });
        sortFilter.dataset.bound = "true";
    }
}

function getFilteredRepositories() {
    let repositories = [...state.repositories];

    if (state.search) {
        repositories = repositories.filter(repository => {
            const searchableText = normalizeText([
                repository.name,
                repository.description,
                repository.language,
                repository.category,
                ...repository.topics
            ].join(" "));

            return searchableText.includes(normalizeText(state.search));
        });
    }

    if (state.category !== "all") {
        repositories = repositories.filter(
            repository => repository.category === state.category
        );
    }

    if (state.topic !== "all") {
        repositories = repositories.filter(
            repository => repository.topics.includes(state.topic)
        );
    }

    switch (state.sort) {
        case "stars":
            repositories.sort((a, b) => b.stars - a.stars);
            break;
        case "forks":
            repositories.sort((a, b) => b.forks - a.forks);
            break;
        case "name":
            repositories.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "updated":
            repositories.sort((a, b) =>
                new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            break;
        case "pinned":
        default:
            break;
    }

    return repositories;
}

function renderTopics(topics) {
    if (!topics.length) {
        return `<span class="topic-tag topic-tag-muted">No GitHub topics</span>`;
    }

    const visibleTopics = topics.slice(0, 6);
    const remaining = topics.length - visibleTopics.length;

    return `
        ${visibleTopics.map(topic => `
            <button
                class="topic-tag"
                type="button"
                data-topic="${escapeHTML(topic)}"
                title="Filter by ${escapeHTML(topic)}"
            >#${escapeHTML(topic)}</button>
        `).join("")}
        ${remaining > 0
            ? `<span class="topic-tag topic-tag-muted">+${remaining} more</span>`
            : ""}
    `;
}

function renderRepositoryCard(repository, index) {
    const categoryColor = CATEGORY_COLORS[repository.category] || "gray";
    const language = repository.language
        ? `<span class="project-language">
               <span class="language-dot" ${repository.languageColor
                   ? `style="background-color:${escapeHTML(repository.languageColor)}"`
                   : ""}></span>
               ${escapeHTML(repository.language)}
           </span>`
        : "";

    const homepageLink = repository.homepage
        ? `<a href="${escapeHTML(repository.homepage)}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`
        : "";

    return `
        <article class="project-card" style="--card-index:${index}">
            <div class="project-card-top">
                <span class="project-category category-${categoryColor}">
                    ${escapeHTML(repository.category)}
                </span>
                ${repository.isPinned
                    ? `<span class="project-pinned" title="Pinned on GitHub">★ Pinned</span>`
                    : ""}
            </div>

            <h3 class="project-title">
                <a href="${escapeHTML(repository.url)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    ${escapeHTML(repository.name)}
                    <span aria-hidden="true">↗</span>
                </a>
            </h3>

            <p class="project-description">
                ${escapeHTML(repository.description)}
            </p>

            <div class="project-topics">
                ${renderTopics(repository.topics)}
            </div>

            <div class="project-card-footer">
                <div class="project-metadata">
                    ${language}
                    <span class="project-stat" title="GitHub stars">
                        <span aria-hidden="true">★</span>
                        ${formatNumber(repository.stars)}
                    </span>
                    <span class="project-stat" title="GitHub forks">
                        <span aria-hidden="true">⑂</span>
                        ${formatNumber(repository.forks)}
                    </span>
                </div>
                <div class="project-links">
                    ${homepageLink}
                    <a href="${escapeHTML(repository.url)}"
                       target="_blank"
                       rel="noopener noreferrer">Source ↗</a>
                </div>
            </div>

            ${repository.archived
                ? `<div class="project-notice">Archived repository</div>`
                : ""}
        </article>
    `;
}

function renderRepositories() {
    if (!elements.projectsGrid) return;

    const repositories = getFilteredRepositories();

    if (repositories.length === 0) {
        elements.projectsGrid.innerHTML = `
            <div class="projects-empty">
                <h3>No matching projects</h3>
                <p>Try another search term, category, or GitHub topic.</p>
                <button type="button" id="resetProjectFilters">Clear filters</button>
            </div>
        `;

        document.getElementById("resetProjectFilters")?.addEventListener("click", () => {
            state.search = "";
            state.category = "all";
            state.topic = "all";
            state.sort = "pinned";

            const search = document.getElementById("projectSearch");
            const category = document.getElementById("categoryFilter");
            const topic = document.getElementById("topicFilter");
            const sort = document.getElementById("projectSort");

            if (search) search.value = "";
            if (category) category.value = "all";
            if (topic) topic.value = "all";
            if (sort) sort.value = "pinned";

            renderRepositories();
        });

        return;
    }

    elements.projectsGrid.innerHTML = repositories
        .map(renderRepositoryCard)
        .join("");

    elements.projectsGrid.querySelectorAll("[data-topic]").forEach(button => {
        button.addEventListener("click", () => {
            const topic = button.dataset.topic;
            state.topic = topic;

            const topicFilter = document.getElementById("topicFilter");
            if (topicFilter) topicFilter.value = topic;

            renderRepositories();
        });
    });
}

function showLoading(isLoading) {
    if (elements.projectsLoading) {
        elements.projectsLoading.hidden = !isLoading;
    }

    if (elements.projectsGrid) {
        elements.projectsGrid.setAttribute("aria-busy", String(isLoading));
    }
}

function showError(message) {
    if (elements.projectsError) {
        elements.projectsError.hidden = false;
        elements.projectsError.textContent = message;
    } else if (elements.projectsGrid) {
        elements.projectsGrid.innerHTML = `
            <div class="projects-error">
                <h3>Projects could not be loaded</h3>
                <p>${escapeHTML(message)}</p>
                <button type="button" id="retryProjects">Try again</button>
            </div>
        `;

        document.getElementById("retryProjects")?.addEventListener("click", loadProjects);
    }
}

async function loadProjects() {
    showLoading(true);

    if (elements.projectsError) {
        elements.projectsError.hidden = true;
        elements.projectsError.textContent = "";
    }

    try {
        state.repositories = await loadPinnedRepositories();

        ensureFilterControls();
        updateTotalStars();
        renderRepositories();
    } catch (error) {
        console.error("Unable to load pinned repositories:", error);
        showError(
            "Unable to load projects from BerrySauce or GitHub. Check your connection and try again."
        );
    } finally {
        showLoading(false);
    }
}

function setupThemeToggle() {
    if (!elements.themeToggle) return;

    const savedTheme = localStorage.getItem("portfolio-theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";

    document.documentElement.dataset.theme = initialTheme;

    elements.themeToggle.setAttribute(
        "aria-label",
        initialTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );

    elements.themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.dataset.theme || "dark";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("portfolio-theme", nextTheme);

        elements.themeToggle.setAttribute(
            "aria-label",
            nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
    });
}

function setupMobileNavigation() {
    if (!elements.mobileMenuToggle || !elements.navLinks) return;

    elements.mobileMenuToggle.addEventListener("click", () => {
        const isOpen = elements.navLinks.classList.toggle("active");

        elements.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
        elements.mobileMenuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    elements.navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            elements.navLinks.classList.remove("active");
            elements.mobileMenuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetID = link.getAttribute("href");
            if (!targetID || targetID === "#") return;

            const target = document.querySelector(targetID);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

async function initPortfolio() {
    setupThemeToggle();
    setupMobileNavigation();
    setupSmoothScrolling();

    await Promise.all([
        loadProfile(),
        loadProjects()
    ]);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio, { once: true });
} else {
    initPortfolio();
}

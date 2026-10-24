
"use strict";

const GITHUB_USERNAME = "live-by-unix";
const GITHUB_API = "https://api.github.com";
const PROFILE_URL = `${GITHUB_API}/users/${GITHUB_USERNAME}`;
const REPOSITORIES_URL =
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;
const PINNED_URL =
    `https://pinned.berrysauce.dev/get/${GITHUB_USERNAME}`;
const THEME_KEY = "portfolio-theme";
const CACHE_TTL = 5 * 60 * 1000;

const cache = new Map();

const state = {
    repositories: [],
    search: "",
    category: "all",
    topic: "all",
    sort: "pinned",
    loaded: false,
    loading: false,
    pinnedNames: new Set()
};

const LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    Java: "#b07219",
    Go: "#00add8",
    Rust: "#dea584",
    "C++": "#f34b7d",
    C: "#555555",
    Ruby: "#701516",
    PHP: "#4f5d95",
    Swift: "#f05138",
    Kotlin: "#a97bff",
    Dart: "#00b4ab",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    CSharp: "#178600",
    "C#": "#178600",
    Lua: "#000080",
    Zig: "#ec915c",
    Dockerfile: "#384d54"
};

const CATEGORY_RULES = [
    {
        name: "APIs & Backend",
        icon: "API",
        terms: ["api", "backend", "rest-api", "graphql", "worker",
            "server", "database", "webhook", "microservice"]
    },
    {
        name: "Web & Websites",
        icon: "WEB",
        terms: ["web", "website", "frontend", "html", "css",
            "javascript", "typescript", "react", "vue", "svelte"]
    },
    {
        name: "Developer Tools",
        icon: "DEV",
        terms: ["developer-tools", "devtools", "cli", "terminal",
            "compiler", "editor", "ide", "debugging", "benchmark"]
    },
    {
        name: "AI & Machine Learning",
        icon: "AI",
        terms: ["ai", "artificial-intelligence", "machine-learning",
            "llm", "rag", "agents", "deep-learning", "neural-network"]
    },
    {
        name: "Games & Game Development",
        icon: "GAME",
        terms: ["game", "games", "gamedev", "game-development",
            "godot", "unity", "gaming", "multiplayer"]
    },
    {
        name: "Desktop Applications",
        icon: "APP",
        terms: ["desktop", "desktop-app", "tauri", "electron",
            "avalonia", "qt", "gtk"]
    },
    {
        name: "Libraries & Frameworks",
        icon: "LIB",
        terms: ["library", "libraries", "framework", "frameworks",
            "sdk", "package", "npm", "open-source"]
    },
    {
        name: "Utilities & Experiments",
        icon: "TOOL",
        terms: ["utility", "utilities", "tool", "tools", "experiment",
            "experiments", "automation", "script"]
    }
];

const LANGUAGE_ALIASES = {
    "c#": "C#",
    csharp: "C#",
    "f#": "F#",
    golang: "Go",
    js: "JavaScript",
    ts: "TypeScript"
};

function $(id) {
    return document.getElementById(id);
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

function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
}

function unique(values) {
    return [...new Set(values.filter(Boolean))];
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(Number(value) || 0);
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function safeExternalURL(value, fallback) {
    try {
        const url = new URL(value || fallback);

        if (url.protocol !== "https:" || url.hostname !== "github.com") {
            return fallback;
        }

        return url.href;
    } catch {
        return fallback;
    }
}

function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = String(value ?? "");
    }
}

function show(id) {
    const element = $(id);

    if (element) element.hidden = false;
}

function hide(id) {
    const element = $(id);

    if (element) element.hidden = true;
}

function getTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY);

        if (saved === "light" || saved === "dark") {
            return saved;
        }
    } catch {}

    return matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

function setTheme(theme) {
    const selected = theme === "light" ? "light" : "dark";

    document.documentElement.dataset.theme = selected;

    const button = $("themeToggle");

    if (button) {
        button.setAttribute(
            "aria-label",
            selected === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
        );
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
        themeColor.content = selected === "dark" ? "#090b10" : "#f8faff";
    }

    try {
        localStorage.setItem(THEME_KEY, selected);
    } catch {}
}

function initTheme() {
    setTheme(getTheme());

    $("themeToggle")?.addEventListener("click", () => {
        setTheme(
            document.documentElement.dataset.theme === "dark"
                ? "light"
                : "dark"
        );
    });
}

async function fetchJSON(url, options = {}) {
    const cached = cache.get(url);

    if (!options.noCache && cached && Date.now() - cached.time < CACHE_TTL) {
        return cached.data;
    }

    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...options.headers
        }
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
            throw new Error("GitHub API rate limit reached. Try again later.");
        }

        if (response.status === 404) {
            throw new Error("Repository or profile not found.");
        }

        throw new Error(`Request failed with HTTP ${response.status}.`);
    }

    const data = await response.json();

    cache.set(url, {
        data,
        time: Date.now()
    });

    return data;
}

async function loadProfile() {
    try {
        const profile = await fetchJSON(PROFILE_URL);

        if (profile.avatar_url) {
            $("avatar").src = profile.avatar_url;
        }

        setText(
            "heroBio",
            profile.bio || "Building software, developer tools, APIs, and experiments."
        );

        setText("statRepos", formatNumber(profile.public_repos));
        setText("statFollowers", formatNumber(profile.followers));
        setText("statFollowing", formatNumber(profile.following));

        setText("statsFootnote", "Live public profile data from GitHub.");
    } catch (error) {
        console.warn("GitHub profile could not be loaded:", error);

        setText(
            "statsFootnote",
            "Profile statistics are temporarily unavailable. Visit GitHub for current information."
        );
    }
}

function getLanguageColor(language) {
    return LANGUAGE_COLORS[language] || "#8793a5";
}

function normalizeLanguage(language) {
    if (!language) return "Unknown";

    const key = normalize(language);

    return LANGUAGE_ALIASES[key] ||
        language;
}

function getRepositoryName(repo) {
    return repo.name || repo.repo || "";
}

function getRepositoryURL(repo) {
    const name = getRepositoryName(repo);

    return safeExternalURL(
        repo.html_url || repo.url,
        `https://github.com/${GITHUB_USERNAME}/${encodeURIComponent(name)}`
    );
}

function normalizeRepository(repo, index, isPinned = false) {
    const name = getRepositoryName(repo);

    return {
        name,
        description: repo.description || "",
        url: getRepositoryURL(repo),
        language: normalizeLanguage(repo.language),
        languageColor: repo.languageColor ||
            getLanguageColor(repo.language),
        stars: Number(repo.stargazers_count ?? repo.stars ?? 0),
        forks: Number(repo.forks_count ?? repo.forks ?? 0),
        topics: unique(
            (Array.isArray(repo.topics) ? repo.topics : [])
                .map(topic => normalize(topic).replace(/^#/, ""))
        ),
        category: "",
        categoryIcon: "",
        updatedAt: repo.updated_at || repo.updatedAt || "",
        isPinned,
        index,
        archived: Boolean(repo.archived),
        fork: Boolean(repo.fork),
        license: repo.license?.spdx_id || null
    };
}

async function loadPinnedRepositories() {
    try {
        const result = await fetchJSON(PINNED_URL);

        const repos = Array.isArray(result)
            ? result
            : Array.isArray(result.pinned)
                ? result.pinned
                : [];

        return repos
            .map((repo, index) => normalizeRepository(repo, index, true))
            .filter(repo => repo.name);
    } catch (error) {
        console.warn("Pinned repositories unavailable:", error);
        return [];
    }
}

async function loadAllRepositories() {
    const result = await fetchJSON(REPOSITORIES_URL);

    if (!Array.isArray(result)) {
        throw new Error("GitHub returned an unexpected repository response.");
    }

    return result
        .filter(repo => !repo.private)
        .map((repo, index) => normalizeRepository(repo, index));
}

function categorizeRepository(repo) {
    const searchable = normalize([
        repo.name,
        repo.description,
        repo.language,
        ...repo.topics
    ].join(" "));

    for (const rule of CATEGORY_RULES) {
        const matches = rule.terms.some(term => {
            if (repo.topics.includes(term)) return true;

            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`)
                .test(searchable);
        });

        if (matches) {
            return {
                name: rule.name,
                icon: rule.icon
            };
        }
    }

    return {
        name: "Other Projects",
        icon: "OTHER"
    };
}

async function fetchRepositoryTopics(repo) {
    const url = `${GITHUB_API}/repos/${GITHUB_USERNAME}/${encodeURIComponent(repo.name)}`;

    try {
        const details = await fetchJSON(url);

        repo.topics = unique(
            (Array.isArray(details.topics) ? details.topics : [])
                .map(topic => normalize(topic))
        );

        repo.description = details.description || repo.description;
        repo.language = normalizeLanguage(details.language || repo.language);
        repo.languageColor = getLanguageColor(repo.language);
        repo.stars = Number(details.stargazers_count ?? repo.stars);
        repo.forks = Number(details.forks_count ?? repo.forks);
        repo.updatedAt = details.updated_at || repo.updatedAt;
        repo.archived = Boolean(details.archived);
        repo.fork = Boolean(details.fork);
        repo.license = details.license?.spdx_id || null;
    } catch (error) {
        console.warn(`Could not load topics for ${repo.name}:`, error);
    }

    const category = categorizeRepository(repo);

    repo.category = category.name;
    repo.categoryIcon = category.icon;

    return repo;
}

async function mapWithConcurrency(items, limit, callback) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (true) {
            const index = nextIndex++;

            if (index >= items.length) return;

            results[index] = await callback(items[index], index);
        }
    }

    await Promise.all(
        Array.from(
            { length: Math.min(limit, items.length) },
            () => worker()
        )
    );

    return results;
}

function mergeRepositories(pinned, all) {
    const merged = new Map();

    all.forEach((repo, index) => {
        merged.set(repo.name.toLowerCase(), {
            ...repo,
            isPinned: false,
            index
        });
    });

    pinned.forEach((repo, index) => {
        const key = repo.name.toLowerCase();
        const existing = merged.get(key);

        merged.set(key, {
            ...existing,
            ...repo,
            topics: existing?.topics?.length
                ? existing.topics
                : repo.topics,
            description: existing?.description || repo.description,
            language: existing?.language !== "Unknown"
                ? existing.language
                : repo.language,
            stars: existing?.stars ?? repo.stars,
            forks: existing?.forks ?? repo.forks,
            updatedAt: existing?.updatedAt || repo.updatedAt,
            isPinned: true,
            index
        });
    });

    return [...merged.values()];
}

function getTopicCounts() {
    const counts = new Map();

    for (const repo of state.repositories) {
        for (const topic of repo.topics) {
            counts.set(topic, (counts.get(topic) || 0) + 1);
        }
    }

    return counts;
}

function populateCategoryFilter() {
    const select = $("categoryFilter");
    const selected = state.category;

    const categories = unique(
        state.repositories.map(repo => repo.category)
    ).sort((a, b) => a.localeCompare(b));

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All projects";
    select.appendChild(allOption);

    for (const category of categories) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    }

    select.value = categories.includes(selected) ? selected : "all";

    if (select.value !== selected) {
        state.category = select.value;
    }
}

function populateTopicFilters() {
    const container = $("topicFilters");
    container.replaceChildren();

    const label = document.createElement("span");
    label.className = "topic-filter-label";
    label.textContent = "TOPICS";
    container.appendChild(label);

    const counts = getTopicCounts();

    const topics = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 12)
        .map(([topic]) => topic);

    const visibleTopic = topics.includes(state.topic)
        ? state.topic
        : "all";

    state.topic = visibleTopic;

    const buttons = [
        { name: "All topics", value: "all" },
        ...topics.map(topic => ({
            name: topic,
            value: topic
        }))
    ];

    for (const item of buttons) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "topic-filter";
        button.dataset.topic = item.value;
        button.textContent = item.name;
        button.setAttribute(
            "aria-pressed",
            String(item.value === state.topic)
        );

        if (item.value === state.topic) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            state.topic = item.value;
            populateTopicFilters();
            renderProjects();
        });

        container.appendChild(button);
    }
}

function getVisibleRepositories() {
    const query = normalize(state.search);

    return state.repositories
        .filter(repo => {
            const matchesCategory = state.category === "all" ||
                repo.category === state.category;

            const matchesTopic = state.topic === "all" ||
                repo.topics.includes(state.topic);

            const searchable = normalize([
                repo.name,
                repo.description,
                repo.language,
                repo.category,
                ...repo.topics
            ].join(" "));

            const matchesSearch = !query ||
                searchable.includes(query);

            return matchesCategory && matchesTopic && matchesSearch;
        })
        .sort((a, b) => {
            switch (state.sort) {
                case "updated":
                    return (Date.parse(b.updatedAt) || 0) -
                        (Date.parse(a.updatedAt) || 0);

                case "stars":
                    return b.stars - a.stars ||
                        a.name.localeCompare(b.name);

                case "name":
                    return a.name.localeCompare(b.name);

                case "pinned":
                default:
                    if (a.isPinned !== b.isPinned) {
                        return a.isPinned ? -1 : 1;
                    }

                    return a.index - b.index;
            }
        });
}

function createStatIcon(type) {
    if (type === "star") {
        return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .9l2.2 4.45 4.9.71-3.55 3.46.84 4.88L8 12.1l-4.39 2.3.84-4.88L.9 6.06l4.9-.71L8 .9z"/></svg>';
    }

    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm0 2.12a2.25 2.25 0 1 1-1.5 0v.88a2.25 2.25 0 0 0 2.25 2.25h1.5v2.13a2.25 2.25 0 1 0 1.5 0V8.5h1.5A2.25 2.25 0 0 0 12.5 6.25v-.88a2.25 2.25 0 1 1 1.5 0v.88A3.75 3.75 0 0 1 10.25 10h-.75v1.38a2.25 2.25 0 1 1-3 0V10h-.25A3.75 3.75 0 0 1 2.5 6.25v-.88z"/></svg>';
}

function createProjectCard(repo, index) {
    const card = document.createElement("a");

    card.className = "project-card";
    card.href = repo.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
    card.setAttribute(
        "aria-label",
        `${repo.name}: open GitHub repository in a new tab`
    );

    const topics = repo.topics.slice(0, 5);
    const extraTopics = repo.topics.length - topics.length;

    const topicMarkup = topics.length
        ? topics.map(topic =>
            `<span class="topic-badge">${escapeHTML(topic)}</span>`
        ).join("") +
        (extraTopics > 0
            ? `<span class="topic-badge">+${extraTopics} more</span>`
            : "")
        : '<span class="project-topics-empty">No GitHub topics set</span>';

    const category = repo.category || "Other Projects";
    const language = repo.language || "Unknown";
    const description = repo.description ||
        "No description has been provided for this repository yet.";

    card.innerHTML = `
        <div class="project-card-top">
            <div class="project-identity">
                <span class="project-icon" aria-hidden="true">${escapeHTML(repo.categoryIcon || "DEV")}</span>
                <div>
                    <div class="project-name">${escapeHTML(repo.name)}</div>
                    <span class="project-owner">@${GITHUB_USERNAME}</span>
                </div>
            </div>
            <span class="project-external" aria-hidden="true">↗</span>
        </div>

        <p class="project-description">${escapeHTML(description)}</p>

        <div class="project-categories">
            <span class="category-badge">${escapeHTML(category)}</span>
            ${repo.isPinned ? '<span class="category-badge">Featured</span>' : ""}
            ${repo.archived ? '<span class="topic-badge">Archived</span>' : ""}
        </div>

        <div class="project-topics-heading">GitHub topics</div>
        <div class="project-topics">${topicMarkup}</div>

        <div class="project-footer">
            <span class="project-language">
                <span class="language-dot" style="--language-color:${escapeHTML(repo.languageColor || getLanguageColor(language))}"></span>
                ${escapeHTML(language)}
            </span>
            <span class="project-stat">
                ${createStatIcon("star")}
                ${formatNumber(repo.stars)}
            </span>
            <span class="project-stat">
                ${createStatIcon("fork")}
                ${formatNumber(repo.forks)}
            </span>
            ${repo.updatedAt ? `<span class="project-stat" title="Last updated ${escapeHTML(formatDate(repo.updatedAt))}">${escapeHTML(formatDate(repo.updatedAt))}</span>` : ""}
        </div>
    `;

    return card;
}

function renderProjects() {
    const grid = $("projectsGrid");
    const repos = getVisibleRepositories();
    const fragment = document.createDocumentFragment();

    for (const [index, repo] of repos.entries()) {
        fragment.appendChild(createProjectCard(repo, index));
    }

    grid.replaceChildren(fragment);

    setText(
        "projectCount",
        `${repos.length} ${repos.length === 1 ? "repository" : "repositories"}${repos.length !== state.repositories.length ? ` of ${state.repositories.length}` : ""}`
    );

    $("emptyState").hidden = repos.length !== 0;

    const hasProjects = state.repositories.length > 0;

    grid.hidden = !hasProjects || repos.length === 0;
}

function clearFilters() {
    state.search = "";
    state.category = "all";
    state.topic = "all";
    state.sort = "pinned";

    $("projectSearch").value = "";
    $("categoryFilter").value = "all";
    $("sortFilter").value = "pinned";

    populateTopicFilters();
    renderProjects();
}

function initFilters() {
    $("projectSearch").addEventListener("input", event => {
        state.search = event.target.value;
        renderProjects();
    });

    $("categoryFilter").addEventListener("change", event => {
        state.category = event.target.value;
        renderProjects();
    });

    $("sortFilter").addEventListener("change", event => {
        state.sort = event.target.value;
        renderProjects();
    });

    $("resetFilters").addEventListener("click", clearFilters);

    $("retryProjects").addEventListener("click", () => {
        cache.clear();
        loadProjects(true);
    });

    document.addEventListener("keydown", event => {
        const target = event.target;

        if (
            event.key === "/" &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) &&
            !target.isContentEditable
        ) {
            event.preventDefault();
            $("projectSearch").focus();
        }

        if (event.key === "Escape" && target === $("projectSearch")) {
            $("projectSearch").value = "";
            state.search = "";
            renderProjects();
            target.blur();
        }
    });
}

function initNavigation() {
    const nav = $("nav");
    const toggle = $("navToggle");
    const menu = $("navMenu");

    function closeMenu() {
        toggle.classList.remove("active");
        menu.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
    }

    toggle.addEventListener("click", () => {
        const isOpen = !menu.classList.contains("active");

        toggle.classList.toggle("active", isOpen);
        menu.classList.toggle("active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", event => {
        if (!nav.contains(event.target)) closeMenu();
    });

    const updateNav = () => {
        nav.classList.toggle("scrolled", window.scrollY > 20);
    };

    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
}

async function loadProjects(forceRefresh = false) {
    if (state.loading) return;

    state.loading = true;

    hide("projectsError");
    hide("emptyState");
    $("projectsGrid").hidden = false;

    if (!state.loaded) {
        $("projectsGrid").innerHTML = `
            <div class="skeleton-card" aria-hidden="true"></div>
            <div class="skeleton-card" aria-hidden="true"></div>
            <div class="skeleton-card" aria-hidden="true"></div>
        `;
    }

    setText("projectCount", "Loading repositories…");

    try {
        if (forceRefresh) {
            cache.delete(PINNED_URL);
            cache.delete(REPOSITORIES_URL);
            cache.delete(PROFILE_URL);
        }

        const [pinned, all] = await Promise.all([
            loadPinnedRepositories(),
            loadAllRepositories()
        ]);

        const pinnedNames = new Set(
            pinned.map(repo => repo.name.toLowerCase())
        );

        state.pinnedNames = pinnedNames;
        state.repositories = mergeRepositories(pinned, all);

        if (state.repositories.length === 0) {
            throw new Error("No public repositories were returned by GitHub.");
        }

        await mapWithConcurrency(
            state.repositories,
            4,
            fetchRepositoryTopics
        );

        state.repositories.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return a.index - b.index;
        });

        populateCategoryFilter();
        populateTopicFilters();
        renderProjects();

        state.loaded = true;
        hide("projectsError");
    } catch (error) {
        console.error("Unable to load project catalog:", error);

        if (!state.loaded) {
            $("projectsGrid").hidden = true;
            show("projectsError");
            setText("projectCount", "Repositories unavailable");
        } else {
            setText(
                "projectCount",
                "Showing previously loaded repositories"
            );
        }
    } finally {
        state.loading = false;
    }
}

function init() {
    initTheme();
    initNavigation();
    initFilters();

    loadProfile();
    loadProjects();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}

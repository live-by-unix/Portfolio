
:root {
    color-scheme: dark;
    --bg-primary: #080b12;
    --bg-secondary: #0d1220;
    --bg-card: #111827;
    --bg-card-hover: #151f31;
    --bg-input: #0b1220;
    --text-primary: #f1f5f9;
    --text-secondary: #a1afc3;
    --text-muted: #718096;
    --accent: #58a6ff;
    --accent-hover: #79c0ff;
    --accent-soft: rgba(88, 166, 255, 0.12);
    --border: #243044;
    --border-hover: #3b82c4;
    --success: #3ddc97;
    --purple: #b69cff;
    --cyan: #67e8f9;
    --orange: #ffbd75;
    --pink: #f0abfc;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;
    --radius-xl: 24px;
    --shadow-card: 0 12px 35px rgba(0, 0, 0, 0.18);
    --transition: 180ms ease;
    --content-width: 1160px;
}

:root[data-theme="light"] {
    color-scheme: light;
    --bg-primary: #f5f8fc;
    --bg-secondary: #edf2f8;
    --bg-card: #ffffff;
    --bg-card-hover: #f8fbff;
    --bg-input: #ffffff;
    --text-primary: #152238;
    --text-secondary: #53647a;
    --text-muted: #7c8ba0;
    --accent: #1769c2;
    --accent-hover: #0d55a3;
    --accent-soft: rgba(23, 105, 194, 0.09);
    --border: #d9e2ee;
    --border-hover: #8ab9ec;
    --success: #16865c;
    --purple: #7650cc;
    --cyan: #087e96;
    --orange: #a65d0b;
    --pink: #a63eb1;
    --shadow-card: 0 12px 35px rgba(34, 58, 89, 0.07);
}

* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    scroll-padding-top: 90px;
}

body {
    margin: 0;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 15px;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    transition: background var(--transition), color var(--transition);
}

body,
button,
input,
select,
textarea {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input,
select {
    font: inherit;
}

button,
a,
input,
select {
    -webkit-tap-highlight-color: transparent;
}

a {
    color: var(--accent);
    text-decoration: none;
    transition: color var(--transition);
}

a:hover {
    color: var(--accent-hover);
}

button {
    color: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}

img {
    display: block;
    max-width: 100%;
}

::selection {
    color: #fff;
    background: #246dc4;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

[hidden] {
    display: none !important;
}

/* Page layout */

.container,
.container-wide,
main,
section {
    min-width: 0;
}

.container,
.container-wide {
    width: min(var(--content-width), calc(100% - 48px));
    margin-inline: auto;
}

section {
    padding-block: 88px;
}

section:nth-of-type(even) {
    background: var(--bg-secondary);
}

.section-header {
    max-width: 740px;
    margin: 0 auto 42px;
    text-align: center;
}

.section-header h2,
section h2 {
    margin-top: 0;
    color: var(--text-primary);
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 750;
    letter-spacing: -0.045em;
    line-height: 1.2;
}

.section-header p,
.section-description {
    color: var(--text-secondary);
    font-size: 1rem;
}

/* Header and navigation */

header,
.site-header,
.navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

nav,
.navbar-inner,
.nav-container {
    width: min(var(--content-width), calc(100% - 48px));
    min-height: 72px;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
}

.logo,
.nav-logo,
.brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--text-primary);
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.03em;
}

.logo:hover,
.nav-logo:hover,
.brand:hover {
    color: var(--accent);
}

.nav-links,
#navLinks {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 25px;
}

.nav-links a,
#navLinks a {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 550;
    transition: color var(--transition);
}

.nav-links a:hover,
#navLinks a:hover {
    color: var(--text-primary);
}

#themeToggle,
#mobileMenuToggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-card);
    color: var(--text-primary);
    cursor: pointer;
    transition: border-color var(--transition), background var(--transition);
}

#themeToggle:hover,
#mobileMenuToggle:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
}

#mobileMenuToggle {
    display: none;
}

/* Hero */

.hero {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    padding-block: 105px 95px;
    background:
        radial-gradient(ellipse at 18% 12%, rgba(37, 99, 235, 0.14), transparent 40%),
        radial-gradient(ellipse at 85% 55%, rgba(8, 145, 178, 0.09), transparent 38%),
        var(--bg-primary);
}

.hero-content {
    position: relative;
    z-index: 1;
    width: min(var(--content-width), calc(100% - 48px));
    margin-inline: auto;
}

.hero h1 {
    max-width: 850px;
    margin: 0 0 22px;
    font-size: clamp(2.7rem, 7vw, 5.3rem);
    font-weight: 850;
    line-height: 1.04;
    letter-spacing: -0.065em;
}

.hero h1 span,
.gradient-text {
    color: var(--accent);
    background: linear-gradient(110deg, #60a5fa, #22d3ee);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero p {
    max-width: 690px;
    color: var(--text-secondary);
    font-size: clamp(1rem, 2vw, 1.15rem);
}

#avatar,
.avatar,
.profile-avatar {
    width: 104px;
    height: 104px;
    margin-bottom: 28px;
    border: 3px solid var(--border);
    border-radius: 50%;
    object-fit: cover;
    background: var(--bg-card);
    box-shadow: 0 0 0 8px var(--accent-soft);
}

.hero-buttons,
.hero-actions,
.button-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
}

.btn,
.button,
.button-primary,
.button-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 44px;
    padding: 10px 18px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 0.92rem;
    font-weight: 650;
    cursor: pointer;
    transition: transform var(--transition), border-color var(--transition),
        background var(--transition);
}

.btn:hover,
.button:hover,
.button-secondary:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
    color: var(--text-primary);
}

.button-primary,
.btn-primary {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
}

.button-primary:hover,
.btn-primary:hover {
    background: var(--accent-hover);
    color: #fff;
}

/* Profile statistics */

.stats,
.stats-grid,
.profile-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 38px;
}

.stat-card,
.stat,
.profile-stat {
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-card);
}

.stat-value,
.stat-card strong,
.stat-number {
    display: block;
    color: var(--text-primary);
    font-size: 1.65rem;
    font-weight: 800;
    line-height: 1.3;
}

.stat-label,
.stat-card span,
.stat-caption {
    color: var(--text-muted);
    font-size: 0.84rem;
}

/* Project section */

#projects {
    scroll-margin-top: 82px;
}

#projectsGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 20px;
    margin-top: 24px;
}

#projectsGrid[aria-busy="true"] {
    opacity: 0.65;
    pointer-events: none;
}

#projectsGrid > * {
    min-width: 0;
}

/* Search, category, topic and sort filters */

.project-controls {
    display: grid;
    gap: 16px;
    margin: 0 0 26px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
}

.project-search {
    width: 100%;
}

.project-search input,
#projectSearch {
    display: block;
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 0.95rem;
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
}

.project-search input::placeholder,
#projectSearch::placeholder {
    color: var(--text-muted);
}

.project-search input:focus,
#projectSearch:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.project-filter-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.project-filter-row label {
    display: grid;
    gap: 6px;
    min-width: 0;
}

.project-filter-row label > span {
    color: var(--text-secondary);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.035em;
}

.project-filter-row select,
#categoryFilter,
#topicFilter,
#projectSort {
    width: 100%;
    min-width: 0;
    min-height: 43px;
    padding: 9px 34px 9px 12px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background-color: var(--bg-input);
    color: var(--text-primary);
    font-size: 0.88rem;
    cursor: pointer;
}

.project-filter-row select:hover {
    border-color: var(--border-hover);
}

.project-filter-row select option {
    background: var(--bg-card);
    color: var(--text-primary);
}

/* Project cards */

.project-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 290px;
    padding: 22px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-card);
    animation: card-appear 350ms ease both;
    animation-delay: calc(min(var(--card-index, 0), 8) * 35ms);
    transition: transform var(--transition), border-color var(--transition),
        background var(--transition), box-shadow var(--transition);
}

.project-card::before {
    position: absolute;
    top: 0;
    left: 22px;
    right: 22px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    content: "";
    opacity: 0;
    transition: opacity var(--transition);
}

.project-card:hover {
    transform: translateY(-4px);
    border-color: var(--border-hover);
    background: var(--bg-card-hover);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.2);
}

.project-card:hover::before {
    opacity: 0.9;
}

.project-card-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 18px;
}

.project-category,
.project-pinned {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: fit-content;
    max-width: 100%;
    padding: 5px 9px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.35;
}

.project-pinned {
    border-color: rgba(245, 190, 70, 0.25);
    background: rgba(245, 190, 70, 0.08);
    color: #e8bf68;
}

.category-purple {
    border-color: rgba(182, 156, 255, 0.25);
    background: rgba(182, 156, 255, 0.09);
    color: var(--purple);
}

.category-blue {
    border-color: rgba(88, 166, 255, 0.25);
    background: rgba(88, 166, 255, 0.09);
    color: var(--accent);
}

.category-cyan {
    border-color: rgba(103, 232, 249, 0.25);
    background: rgba(103, 232, 249, 0.08);
    color: var(--cyan);
}

.category-green {
    border-color: rgba(61, 220, 151, 0.25);
    background: rgba(61, 220, 151, 0.08);
    color: var(--success);
}

.category-orange {
    border-color: rgba(255, 189, 117, 0.25);
    background: rgba(255, 189, 117, 0.08);
    color: var(--orange);
}

.category-pink {
    border-color: rgba(240, 171, 252, 0.25);
    background: rgba(240, 171, 252, 0.08);
    color: var(--pink);
}

.category-gray {
    color: var(--text-secondary);
}

.project-title {
    margin: 0 0 10px;
    overflow-wrap: anywhere;
    font-size: 1.12rem;
    font-weight: 750;
    line-height: 1.4;
    letter-spacing: -0.025em;
}

.project-title a {
    display: inline;
    color: var(--text-primary);
}

.project-title a:hover {
    color: var(--accent);
}

.project-title a span {
    display: inline-block;
    margin-left: 3px;
    color: var(--text-muted);
    font-size: 0.8em;
    transition: transform var(--transition), color var(--transition);
}

.project-title a:hover span {
    transform: translate(2px, -2px);
    color: var(--accent);
}

.project-description {
    display: -webkit-box;
    min-height: 3.2em;
    margin: 0 0 20px;
    overflow: hidden;
    color: var(--text-secondary);
    font-size: 0.88rem;
    line-height: 1.65;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}

/* Actual GitHub topics */

.project-topics {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: center;
    gap: 7px;
    margin: 0 0 22px;
}

.topic-tag {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 4px 8px;
    border: 1px solid rgba(88, 166, 255, 0.2);
    border-radius: 6px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.73rem;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition: background var(--transition), border-color var(--transition),
        transform var(--transition);
}

.topic-tag:hover {
    transform: translateY(-1px);
    border-color: var(--accent);
    background: rgba(88, 166, 255, 0.19);
}

.topic-tag-muted {
    border-color: var(--border);
    background: var(--bg-secondary);
    color: var(--text-muted);
    cursor: default;
}

.topic-tag-muted:hover {
    transform: none;
    border-color: var(--border);
    background: var(--bg-secondary);
}

/* Card footer and metadata */

.project-card-footer {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border);
}

.project-metadata {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 0.77rem;
}

.project-language,
.project-stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.language-dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    flex: 0 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    background: var(--accent);
}

.project-stat {
    color: var(--text-muted);
}

.project-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
}

.project-links a {
    font-size: 0.82rem;
    font-weight: 650;
}

.project-notice {
    margin-top: 12px;
    color: var(--text-muted);
    font-size: 0.75rem;
}

/* Empty, loading, and error states */

#projectsLoading {
    padding: 35px 20px;
    color: var(--text-secondary);
    text-align: center;
}

#projectsLoading:not([hidden])::before {
    display: block;
    width: 28px;
    height: 28px;
    margin: 0 auto 14px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
    content: "";
}

#projectsError:not([hidden]) {
    margin: 20px 0;
    padding: 18px;
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: var(--radius-md);
    background: rgba(248, 113, 113, 0.07);
    color: #fca5a5;
}

.projects-empty,
.projects-error {
    grid-column: 1 / -1;
    padding: 42px 24px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    text-align: center;
}

.projects-empty h3,
.projects-error h3 {
    margin: 0 0 8px;
    font-size: 1.15rem;
}

.projects-empty p,
.projects-error p {
    color: var(--text-secondary);
}

.projects-empty button,
.projects-error button {
    min-height: 40px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
}

.projects-empty button:hover,
.projects-error button:hover {
    border-color: var(--accent);
}

/* About, skills, and general content cards */

.card,
.about-card,
.skill-card,
.content-card {
    padding: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    transition: border-color var(--transition), transform var(--transition);
}

.card:hover,
.about-card:hover,
.skill-card:hover,
.content-card:hover {
    border-color: var(--border-hover);
}

.card h3,
.about-card h3,
.skill-card h3,
.content-card h3 {
    margin-top: 0;
    color: var(--text-primary);
}

.card p,
.about-card p,
.skill-card p,
.content-card p {
    color: var(--text-secondary);
}

.cards-grid,
.about-grid,
.skills-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
}

.tag-list,
.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag,
.skill-tag {
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 0.8rem;
}

/* Contact section */

#contact {
    text-align: center;
}

#contact p {
    max-width: 620px;
    margin-inline: auto;
    color: var(--text-secondary);
}

.social-links,
.contact-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 25px;
}

.social-links a,
.contact-links a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 0.88rem;
    font-weight: 600;
}

.social-links a:hover,
.contact-links a:hover {
    border-color: var(--accent);
    color: var(--accent);
}

/* Footer */

footer,
.site-footer {
    padding: 26px 24px;
    border-top: 1px solid var(--border);
    background: var(--bg-primary);
    color: var(--text-muted);
    text-align: center;
    font-size: 0.82rem;
}

footer p,
.site-footer p {
    margin: 0;
}

/* Animations */

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes card-appear {
    from {
        transform: translateY(8px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Tablet */

@media (max-width: 1000px) {
    #projectsGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cards-grid,
    .about-grid,
    .skills-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    section {
        padding-block: 72px;
    }
}

/* Mobile navigation */

@media (max-width: 720px) {
    .container,
    .container-wide,
    nav,
    .navbar-inner,
    .nav-container,
    .hero-content {
        width: min(100% - 32px, var(--content-width));
    }

    nav,
    .navbar-inner,
    .nav-container {
        min-height: 64px;
    }

    #mobileMenuToggle {
        display: inline-flex;
    }

    .nav-links,
    #navLinks {
        position: absolute;
        top: calc(100% + 1px);
        left: 0;
        right: 0;
        display: none;
        align-items: stretch;
        flex-direction: column;
        gap: 0;
        padding: 10px 16px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--bg-primary);
        box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
    }

    .nav-links.active,
    #navLinks.active {
        display: flex;
    }

    .nav-links a,
    #navLinks a {
        display: block;
        padding: 12px;
        border-radius: 8px;
    }

    .nav-links a:hover,
    #navLinks a:hover {
        background: var(--bg-secondary);
    }

    .hero {
        padding-block: 76px 66px;
    }

    .hero h1 {
        font-size: clamp(2.5rem, 11vw, 4rem);
    }

    section {
        padding-block: 60px;
    }

    .section-header {
        margin-bottom: 30px;
    }

    .project-controls {
        padding: 14px;
    }

    .project-filter-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    #projectsGrid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
    }

    .project-card {
        padding: 17px;
    }

    .project-card-top {
        align-items: flex-start;
        flex-direction: column;
        gap: 7px;
        margin-bottom: 14px;
    }

    .project-description {
        font-size: 0.84rem;
    }

    .project-metadata {
        gap: 9px;
    }
}

/* Small phones */

@media (max-width: 480px) {
    #projectsGrid,
    .cards-grid,
    .about-grid,
    .skills-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .project-card {
        min-height: 0;
        padding: 20px;
    }

    .project-card-top {
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .project-description {
        min-height: 0;
    }

    .stats,
    .stats-grid,
    .profile-stats {
        gap: 8px;
    }

    .stat-card,
    .stat,
    .profile-stat {
        padding: 13px 10px;
    }

    .stat-value,
    .stat-card strong,
    .stat-number {
        font-size: 1.3rem;
    }

    .stat-label,
    .stat-card span,
    .stat-caption {
        font-size: 0.72rem;
    }

    .hero-buttons,
    .hero-actions,
    .button-group {
        align-items: stretch;
        flex-direction: column;
    }

    .hero-buttons > *,
    .hero-actions > *,
    .button-group > * {
        width: 100%;
    }

    .project-filter-row {
        grid-template-columns: minmax(0, 1fr);
    }
}

/* Respect reduced-motion preferences */

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

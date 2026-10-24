# live-by-unix Portfolio

A modern, minimal personal developer portfolio website for [live-by-unix](https://github.com/live-by-unix).

## Features

- **Dynamic GitHub Integration**: Fetches profile information and pinned repositories in real-time from GitHub APIs
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Premium dark developer aesthetic with subtle animations
- **Accessible**: Semantic HTML, keyboard navigation, and ARIA labels
- **Performance**: Lightweight vanilla JavaScript with no framework dependencies
- **Error Handling**: Graceful fallbacks for API failures

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES6+)
- No frameworks or build tools required

## APIs Used

- GitHub User API: `https://api.github.com/users/live-by-unix`
- Pinned Repositories API: `https://pinned.berrysauce.dev/get/live-by-unix`

## Local Development

1. Clone or download this repository
2. Serve the files using any static server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Deployment

This is a static website that can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

Simply upload the files and the site will work immediately.

## File Structure

```
/
├── index.html    # Main HTML structure
├── styles.css    # All styling and animations
├── script.js     # API integration and interactivity
└── README.md     # This file
```

## Customization

To use this template for a different GitHub user:

1. Update `GITHUB_USERNAME` in `script.js`
2. Update the GitHub API URLs in `script.js`
3. Update meta tags and content in `index.html`

## License

MIT

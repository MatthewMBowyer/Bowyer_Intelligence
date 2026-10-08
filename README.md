# Bowyer Intelligence — website

Static, GitHub-Pages-ready business website. **Creating the Operational Edge.**

## Deploy

Static site — no build step, no backend. GitHub Pages serves this repository
root directly (`main`, folder `/`).

Every reference is repository-relative, so the site works at a domain root
and under the `/Bowyer_Intelligence/` subpath.

This repository contains the website ONLY. The project's working material
(research, QA evidence, tooling, source PDFs, owner-demo launcher) is not
website content and lives in the private CMi repository instead.

Publish with `python3 tools/publish_site.py --push` from the project root in
CMi. `site/` is the source of truth; never hand-edit this repository.

## Structure

```
index.html            Home
capabilities.html     Eight capability areas + engagement model
demonstrations.html   Six live in-browser demos (fictional data, labelled)
credibility.html      Anonymised founder-experience narrative
contact.html          Honest demo-only form + placeholder channels
404.html              Not-found page
assets/
  css/styles.css      Design system (tokens from the brand PDF)
  js/main.js          Nav, reveal, all six demos, form behaviour
  fonts/              Self-hosted subset woff2 + OFL licence
  img/                Logo, favicons and Open-Graph share card (PNG)
robots.txt            Allows all; points to sitemap
sitemap.xml           Five public pages
```

## Local preview

Open `index.html` directly, or serve:

```
python -m http.server 8765
# → http://localhost:8765/
```

## Editing notes

- Colours/typography live as CSS custom properties at the top of
  `assets/css/styles.css` (`--bg`, `--ink`, `--orange`, …).
- Demo data and logic live in `assets/js/main.js` (`SAMPLE_STATEMENT`,
  `parseStatement`, `classify`, pipeline scenario). All data is fictional and
  labelled on-page.
- Contact details are deliberate placeholders (`hello@bowyer-intelligence.example`,
  +27 10 000 0000) until the owner approves real channels. The form is a labelled
  demo and never sends anything.

Privacy: no tracking, no cookies, no external requests. Fonts are OFL-licensed
(`assets/fonts/OFL.txt`).

© Bowyer Intelligence.
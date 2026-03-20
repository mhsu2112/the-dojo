# The Dojo — VaR Examination Simulator

A single-page training simulator that puts you in the role of a bank examiner conducting a Value-at-Risk (VaR) model examination at a fictional U.S. G-SIB (Atlantic National Bank). Built with React + TypeScript + Tailwind CSS, powered by the Anthropic Claude API.

**Live:** [mhsu2112.github.io/the-dojo](https://mhsu2112.github.io/the-dojo/)

---

## What It Is

The Dojo progresses through five examination phases, each with a scenario that builds on the prior:

| Phase | Scenario | Core Skill |
|---|---|---|
| 01 | The Briefing Room | Reading model documentation, identifying red flags |
| 02 | Riding Shotgun | Leading a technical interview with a resistant expert |
| 03 | The Deep Dive | Analyzing data, identifying a window-dressing pattern |
| 04 | The Full Scope | Exam planning, exit meeting with the CRO |
| 05 | The Gauntlet | Navigating institutional pressure on a significant finding |

NPC characters — EIC James Okafor, Dr. Elena Vasquez (Head of Market Risk), CRO Richard Chen, and Deputy Director Margaret Liu — are all powered by Claude and maintain distinct personalities, knowledge boundaries, and motivations.

---

## Running Locally

```bash
git clone https://github.com/mhsu2112/the-dojo.git
cd the-dojo
npm install
npm run dev
```

Or open `the-dojo.html` directly in any browser (no server required).

---

## Building

```bash
npm run build
```

To bundle into a single self-contained HTML file:

```bash
npm run build && python3 -c "
import glob, os
js = glob.glob('dist/assets/index-*.js')[0]
css = glob.glob('dist/assets/index-*.css')[0]
html = open('dist/index.html').read()
html = html.replace(f'<script type=\"module\" crossorigin src=\"/assets/{os.path.basename(js)}\"></script>', f'<script type=\"module\">{open(js).read()}</script>')
html = html.replace(f'<link rel=\"stylesheet\" crossorigin href=\"/assets/{os.path.basename(css)}\">', f'<style>{open(css).read()}</style>')
open('the-dojo.html', 'w').write(html)
print('Bundle written to the-dojo.html')
"
```

---

## API Key

The simulator calls the Anthropic API directly from the browser. Each user provides their own API key on the home screen — it is stored only in localStorage and never transmitted anywhere else.

To get an API key: [console.anthropic.com](https://console.anthropic.com)

---

## Stack

- React 18 + TypeScript
- Tailwind CSS 3
- Recharts (Phase 3 data visualization)
- Vite
- Anthropic Claude API (claude-sonnet-4-6)

---

## Technical Notes

- All state is client-side (React Context + localStorage)
- NPC conversation histories are maintained per-character for continuity
- The Phase 3 VaR data uses a seeded pseudo-random generator so the window-dressing pattern is consistent across sessions
- Decisions are final — you cannot revisit them (deliberate design choice)

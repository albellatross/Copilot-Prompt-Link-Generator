# Copilot Prompt Link Generator — Product Requirements Document (PRD)

## 1. Overview
The **Copilot Prompt Link Generator** is a lightweight web tool designed to assist users in batch-generating clickable Copilot chat links from a list of prompts. The tool helps designers and prompt engineers quickly format, organize, and share multiple prompts in a structured and accessible way — without relying on plugins or external extensions.

## 2. Core User Flow
1. The user opens the webpage.
2. The user pastes **10 Copilot prompts** (one per line) into a text box.
3. The system automatically:
   - Adds sequential numbering (1–10) to each prompt.
   - Generates clickable links for each prompt using the base URL:
     `https://copilot.microsoft.com/chats/new?q=`.
   - Displays the formatted list as numbered, clickable links.
4. The user can copy or share the generated list.

## 3. Functional Requirements

### 3.1 Input Area
- A multiline text box where the user can paste or type up to 10 prompts.
- Each line is treated as one prompt.
- Placeholder text: _“Paste your prompts here — one per line (up to 10).”_

### 3.2 Processing Logic
When the user clicks the **Generate Links** button:
- Split the input by line breaks.
- Trim whitespace from each line.
- Add a number prefix (e.g., `1.`, `2.`, …).
- Encode each prompt using `encodeURIComponent` for URL safety.
- Generate a clickable link for each prompt using the format:
```
1. [prompt text]
   → https://copilot.microsoft.com/chats/new?q=[encoded prompt]
```

### 3.3 Output Display
- Results appear in a scrollable container or card-style list.
- Each item includes:
  - The prompt number and text.
  - A clickable link that opens in a new tab.
- Provide a **Copy All Links** button to copy all formatted links to the clipboard.

## 4. UI Design (Web Page Layout)
- Header: “Copilot Prompt Link Generator”.
- Main Input Box: centered, clear placeholder text.
- Buttons: **Generate Links**, **Clear All**.
- Result Area: numbered list with blue clickable hyperlinks and subtle hover effects.
- Note: small tooltip saying “Each link opens a new Copilot chat with your prompt pre-filled.”

## 5. Technical Requirements
- Frontend only: pure HTML, CSS, and JavaScript (no backend required).
- Compatibility: modern browsers (Edge, Chrome, Safari, Firefox).
- Security: no local storage or external calls; no plugin or system modifications.

## 6. Example Output
**Input:**
```
Generate a product landing page for a fitness app
Write a 3-minute bedtime story for children
Design a modern AI chatbot interface
... (up to 10 prompts)
```
**Output:**
1. Generate a product landing page for a fitness app
   👉 [Open in Copilot](https://copilot.microsoft.com/chats/new?q=Generate%20a%20product%20landing%20page%20for%20a%20fitness%20app)

2. Write a 3-minute bedtime story for children
   👉 [Open in Copilot](https://copilot.microsoft.com/chats/new?q=Write%20a%203-minute%20bedtime%20story%20for%20children)

3. Design a modern AI chatbot interface
   👉 [Open in Copilot](https://copilot.microsoft.com/chats/new?q=Design%20a%20modern%20AI%20chatbot%20interface)

## 7. Future Enhancements (Optional)
- Export results to `.txt` or `.csv`.
- Add link shortening (e.g., Bitly).
- Auto-copy to clipboard after generation.
- Dark mode toggle.

## 8. Accessibility & UX Considerations
- Ensure keyboard accessibility (focus states for input and buttons).
- Provide clear error messages when input exceeds 10 lines.
- Responsive layout for mobile and desktop.

## 9. Deliverables
- Single-page HTML/CSS/JS prototype.
- README with usage instructions.
- Optional: downloadable ZIP of the static page.

---

If you want, I can now:
- Add a downloadable HTML/JS/CSS prototype file to the canvas, or
- Convert this document to a PDF/Word file for sharing.

Tell me which one you prefer and I’ll add it to the canvas.


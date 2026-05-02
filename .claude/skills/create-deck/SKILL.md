---
name: create-deck
description: Convert a study guide (PDF, image, or URL to a quiz/flashcard site) into a Studybuddy deck JSON. Use when the user wants to turn source material into flashcards.
---

# Create deck

Turn a study guide into a `src/decks/<slug>.json` file matching the `Deck` type in [src/types.ts](src/types.ts). Source can be a local file (PDF, image) or a URL (Blooket, Quizlet, etc.).

## Input

The user will point at one of:

1. **A local file path** — usually under [study_guides/](study_guides/). Common: PDFs. Sometimes: images of a whiteboard or a printed handout.
2. **A URL** — a flashcard/quiz set on an external site (Blooket, Quizlet, Kahoot, Google Doc, etc.).

If the input is ambiguous ("do the German one"), ask for the path or URL.

## Output

A new file at `src/decks/<slug>.json` shaped as:

```json
{
  "id": "<slug>",
  "name": "<human-readable title>",
  "createdAt": "<today ISO date YYYY-MM-DD>",
  "cards": [{ "front": "...", "back": "..." }]
}
```

Rules for metadata:
- **id / slug**: lowercase-hyphenated, derived from the source title. Trim generic words like "review" or "test" when redundant. Stable — the id is what identifies the deck.
- **name**: the source's own title if available (PDF heading, page `<h1>`, set name). Short and specific — "Unit 7: Exponential Functions" beats "Unit 7 Test Review.pdf".
- **createdAt**: today's date in `YYYY-MM-DD`. Decks are sorted newest-first.

Before writing, check if the file already exists. If so, ask whether to overwrite or pick a new slug.

## Pipeline overview

Regardless of source, the skill does:

1. **Extract** raw question/answer pairs from the source (see source-specific playbooks below).
2. **Split** every sub-part into its own card — one fact per card. `Q5a/b/c/d` → four cards. Only bundle sub-parts when they form a single atomic concept (rare; when in doubt, split). Shuffled cards are shown in isolation, so when a sub-part depends on a shared setup, repeat the setup on every card.
3. **Convert math to LaTeX** per the rules below. Every math expression must be wrapped, even simple ones like `x^2`.
4. **Write** the JSON file and report card count + any skipped items with reasons.

Don't run `npm run dev` after writing — the user will verify.

## Source-specific playbooks

### PDF

Use the Read tool on the path — it handles PDFs natively.

- Read the whole document, not the first page. Answer keys are usually at the bottom.
- Pair each question with its answer-key entry (`5a` → answer labeled `5a`). Flag unmatched entries.
- **Image-dependent questions**: best-effort.
  - If the answer is self-contained (e.g. "asymptote is y = 3"), describe the graph setup in words on the front: *"An exponential decay graph passes through (0, 16) and approaches y = 0. Which function matches: p(x) = (0.25)^x, p(x) = 2(0.5)^x, p(x) = (1.25)^x, or p(x) = (25)^x?"*
  - If the task requires *producing* an image (e.g. "draw the graph"), skip and note in the summary.
- **Extraction gaps**: if a question references "the function" or "the equation" with no visible expression (equation was rendered as an image the PDF reader couldn't extract), **skip and flag** — do not invent content to fill gaps.

### Image (screenshot, photo of a handout)

Read the image. If the text or equations are illegible, ask the user for a clearer source rather than guessing. Otherwise follow the PDF playbook.

### URL (Blooket, Quizlet, etc.)

Requires the `playwright-chrome` MCP (tools prefixed `mcp__playwright-chrome__browser_*`). If those tools aren't available in this session, tell the user to enable the MCP (project has [.mcp.json](.mcp.json) configured for CDP port 9223) and restart Claude Code.

General approach:
1. `browser_navigate` to the URL.
2. If the page has a "Show answers" / "Reveal" / "Flip all" control, click it (use `browser_evaluate` to find by text).
3. Use `browser_evaluate` to extract `document.body.innerText` (or targeted DOM queries) — the accessibility snapshot is often too large for heavily decorated pages.
4. Parse the extracted text with a regex tailored to the site's layout.
5. Save the parsed structure to `.playwright-mcp/<name>.json` via the `filename` param on `browser_evaluate` (MCP is sandboxed to project dirs — `/tmp` is blocked).
6. Read that file and reshape into the Deck schema.

If the URL is behind auth and the user's Chrome isn't logged in, `browser_evaluate` will show a sign-in wall. Ask the user to log in manually in the attached Chrome, then retry.

#### Blooket (`dashboard.blooket.com/set/<id>`)

Verified working without login — the set's creator view is publicly readable; login is only required to host/edit.

Extraction recipe:

```js
// in browser_evaluate
() => {
  // Click "Show all answers" first (separate call — needs a paint after)
  const btn = [...document.querySelectorAll('button, a, div[role="button"]')]
    .find(e => /show all answers/i.test(e.textContent));
  btn?.click();
}
```

Then after ~1s (use `browser_wait_for` with `time: 1`):

```js
() => {
  const text = document.body.innerText;
  const lines = text.split('\n');
  const cards = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^Question (\d+)$/);
    if (!m) continue;
    // Next non-empty line is the prompt
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    const prompt = lines[j]?.trim();
    // Skip past metadata line matching "<N> sec"
    let k = j + 1;
    while (k < lines.length && !/^\s*\d+\s*sec$/.test(lines[k])) k++;
    // Subsequent non-empty lines until next "Question N" are answer(s)
    const answers = [];
    let p = k + 1;
    while (p < lines.length && !/^Question \d+$/.test(lines[p])) {
      const t = lines[p].trim();
      if (t) answers.push(t);
      p++;
    }
    cards.push({ prompt, answers });
  }
  return { title: document.querySelector('h1')?.textContent?.trim(), cards };
}
```

Notes from working with a real Blooket set:
- Some cards have multiple answer lines that are **alt-spelling variants** (e.g. `begrüßen, begrüßt` and `begruessen, begruest` for ASCII-fallback). Keep the first form only — that's the canonical one.
- Each Blooket question is already one fact; do **not** sub-split.
- For language-flashcard sets, the front is often the translation prompt and the back is `infinitive, past participle` (or the equivalent paired form). Preserve the exact formatting from the site.
- Use `filename: '.playwright-mcp/<name>.json'` on `browser_evaluate` to dump large result sets to disk; the inline tool output truncates.

#### Quizlet, Kahoot, other sites

No verified recipe yet. General strategy: look for a "flashcards" or "terms" view in the URL, click anything labeled "show answers" or "flip", then grab structured content from the DOM. Fall back to `innerText` parsing if the DOM is a hostile soup.

## Math → LaTeX rules

Wrap every math expression. Inline for short snippets inside prose; display (`$$...$$`) for standalone equations that dominate the card.

| Source notation | LaTeX |
|---|---|
| `x^2`, `(1.12)^x` | `$x^2$`, `$(1.12)^x$` |
| `(½)^x`, `½`, `¼`, `⅛` | `$\left(\tfrac{1}{2}\right)^x$`, `$\tfrac{1}{2}$`, `$\tfrac{1}{4}$`, `$\tfrac{1}{8}$` |
| `a/b` in math context | `$\tfrac{a}{b}$` (inline) or `$\frac{a}{b}$` (display) |
| `y = 1500(1.12)^x` | `$y = 1500(1.12)^x$` |
| `R = 1250(0.975)^x` | `$R = 1250(0.975)^x$` |
| `≤`, `≥`, `≠` | `\le`, `\ge`, `\ne` |
| Multi-char exponents | `$x^{10}$` — braces required |
| Percent signs | literal `%` — no escaping needed in KaTeX |

Use `\tfrac` inline so cards stay readable on a phone; `\frac` only inside display math. Wrap multi-character exponents and subscripts in braces: `x^{10}` not `x^10`.

**Non-math sources** (language vocabulary, history dates, etc.) have no LaTeX — leave content plain. Don't wrap `anfangen` or `1492` in `$...$`.

## Card-writing style

- **Front** is a question or prompt. End with `?` when it's a question. One or two sentences.
- **Back** is the answer, as concisely as possible. Include brief reasoning only when the source does (e.g., "growth, because factor > 1").
- Use Markdown: `**bold**` for emphasized terms, `*italic*` sparingly.
- Don't restate the problem on the back — the user just flipped from the front.
- Preserve the source's phrasing when it's pedagogically specific ("growth factor" vs. "base" — these are distinct terms in the curriculum).

### Example transformations

From a PDF:
> 5. A roach population can be modeled by R = 1250(0.975)^x, where x is time in days.
> a) What is the decay rate?
> 5a) 2.5%

```json
{
  "front": "A roach population is modeled by $R = 1250(0.975)^x$ (where $x$ is days). What is the **decay rate**?",
  "back": "$2.5\\%$"
}
```

From Blooket:
> Question 1 — to begin — anfangen, angefangen

```json
{ "front": "to begin", "back": "anfangen, angefangen" }
```

## Gaps and flags

If you detect:
- A question referencing "the function" or "the equation" with no visible expression → **skip and flag**.
- An answer entry that doesn't match any question → **flag** in the summary.
- A graph-only question with no salvageable text description → **skip and note**.
- An authenticated URL that shows a sign-in wall → **stop** and ask the user to log in.

Don't invent content to paper over extraction gaps. Better to report "skipped Q1 — function definition missing from source; please add manually" than to guess.

## After writing

- Report: output path, card count, skipped items (with reasons), and any alt-spelling / formatting choices worth knowing.
- Don't auto-start the dev server.
- If this is the first deck the user has added via the skill, mention that `src/decks/loader.ts` discovers JSON via `import.meta.glob` — no registration needed.

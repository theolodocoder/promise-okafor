---
title: A resume parser that runs in the browser
subtitle: Reading a PDF resume where it is uploaded, by rebuilding the page from loose pieces of text.
line: Reading a PDF resume where it is uploaded, by rebuilding the page from loose pieces of text.
field: Open source
year: 2026
backdrop: cream
visual: cover: /work/covers/resume-parser.jpg | A resume page turning into typed data
order: 7
draft: false
---
## What it is

When someone uploads a resume to JobWhisper, the app reads it in their browser and fills in the editor: contact details, sections, jobs, schools, skills. I designed and built this parser and its foundation. A teammate later extended it a lot and made it the server's parser too, and I say below which parts are theirs.

It takes PDF, Word and plain text, turns all three into the same simple list of text blocks, and runs one parser over that list. There is no AI model in it. It follows rules, so it behaves the same way every time and a user can predict it and correct it.

The server parses the file first. Then the browser parses it again, and its result replaces the server's when it passes two checks, described below.

I also wrote a small public prototype of a resume parser earlier in the year. It is a separate, older experiment and shares no code with this one.

## The problem

A PDF does not contain lines, paragraphs or columns. It contains small runs of text, each with a position on the page. Everything you see as structure is a guess from those positions.

The server reads the same file, but it only gets flat text out of it. So on resumes with real layout it merged jobs together, kept page footers as content, and one user's resume showed up as one block of run-on prose. The positions were in the file. They were being thrown away before the parser ever saw it.

## Reproducing it with real files

I took nine real resume PDFs, exported from Google Docs, Word and Canva, with one and two columns, and ran them through the exact upload path. All nine failed silently. The upload worked, no error appeared, and the data in the editor was wrong. That was the worst part, because nothing told anyone to look.

## The hard part

Rebuilding a page from loose pieces. Each piece below was a bug I met on a real file.

**Spaces.** A PDF can split a line in the middle of a word. "lazy loading" arrived as "lazy lo" and "ading", and joining pieces with a space gave "lazy lo ading". So spaces come from the gap between where one piece ends and the next begins, and a gap of about a third of a space is enough to count.

**Columns.** LinkedIn's export puts a sidebar next to the main text, and the parser took the sidebar's "Contact" heading for the candidate's name. I find columns by looking for the widest empty strip down the middle of the page that no text crosses, and I split the page there.

That broke on resumes with right-aligned dates, which also leave a clean gap. Splitting there tears every date from its job. A strip of dates and a sidebar are the same width, so size cannot tell them apart. I look at what is inside. If at least half the text in the narrow strip contains a year, it is a rail of dates, not a column.

**Bold.** The PDF reader only gives a font's internal name at first. The real name, like Arial-BoldMT, shows up only after a second call. Bold lives in that name and nowhere else, so without it every heading looked plain.

**Paragraphs and wrapped lines.** A gap larger than 1.4 times the column's usual line spacing is a paragraph break. A line that wraps is rejoined only when the one above ended without a full stop and this one starts lowercase, so job titles and headings are never swallowed. What counts as a full line is measured against the column's own width. LinkedIn wraps its contact block at about 28 characters, and a fixed limit left "gmail.co" and "m" apart.

<figure class="wide">
<div class="flow">
<div><b>Pieces of text</b>Each with a position and a real font name</div>
<div><b>Lines</b>Spaces from gaps, wraps rejoined</div>
<div><b>Columns</b>Widest empty band, dates told from sidebars</div>
<div><b>Blocks</b>Bold, size and breaks attached</div>
</div>
<figcaption>From a PDF to the blocks the parser reads. Word and plain text join at the last step.</figcaption>
</figure>

## Decisions and tradeoffs

### Score headings, do not match them

No single signal marks a heading in every resume. Wording, bold, size, capitals, a trailing colon and being short each add points, and a line needs 45 to count. I set the bar so the parser would rather miss a heading than invent one. A missed heading becomes text in the section above, which a reviewer can see and fix. A false heading splits a job in half and looks deliberate.

> **What it cost**
> Some unusual custom headings merge into the section above them.

I use whole-number weights because decimals broke a check. Bold at 0.15, larger than body at 0.2 and short at 0.1 add up to 0.44999999999999996, which failed a check against 0.45 and silently dropped a real heading. Whole numbers made the sum exact.

### One confidence per section

Each section gets a confidence from 0 to 100, and anything under 60 is flagged for the candidate. "We were unsure about your Certifications" is something a person can check. "78% confident" is not.

### Trust the browser parse only when it passes two gates

After the server stores the file, the browser parses it again. If that parse has a name or an email, at least two sections, and no job with an absurd pile of bullets, it replaces the server's version. If not, the server's version stays. The bar is coarse on purpose, and I would rather keep the server's version than attach a parse that fails it.

### Keep the heavy libraries out of the first page

The PDF and Word libraries load only when someone uploads. A dynamic import inside an eager module did not do this, because the bundler inlined it. I put each library in a module that nothing imports directly. When the Word library was imported the plain way, 550 KiB gzip of it landed in the first load.

The PDF worker is also shut down in a `finally` block. A corrupt or password-protected file fails halfway through reading. Without that block, every retry of the bad file left another worker running, on the low-end phones and laptops we budget for.

### Fix it at the smallest point

When skill group labels turned into seven fake sections, I stopped them from being created at scoring time. I did not add a pass to merge them back.

## Result

The nine real resumes were hardened on the server upload path, in the parser the server ran at that time, not the browser package. I fixed the failures one pattern at a time, each with a test built on an invented resume that failed first. Before the fix, all nine parsed badly. After it:

<figure class="wide">
<div class="key"><span><i></i>Before</span><span><i class="a"></i>After</span></div>
<div class="bars">
<span class="lab">Bullets recovered</span><div class="bar2"><i style="width:11%"></i>1 of 9</div><div class="bar2 after"><i style="width:100%"></i>9 of 9</div>
<span class="lab">Files missing a name, email or phone</span><div class="bar2"><i style="width:78%"></i>7 of 9</div><div class="bar2 after"><i style="width:1%"></i>0 of 9</div>
<span class="lab">No broken structure</span><div class="bar2"><i style="width:1%"></i>0 of 9</div><div class="bar2 after"><i style="width:100%"></i>9 of 9</div>
</div>
<figcaption>The nine real resumes, before and after. Two of the nine have no bullets to recover. The files themselves are not kept anywhere.</figcaption>
</figure>

The causes were small details with big effects. A bullet character the parser did not know made one job with eight bullets into eight jobs. A wrapped email ended in "gmail.co". A two-column export gave the name as "Contact". A bare year became a made-up month.

## What a teammate added

A teammate extended the parser well past my foundation. They wrote the role vocabulary, the header peeling above a sidebar, the running footer removal and the link handling, and they ported the parser to the server so both sides parse a file the same way. I did not write those parts.

## What was still wrong

A genuine three-column resume keeps its two widest columns merged, because I only split in two. I wrote that limit into the code. Role detection is a vocabulary match, so a company called "Lead Marketing Ltd" could be read as a job title. A damaged font map, where "Office" arrives as "O ce", cannot be recovered in the browser. Scanned PDFs have no text and no OCR, so they fall back to the server and an honest error.

I have no production numbers, and no parse-time measurements either.

## What I took from it

When a parser can fail without an error, the test has to be real files. The nine real resumes showed failures that clean test data would not. And where the parser cannot be sure, a blank field is better than a confident wrong one.

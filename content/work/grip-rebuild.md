---
title: Rebuilding grip.ng
subtitle: A public gift-card trading site, rebuilt to be light, searchable and tested.
line: A lighter site, with accessibility checked on every page at four widths.
field: Performance
year: 2026
backdrop: cream
visual: cover: /work/covers/grip-rebuild.jpg | The grip.ng rebuild in numbers: less JavaScript and a smaller home page
order: 4
draft: false
---
## What it is

grip.ng is the public site of a gift-card and bill-payment product in Nigeria, run by a crypto and gift-card trading company. I rebuilt it in Next.js. I built it alone. The old site is still the one people see. The rebuild is finished but has not replaced it, because the release is waiting on a cloud permission I could not grant myself.

## The problem

The old site was an Angular app that drew everything in the browser. It also carried Bootstrap, jQuery, an animation library and an old icon font. To a search crawler, every page was an empty shell. The page also had a list of more than 150 keywords that nobody reads.

The brief I wrote for myself was simple. Same pages, same words, same behaviour. Nothing added and nothing removed. The pages had to arrive as finished HTML, and they had to stay light.

## How I measured it

I used Lighthouse, on a mobile profile with simulated throttling, run in CI against all nine marketing pages. I set budgets that fail the build: performance at 0.9 or more, search at 1, accessibility at 0.95 or more.

That mattered early. I added scroll animations to every page, and performance dropped to between 0.79 and 0.88 on all nine. Before I trusted that, I stashed the change and ran again. The clean version scored 0.96, so it was not noise.

For layout and accessibility I wrote one sweep. It visits every page at 360, 768, 1280 and 1440 pixels wide. At each width it checks that the page loads, that there is exactly one main heading, that nothing scrolls sideways, that the browser console is quiet, and that an accessibility scanner (axe, against WCAG 2.2 AA) finds nothing. At 360 it also checks that every tap target is at least 44 pixels tall.

## The hard part

Nothing on the page was big. The weight came from small things that each looked fair. A form validation library loaded on every page because the API client was built in the root layout. A data-fetching provider wrapped the whole site although only one calculator used it. A menu library shipped two menus most visitors never open.

Every one of them was defensible alone. Together they were a lot of JavaScript to download and run before anything could paint.

<figure class="wide">
<div class="key"><span><i class="a"></i>Less JavaScript on every page, gzip</span></div>
<div class="bars">
<span class="lab">Validation, data fetching and toasts out of the root layout</span><div class="bar2 after"><i style="width:85%"></i>about 130 KB</div>
<span class="lab">Header menus loaded when first used</span><div class="bar2 after"><i style="width:21.5%"></i>about 33 KB</div>
<span class="lab">Calculator dropdowns loaded when first used</span><div class="bar2 after"><i style="width:19.5%"></i>about 30 KB</div>
<span class="lab">Animation library replaced with a small helper</span><div class="bar2 after"><i style="width:15%"></i>about 23 KB</div>
</div>
<figcaption>The four JavaScript cuts, as I wrote them down in each commit. They add up to about 215 KB, so I say "about 200 KB". This is a sum of four estimates, not one before and after measurement of the build.</figcaption>
</figure>

## Decisions and tradeoffs

### Load a menu when someone reaches for it

For the header menus and the calculator dropdowns I did not drop the library. I drew a look-alike button with the same classes and markup, and it fetches the real component when the pointer comes near, on focus, or on touch. Then it swaps in the real one, already open. Escape, the focus trap and focus return all work the same, because from that point it is the same menu.

> **What it cost**
> More code to keep in step. The look-alike has to match the real trigger, and the tests have to look the trigger up again after the first press because the real one replaces it.

### Take the performance hit on the animation, not on the budget

When the scroll animations pushed the score under 0.9, I had two choices. I could lower the budget, or I could remove the motion that cost the most. I removed the continuous parallax and kept one-time reveals. The parallax component is still in the repository, built and unused, with a note saying why.

I also replaced the animation library on the marketing site with a small helper. It uses a frame callback and an intersection observer, and it keeps the same easing, timings and reduced-motion behaviour.

### Fix the HTML, not just the scripts

The home page had a strip of 36 card logos. Each used a fill-the-box image mode, so each carried a list of image URLs for every screen width, 576 URLs in total. I gave the logos fixed sizes with a one and two times version. Home HTML went from 254 KB to 181 KB. I also preloaded only the Latin part of the main font, which saved 36 KB before first paint.

### Never loosen a check to get green

I wrote this in the plan before the sweep existed: do not disable an axe rule, do not widen the scroll tolerance, do not allow-list a console error. Every finding gets fixed in the component.

I also made each new check prove it can fail. I removed a placeholder and watched the test go red. I put two small buttons next to each other and watched the target-size rule catch them. Then I put things back. A test that has never failed has not shown me anything.

### What I chose not to build

The old site had a blog and a support site on other addresses. I left them as links. I also held to parity. If something on the old site was broken, I fixed it, like a page that rendered empty and a page title that read "undefined". I did not add features.

I also removed the Lighthouse job from CI later. The commit does not say why, and I will not invent a reason here. Without it, no check on a pull request watches the page budgets any more.

## Result

The home page is 181 KB of HTML, down from 254 KB, and the JavaScript every page loads before first paint is about 200 KB lighter than my first version of the rebuild. Those are build figures, not field figures. The site is not live, so no real visitor has measured it.

<figure class="wide">
<div class="key"><span><i></i>First version</span><span><i class="a"></i>After the pass</span></div>
<div class="bars">
<span class="lab">Home page HTML, raw</span><div class="bar2"><i style="width:85%"></i>254 KB</div><div class="bar2 after"><i style="width:60.5%"></i>181 KB</div>
<span class="lab">Lighthouse performance, mobile, with the parallax kit</span><div class="bar2"><i style="width:75%"></i>0.79 to 0.88</div><div class="bar2 after"><i style="width:86%"></i>0.96 without it</div>
</div>
<figcaption>Home HTML is from the commit message. The Lighthouse rows are the animation test, not a final score.</figcaption>
</figure>

The checks run on every pull request.

<figure class="wide">
<div class="flow">
<div><b>Pull request</b>Opened or pushed to main</div>
<div><b>Static checks</b>Format, lint, types, unit tests, build, Storybook</div>
<div><b>Browser suites</b>Sweep at 4 widths, key flows, axe on each</div>
<div><b>Result</b>A red test fails the run</div>
</div>
<figcaption>The pipeline, as it runs on every pull request and on pushes to main.</figcaption>
</figure>

The sweep found real things. The menu library hid the rest of the page from screen readers whenever a menu was open, in three different menus. One detail page scrolled sideways because a long reference would not wrap. An empty tab panel was a place for keyboard focus to get stuck. It also caught a mismatch between the server HTML and the first browser render, because one component checked the reduced-motion setting on its first draw. When I widened the scan to the newer WCAG 2.2 rules it found nothing, which I wrote down as it was.

## What was still wrong

It is not live. The first release failed before building, because the account that deploys it needed four roles on the cloud project and only an owner can grant them. When I last checked, the old site was still the one being served.

The signed-in dashboard also runs on a mock backend, not the real API, so it has not been tested against real accounts. The marketing site is the part I can speak for.

I never measured the old site, so I cannot give a before and after against it. The savings above are against my own first version of the rebuild.

## What I took from it

A performance budget in CI is only worth something if you keep it when a nice feature breaks it. The time the animations took the score to 0.79, the easy move was to lower the number. I removed the animation instead.

---
title: One codebase for every app
subtitle: Every app reads the same design values and the same API contract.
line: Every JobWhisper app uses the same design values and gets its API types from the backend's contract.
field: Architecture
year: 2024 to 2026
backdrop: sky
visual: phones: /work/jobs.jpg | The jobs screen of the mobile app | /work/tracker.jpg | The application tracker
order: 1
parent: jobwhisper
draft: false
---
![The jobs screen in the mobile app. Its colors, type sizes and corner radii come from the same token file the web app reads.](/work/jobs.jpg "sky phone")

## What it is

I set up one repository for JobWhisper's web app, admin console, marketing site, desktop app, browser extension and mobile app, so they share the same pieces. There is one design system, with browser components and a React Native counterpart, and one set of design tokens. The API types are generated from the backend's own contract, so a mismatch with the backend fails a check instead of reaching a user.

## The problem

When apps keep their own buttons, colors and API definitions, they drift apart slowly and nobody sees it. A button is two pixels different on desktop. A field is called one thing in the app and another thing on the server.

The API drift is the expensive kind. A hand-written API type can be wrong while the compiler still accepts it, so the first person to find out is a user whose request fails.

## How I checked it

I did not trust the rules to hold because we agreed on them. I added checks for the rules we needed to keep, and the repository runs them on every merge. One command runs the formatter, the dependency rules, the contract check, a scan for stray colors, the lint, types, tests and builds, and the performance budgets. If any step fails, nothing merges.

## The hard part

The browser, React Native and the backend each had their own limits, and they all had to agree.

The browser and React Native cannot share components, because React Native does not run DOM elements. They can share values. So the design system is two sets of components on one set of numbers. And the backend lives in another repository with its own release pace, so the frontend needs a copy of its contract that it can check.

<figure class="wide">
<div class="flow">
<div><b>Backend code</b>Controllers and their schemas</div>
<div><b>Contract file</b>The API's published OpenAPI document</div>
<div><b>Generated client</b>Built from the contract on the backend side</div>
<div><b>Frontend copy</b>Vendored, with generated types and a CI check</div>
</div>
<figcaption>Where the shape of an API response comes from. Nothing in the frontend writes it by hand.</figcaption>
</figure>

## Decisions and tradeoffs

### Apps never import apps

Every project in the repository carries tags for what it is and where it runs. The rule is that an app depends on features, features on shared UI and data access, and those on plain domain code. Domain code has no React, no browser and no storage in it. A check reads the tags and fails the build on a bad import.

This is what made the mobile app possible. Code that was mixed in with browser views could not be reached from React Native, so we pulled the plain parts out into packages with no browser in them. The browser packages re-export them, so the web app could keep importing from the same places.

> **What it cost**
> Mobile brought an Nx check that wanted project references the mobile typecheck could not accept. Deploys of the web app quietly stopped for a while because of it. I cover that below.

### Tokens in two files, with a test between them

The browser reads one CSS file for colors, type, radii and shadows. React Native reads a plain TypeScript file with the same values. A test asserts that the two agree, and also that the important color pairs pass the accessibility contrast rules.

We also made it impossible to write a raw color anywhere else. A scan fails the build on a hex code, an `rgb()` call or a numbered palette class outside those two files. So a designer changing a color changes it once.

### Match the design's root size

The design was drawn at a 90% root font size. A first pass converted only type and corner radius to the usual 16px root. Everything else kept the design's rem values, so spacing and containers rendered 11.1% larger than the design. I kept the 90% root so all of it matches at once, and the token test now divides by the right number.

> **What it cost**
> Body text lands at 12.6px, which is small. I wrote that down in the tokens doc as a design call that needs the designer's sign-off, and left it alone.

### The backend's contract is the source

Early on, the frontend had its own hand-written contract. On the day we switched to the backend's published OpenAPI document and regenerated the types, the parity tests in several packages failed. Every schema name we had invented was gone, replaced by the backend's own shapes. That was the point. The tests had been waiting for a real source to compare against.

I rewrote the identity checks field by field, narrowed the resume check to the fields both sides share, and parked billing, because the backend had no billing endpoints yet. From then on, the generated types come from the contract file and a check fails if the committed types differ from it.

The generated types also had to be a `.ts` file, not a `.d.ts`. A hand-written declaration file is not copied into the build output, so consumers saw `any` and the parity tests passed on nothing.

### Copy the generated client in, and say so

The backend team generates a typed client from the same contract and checks in their CI that it is current. We could not install it from a registry because it is published nowhere, and our dependency rules reject links to local folders on purpose, since those resolve differently on every machine. So a script copies it in, and the folder says not to edit it.

> **What it cost**
> It is a copy, so someone has to run the sync. The script has a check mode that fails when the copy is behind, but that mode is not in our merge gate. I come back to this below.

### Text limits live in the design system

A pasted job description over the API's 5,000 character limit made the request fail, and the session never started. I fixed it once in the shared field. It stops a paste at the limit, shows a count, and says politely when a paste was cut. Each limit is a named constant that mirrors the API's own rule. Web, desktop and mobile got the fix together.

## Result

The web app calls the real API for every feature, and the mock server is left for tests and Storybook. The generated types and the vendored client are the only description of the API the frontend uses. When an endpoint changes, the types should now fail in the editor before a 400 shows up in staging.

I have no before-and-after numbers for this one. The result is the failures that did not happen, and I cannot count those honestly.

## What was still wrong

The vendored client has a check mode and our CI does not run it. If the backend changes and nobody syncs, the frontend keeps compiling against the old client until someone does. The backend's own CI catches a stale client on their side, but our side relies on someone remembering.

The theme's dark palette appears in two CSS blocks that must match. The tokens doc says so, and no test proves it.

Mobile also taught us something about the repository itself. After the mobile merge, Nx's reference sync was always pending, and outside CI the web build refused to run. CI stayed green. For a while merged changes were not reaching the dev and production sites. I reproduced it on a clean copy of the branch, found that applying the sync would break the mobile typecheck, and had the deploy builds skip that one check. I then added the sync check to CI so the next drift fails there.

## What I took from it

The mobile merge showed that a green build only proves the checks you have. Deploys stopped while CI passed, so the new check went in where the failure actually was. The vendored client and the dark palette are the two rules still waiting for theirs.

---
title: Cosella
subtitle: The frontend foundation a team builds on, and one bug that showed why it matters.
line: The frontend foundation a whole team builds on.
field: Leadership
year: 2026
backdrop: mist
visual: cover: /work/covers/cosella.jpg | The Cosella dashboard
order: 2
draft: false
---
![The public Cosella website. This case study is about the frontend behind it and the product it sells.](/work/cosella.jpg "sky")

## What it is

Cosella is a live assistant for sales teams. A rep is on a call, the customer raises an objection, and the rep sees an answer drawn from their own company's playbook. There is a web dashboard, an internal admin, a desktop app, a marketing site and docs.

I am the lead frontend engineer. I wrote the first commit of the frontend, so most of this piece is about what I set up before anyone else wrote a screen, and one real bug that shows why.

## The problem

When a team starts building quickly, engineers end up solving the same problems in different ways. Left alone, every screen gets its own way to call the API, check a permission, validate a form and show an error. A month later nobody can change one of those without touching twenty files.

The product also made mistakes costly. It runs during a live call, so a blank page or a wrong number is not a small annoyance for the person using it.

## How I started

Before building screens, I set up the shared pieces every screen would need and wrote each decision down, so a new person could read why instead of asking.

- A component library with its own previews and tests.
- A shared app shell with a command palette, so every app navigates the same way.
- Permissions as one function that answers "can this person do this", used everywhere instead of ad hoc role checks.
- Forms with one way to validate.
- Error tracking that redacts private data before it leaves the browser.
- An API client generated from the backend's contract, so the types come from the server and not from guessing.
- Written architecture decisions, and a check before every push that type-checks and builds every app.

Each piece gave the team one documented way to handle a problem, so nobody had to invent their own.

## The hard part

The best example of why this matters was not in the frontend at all.

One customer's live calls would not start. Every attempt failed. The AI provider rejected the setup request, saying the prompt was over its limit by 4 tokens. Worse, our app sent the same request again, three times, and got the same answer each time.

There were two bugs. First, the prompt budget counted only the knowledge base, with a round number that sat right at the edge for this customer, and never counted the fixed instructions. Second, the server reported the failure as "service unavailable", which told the app to try again when trying again could never work.

## Decisions and tradeoffs

### Budget the whole prompt, and cut only the part that can be cut

<figure class="wide">
<div class="flow">
<div><b>Fixed instructions</b>Never touched</div>
<div><b>Knowledge base</b>The only part that shrinks</div>
<div><b>Count the whole</b>Estimate with room to spare</div>
<div><b>Rejected anyway?</b>Use the provider's own count, retry once</div>
</div>
<figcaption>The new order. The budget covers the finished prompt, not one piece of it.</figcaption>
</figure>

I made the budget apply to the full prompt as it is actually assembled. The fixed instructions stay as they are, because the product depends on them. Only the knowledge base gives way, because it is the only part that can.

For this customer that kept 52,705 of their 60,423 characters of knowledge, so 87%. The rest of the playbook got trimmed so the call could start.

> **What it cost**
> Part of that customer's knowledge base is cut from the prompt, and that customer is now close to what putting the whole knowledge base in the prompt can hold.

### Let the provider count for us

My character-based estimate can never be exact, because URLs and code split into many more tokens than plain sentences do. But when the provider rejects a prompt it says exactly how many tokens it counted, which is the real usage and not an estimate.

So if a prompt is still rejected, the server uses that number to work out the real ratio, trims again and tries once more. The second attempt rests on a measurement and not a guess. I also kept the estimate generous on purpose, so a normal knowledge base is not cut down just to be safe.

### Make the error honest

A prompt that is too long is our bug. It is not an outage. So it now comes back as its own error type and not as "service unavailable", and the app stops sending it again. Other errors from the provider still behave as before.

I wrote tests against the real prompt builder and not a stand-in, including one that proves the old budget overflows for this case. If someone brings the old number back, the test fails.

## Other bugs the same habits caught

The same care showed up in smaller places, each one found by reading what the code really did.

- **Data leaking between workspaces.** Some cached data was not tied to a workspace, so after a switch the previous workspace's financial ledger showed up. That data is now keyed by workspace.
- **A permission check that let a manager see calls they should not.** It treated "no team" on both sides as a match. It now needs a real team on both.
- **Two refreshes at once.** Two requests could each renew the login, and the second one cancelled the first, so the user was logged out. Now they share one refresh, and only a real "no" from the server logs anyone out, not a network blip. I also closed an open redirect on the return-after-login link.
- **Money display.** Amounts dropped their cents, so $1,234.50 showed as $1,234.5. A CSV import let quoted commas shift columns. Both are fixed and covered by tests.
- **The marketing page.** I cut it to about 1.2 kB of JavaScript, and later shrank the logo images from about 180 KB to 23 KB.

## Result

That customer's prompt now fits under the limit. The whole prompt now has a budget, the error tells the app the truth, and a test fails if the old budget comes back. The tests ran against the real prompt builder.

The shared components, API client and written decisions gave the team a common starting point across the apps.

## What was still wrong

Putting the whole knowledge base into the prompt has a ceiling, and that customer is already near it. The code itself now warns that it is time to fetch only the relevant parts of a knowledge base per call. That is a larger change, and it is not built.

I also have no usage figures to put next to any of this, so I have left them out. Work on making the desktop app more resilient on weak connections is in review and is not part of what I am describing here.

## What I took from it

An error should say whose fault it is. The first bug was a prompt that was 4 tokens too long. The costly part was that the app was told to retry something that could never work.

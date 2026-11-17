---
title: How I review pull requests
summary: Real findings from my reviews on a money admin console, an ID verification flow and a live audio feature, and the habits behind them.
publishedAt: 2026-11-17T09:00:00+01:00
category: Code review
tags: [Code review, Architecture, Leadership]
featured: false
draft: false
---

When I review a pull request, I start from what the checks can't see. If CI is green, the lint rules, types, layering and test coverage already hold. My job is the part a machine won't catch: what breaks for a real person, how it breaks, and the smallest fix.

So every finding I write has the same shape. What breaks. A real way it breaks, step by step. The fix. Then I sort findings into three groups: must fix before merge, should fix, and nice to have. The author always knows what's blocking and what isn't.

Here are three reviews, with screenshots of what I actually posted. Code, file paths, colleagues' names and the outside provider's name are blurred.

## An admin console that moves money

A large pull request added an internal admin console: accounts, refunds, a transaction ledger, support tickets and live alerts. The console was well built. It was cleanly layered, permissions were checked at the route, and five of six tables paged on the server. I said that first, because it was true and because it tells the author what to keep.

Three things blocked the merge.

![My review requesting changes on the admin console: the three blocking findings. File paths and names are blurred.](/images/reviews/admin-blocking.jpg)

**Refunds were approved on one click.** Every other serious action in the PR (suspending an account, adjusting credit, removing a team member) sat behind a dialog that restates the consequence. Refund approval fired straight from a list of pending requests. The idempotency key protects against a network retry, not against clicking the wrong row. I asked for the same dialog, showing the amount and who asked, and for "Deny" to collect a real reason instead of a canned note, because that page is the audit trail.

**The ledger showed the first 25 rows and nothing else.** The API accepted `page` and `limit`, but the response had no page information, and the frontend sent neither parameter. An operator could never reach row 26. This needed a fix on both sides: the backend had to return the same page block every other list returns, and the frontend had to wire up the pagination the other five tables already used.

**A change to a shared data hook brought back a race in every app.** To stop React's development mode from fetching twice, the cleanup now cancelled an old request one tick later instead of right away. In that small window, a slow response for the previous screen could still land and overwrite the new screen's data. Every list and detail page in the web, admin and desktop apps went through this hook, billing included. The hook's own comment said this could not happen.

The fix I suggested was small: mark the old request as replaced immediately, drop its result when it arrives, and keep the timer only for the actual cancel. I also asked for a test with fake timers that lands the old response inside that window, so it fails if anyone changes the timing again.

Below the blockers I listed five "should fix" items. Live alerts reconnected every second after a clean close, so a proxy that ends streams early would turn every open admin tab into one request per second. The permission checks had no tests, even though they were the only thing between "read-only support" and "can approve a refund". A checkout button guarded double clicks with React state, which can't block two clicks in the same tick. A ref can, and the codebase already had one for this.

I also flagged scope. The same PR shipped a full top-up payment flow, a support ticket system and a marketplace backend, all under an "admin console" title. The billing work was careful, which is exactly why it deserved its own review and its own title. I asked for it to be split out.

![The same review: the should-fix items and the scope note.](/images/reviews/admin-shouldfix.jpg)

## An ID verification flow in a trading back office

This was a review screen where staff check a customer's ID documents before raising their account limits. I reviewed it over three rounds. The pattern I kept finding was the worst kind of bug on a compliance screen: things that fail quietly instead of visibly.

![Round three of the ID verification review: my summary and three of the inline findings. Code, file paths and the provider's name are blurred.](/images/reviews/kyc.jpg)

**The approve button turned on too early.** It checked whether either of two ID documents was approved. But most customers already had one approved from the previous tier, so the button was active before the new document was ever looked at. The fix was to check the document actually under review.

**The provider's status could overrule the reviewer.** If a reviewer rejected a document but the outside verification provider still said "pending", a refresh showed it as pending again, the reject reason vanished, and the approve menu came back. If the provider said "approved", a rejected document showed as approved and let the upgrade through. A person's decision should win over the provider's, or both should be shown. I also suggested the backend make this call, so the screen only displays the final answer.

**An approval could go to the wrong customer.** After closing the panel with Escape, opening it for a different customer briefly showed the first customer's details with an active approve button, while the click would approve the new customer. Clearing the old review before loading the new one closes it.

**One failed request killed the panel for good.** The loading stream let an error escape, so after one failure, opening any other customer did nothing until a full page reload. Three requests were also tied together so that if any one failed, the whole review disappeared, and a customer with no provider records got told they had no submission at all.

Smaller findings in the same rounds:

- A "verified" status wasn't in the list of known statuses, so it fell through to "Not started". A reviewer looking at a fully verified ID saw the opposite of the truth.
- A filter bar was hidden when the customer count was `0`, because `0` is falsy.
- A failed ID check could still enable approval, because "failed" fell through to an older admin approval.
- Uploaded files opened in a new tab without `noopener`, so the opened page could redirect the back office tab to a fake login.
- Any country outside the three known ones showed income in Naira. Wrong, but believable to a reviewer.
- Once a decision was made, the panel couldn't be opened again, so the audit trail the PR described was only visible before the decision.

## A live audio change I approved

Not every good review blocks. This one changed a live interview feature so the microphone holds while the AI interviewer is speaking, to stop the app hearing itself.

Before approving, I checked the one thing that worried me: did holding the mic quietly take away the candidate's ability to interrupt? It didn't. Interrupting was already turned off on purpose elsewhere, for the same noise reason, so the two decisions agreed.

I approved it with two notes. The timer that releases the mic used the audio clock, which doesn't move while the browser has audio suspended. Audio queued in that state plays later than the timer expects, so the mic could open before the interviewer was actually heard. And a half-spoken answer was dropped, not sent, when the hold kicked in. The server would close the turn anyway, so I only asked that the comment say which behaviour was intended.

![My approval on the live audio change, with the two non-blocking notes.](/images/reviews/audio.jpg)

## What I bring to a review

- I check the change out in its own worktree and review it against the branch it merges into, so I review what will actually ship.
- I give a real way each bug happens, not "this might be an issue".
- I keep blockers few and clear, and I say what's good so it stays.
- I suggest the smallest fix and the test that will catch it next time.
- I flag when a PR is doing too much, because a careful review needs a clear scope.

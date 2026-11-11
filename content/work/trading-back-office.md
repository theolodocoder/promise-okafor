---
title: Locking down a trading back office
subtitle: Private live channels, two-step sign-in and money approvals for a team that moves real money.
line: Private live channels, two-step sign-in and withdrawal approvals for a team that handles gift-card cash.
field: Security
year: 2026
backdrop: lavender
visual: cover: /work/covers/trading-back-office.jpg | An illustration of private channels, one-time codes and a withdrawal awaiting approvals
order: 3
draft: false
---

## What it is

A crypto and gift-card trading company runs its business from an internal back office. Staff chat with customers about gift-card trades, approve withdrawals and manage accounts. I was the senior frontend engineer on it, and most of the security work in the app was mine.

The thing to know about gift cards is that a card code is cash. Whoever sees the picture of the card can spend it.

## The problem

The back office used live channels to show new chat messages the moment they arrived. Every one of those channels was public. The key to subscribe was in the page's JavaScript, so anyone who opened the site's bundle had it.

That meant someone outside the trade could listen to a customer's chat as it happened, and each message carried the link to the card image. The commit that began the fix says it plainly: card images were reaching people who were never in the trade.

On top of that, admins were "expected" to use two-step sign-in, but nothing enforced it. An admin account with it switched off went straight to the dashboard.

## Finding out what a stranger could see

For the channels, the question was simple. What does someone receive if they subscribe? The answer was the whole message, link included.

## The hard part

The leak was not one hole. The channels were public, and the messages on them carried everything. Closing one without the other would have left the other open. And the first fix could not wait for the second.

So I did it in two steps and was honest in the commit that the first was only a mitigation.

## Decisions and tradeoffs

### Make the socket ring a doorbell

First, the live channel stopped carrying data. A new-message event now only says "something changed". The app then re-reads the thread over its normal signed-in request, which the server checks.

<figure class="wide">
<div class="flow">
<div><b>Customer sends</b>A message, maybe a card photo</div>
<div><b>Live channel</b>Only says "something changed"</div>
<div><b>Back office asks</b>Re-reads the chat over a signed-in request</div>
<div><b>Server checks</b>Only then does the thread come back</div>
</div>
<figcaption>After the change, a stranger on the channel hears a doorbell and nothing else.</figcaption>
</figure>

It had side effects I had to handle. Bursts of messages now collapse into one re-read. The live service does not replay what you missed, so a laptop that slept lost messages quietly. Now the app re-reads when it reconnects. A first-open bug was binding every handler twice, and I fixed that too.

It also fixed a bug nobody had linked to it. Photo messages showed as empty bubbles until you reloaded, because the live payload never carried the files.

### Then make every channel private

The doorbell was a mitigation. The real control is a private channel, where the server decides who may join. I moved every channel to private, authorised by the API.

The authorisation request goes through the same signed client as every other call. I did that on purpose, because that client is the only thing that attaches the signing headers and the sign-in token.

I also split the live service into one app per environment. The server signs a permission with one app's secret, so a shared app would let a channel allowed in one environment be joined from another.

### Two-step sign-in, checked on every route

I put the check on the route, not on the sign-in page. A saved session, a typed address and a page refresh all skip a sign-in redirect, but none of them skips a route check.

Two details were deliberate. If the profile does not say whether two-step is on, the app reads that as "not set up", so a backend that stops sending the field cannot quietly switch the rule off for everyone. And the setup page sits outside the check, or it would send people back to itself forever.

<figure class="wide">
<div class="flow">
<div><b>Password</b>Step one returns a short-lived token, not a session</div>
<div><b>Authenticator code</b>Step two trades the token and the code for the session</div>
<div><b>Then the checks</b>Role, status and permissions run on the real session</div>
<div><b>Every route</b>No two-step setup, no way in</div>
</div>
<figcaption>Sign-in in two steps, with the setup rule enforced again on every page.</figcaption>
</figure>

> **What it cost**
> If the profile request itself fails, the app lets the person through and checks again on the next navigation. I chose that on purpose, because locking every admin out of the back office over one timed-out call seemed worse than the gap it leaves. Sign-in still gates access.

When the backend moved to a two-step sign-in, I moved the app onto it, so role and permission checks now happen after the code. The same authenticator code, plus the two security questions, now also guards a manual credit or debit on a customer wallet.

### Withdrawals need more than one approver

Fiat, crypto and bill withdrawals need several admins to approve, each with an authenticator code. When the backend replaced its contract with one status that says fully, partly or not yet authorised, I moved the screen onto it. I also added an "awaiting others" state. Before, an admin who had already signed was asked for another code that could not move anything forward.

In the same change I found that one call went to a different route in production than in the other environments, because a string clean-up only matched outside production. I fixed all five calls, not just the one that surfaced it.

### Encrypted uploads, with the browser's own crypto

Operators could only send text, and they needed to send images. The browser encrypts each file with a one-time key it agrees with the server, using only the browser's built-in crypto. I added no library.

I will not call it end to end. The server decrypts on receipt and keeps the image, and the commit says so. What it protects is the file in transit.

Two bugs were failing silently and throwing uploads away. The shared request wrapper copied the body into a new object, and a file form has nothing to copy, so the upload became a lone timestamp. It also overwrote the header the browser uses to mark where each part of an upload begins, so the parts could not be read. I made the rule depend on what kind of body it is, so a future upload endpoint will not have to remember to opt out. A test now encrypts a file and decrypts what was posted back to the original bytes.

## The security review

I also did a security review of the backend. I found a serious problem, traced it through the code, and wrote up the fix for the backend team.

I found it and reported it. I do not know whether it was fixed, so I will not say it was.

## Result

Card-image links no longer travel over a public channel, and the channels are private and tied to their environment. Admins without two-step sign-in cannot use the app. Withdrawals wait for more than one approver, with an authenticator code each. Two-step sign-in and withdrawal approval ran in production. I have no numbers for any of it, and I will not make some up.

## What was still wrong

The withdrawal screen's status check, if it errors, still carries on without checking. I flagged it in the pull request and offered to make it stop instead. I do not know if the server enforces the approvals by itself, so I would not call that safe.

The doorbell was always a mitigation. It only holds if the server checks each chat's owner when the thread is re-read, and that was in the backend, not in my hands.

## What I took from it

Fix the leak at the cheapest point first, and say that it is only the first fix. Then do the real one. I would rather write "this is a mitigation" in the commit than let a stopgap pass for the answer.

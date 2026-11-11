---
title: Morrow
subtitle: A writing platform where a team drafts the same chapter at once, and a read-only collaborator stays read-only.
line: A writing platform where teams draft the same chapter live, with one access rule everywhere.
field: Collaboration
year: 2026
backdrop: cream
visual: cover: /work/morrow.jpg | Morrow, a collaborative writing app, on a laptop and a phone
order: 5
draft: false
---
![Morrow on a laptop and a phone.](/work/morrow.jpg "cream")

## What it is

Morrow is a writing platform where people draft the same chapter live. It is my own project and I built it alone. The code is public at [github.com/theolodocoder/morrow](https://github.com/theolodocoder/morrow). It has no users yet. It is pre-release and has no live address, so everything below is about how it is built and tested, not how it is used.

Writers co-edit a chapter. Contributors propose changes and a reviewer compares them word by word. Anyone can branch a story to try a "what if" ending. Collaborators can talk in a voice room while they write.

## The problem

Collaborative writing tools tend to fail in two quiet ways. They lose edits, or they merge two people's changes into one sentence nobody wrote. And the rule for who may do what ends up written twice, once in the API and once in the live layer, and the two slowly disagree.

The second one is the dangerous one. If the live socket forgets that somebody is only a reader, that person can type into the chapter anyway.

## First, make the bad cases cheap to try

Before I wrote the app I built small throwaway spikes for the three things I was least sure of: saving, proposals and access. Each one had to survive a nasty test.

For saving, I ran two collab servers against one document. With a plain overwrite, 20 of 40 paragraphs were lost. With merge-on-write, all 40 were kept. After that the question of whether to merge on write was closed.

For proposals, I generated about 172,000 random pairs of concurrent edits, with paragraph splits and joins in them, and checked every "clean" result against an independent merge.

For access, I broke the code on purpose after the tests passed. Removing the database re-check made the right test fail. So did removing read-only enforcement and removing the revoke call. That showed me the tests were checking something.

## The hard part

A document is shared by many people, so every rule has to be true on every path into it.

The test of it is simple. Give someone a valid ticket that says "edit", then make them a viewer. They must still not be able to write. And they must not be able to write by going around the API either.

<figure class="wide">
<div class="flow">
<div><b>API</b>Checks <code>can()</code>, then signs a 60 second ticket for one chapter</div>
<div><b>Live socket</b>Checks the ticket</div>
<div><b>Database</b>Collab asks again who this person is now</div>
<div><b>Read-only flag</b>Set by the server, so their edits are dropped</div>
</div>
<figcaption>The path into a chapter. The ticket only proves a recent decision. The database has the last word.</figcaption>
</figure>

## Decisions and tradeoffs

### One access rule, called from both places

There is one function, `can(actor, capability, ctx)`, in a package both services import. It is pure. It takes who is asking, what they want, and the facts about the work, and it returns a yes or a no.

```ts
if (capability === 'document.edit')
  return role !== null && DIRECT_WRITERS[effectiveMode(ctx)].has(role)
```

The API calls it on every route. Collab calls it when a socket connects. The UI never decides anything: it only draws what `can()` said. I chose this because two copies of a rule drift, and one copy cannot.

When someone cannot even read a work, the API answers 404, so it never confirms that the work exists. When they can read it but lack the capability, it answers 403.

### The collaboration service is the only writer

Only the collab service writes document content, and it merges every update into the stored state. The API never touches it. If the API needs to apply a proposal or take a snapshot, it asks collab.

I also kept the API and collab as two deployables. One process would have been simpler. But then every API deploy would drop every writer's connection in the middle of a sentence.

### A short ticket, and the database decides

The ticket lasts 60 seconds and names one user and one chapter. But a ticket is only a memory of a decision. So on connect, collab looks the person up again, and the read-only flag comes from the database, not the ticket. One test mints an edit ticket for a viewer and checks that the words never land.

Live connections are re-checked on their next message, at most every 30 seconds, and the API can push a revoke at once. A test checks that a removed member is closed and told why in under a second. Another checks the case where the revoke call is lost, and the re-check closes them anyway.

In the spike, turning a live editor into a viewer by flipping a flag worked on the server but left the client's screen out of step with the document. So a downgrade closes the connection and forces a fresh login at the new role.

> **What it cost**
> Two services to run and an extra round trip for a ticket each time a chapter opens. I did not measure the second one.

### Clashes are shown, never auto-resolved

A proposal is a private copy of the chapter. When the reviewer accepts, the engine compares the copy with the live chapter and says one of three things. Fast-forward means the chapter did not change. Clean means both changed in different places. Conflict means they changed the same place.

A conflict is never applied for you. A merge down to the character would weave two rewrites of one sentence into nonsense. So the reviewer sees both versions side by side and chooses, and only that choice applies it.

### Compare by identity, not by text

My first classifier compared paragraph text, and it was wrong. Split a paragraph and join it back and the text is identical, but Yjs has deleted the old characters and made new ones. A concurrent insert that pointed at the old characters merged into "salt salt".

So each block now carries a signature built from the ids of its live Yjs items. The text is used for the word-by-word diff the reviewer reads. Accept and reject decisions use identity.

> **What it cost**
> The signature code reads Yjs internals. So I kept it in one module and pinned the Yjs, y-tiptap and Hocuspocus versions.

### Voice rooms ride the connection that is already authorised

The call setup messages travel on the chapter's existing socket. Collab stamps each one with the verified sender, never passes one across chapters, and skips anyone who has blocked the other person. Audio goes browser to browser, is never recorded, and the room is capped at 8 speakers.

> **What it cost**
> People behind strict networks cannot join until a relay server is added, and rooms over 8 need a media server. Both are written down in the deploy notes as things to add later.

## Result

What exists today is the tests, and I am careful to say only that.

The integration tests run against a real Postgres, with a fresh database for each file, not mocks. The project rules say every permission rule needs a test. The end-to-end tests run in Playwright and check every screen they visit with axe against WCAG 2.2 AA. A separate Playwright run signs in twelve people, opens one chapter for all of them and types a few lines from each. It mainly captures the README screenshots, and its only checks are that the editor loads and shows Saved. So I do not count it as proof of scale.

After the main build I added tests for bad networks, and a patch to the editor so a letter typed beside the same letter stays the writer's.

## What was still wrong

Nobody has used it. The spikes were on one laptop with random edits, which is harder on proposals than real writing, so the real conflict rate is unknown. In that random test, conflicts were 4.6% on chapters of 50 to 120 paragraphs with a few edits on each side, and 14% with more.

The voice rooms have not been tried on strict networks.

## What I took from it

The rule that must never be wrong should live in one place and be tested from every door. Writing the tests that try to break it first, then checking that they fail when I remove the check, told me more than the feature did.

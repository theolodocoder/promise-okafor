---
title: One access rule for the API and the socket
summary: If an app has both HTTP routes and a live connection, one pure function should answer every permission question, and a short ticket should never be trusted as the answer.
publishedAt: 2026-11-11T09:00:00+01:00
category: Architecture
tags: [access control, websockets, testing]
featured: false
draft: false
---
[Morrow](https://github.com/theolodocoder/morrow) is a writing platform where people edit the same chapter at once. It has HTTP routes and a live socket, and I wanted both to answer permission questions with the same rule, so I put that rule in one function. If each had its own check, the two would disagree sooner or later. Morrow is my own project, it is pre-release, and it has no users. So this is about how it is built and tested, not how it behaves in the wild.

## Why two checks drift

The API is where permission checks get written first. A route loads the work, looks at the person's role and says yes or no. Then the live socket arrives, and it needs the same answer. The quick way is to copy the logic across, with a small change for the way sockets work.

Once the logic is copied, the two copies can drift. Someone changes how editors are treated in the API, and the socket still has the old idea. Or the API gets a new restriction, like suspended accounts, and the socket never hears about it.

The worst case is a reader. If the socket forgets that a person is only a viewer, they can type into the chapter, and every other writer sees it. No API route was ever called, so nothing in the API logs would show it.

## One pure function, called from both doors

In Morrow there is one function, `can(actor, capability, ctx)`, in a package both services import. It is pure. It takes who is asking, what they want and the facts about the work, and returns true or false. It reads nothing and writes nothing.

```ts
export function can(actor: Actor, capability: Capability, ctx: AccessContext): boolean {
  const { work } = ctx
  if (work.deleted) return false
  // The owner relationship is authoritative even if a membership row is missing or stale.
  const role = actor.userId !== null && actor.userId === work.ownerId ? 'owner' : ctx.role
  ...
  if (capability === 'document.edit')
    return role !== null && DIRECT_WRITERS[effectiveMode(ctx)].has(role)
```

The API calls it in the routes that act on a work. The collab service, which runs the live connection, calls it when a socket connects. The UI never decides anything. It only draws what `can()` said.

Pure matters because the function only reads what it is passed. The caller loads the facts, from the same database query helpers, and passes them in. So there is nothing about HTTP or sockets inside the rule to fork.

The API adds one small thing on top. If the person cannot even read the work, the answer is 404, so it never confirms the work exists. If they can read it but lack the capability, the answer is 403.

## What a ticket proves, and what it does not

A browser cannot send custom headers when it opens a socket, so the socket needs a credential some other way. In Morrow the API checks `can()` first, then signs a ticket: a user, one chapter, a mode of edit or read, and an expiry 60 seconds away. The socket verifies the signature, but that is only the first step.

```ts
export const TICKET_TTL_SECONDS = 60
export type TicketMode = 'edit' | 'read'
```

A ticket proves one thing: the API said yes about this person and this chapter when it signed the ticket. It does not prove the person is allowed now. They might have been removed a second after it was signed. It also does not prove the mode is right. The mode is what the person asked for, and an edit ticket can sit in the hands of someone who has since become a viewer.

So when collab gets a connection, it checks the signature and then asks the database again who this person is now. The read-only flag comes from that answer, not from the ticket:

```ts
const readOnly = !(mayEdit && mode === 'edit')
connectionConfig.readOnly = readOnly // enforced by the server: updates from read-only connections are dropped
```

The server drops the updates itself. It does not rely on the browser behaving.

## Connections that outlive the decision

A socket stays open for hours. A decision made at connect time gets old.

Morrow handles this two ways. When a member is removed, the API sends a signed call to collab, and collab closes that person's connections and tells them why. And as a backstop, collab re-checks a live connection on its next message, at most every 30 seconds. If the revoke call is lost, the re-check still catches it on that connection's next message.

When a live editor is turned into a viewer, I do not flip the read-only flag on the open connection. In an early spike that left the person's screen out of step with the document, with no error. So the connection is closed and the client reconnects, which means a fresh ticket at the new role.

## The tests that keep it honest

I wrote tests that try to get around the rule: stale tickets, read-only connections and revoked access. Three of them matter most.

The first mints an edit ticket for a viewer, connects, types, and checks that nothing reaches the database:

```ts
it('an edit ticket for a viewer still yields read-only (the database decides, not the ticket)', ...
```

The second connects a viewer and an owner to one chapter. Both type. Then it checks that the viewer's words were neither saved nor sent to the owner.

The third removes a member, calls the revoke, and checks that the connection is closed and the client is told `access_changed` in under a second. A fourth drops the revoke call on purpose and checks that the re-check closes the connection anyway.

These run against a real Postgres, with a fresh database per test file, not mocks. I wanted to see how the real database answers, because a mocked one agrees with whatever I wrote.

I also broke the code on purpose. In the spike I removed the database re-check, then the read-only enforcement, then the revoke call, and each time the right test failed. A test that cannot fail tells you nothing.

One more trap. The auth library I use skips its origin check when it detects a test run. So my cross-site request tests would have passed and proved nothing. I turned the check on explicitly.

## What it cost

Morrow has two services, the API and collab, so there are two things to deploy and run. I kept them apart because in one process every API deploy would drop every writer's connection.

Each chapter open needs an extra round trip to get a ticket. I did not measure how long that takes. The 30 second re-check interval is a setting I picked, not a measured result.

## What I took from it

Put the rule in one pure function and call it from every door. Treat a ticket as a note that someone said yes a minute ago, and ask again when it matters. Then write the tests that try to break it, and remove the check once to see them fail.

---
title: Building Paje to understand what frameworks hide
summary: A close look at the tiny reactive UI runtime I am building—from hyperscript and action dispatch to DOM lifecycle, deliberate constraints, and the lessons hiding beneath familiar abstractions.
publishedAt: 2026-07-17T09:00:00+01:00
updatedAt: 2026-07-17T09:00:00+01:00
category: Engineering notes
tags: [JavaScript, Runtime Architecture, Virtual DOM, Frontend]
featured: true
---

Frameworks make frontend work feel wonderfully direct. State changes, the view follows, and a large amount of machinery stays out of sight. That convenience is valuable—but after years of shipping products with mature tools, I wanted to inspect the machinery for myself.

Paje is the result: a small reactive UI runtime written in vanilla JavaScript. It is not an attempt to replace React, Angular, or Vue. It is a focused engineering exercise in making the hidden contracts of a UI framework explicit: how state moves, how actions become updates, how a view becomes DOM, and how every listener and node is cleaned up again.

> The useful question was never “can I make another framework?” It was “how little machinery is required before a UI starts to feel reactive?”

This article walks through the current architecture, the decisions behind it, and the places where keeping the system small forced me to think more clearly.

## Start with the contract

Paje begins with one public primitive: `createPaje`. It accepts initial state, a view function, and a map of reducers. The shape is intentionally unsurprising.

```javascript
const app = createPaje(
  { count: 0 },
  (state, emit) => h("div", { class: "counter" }, [
    h("strong", {}, [`Count: ${state.count}`]),
    h("button", { on: { click: () => emit("increment") } }, ["Add one"]),
  ]),
  {
    increment: (state) => ({ ...state, count: state.count + 1 }),
  },
);

app.mount(document.querySelector("#app"));
```

There are only three ideas to hold at once:

- **State** is the current truth of the interface.
- **The view** is a pure description of what that state should look like.
- **Reducers** describe the legal transitions between states.

That API is small because the runtime carries the coordination burden. Calling `emit("increment")` dispatches an action, the matching reducer returns new state, and an after-dispatch hook renders the next view.

The public contract was the first architecture decision. Before building internals, I wanted to know what the runtime promised its caller—and just as importantly, what it did not promise.

## The architecture is a loop

At its core, Paje is a loop rather than a collection of features.

1. A user event emits a named action.
2. The dispatcher sends the payload to subscribed reducers.
3. A reducer produces the next state.
4. An after-command handler asks the view for a new virtual tree.
5. The renderer commits that tree to the DOM.

This separation matters. The dispatcher knows nothing about DOM nodes. Reducers know nothing about event listeners. The renderer knows nothing about why state changed. Each piece has one reason to change, which makes the whole runtime easier to inspect and test.

The dispatcher is a small publish/subscribe system backed by a `Map`. Subscriptions return unsubscribe functions, so ownership and cleanup are part of the design rather than an afterthought.

```javascript
subscribe(commandName, handler) {
  if (!this.#subs.has(commandName)) this.#subs.set(commandName, []);

  const handlers = this.#subs.get(commandName);
  handlers.push(handler);

  return () => {
    const index = handlers.indexOf(handler);
    handlers.splice(index, 1);
  };
}
```

The interesting detail is the global after-command hook. Reducers update state first; rendering happens after dispatch completes. That gives Paje a clear phase boundary: transition, then render.

## Virtual nodes without special syntax

Paje uses a hyperscript function called `h()` instead of a template compiler or JSX transform. A call creates a plain object describing an element:

```javascript
function h(tag, props = {}, children = []) {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
}
```

Text and fragments have their own node types. Strings in a children array are normalized into text nodes, and null children are removed before the renderer sees them.

That normalization step looks minor, but it creates an important boundary. Code above it can be flexible; code below it can rely on a stable shape. Mature frontend systems use this pattern everywhere: accept a broad input at the edge, normalize it once, and keep the core strict.

Choosing plain objects also makes the abstraction observable. You can log a Paje view and see exactly what the runtime will traverse. There is no compiler output to decode and no private element format to guess at.

## Rendering and ownership

The renderer switches on three node types—text, element, and fragment—and delegates each to a small mounting function. Element mounting creates a real DOM node, applies attributes and listeners, recursively mounts children, then appends the result to its parent.

Every virtual node keeps a reference to the real node it created. Event handlers are stored as well. Those references make unmounting deterministic:

- child nodes are destroyed recursively;
- registered listeners are removed with the same handler references;
- DOM nodes are removed from their parent;
- application subscriptions are released when the app unmounts.

This is one of the strongest lessons from the project: **lifecycle is an ownership problem**. Creating a node is only half of a renderer. A reliable system must also know who owns the resources created along the way and how that ownership ends.

It is easy to demo a click handler. It is harder—and more representative of production engineering—to ensure the handler does not survive the interface that created it.

## The deliberate limitation

Paje currently replaces the rendered tree after an action. If a previous virtual tree exists, the runtime destroys it, asks the view for the next tree, and mounts that tree from scratch.

```javascript
function renderApp() {
  if (vdom) destroyDom(vdom);
  vdom = view(state, emit);
  mountDom(vdom, parentEl);
}
```

Calling the structure a virtual DOM does not magically make it efficient. The current tree is a DOM description and lifecycle record; it is not yet used for reconciliation.

That constraint is intentional at this stage. Full replacement gives the project a correctness baseline with a very small surface area. Before introducing keys, patch operations, and child reconciliation, I want the lifecycle rules to be unambiguous.

The next renderer can then be measured against something concrete:

- Does it preserve input focus and selection?
- Can it patch attributes without leaking listeners?
- How does it behave when keyed children reorder?
- What is the cost of diffing compared with replacement for small trees?
- Can an interrupted update leave the DOM and virtual tree out of sync?

The senior engineering lesson is not “always start simple.” It is **name the capability you have not built**. Precise limitations make an architecture easier to evolve than ambitious labels do.

## Tiny APIs still need policy

Attribute handling revealed how quickly a renderer becomes a policy engine. Classes can arrive as a string or an array. Styles are applied property by property. `data-*` values use `setAttribute`, while other values are assigned as DOM properties. A null value means removal.

Every one of those choices has edge cases. Boolean attributes behave differently from strings. Some DOM properties reflect attributes and some do not. Style values may need units. Controlled form values introduce cursor and selection concerns.

This is why “just render an object” becomes framework work. The loop is small; the platform contract is not.

Paje keeps the current policy isolated in `attributes.js`. That means future support for boolean attributes, ARIA validation, or style normalization has a clear home instead of spreading across mounting logic.

## What I would evolve next

The project has a useful core, but I see the current implementation as a foundation. The next stages are less about adding a long feature list and more about strengthening guarantees.

### Reconciliation with measurable rules

I would add a patching layer that compares old and new nodes by type, tag, props, and stable keys. The important work is not only reducing DOM operations; it is defining predictable identity. Inputs, animations, and local browser state all depend on the renderer knowing when an element is “the same” element.

### Scheduled and batched updates

Today, every dispatch reaches the render phase synchronously. Batching multiple actions into one commit would prevent redundant work and introduce a natural place for prioritization later. The key is to preserve the mental model: actions remain deterministic even if commits are scheduled.

### Better developer diagnostics

A tiny runtime is an excellent place for precise error messages. Invalid node types, missing mount targets, duplicate keys, unknown actions, and reducer exceptions should fail with context that points directly to the caller’s mistake.

### A more rigorous test matrix

Unit tests cover individual primitives, but renderer confidence comes from behavioral tests: mount, update, reorder, detach, and remount. I would also add leak-focused tests that count listeners and verify cleanup across repeated lifecycle cycles.

## What building Paje changed for me

Building a runtime sharpened the way I use production frameworks. Reconciliation is no longer a vague optimization; it is an identity system. Effects are not just callbacks; they are owned resources with cleanup contracts. State libraries are not magic; they are transition rules, subscription graphs, and scheduling decisions.

It also reinforced a broader architectural habit: separate mechanism from policy.

- The dispatcher is a mechanism for delivering actions.
- Reducers are the policy for changing state.
- Mounting is a mechanism for creating DOM.
- Attribute handling is the policy for translating props to the platform.

When those boundaries are visible, a system can grow without turning every new feature into a rewrite.

Paje is deliberately small, but the questions it exposes are the same ones that matter in large frontend platforms: identity, ownership, predictability, scheduling, and the cost of abstraction.

That is why I am building it. Not because the ecosystem needs another logo—but because understanding the loop makes me better at designing the systems teams depend on every day.

---

*Paje is an evolving open-source learning project. I will use future notes to document reconciliation, scheduling, testing, and the trade-offs that appear as the runtime grows.*

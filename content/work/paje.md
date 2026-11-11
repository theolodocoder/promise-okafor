---
title: Paje
subtitle: A small UI framework I wrote to see how the big ones work.
line: A small UI framework with its own virtual DOM, built to see what frameworks hide.
field: Open source
year: 2025
backdrop: mist
visual: cover: /work/covers/paje.jpg | Paje counter example code beside the counter it renders
order: 6
draft: false
---
## What it is

Paje is a small UI framework I wrote to find out what happens between a state change and an update to the page. It is plain JavaScript, published on npm. You give it three things: a state object, a view function and a set of reducers. It builds the page from them and recreates the whole page after every action. It has its own virtual DOM, a `h()` function for building elements, an action dispatcher, and mount and unmount that remove what they created.

The README gives the bundle as ~6.2KB minified and ~2.1KB gzipped. The source is 496 lines. I wrote a longer walkthrough of the internals in [Building Paje](/blog/building-paje/), so this page is only the decisions.

## The problem

I had used mature frameworks for years and could not say what they did between "state changed" and "the screen changed". I wanted to find out by building the smallest thing that still feels reactive. Nobody asked for it and it does not replace React. The question was how little is needed.

## How I worked it out

There was nothing to measure, so I built it in this order: hyperscript, mounting, destroying, the dispatcher, then the state wiring. A counter and a todo app were my test bench. Both are view functions, so if the runtime was wrong I could see it in the page.

<figure class="wide">
<div class="flow">
<div><b>Event</b>The view calls emit with an action name</div>
<div><b>Dispatcher</b>Hands the payload to the reducer for that name</div>
<div><b>Reducer</b>Returns the next state</div>
<div><b>Render</b>Destroy the old tree, call the view, mount the new one</div>
</div>
<figcaption>The whole loop. Every box is one small file.</figcaption>
</figure>

## The hard part

The hard part was cleanup. Creating a node is easy. Knowing who owns it afterwards is what takes care. If a listener or an element outlives the view that made it, it stays in the page after the view is gone.

So every virtual node remembers the real node it created and the exact handler functions it attached:

```javascript
function createElementNode(vdom, parentEl) {
  const { tag, props, children } = vdom;
  const elementNode = document.createElement(tag);
  vdom.el = elementNode;

  addProps(elementNode, props, vdom);
  children?.forEach((child) => mountDom(child, elementNode));
  parentEl.appendChild(elementNode);
}
```

`removeEventListener` only works with the same function that was added, so destroying a node walks the tree and hands back those saved references. Nothing has to be looked up.

## Decisions and tradeoffs

### Three ideas and nothing else

State, a view that is a plain function of state, and reducers that return new state. That is the whole public surface, plus `h`, `hFragment` and `hString`.

> **What it cost**
> No routing, no forms helper, no built-in TypeScript. The README says so directly: it is not for large apps.

### Plain objects instead of a template syntax

`h()` returns a plain object, so there is no JSX transform and no build step. You can log a view and see exactly what the runtime will walk. It also normalises once, at the edge: strings become text nodes and nulls are dropped, so the code below never has to ask.

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

> **What it cost**
> Views are written as nested function calls, which is wordier than markup.

### Rebuild everything on every action

This is the decision to be most straight about. Paje does not diff. After each action it throws the old tree away and mounts a new one:

```javascript
function renderApp() {
  if (vdom) {
    destroyDom(vdom);
  }
  vdom = view(state, emit);
  mountDom(vdom, parentEl);
}
```

The virtual tree is a description and a record of what to clean up. It is not yet used to compare old with new. I kept rendering this simple while I worked out how nodes and listeners should be created and removed. A diff on top of leaky cleanup would hide the leaks.

> **What it cost**
> Every action recreates every node, so an input in the todo example is destroyed and rebuilt on each keystroke. It is fine for small apps and wrong for big ones. The README line about "efficient rendering" is generous, and I would not repeat it now.

### Leave out keys, batching and scheduling

Without diffing there is nothing for keys to identify, and every dispatch renders straight away. I would rather have a short list of things the framework does not do than a long list it does badly.

## Result

Paje is on npm at version 1.0.2, with a counter and a todo app as examples. The bundle sizes are the README's. It had 661 downloads in the last year.

## What was still wrong

Looking back through the history with a harder eye, I found things I would not hide.

**Cleanup was incomplete at first.** For the first working version, destroying an element removed its children and its listeners but never the element itself. The fix was a call to `el.remove()`:

```javascript
if (el && el.parentNode) {
  el.remove();
}
```

**The newest source is broken.** My last commit left a stray line break inside the reducer line, so `state = reducer(state, payload)` became `sta` on one line and `te = ...` on the next. Built from source, any action would throw. The bundle committed in the repo is fine, because it was built before that edit. Nothing caught it because the test suite is one placeholder test, `expect(1).toBe(1)`. My blog post says the primitives are unit tested. That is not true yet.

**Smaller things.** Calling an unsubscribe function twice removes some other handler. Dispatching an action with no reducer still re-renders. The bundle prints a welcome message to the console. And I quote only the README sizes, because a quick gzip of the bundled file gives a smaller number than the README states, so I should re-measure and fix the README.

## What I took from it

Paje is a runtime that rebuilds the page, and that is the label I would give it. The cleanup bug taught me to ask, for anything a runtime creates, who removes it.

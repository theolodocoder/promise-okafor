---
title: A design system every app can share
summary: We moved a design onto our web apps and a React Native app, and the hardest decision was a number that looked like a bug, a root font size of 90%.
publishedAt: 2026-11-11T09:00:00+01:00
category: Design systems
tags: [Design systems, CSS, React Native, Accessibility]
featured: false
draft: false
---

We needed our web apps and our React Native app to look like one product, but components could not be shared between them. So we shared the design's numbers instead, and each side builds its own components from them. The hard decision was one of those numbers, a root font size of 90%, and it was the one I was most tempted to get wrong.

## Why the components are not shared

The browser components are React, built on Base UI for the accessible behavior. React Native does not run DOM elements, so none of that can move over. The native side is its own small set of pieces built from plain React Native views and text. There is no UI kit under it.

What both sides can read is the values. Colors, type sizes, corner radii. The browser reads them from a CSS file. React Native reads the same values from a plain TypeScript file. A test checks that the two files agree, and that the important color pairs still pass the contrast rules.

We also made it hard to go around them. A scan fails the build if a raw color shows up anywhere outside those two files. So when a designer changes a color, it changes in those two files, and the test keeps them matching.

Sharing the values was the easy part. Getting their sizes right was harder.

## The design was drawn at 90%

The design we were given was authored with `html { font-size: 90% }`. So one rem in the design is 14.4 pixels, not 16. Every size in the design file, a heading at 1.5rem or a radius of 0.75rem, only looks right if the page uses that root.

```css
html {
  font-size: 90%;
}
```

The usual move is to convert. Keep the root at 16 and multiply the design's values by 0.9. Our first pass did exactly that, and only for type and corner radius, because those were the two scales we were looking at.

Type and corner radius looked right. The problem was everything we did not convert. Tailwind's spacing scale, its container widths, its default radii, and every rem written by hand during the port still held the design's own values. Under a 16px root, each of them rendered 11.1% larger than the design.

Nobody would have filed that as a bug. The spacing and containers were just 11.1% bigger than drawn, and the page felt slightly loose in a way no one could point to.

## Match the root, do not convert the values

We stopped converting. We set the root to 90% and kept every rem exactly as the design wrote it.

A conversion has to be remembered at every value, forever. Tailwind's built-in utilities are not in our token file at all, so there is nowhere to apply a conversion even if you wanted to. Matching the root fixes all of them at once, including the ones no token override can reach. The numbers in our code are now the same numbers the designer wrote, so anyone comparing the two sees no difference.

I used a percentage and not a pixel value on purpose. If a reader raises their browser's default text size, they still get 90% of their size. The page keeps scaling with them.

The native side needed a small change of thinking. React Native has no rem. Its sizes are plain device pixels, so the shared file holds pixels, and 1.5rem at this root is 21.6 of them. The parity test between the two files divides the native value by 14.4 and compares it to the rem in the CSS. The comment in the test says why it is not 16: dividing by 16 would pass quietly on a UI that is 11.1% too big. A check that passes for the wrong reason is worse than no check.

## What it cost

The root is a trade, and it cost us in three places we found along the way.

> **What it cost**
> Body text lands at 12.6px, because the design's base size is 0.875rem and a rem is 14.4px. That is small. I did not quietly raise it. I wrote it into the tokens doc as a design decision that needs the designer's sign-off, and left it alone.

Touch targets shrank the same way. A control sized at 2.75rem, which the design draws as 44px, renders at 39.6px. That clears the 24px minimum in WCAG 2.2 AA, but it is under the 44px the design asked for. The doc says so too.

Some small controls went under the line altogether. On the desktop app, a compact segmented control came out at 21.6px and a small switch's tappable area at 22px, both below the 24px floor. I fixed those by giving them explicit pixel sizes and checked the result by clicking the extended area, not by reading the CSS.

And on phones in a browser, iOS Safari zooms the page when you focus any text field under 16px. With a 90% root, even our base text size computes to 14.4. So every text input now pins a literal 16px on small screens and keeps the design's own scale above that.

None of these were a reason to go back. Each one was a visible, local problem we could name, and we fixed all but the body text, which waits on the designer. The 11.1% drift was invisible and everywhere.

## How we keep it honest

A decision like this rots unless the repository defends it. Three things help hold it in place.

The parity test fails if the native pixel values and the CSS rems stop describing the same rendered size. The raw-color scan fails the build if someone writes a hex code outside the token files. And the tokens doc says in plain words what the root is, why, and what it costs, so the next person to touch it does not "fix" the 90% back to 100%.

One gap is still open. The dark palette lives in two CSS blocks that have to stay identical, one for an explicit choice and one for the system setting. The doc says they must match. The test only checks that each value appears somewhere in the file, so a drift between the two blocks would not be caught.

## What I took from it

We kept the 90% root. It cost us smaller body text, a few controls that needed explicit sizes and a 16px rule for inputs on phones, and all of it is written down where the next person will find it. When a design and your platform disagree about a base unit, I would change the base again, not every value that depends on it.

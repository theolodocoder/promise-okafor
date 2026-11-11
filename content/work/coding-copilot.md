---
title: The coding copilot
subtitle: Reading a candidate's screen without paying for the same screen twice.
line: Reading a candidate's screen without paying for the same screen twice.
field: AI
year: 2024 to 2026
backdrop: cream
visual: shot: /work/jw-coding.jpg | The coding copilot beside a coding question
order: 7
parent: jobwhisper
draft: false
---
![The coding copilot beside a coding question. The strip says it is watching the screen, there is a Capture now button, and each problem it has answered keeps its own tab.](/work/jw-coding.jpg "cream")

## What it is

The coding copilot reads the candidate's screen during a coding interview or an online assessment and shows an answer in a small window beside it. It does not listen to anything. It also reads multiple-choice questions.

I wrote the screen watch in the app and the one-call path on the server. A teammate's review found two bugs in that path.

## The problem

The first version needed two model calls to answer one screenshot, so every answer was slower and cost double. A person is waiting on each one, so speed and not answering the same screen twice had to be right together.

One model wrote out the whole problem statement as text, and a second model answered that text. Measured live, the first step finished 3.7 seconds after the screenshot arrived, and the first words of the answer came at 4.5 seconds.

## Putting a stopwatch on one frame

I made the server log two lines for every screenshot, counted from its arrival: when the first words go out, and when the answer is complete.

That showed the first answer of a session was slower, because the model has to load the long instructions. Measured on the branch, the first words took 2.7 to 3.9 seconds cold and 1.3 to 2.0 seconds when the instructions were already loaded. So I moved that cost to session start. The server sends the instructions once with a one-word question and throws the reply away. If that fails, the session goes on.

<figure class="wide">
<div class="flow">
<div><b>Every 2 s</b>Take a small grey thumbprint of the screen</div>
<div><b>Changed enough?</b>If not, send nothing</div>
<div><b>One call</b>The model looks at the picture and starts answering</div>
<div><b>Title last</b>Already answered? Take the half-drawn card back</div>
</div>
<figcaption>One frame, from the candidate's screen to the card. Two of the four boxes exist only to avoid a paid call.</figcaption>
</figure>

## The hard part

The hard part was deciding when two screens are the same problem. It fails both ways. If the app is too eager, it sends the same question every time a cursor blinks, and we pay for each. If it is too careful, the candidate clicks Next and the copilot says nothing, because the layout, the editor and the colours all stay the same. Only the words change.

The server can make the same mistake. "Queries I" and "Queries II" are two different problems, but their titles overlap by 0.71 on a scale where 1 is identical.

## Decisions and tradeoffs

### When to capture

The app checks the screen every 2 seconds and sends a screenshot only if it changed. It decides that locally, from a grey thumbprint of 48 by 27 cells, so a quiet screen costs no model call.

A screen counts as new in two cases. If the average change is 4% or more, that is a new page. If at least 1.5% of the cells moved by more than a small amount, that is text rewritten in place. My first thumbprint was 16 by 9. Each cell was a 120 pixel square, and a changed problem statement barely moved the average, so Next went unnoticed.

After an answer lands, the watch stays quiet for 3 seconds, because scrolling to read the answer is a change too. It is 3 and not 10 so the next problem is not missed, and the server's duplicate check catches what the short wait lets through.

One screen is answered at a time. A frame that arrives meanwhile is dropped with a "busy" reply, not queued, or we would pay for answers to a screen that has moved on.

> **What it cost**
> A screen that fails to read is sent again, up to 3 times, about 5 seconds apart, with no backoff. That is up to 4 paid calls for one bad screen. I left a note in the code to add a backoff if it shows on the bill.

### One call, not two

The model now looks at the picture and writes the answer straight away.

> **What it cost**
> The model writes the title last, so a repeat is only recognised once the answer is already half on screen. Then the card is taken back. We paid for a call that showed nothing. I chose that trade.

### Compare titles only

I stopped comparing problem bodies, because every statement in a set opens the same way and the next problem looked like a repeat forever. The server now compares titles only, with the number in front removed, and treats 0.8 word overlap as a repeat.

A teammate's review found a bug in my first version. I remembered the title from the first piece the model streamed, so "3654" was remembered as "365", and problem 3655 was refused as a repeat of something the candidate never saw. A title is now remembered only once it is finished. The same review found that a title kept for an answer nobody saw would block that problem all session, so a paused or failed answer gives its title back.

### Failover, and when it is allowed

Reads go to one provider first, with a second behind it. The second gets the call only if the first fails before it has sent a single word. Once words have reached the candidate I do not switch, because a switch would replay or mix text they have read.

> **What it cost**
> If the first provider dies halfway through an answer, the candidate sees it break and the whole screen is read again.

### Lower the quality, never the size

A screenshot is the biggest thing on the live connection, up to about 1 MB. The gateway closes the connection on any message over 2 MB, so the desktop app sends nothing over 1.4 MB. It tries 1440 by 900 at quality 70, then quality 50, and only then a smaller size.

On a weak link it goes straight to quality 50, about a third lighter, at the same size. I chose this because the model reads code from the pixels, so a softer picture should still read and a smaller one may not. I did not test the accuracy of that. The app skips a tick while 64 KB is still waiting to leave. Capture now always goes.

### Multiple-choice questions

The same call decides what is on the screen, with no extra round trip. A multiple-choice answer is a card with the picked letters, one line of why, and Sure, Likely or Not sure. When torn, it says "Between B and D" and does not pick.

The server checks the card before it goes out. If a label is repeated or a pick is not one of the options, the card is dropped and the plain answer is sent. Repeats are matched on the exact question and options with symbols kept, because `O(n)` and `O(log n)` are different answers. The model is told that text on the screen is the question, never an instruction.

> **What it cost**
> The card is sent whole. It does not type in word by word like a coding answer.

## Result

On the test runs, the first words of an answer came about 2 to 3 seconds after the screenshot, where they had come at 4.5 seconds. The complete answer was in at about 4 to 6 seconds, where the card used to arrive at 7.9. These are measured figures from my runs, not production numbers.

<figure class="wide">
<div class="key"><span><i></i>Two calls</span><span><i class="a"></i>One call</span></div>
<div class="bars">
<span class="lab">First words of the answer</span><div class="bar2"><i style="width:56%"></i>4.5 s</div><div class="bar2 after"><i style="width:38%"></i>2 to 3 s</div>
<span class="lab">Answer complete</span><div class="bar2"><i style="width:99%"></i>7.9 s</div><div class="bar2 after"><i style="width:75%"></i>4 to 6 s</div>
</div>
<figcaption>Seconds after the screenshot arrived, measured on test runs.</figcaption>
</figure>

## What was still wrong

When I opened the multiple-choice pull request I had not seen a real card come back. Only the error path had run, so the card behaviour above is built and checked by tests, not seen live. Both AI accounts on our dev setup were failing at once, one with an unknown-user error and one with no credit left. Failover only helps if the second provider is paid up.

Before that, a provider failure went out as "nothing on screen". The candidate saw "No coding question on screen yet" forever and could not tell a broken copilot from a blank page. Now the app says it could not read the screen and tries again.

I have no figure for what failover or a retracted repeat costs in money.

## What I took from it

I would put the stopwatch in the log first again. Without it I would not have known whether the delay was loading instructions, reading the screenshot or writing the answer.

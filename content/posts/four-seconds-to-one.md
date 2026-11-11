---
title: 4 seconds to 1 second
summary: A wait feels shorter when the useful part shows first, and my first speed-up taught me to measure where the wait really is before touching anything.
publishedAt: 2026-11-11T09:00:00+01:00
category: Performance
tags: [Performance, Latency, Perceived speed, Frontend]
featured: false
draft: false
---

Most of the time, a slow screen is not one slow thing. It is a line of small waits, and each one stands behind the one before it. I learned that on a live feature where the screen stayed empty for about 3.8 seconds, and it came down to about 1 second. Almost none of that came from making a step faster.

Here is how it went, because my first fix did nothing and that taught me more than the ones that worked.

## The wait

The feature was an interview assistant. It listens to the interviewer and shows the candidate an answer while the conversation is still going. After the interviewer stopped talking, the screen stayed empty for about 3.8 seconds. Then the whole answer dropped in at once.

In a live conversation, four seconds of nothing is a long time. By the time the answer shows up, the moment has moved on. The AI part is only the setting here. Any screen that waits on a slow back end and then shows everything in one go has the same shape.

## Find the wait before fixing it

I did not want to guess, so I ran the call against the server with real spoken questions, sent in small pieces the way a live call sends them, and timed each step from the server side. I kept one clock for each comparison.

<figure class="wide">
<div class="flow">
<div><b>Question ends</b>The clock starts here</div>
<div><b>Transcript</b>The question as final text</div>
<div><b>First words</b>The first text of the answer</div>
<div><b>Complete</b>The whole answer on screen</div>
</div>
<figcaption>The four marks I timed. Each change below moves one of them.</figcaption>
</figure>

That run showed two dead spots, and they had different causes. One was before the call even started: the live connection took between 1.6 and 2.4 seconds to open, because the server finished a slow handshake with another service before it let the app in. The other was inside the answer. It arrived as one finished block, so the app typed out text it already had.

Neither was what I would have guessed. I would have started with the model.

## Start earlier, not faster

The first two fixes were about order, not speed.

For the connection, I let the app in first and finished the slow handshake behind it. The server tells the app when the other side is ready, and until then the app says "connecting". It is like opening the shop door while the till is still starting up. The customer walks in straight away, and we tell them when we can take an order. Socket open went from 1.6 to 2.4 seconds to about 0.65 seconds, in local testing.

> **What it cost**
> Audio that arrives before the other side is ready is dropped, not queued. And I had to handle that side failing after the door is already open. The server says so, closes cleanly, and lets a retry start fresh.

For the answer, the server now sends it as it is written instead of waiting for the end. Each message carries the whole text so far, and the newest one replaces the last. I chose replace over add-on because a message can arrive late or go missing, and a replace never leaves a gap or a doubled word. First text on screen came down from 3.8 to 2.1 seconds, in local testing.

Then one small change in how the model was asked. It returns its reply as structured data, and it writes the fields in the order we list them. We listed the question first, so it spent its first words repeating the question back, which nobody was waiting for. I put the answer first. Measured one character at a time, the first visible text now showed up after 12 characters of reply, down from 43.

## The fix that did nothing

The biggest remaining wait was the one before the answer even began. The answer could not start until the question was fully transcribed, and the question was usually clear from its first few words. So the obvious move was to start answering the moment the interviewer went quiet, using the last partial transcript we had.

I built that, and it looked right. Then I measured it against the real transcription service, and it changed nothing.

The service only sends its partial transcripts after its own silence detector has already decided the turn is over. At the moment of silence there was no partial to start from. The text arrived about a quarter of a second after the silence, and about 0.7 seconds before the finished sentence. My change was waiting for something that came too late to help.

I wrote that in the commit message in plain words: the lever shipped inert. Only a measurement against the real provider showed it was doing nothing.

So I moved the start. The answer now begins on the first partial of five or more words that looks like a question, once per turn. That one worked. Measured locally with a spoken question, the first piece of the answer showed up about 0.73 to 0.93 seconds after the final transcript, which is about one second after the interviewer stops. Before this stack of changes the same point was 1.9 to 2.3 seconds after the silence.

<figure class="wide">
<div class="bars">
<span class="lab">First answer text, from the end of the question</span><div class="bar2"><i style="width:76%"></i>3.8 s, one finished block</div><div class="bar2 after"><i style="width:42%"></i>2.1 s, after streaming</div><div class="bar2 after"><i style="width:20%"></i>about 1 s, after starting early</div>
</div>
<figcaption>Measured on my machine with spoken test questions. These are local runs, not production numbers.</figcaption>
</figure>

> **What it cost**
> Starting early means the model may answer the gist of a partial whose final text differs a little. That is the price of starting before you know the whole question. To keep it safe, no part of an answer is shown before the question it belongs to, and the answer is labelled with the final transcript, not the guess.

Starting early broke something too. Measured live, the model sometimes declined a short opening, and the turn was marked as answered, so no answer ever came. I fixed that so a decline asks again once the full question arrives.

## Show the useful part first

Everything above has the same idea underneath. The person does not need the whole answer at once. They need the first words, early, so they can start reading while the rest arrives. Opening the door first, streaming, putting the answer field first and starting on a partial are all ways of getting the first useful piece in front of someone sooner. None of them made the model faster.

I did turn one dial on a step itself, near the end, and only because a measurement pointed at it. In a later end-to-end run with a real spoken question, the final transcript took 0.47 seconds, the first answered words 1.5 seconds and the full answer 2.2 seconds. The wait for silence was about a third of the time to the first words. So I shortened that window to 400 milliseconds. A shorter one, 300, chopped sentences at breaths, so 400 is the shortest that still closes on a real pause. It stays a setting, so each environment can change it.

You will notice that run says 1.5 seconds and the earlier ones say about 1. They are different runs on different days with slightly different clocks, so they do not match exactly. I kept one clock for each comparison, and I would sooner show you both than pick the nicer number.

## What was still wrong

All of these are local runs on a good connection. I had no baseline for real users, so I cannot tell you the production figure. A slow connection was a different problem, and I took it on next in a separate piece of work. Starting early also still guesses, and I had no count of how often it guessed wrong.

So the next thing I built was a timer for every question, on the server and in the app, merged into one row of numbers with no text in it. That way the next change gets judged against data, not a feeling.

## What I took from it

Measure where the wait is before you change anything, because my first speed-up looked right and did nothing. Then ask what can start earlier, and what the person can see first, before asking how to make a step faster.

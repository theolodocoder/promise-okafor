---
title: The first answer in about a second
line: Cutting the silence before a live answer from almost 4 seconds to about 1, in local tests.
field: Performance
year: 2024 to 2026
backdrop: cream
visual: shot: /work/jw-web.jpg | The live interview copilot in the web app
order: 2
parent: jobwhisper
draft: false
---
## What it is

JobWhisper's interview copilot listens to a live interview and shows the candidate an answer while the interviewer is still talking. I led the frontend, and I did this work on the server side of the live call too.

## The problem

In my local test calls, after the interviewer stopped, the screen stayed empty for about 3.8 seconds. Then the whole answer landed in one block. For a person in the middle of an interview, that is a long, quiet gap.

Two things made it worse. In the same tests the live connection took between 1.6 and 2.4 seconds just to open. And the answer came as one finished piece, so the app typed out text it already had.

## Measure the gap before cutting it

I did not want to guess where the time went, so I ran the desktop call against the server with real synthesized speech, sent in small frames the way a live call sends it, and timed each step from the server side.

<figure class="wide">
<div class="flow">
<div><b>Interviewer stops</b>The clock starts here</div>
<div><b>Transcript</b>The question as final text</div>
<div><b>First words</b>The first text of the answer</div>
<div><b>Complete</b>The whole answer on screen</div>
</div>
<figcaption>The four marks I timed on every run. Each fix below moves one of them.</figcaption>
</figure>

That run showed two dead spots, and they had different causes. One was before the call even started. The other was inside the answer.

## The hard part

Nothing here was one big slow thing. It was a line of small waits, each standing behind the one before it.

The connection waited for the transcription provider before it opened, so the app sat on "connecting" for up to 2.4 seconds. The answer waited for the whole model reply before showing a character. The model spent its first words repeating the question back, which nobody was waiting for. And the answer itself waited for the final transcript, even though the question was already clear from the first few words.

Each wait looked fair on its own. Together they were the 3.8 seconds.

## Decisions and tradeoffs

### Open the socket before the provider

The server used to finish connecting to the transcription provider inside the opening handshake. I moved it so the socket opens first and the provider connects behind it. The server tells the app when the provider is ready, and until then the app shows "connecting".

That is like opening the shop door while the till is still starting up. The customer walks in at once, and we tell them when we can take an order.

> **What it cost**
> Audio that arrives before the provider is ready is dropped, not queued. And I had to handle a provider that fails after the socket is already open: the server says so, closes cleanly, and releases the channel so a retry gets a fresh one.

Socket open went from 1.6 to 2.4 seconds to about 0.65 seconds in testing.

### Stream the answer, and replace instead of append

The server now sends the answer as it is written. Each message carries the whole text so far, and the newest one replaces the last. I chose replace over append because a message can arrive late or be skipped, and a replace never leaves a gap or a doubled word. It also lets the server throttle the stream and drop a message, and it is never replayed after a reconnect. The finished answer still arrives as before, so an old app that ignores the stream stays correct.

If the model declines to answer, nothing is shown. If it starts and then breaks, the server sends an empty message that takes the text back.

First text on screen came down from 3.8 to 2.1 seconds, in testing.

### Put the answer field first

The model returns its reply as structured data, and it writes the fields in the order we list them. We listed the question first, so it spent its first words restating the question, and the app cannot show a character until it has seen where the answer begins. I put the answer field first and read it while it was still half written. Measured one character at a time, the first visible text now appeared after 12 characters of reply, down from 43, in testing.

### Start on the first question-like partial

My first version started answering when the interviewer went silent. I measured it against the real provider and it did nothing. The provider only sends its partial transcripts after its own silence detector has already decided the turn is over, so there was no partial to start from. I wrote that down in the commit as a lever that shipped inert, and moved the start to the first partial of five or more words that looks like a question.

> **What it cost**
> The model may answer the gist of a partial whose final text differs a little. That is the price of starting early. To keep it safe, no part of an answer is ever shown before the question it belongs to, and the answer is labelled with the final transcript, not the guess.

Measured live, the model sometimes declined short prefixes and the turn was marked answered, so no card ever came. I fixed that so a decline asks again when the finished question arrives.

### Tune the silence window

The wait for silence turned out to be about a third of the time to the first words. I shortened the window to 400 ms. A shorter one, 300, chopped sentences at breaths, and 400 is the shortest that still closes on a real pause. It stays a setting, so each environment can change it.

I also gave the live answer its own model setting, so that one call can be tuned without moving the cheaper checks beside it.

## Result

<figure class="wide">
<div class="key"><span><i></i>Before</span><span><i class="a"></i>After</span></div>
<div class="bars">
<span class="lab">Socket open</span><div class="bar2"><i style="width:48%"></i>1.6 to 2.4 s</div><div class="bar2 after"><i style="width:13%"></i>0.65 s</div>
<span class="lab">First answer text, from the end of the question</span><div class="bar2"><i style="width:76%"></i>3.8 s</div><div class="bar2 after"><i style="width:20%"></i>about 1 s</div>
</div>
<figcaption>Measured locally with spoken test questions, two runs each for the last step. Not production numbers.</figcaption>
</figure>

In those local runs the first words showed about one second after the interviewer stopped, from 3.8 seconds of empty screen. On the way, the first text was at 2.1 seconds after the connection and streaming changes, and about 1 second after the last two. In a later local end-to-end run with a spoken question, the final transcript took 0.47 seconds, the first answered words 1.5 seconds and the full answer 2.2 seconds. So the number depends on the run and the clock you hold, and I kept the same clock for each comparison.

## What was still wrong

These are local runs on a good connection. I had no baseline for real customers, and a slow line was a different problem that I took on next in a separate study. Speculation also still guesses, and I had no count of how often it guessed wrong.

So I built per-question timing next: the server and the app each time their half, the two halves merge into one row of numbers with no transcript text, and an admin page shows the middle and slow end by country, app version and connection. I also built a repeatable throttled test harness, so the next change would be judged against numbers.

## What I took from it

Measure first, because my first speed-up did nothing and only a measurement told me. And order the work so the person sees something early. Most of this was not making the answer faster. It was showing the first part of it sooner, and not making them wait for the last part.

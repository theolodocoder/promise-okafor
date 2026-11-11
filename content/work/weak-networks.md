---
title: Live answers on weak networks
subtitle: Live AI answers on a connection that can barely hold a call.
line: Live AI answers on a connection that can barely hold a call.
field: Real-time
year: 2024 to 2026
backdrop: lavender
visual: phones: /work/copilot.jpg | The copilot in the mobile app
order: 3
parent: jobwhisper
---
![The copilot on a phone. The interviewer's question lands as text, then the answer follows. This case study is about how long that first step takes on a bad connection.](/work/copilot.jpg "lavender phone")

## What it is

JobWhisper's interview copilot listens to a live interview and shows the candidate an answer while the interviewer is still talking. I led the frontend, and I did the work on this live path on both sides, the app and the server.

## The problem

On a good connection the question shows up as text about half a second after the interviewer stops talking. That is the number everything else is judged against.

Customers on weak connections told us the answers came very late, or never came at all. An answer that shows up after the conversation has moved on is no use to anybody.

We had no number for a weak connection. We only had complaints.

## First, make it fail on my desk

I did not want to guess, so before fixing anything I built a small test rig. It plays two spoken questions with noisy silence between them, the way a real interview sounds, and sends them through a throttle that caps the upload speed.

<figure class="wide">
<div class="flow">
<div><b>Recorded interview</b>Two spoken questions with room noise between them</div>
<div><b>Throttle</b>Upload capped at 300 or 150 kbps</div>
<div><b>Live server</b>The same one the app talks to</div>
<div><b>Stopwatch</b>From the end of the question to text on screen</div>
</div>
<figcaption>The test rig. The same call, at the same speed, gives a number every time.</figcaption>
</figure>

The first run was worse than the complaints. At 300 kbps the second question took about 20 seconds to arrive. At 150 kbps it never arrived. I stopped waiting after 35 seconds.

## The hard part

It was not one bug. It was three, and each one made the next one worse.

1. **We were sending everything.** The app sent raw audio, about 520 kbps for each audio source, with the silence included. A call is mostly the other person talking, or nobody talking, and we were uploading all of it.
2. **Nothing slowed the sender down.** When the line was full the audio just queued up. Every question waited behind the backlog from the one before it. That is why the second question was so much worse than the first.
3. **The server gave up on slow clients.** A client buried in its own backlog could not answer the server's "are you there" check in time. So the server decided the client was gone, hung up, and threw the question away.

<figure class="wide">
<div class="pipe">
<span>Before</span><div class="cells"><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="q"></i><i class="q"></i><i class="q"></i><i class="q"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<span>After</span><div class="cells" style="max-width: 44%"><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i><i class="k"></i><i class="q"></i><i class="q"></i><i class="q"></i><i class="q"></i><i class="k"></i></div>
</div>
<figcaption>What goes up the line. Blue is the first question, green is the second, grey is silence. Before, the second question sits behind all the silence in front of it. After, only speech is sent, with one small frame now and then to keep the line open.</figcaption>
</figure>

Fixing only the first one would have looked like progress, and the server would still have dropped the call.

## Decisions and tradeoffs

### Stop sending silence

I added a gate on the audio. It opens when the sound gets louder than a low threshold, and it closes after the speech stops. Two details mattered more than the gate itself.

<figure class="wide">
<div class="gate"><i class="off" style="width:20%"></i><i class="pre" style="width:4%"></i><i class="sp" style="width:30%"></i><i class="tail" style="width:22%"></i><i class="off" style="width:24%"></i></div>
<div class="gate-l"><span style="width:24%">Silence, not sent. The green sliver is the 300 ms kept in hand.</span><span style="width:30%">Speech, sent</span><span style="width:22%">3.5 s tail, sent</span><span style="width:24%">Silence, not sent</span></div>
<figcaption>One turn through the gate, left to right.</figcaption>
</figure>

**The first syllable.** If the gate opens only when it hears speech, the start of the word is already gone. So the gate always keeps the last 300 ms in hand and sends that first.

**The end of the turn.** I first set the tail to 2 seconds. That was wrong. The speech-to-text side decides a person has finished by hearing silence, and that silence window can be set as high as 3 seconds. If my tail is shorter than the window, the turn never closes and no answer comes until somebody speaks again. So I set it to 3.5 seconds, which covers every allowed setting.

> **What it cost**
> We save nothing in pauses shorter than 3.5 seconds. We still skip the long silences, which is most of a call. In the test, 141 of 316 audio frames were sent, 55% less.

I also set the open threshold low on purpose, below every speech detector further down the line. If I am wrong about that, the gate stays open in a noisy room. We save no data, but we lose no words. I chose the failure that wastes data over the one that cuts speech.

### Keep the line warm

With the gate closed we send nothing, and I did not know if the speech-to-text provider would drop a connection that goes quiet. So I tested it. With zero bytes for about 16 seconds, it dropped and reconnected. With one quiet frame every 5 seconds, it held for 90 seconds of silence with no problem. The keepalive stayed.

### Compress the socket

I turned on compression for the live connection. It was a measured win on the wire.

> **What it cost**
> CPU and memory on the server for every open call. I wrote that down for DevOps to watch after release.

### Drop the drafts, never the state

When the client's download side backs up, the server now drops the messages that replace each other: the half-finished transcript, and the answer as it streams in. The next one replaces the last one anyway, so nothing is lost.

It never drops heartbeats or state changes. The code review caught that I had made retractions droppable too, which would have left a wrong answer on screen. I fixed it and added a test that fails without the fix.

The same review found this dropping rarely triggers in practice, because the operating system's own buffers hide the backlog from the server. I kept it. It is harmless, and it is right when it does trigger.

### Slow is not dead

On the server, any message from the client now counts as proof it is alive, not only the reply to a ping. On the client, a connection that is still draining its queue counts as alive. I also fixed an off-by-one that had been flagging every connection as weak.

> **What it cost**
> A link that is really dead is now noticed in about 9 seconds, up from about 6. I accepted that, because a switch from wifi to mobile data is still caught in about 2.5 seconds by the network-change signal.

### Screenshots: lower the quality, never the size

The coding copilot reads the candidate's screen. On a weak link it now sends a lighter image, but at full size. The AI reads code from that image and needs every pixel. Blurry is fine. Small is not.

### What I chose not to build

A limit that throws away audio older than a few seconds. It is the obvious fix, and I left it out. It could drop the bit of silence that closes a turn, and then there is no answer at all. The gate already drains the backlog in every pause.

## Result

The second question at 300 kbps went from about 20 seconds to under 2.

At 150 kbps it went from never arriving to 5.2 seconds. These are the times for the question to arrive as text, measured on the throttled test rig.

<figure class="wide">
<div class="key"><span><i></i>Before</span><span><i class="a"></i>After</span></div>
<div class="bars">
<span class="lab">300 kbps, first question</span><div class="bar2"><i style="width:21%"></i>5.4 to 5.6 s</div><div class="bar2 after"><i style="width:9%"></i>2.2 to 2.5 s</div>
<span class="lab">300 kbps, second question</span><div class="bar2"><i style="width:78%"></i>19.5 to 21.4 s</div><div class="bar2 after"><i style="width:6.5%"></i>1.5 to 1.9 s</div>
<span class="lab">150 kbps, first question</span><div class="bar2"><i style="width:62%"></i>15.6 to 16.7 s</div><div class="bar2 after"><i style="width:31%"></i>8.1 s</div>
<span class="lab">150 kbps, second question</span><div class="bar2"><i class="never" style="width:78%"></i>never, over 35 s</div><div class="bar2 after"><i style="width:20%"></i>5.2 s</div>
</div>
</figure>

The "before" numbers are kinder than what customers saw. I measured the old app against the fixed server. Against the old server, the second question was dropped even at 300 kbps.

## What was still wrong

At 150 kbps the first question still took 8 seconds. The lag that was left was the speech itself. Raw audio is too heavy for that line even when it is compressed, and no gate fixes that.

That became the next project: a lighter audio format that sends about 16 times less data.

## What I took from it

Build the thing that makes it fail first. Without the throttle I would have guessed "compress it", seen a small win and stopped. The server would still be hanging up on every slow client.

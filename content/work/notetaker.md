---
title: The meeting notetaker
subtitle: Two ways to take meeting notes, built in about six days.
line: Notes and answers for the meetings you are in, with a bot or without one.
field: Product
year: 2024 to 2026
backdrop: sky
visual: shot: /work/jw-meeting.jpg | The meeting copilot
order: 6
parent: jobwhisper
draft: false
---
![The meeting copilot panel in the desktop app. The notetaker's own live panel is smaller, with subtitles and an ask box, but it sits on the same idea.](/work/jw-meeting.jpg "sky")

## What it is

JobWhisper's notetaker joins your meeting, or listens to it from your own computer, and gives you notes when the call ends. The notes have a short summary, action items you can tick, decisions, open questions and the full transcript. During a call you can also ask it about what has been said so far.

It came in two forms. A meeting bot joins Google Meet, Zoom and Teams calls. A desktop recorder does the same job with no bot in the room. I built it across the API, the web app and the desktop app, in about six days, from 28 October to 2 November 2026, and the owner and I made the product calls together.

## The problem

The question was how much to build before we could trust a bot with someone's meeting. A bot that records calls touches money, privacy and the other people on the call, and each can go wrong quietly.

## First, a fake bot

I did not wait for the bot to exist. The first version of the server had a simulated bot that moved through joining, waiting, recording and processing on a clock. Storage, credit checks, AI notes, sharing and the web app all worked against it.

Which bot to use was still open, and nothing else had to wait. A real bot only had to report the same status changes the fake one did, so swapping it in touched one small part.

<figure class="wide">
<div class="flow">
<div><b>A bot or the recorder</b>Two ways in, one result</div>
<div><b>Transcript</b>Who said what, in order</div>
<div><b>Notes and charge</b>Written once, billed once</div>
<div><b>Recording deleted</b>Only text is kept</div>
</div>
<figcaption>Both sources end in the same pipeline, so notes, sharing and billing were built once.</figcaption>
</figure>

## The hard part

The harder work was handling failures when a vendor's server and ours exchange updates about a live call.

1. **Messages arrive late, more than once, or early.** One can arrive before our own request to create the bot has returned.
2. **Money moves on those messages.** A repeat message must not charge a second time, and a lost one must not charge never.
3. **Anyone can post to a public address.** The webhook has to be public, so it has to prove who sent each message.

## Decisions and tradeoffs

### Build the bot or rent one

We first designed our own bot: a browser that signs into a Google account, joins the call and reads the captions. I built it on a branch and never merged it. It would have been Meet only, because Zoom and Teams have their own approval rules.

The company had a paid meeting-bot service by then. It handles joining, waiting rooms, platform rules, recording and transcription for all three apps. So we dropped our own bot and built on the service.

> **What it cost**
> A dependency we do not control. When I first merged, its transcript and message formats came from its documentation, not from live traffic. I checked a real Google Meet call right after.

### Verify every webhook

Each message from the bot service carries an id, a timestamp and a signature. The server rebuilds the signature from the raw body with a shared secret and compares it in constant time. A message older than five minutes is refused, which limits how long a captured one could be replayed. During key rotation any one of several signatures may match.

If our own handling fails, the server answers with an error so the service retries. The log records the kind of error and never its text, because that text can echo the meeting link.

A status only moves forward. Joining, waiting, recording, processing, then ready or failed. A late or repeated message cannot pull a finished call back to recording. One vendor account serves every environment we run, so each bot carries its environment, and other environments' messages are ignored.

### Cap recording by credits

Before a bot is sent, the server asks the credit meter how many minutes the balance covers, up to a hard cap of 180. The bot is created with that limit, so it leaves the call by itself when the minutes run out. The session records whether the balance or the 180-minute cap set the limit, so the list can say "out of credits" or "time cap".

Charging happens once, when the transcript is ready. The minutes come from the vendor's own record of when the bot was in the call. A call that never recorded gets no notes and no charge, and a retried notes run cannot bill twice.

> **What it cost**
> The limit is set when the bot is sent. My own bot design checked the balance every minute during the call. With a rented bot the cap is fixed at the start. Billing also still uses the meeting copilot's rate, a shortcut I marked in the code until the notetaker gets a rate of its own.

### Two sends of one call are one call

A double click or two open tabs can send two bots to the same call, and checking first is not enough because two checks can pass together. So the database refuses it: one joining bot per account per call, and the loser of the race returns the winner's session.

### Delete the recording once the notes are written

The bot service keeps the recording. We only need the words. So when the notes are saved, the server asks the service to delete the media. It does the same when a call is cancelled before it recorded, and when someone deletes a past call.

The desktop recorder goes further. Audio streams to the server and is never written to disk. Only the transcript and the notes are kept.

### A recorder with no bot

Some people do not want a participant in the room. The desktop app already hears both sides of a call, so it sends that audio to the server, which writes the same notes into the same list. A bot can post a notice in the meeting chat, and a recorder cannot. So the app shows a notification, "Recording for notes. Let others know." That is not the same as consent, and I did not call it that.

> **What it cost**
> The transcript reads "You" and "Others", with no real names, because local audio has two streams and no way to tell the other speakers apart. It also cannot run at the same time as the live copilot, and it never starts without a click.

Billing here follows the audio actually received, using the longer of the two streams, and charges nothing if no audio arrived.

### Ask the meeting, with limits

While a call records, the desktop panel shows subtitles and a box to ask about the meeting. Each answer reads only the saved transcript, inside the fence we use for untrusted text, and says "The meeting hasn't covered that yet" when it does not know. A call takes at most 60 questions, counted on the saved record so a restart cannot reset it. Questions and answers are never stored or logged.

### What I cut

The bot version has no live notes during the call and no chat commands. The desktop version has no notes pages of its own and opens the web page. We wrote the cuts down as non-goals so they would not look unfinished.

## Result

The bots were merged to the production branch on 30 October, two days after the first commit. The desktop recorder and its live panel merged on 2 November and were in that day's desktop release tag. I checked the bot end to end on our dev environment with a real Google Meet call: it joined, posted the consent message, and returned notes and a transcript with real speaker names.

## What was still wrong

- **I found no record of a real Zoom or Teams call being tested.** The bot service supports them, but I only saw a real call on Meet.
- **Meetings that admit only signed-in accounts** turned the guest bot away. We added a plain message for it, and later a way for the bot to sign in.
- **Recording without a bot depends on a legal answer.** The specs held the release on it. The record does not tell me how it ended.
- **A crash can leave up to a minute of desktop audio uncharged.**

## What I took from it

Put the uncertain part behind a fake and build everything around it first. The bot decision changed halfway, and almost none of the work had to be redone.

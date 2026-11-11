---
title: Build the test that fails first
summary: Three bugs I could not fix by reading code, and what I built on my desk to make each one fail before I touched the fix.
publishedAt: 2026-11-11T09:00:00+01:00
category: Debugging
tags: [Debugging, Testing, Reproduction]
featured: false
draft: false
---

When a bug report comes in, I try to make the bug fail on my own desk before I write any fix. Then the fix has a job: turn that failure into a pass. Whatever I built stays behind, so it fails again if the fix is ever removed.

A bug I can only read about is a bug I will guess at. Here are three where I did not have a good guess.

## Testing live answers on weak connections

At JobWhisper we got complaints that live answers came very late on weak connections, or never. I had no number for "weak connection". I had only the complaints.

So I built a small rig first. It plays two spoken questions with background noise between them, the way a real interview sounds, and sends them through a throttle that caps the upload speed. A stopwatch measures from the end of each question to the answer text on screen.

The first run was bad. At 300 kbps the second question took about 20 seconds to show up. At 150 kbps it never did, and I stopped waiting after 35 seconds.

The rig showed me something I would not have found by guessing. It was three connected problems, and each made the next one worse. We were uploading all the silence. Nothing slowed the sender down, so every question waited behind the backlog of the one before it. And the server hung up on clients that were too buried to answer its "are you there" check. Fixing only the first would have looked like progress while the server kept dropping calls.

After the fixes, the second question at 300 kbps arrived in under 2 seconds, and at 150 kbps in 5.2 seconds instead of never. Those are times on the throttled rig, not production figures. The same rig is how I knew the first fix was not enough, and it is how I found what was still slow afterwards.

## Reproducing a Windows capture failure in a smaller app

The next one was a Windows bug in our desktop app. On Windows the app captures the sound of the call through the screen-sharing part of the browser engine. For several releases that capture failed with a permission error, and we had not seen it, because on a Mac the app takes a different path and never touches that code.

Reading the permission code did not show me the problem. So I took almost everything out. I wrote a small standalone Electron app that mirrors the app's preload code, ran it with the app's permission handlers, and asked it for the capture.

With the app's handlers in place, it failed with the same permission error. Then I let through the one kind of request that was being refused, and the capture came back with an audio track, a video track and frames flowing.

That showed the cause in one small place. The browser engine sends the capture request with no media types listed. Our rule only allowed requests that asked for the microphone, so it answered no, before the real capture handler was ever asked. The fix lets that request through only while a capture is being set up. Everything else is still refused, so a page asking to share the screen at some other moment is still turned down.

I should be plain about the limit here. I did not have a Windows machine in front of me, and the change description says so. The small app was my evidence, and the first real confirmation was always going to be the next install. I would rather say that than claim a result I did not watch.

The reason I trust the small app is that it cut the question down. When the failing thing is that small, there is nowhere left for a wrong theory to hide.

## Nine resumes that all parsed wrong, and none of them errored

The last one is the one I like most, because nothing was broken in the usual sense. Resume upload on the server was not throwing errors. It was returning resumes that looked fine and were wrong.

I took nine real uploaded resumes, exported from Google Docs, Word and Canva, one and two columns, designer and engineer layouts, and ran them through the exact upload path. All nine came out wrong, and none gave an error. That kind of failure is easy to miss, because nothing alerts anyone.

The same few mistakes kept showing up:

- A bullet character the parser did not know made one job with eight bullets turn into eight jobs, each titled with a sentence.
- A line that the page had wrapped turned one email address into one ending in `.co`. It looked valid and went nowhere.
- A name set in capitals looked exactly like a section heading, so the parser found no name, email or phone in files that had all three.
- In two-column files the sidebar was read first, and one candidate's name came out as "Contact".

The before numbers became the scoreboard. Bullets recovered: 1 of 9. Name, email and phone: 7 of 9 files were missing at least one. Files with no broken structure: 0 of 9.

For each pattern I then wrote a test on an invented resume, shaped like the real one, and ran it against the old code first to watch it fail. I did that on purpose. A test that has never failed has not shown that it can. No real candidate's file went into the repository, because those are other people's resumes.

After the change, bullets recovered went to 9 of 9, with two files that have none to recover. Name, email and phone were complete in 9 of 9, and none had broken structure. That is on the nine files, which is a small sample, and I said so in the change itself.

It also left some things honestly unfixed. Two files still lose a few letters, because a broken font means the missing characters never reach us. The most crowded two-column file loses some employer names, because the layout does not survive as flat text. I left those as they were and noted them, because guessing would have put wrong facts about a person into their resume.

This was the server's parser. A teammate later extended the parser heavily and made the browser and the server parse the same way. The nine-file pass and these fixes were mine.

## What the three have in common

None of them started with a theory. The throttle gave me a number where I had only complaints. The tiny app gave me a place where a wrong guess had nowhere to hide. The nine files gave me a scoreboard for something that never raised an error.

In each case the thing I built was cheaper than one wrong fix. And each one stayed behind: a tiny harness I can rerun, a rig I can point at the next change, tests that go red if the fix is taken out.

If I cannot make a bug fail on my desk, I treat that as the first thing to fix.

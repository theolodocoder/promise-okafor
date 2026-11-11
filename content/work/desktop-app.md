---
title: Shipping a desktop app
subtitle: Auto-updating releases of the JobWhisper desktop app, and the audio bugs that only showed up on real machines.
line: Releasing a desktop app that never updates during a live call.
field: Release engineering
year: 2024 to 2026
backdrop: mist
visual: shot: /work/jw-desktop-home.jpg | The desktop app on a Mac
order: 4
parent: jobwhisper
draft: false
---
![The JobWhisper desktop app on a Mac. A person in a live interview must be able to trust this window, so most of this case study is about what it does when nobody is looking.](/work/jw-desktop-home.jpg "mist")

## What it is

JobWhisper's desktop app is the interview copilot for Mac, Windows and Linux. It sits next to a live call, hears the interviewer through the computer's audio, and shows the candidate an answer.

A release pipeline and an update path already existed when I took it over, and a teammate had added the Linux build. From there the app went through 21 releases, from the first tag in early September to the last one in early November, and I ran the release process. I also closed the gaps in the pipeline, and I fixed the bugs that only appeared on someone else's machine.

## The problem

A web app is one copy, and you can fix it any time. A desktop app is copies on other people's laptops, and some of those copies are in the middle of an interview.

That gives you two rules. An update must never land during a call, and the audio must keep working on machines you do not own. Both rules got tested by real testers in the first weeks.

## How I tracked the audio bugs down

Every audio bug had the same shape. It worked on my machine and failed on someone else's, with no error on screen. So I worked from the cause before I touched the app, and on Windows I built a small setup that showed the failure by itself.

On the Mac, testers saw "Screen Recording is off" with the switch plainly on, and they heard nothing. I read how macOS handles this audio. The old capture method needs a second permission that is listed on its own, and macOS never asks for it. If it is denied, the capture still starts and just streams silence. So the app was working and hearing nothing, and our screen sent people to a switch that was already on.

On Windows, system audio failed in every release from 1.0.9, and the Mac never showed it. I built a bare Electron test app that copied the real app's bridge line for line. With the app's permission rules it failed. With one rule changed it worked.

## The hard part

Both bugs were quiet. Nothing crashed and nothing printed an error. The Windows one also hid behind the Mac, because the two platforms capture system audio in two different ways, so a fix and a test on the Mac said nothing about Windows.

<figure class="wide">
<div class="flow">
<div><b>App asks to share the screen</b>This is how Windows system audio starts</div>
<div><b>Electron asks the permission rule</b>The request says it wants no media types</div>
<div><b>Rule said no</b>It was written for the microphone only</div>
<div><b>Audio never starts</b>Error: permission denied, in every release from 1.0.9</div>
</div>
<figcaption>The Windows bug. The request reached our rule before anything that could say yes, and the rule only knew about microphones.</figcaption>
</figure>

## Decisions and tradeoffs

### Never update during a call

The app checks for updates 10 seconds after the window opens, and downloads in the background. It never installs on its own, and it only asks the person to restart. I added the rule that it does not even check or download while a call is live, because the download competes with the audio going out. I kept every decision in one small file with plain tests, so the rule is checked without starting Electron.

> **What it cost**
> An app that stays open all day can miss a release. It was checking every 6 hours at first, and a tester reported that auto-update did not work, because an app opened just before a release finished uploading found nothing and then did not ask again. I moved it to every hour, plus a check when the window comes back into focus, at most once every 15 minutes.

### One tag is the whole release

A tag starts the build for each platform. Each one publishes into a single draft release, and a last step checks that all three update files arrived before the draft goes public. If one platform fails, nothing half-ships. If just one platform fails, I can rebuild only that one.

Other people fixed parts of the signing with me. Only the Mac build is signed and notarized, with an App Store Connect key, and a release tag refuses to publish an unsigned Mac build. An unsigned Mac app installs, but it can never update itself, so it is not worth publishing.

### Use the permission people already give

The second Mac permission is one macOS never asks for, so we could not guide people through it. I replaced the capture method instead. I ported a small Swift helper, already in use in sister products, that captures system audio through Screen Recording, which people already turn on for the coding copilot. It runs as a separate program next to the app, one build for each kind of Mac chip. When the permission is refused, it reports it in the system's own words.

### Make audio fix itself

A tester's real interview hit a network glitch. Afterwards both system audio and the microphone were dead, and the app told them to restart the session, for devices it could have simply started again.

Now the helper retries after 2, 5, 15 and 30 seconds. The ladder resets only after a calm minute, so a helper that keeps failing backs off and does not start in a loop. The microphone comes back when the system says a device changed, like AirPods dropping or a USB mic being pulled.

> **What it cost**
> Two things stay final. If the user has refused a permission, we do not retry, because that would pound on a switch that is off. And we never show the permission prompt again mid-call, because a prompt loop over a live interview is worse than a short silence.

### See the meeting, not the app

Meeting detection only looked at running programs. So Google Meet in Chrome was invisible, and Zoom counted as a meeting whenever it was merely open. Now it reads the titles of open windows and matches real meeting windows, with the old program list as a backup. It uses the Screen Recording permission the app already has, so it asks for nothing new. It nudges once per meeting.

## Result

The Windows system audio fix went out in release 1.0.13. The audio had been broken for four releases in a row, 1.0.9 to 1.0.12. In my test app, the request went from refused to one audio track and one video track with frames flowing.

On the Mac, the helper replaced the old capture and works with the one permission people already give. Meeting detection was tested on a real Mac, and a browser meeting opened the meeting setup. Updates now only happen outside a call.

## What was still wrong

I could not run the Windows fix on a Windows machine when I merged it, so the test app was the evidence and the first real check was the install itself. The Mac helper had the same gap. I tested it on my own Mac, but a tester's live session needed the release build. And the 2-second recovery is how the ladder is built. I wrote tests for it, but it needed a real Mac with Wi-Fi turned off to prove it.

## What I took from it

A bug you cannot see on your own machine needs its cause found before its fix. On Windows, a bare test app showed the real cause in one run, where guessing from the Mac would have told me nothing.

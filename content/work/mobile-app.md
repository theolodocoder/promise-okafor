---
title: The mobile app
subtitle: The JobWhisper app for iPhone and Android, and the bugs only a store review or a cloud build could find.
line: A phone app that passed every check we had and still failed in the places we could not test.
field: Mobile
year: 2024 to 2026
backdrop: lavender
visual: phones: /work/jobs.jpg | The jobs screen of the mobile app
order: 5
parent: jobwhisper
draft: false
---
![The jobs deck in the phone app.](/work/jobs.jpg "lavender phone")

## What it is

The JobWhisper app for iPhone and Android, built with React Native and Expo. It has the job deck, the application tracker and the live interview copilot. I built it on the same shared code as the web app, after an earlier Flutter version of the app, so the work was a full port of that design plus the real API behind every screen.

Android went live in the Play Store in the US on 12 October 2026. On iOS, the first version went to TestFlight in September and to App Review in late September. I'll say below what each store did and what I do not know.

## The problem

Everything in the app passed. Unit tests, types, lint, the simulator on my desk and a real iPhone. Then four things failed that none of those could see: Apple's reviewers, a cloud build, a real backend, and a phone on the table in front of an interviewer.

## How I found each one

Each failure had a place where it showed up, so the first job was to go to that place.

For the launch crash, Apple said only "crashed on launch". Our iPhone ran fine, and so did the simulator. The difference was the iOS version. Apple reviews iPhone-only apps on an iPad, on the newest system. So I made an iPad Air simulator on iPadOS 27 and ran the release build there. It died at once, and the log gave the reason.

<figure class="wide">
<div class="flow">
<div><b>Our iPhone, iOS 26</b>Warns in the log, runs</div>
<div><b>Simulator, iOS 26.5</b>Warns in the log, runs</div>
<div><b>App Review, iOS 27</b>Process killed at launch</div>
<div><b>iPad simulator, iOS 27</b>The only place I could see it</div>
</div>
<figcaption>Same build, four places. The crash only exists on the newest system.</figcaption>
</figure>

For the two build failures, I ran the cloud build's own commands on my machine until they broke the same way. For the copilot, I read the web and desktop code side by side with the phone code, against the written contract for the live socket.

## The hard part

Nothing was wrong in a way a test could point at.

The launch crash was a new rule in the newest SDK. Apps built with it must use the scene-based life cycle, and ours used the old one. On iOS 26 that only prints a warning, so every device we owned said the app was fine. A build that is safe on every machine you own can still be dead on the one the reviewer owns.

The cloud builds failed because of what my machine had and a clean checkout did not. The copilot was the worst, because it did not crash. It transcribed the first question and then went quiet and hung up.

## Decisions and tradeoffs

### Fix the launch crash in a config plugin

Expo ships a scene delegate, but its template still generates the old app delegate, so using the new one is opt-in. I did not edit the generated iOS folder, because every build regenerates it and the edit would vanish. I wrote a small config plugin that adds the scene settings and takes the window start-up out of the app delegate. It also throws if Expo's template changes shape.

> **What it cost**
> The review round trip. The app went to Apple with a crash, and a later build had to go back. The plugin is also a patch on a template I do not own, so when Expo adopts scenes itself the plugin should go.

I chose the throw on purpose. If the template drifts, a silent skip would ship an app that crashes on launch. A failed build is a better way to find out. The plugin has its own unit test against a copy of the template.

### Adapt the design system, do not reuse it

The desktop app can use our web components because it is a browser underneath. React Native has no DOM, so those exact components cannot render. I made the native design system a faithful copy of the web one, with the same look and the same props, and rewired the screens to use it. Then I stopped. Switch, Dialog and a few others had no screen that needed them, so I did not port them.

### Make the phone copilot match the web contract

The phone copilot was a reduced copy of the web one, and two differences caused the "transcribes once, then disconnects" bug.

The iPhone audio session had voice processing on. That mode cancels echo and keeps only the voice near the mic. A copilot that listens to a room needs the far voice, so it was erasing the interviewer. The transcriber got near-silence and the server gave up. I turned it to minimal processing, which is what the web does for the same reason.

The second was a label. We tagged every audio frame as the candidate. In the socket contract that tag means "my own mic, next to an interviewer source". A phone is one mic in a room, so the frames should carry no tag. With the tag on, the server never saw an interviewer question, so it never made an answer.

![The copilot on a phone: the question as text, then the answer.](/work/copilot.jpg "sky phone")

I also fixed a wrong belief in the code comments. An earlier note said the transcription error was recoverable. The contract says an error frame is final and an "ended" follows. Patching around it had hidden the real cause.

Weeks later I brought the phone onto the same socket layer as web and desktop, and fixed the silence the phone streamed all the time. The pull request says plainly that I had not run it on a device yet.

### Put the consent gate where the reviewer lands

Apple rejected the app a second time, for sharing data with AI providers without consent. We had a consent screen. I had put it in the sign-up flow only, and the reviewer's demo account was already signed up, so it landed on the jobs screen and never saw it. The gate now covers the main app as well, and the wording names every provider the backend can send data to. We rewrote the privacy policy to match, and I sent the app back to review on 14 October.

### Resolve workspace code from source in the cloud build

The shared libraries point at a built folder that is not in git. My machine had it. The cloud's clean checkout did not, so the bundle could not find them. I pointed Metro at each library's source instead.

The second one was a missing direct dependency on the Babel preset. It only existed as someone else's dependency, which my machine could see and the cloud build could not. The error said something about a transform function, which was nowhere near the cause. It only failed in the step that packs the update bundle, so a normal bundle run passed. I reproduced it by running that one step by hand.

## Result

The launch crash is fixed and the plugin has a test. The consent gate and the new policy went out with a build that I sent back to Apple on 14 October. The two cloud build failures are closed and I know the one command that reproduces each.

Android is live in the US and verified from its public store page. After that I hid the iOS-only billing link on Android and sent a worldwide release to review, with a later release behind it.

On the phone copilot, the two root causes are fixed, and the later weak-network work is merged. I do not have a measured before and after from a real phone, so I will not give one.

## What was still wrong

I do not have Apple's answer to the 14 October resubmission in my notes, so I am not claiming the App Store listing. I also do not have Google's answer on the worldwide releases.

The reduced copy problem is fixed only by discipline. Phone, web and desktop share the socket now, but there is no test that fails when the phone drifts from the contract. The motion code is the same kind of gap. Our test setup replaces the animation library, so a bad color value in an animation passed every test and still crashed the app on launch. Only a rebuilt app running on a device caught it.

## What I took from it

Test where the judge tests. Our devices were the wrong ones. The newest iOS on an iPad simulator, a clean checkout for the cloud build and the real backend on a phone each found something we could not find any other way.

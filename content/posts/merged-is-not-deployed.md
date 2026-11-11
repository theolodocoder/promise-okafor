---
title: Merged is not deployed
summary: After a big merge our production deploys stopped while the pipeline stayed green, and what I changed so a green check is never the end of a release.
publishedAt: 2026-11-11T09:00:00+01:00
category: Releases
tags: [Deployment, CI, Nx, Releases]
featured: false
draft: false
---

Our pipeline was green, and production was still serving the build from before a large merge. A green pipeline tells you the code built. It does not tell you that your users have it.

## What happened

We had just merged a large change that brought a mobile app into our frontend monorepo. Afterwards, someone tested a fix on our dev site and saw the old behaviour. The fix was merged. CI was green.

So the code was fine. The site was still serving a build from before the merge.

## First, find out what is really being served

I stopped looking at GitHub, because GitHub only knows what was merged. It has no record of what a hosting platform did afterwards. So I asked the site itself.

```sh
curl -sI "https://app.example.com/?cb=$(date +%s)" | grep -i last-modified
```

The query string changes the URL, so I am not handed a cached copy. The `last-modified` date was from before the merge. I did the same for production, and its date was old too. Nothing had gone out since the merge, on either one.

For a second opinion I looked for a piece of new copy inside the served JavaScript file. It was not there. Two checks, same answer.

## Then make it fail somewhere I can watch

The deploy build runs on a machine I cannot see, so I reproduced it on mine. I took a clean export of the branch, with no local files and no old caches, installed from the lockfile the way the deploy does, and ran the same build command the Dockerfile runs. I also made sure the CI setting was off, because the hosting platform's build does not have it.

It failed straight away with one line: the workspace is out of sync.

Now the picture was clear. Nx, our build tool, keeps TypeScript project references in step with the dependencies between our packages. When the mobile app arrived, those references were out of date, so a sync was always waiting. When Nx runs inside CI it carries on regardless. When it runs anywhere else, it refuses to build until the sync is applied. Our deploy builds are not CI, so every one of them stopped at that line, and the platform kept serving the last build that had worked.

<figure class="wide">
<div class="flow">
<div><b>Merge</b>Code lands on the branch</div>
<div><b>CI</b>Builds with the CI setting on. Green</div>
<div><b>Deploy build</b>Same command without it. Stops at "out of sync"</div>
<div><b>Served site</b>Still the old build</div>
</div>
<figcaption>Two builds of the same code, and only one of them checks that the workspace is in sync. The one users depend on is the one that stopped.</figcaption>
</figure>

## The hard part

Running the sync and committing the result would fix the deploys. It would also break something else.

The mobile app reads its workspace packages from source, not from built output. One of those packages is source only, so it has no built declarations at all. The sync wanted to add a project reference to it. With the reference in place, the type checker looked for build output that did not exist, and the mobile type check failed.

The tool's suggestion would have fixed deploys and broken the mobile type check. I did not want to trade one for the other on a day when production was already behind.

## Decisions and tradeoffs

### Skip the check in the deploy build

A deploy builds one app. It does not need project references to be tidy, because it only needs the app to compile and bundle. So I added the flag that skips the sync check to the deploy build of each app, and left a comment next to it that says why, so nobody removes it later without knowing.

I sent the fix to the dev branch, and the same fix straight to the branch production builds from, because production was just as stuck. Before I called it fixed, I ran the clean-export build again. It failed without the flag and passed with it, for every app.

### Then fix the real drift, and make CI see it

Skipping a check can hide a real problem, so the same day I dealt with the drift itself. The references that were harmless went into the repo. For the source-only package I used the sync tool's own setting to leave that one dependency out, so the mobile type check stays happy.

Then I added the sync check to CI. Before, drift only showed up in a deploy, where nobody was looking. Now it fails a pull request, where everybody is.

I kept the flag in the deploy builds as well. CI now owns that check, so the deploy does not need to repeat it.

### Make the served build the check

The team had no way to tell that a successful merge had not reached anybody, and for a while we believed the work was live. The rule we took on: after a merge that matters, someone looks at the served build before saying it is out.

It is a small check:

1. Ask the live site for its `last-modified` date, with a cache-buster, and compare it to the time of the merge.
2. For a change you can see, find one new string from it in the served JavaScript.

It is quick, and it looks at the thing users actually get.

## Result

Deploys could build again for every app, on dev and on production. After that, a sync problem fails in CI instead of in a deploy. And "merged is not deployed, check the served build" became something the team does, not something I remember.

I do not have a figure for how long users were behind, so I will not give one. What I can say is that nothing in our tools told us. A person had to notice.

## What was still wrong

The check I added is still a person looking. If someone forgets, the same silence can come back from a different cause. A tidier answer would be for the site to say which build it is. A version file served next to the app, or a version in the page itself, would let a script compare it to the commit that was merged and shout when they differ. I have not built that, and it is the next thing I would add.

## What I took from it

After an important merge we now check the served build, and CI catches project reference drift before it reaches a deploy.

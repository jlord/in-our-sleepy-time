## Context
There is currently a bug in `update.js` which generates the incorrect
URL for the Apple Podcasts button. It is currently creating a URL
with guid provided by the original RSS XML. Apple Podcasts creates
its own ids for each episode which is not the same as the guid provided
by the original RSS XML. This Apple specific id is required for opening
the correct episode in the Apple Podcasts app.

In order to get the correct episode id for Apple Podcasts this API is
available: https://itunes.apple.com/lookup?id=73330895&entity=podcastEpisode&limit=2000.

Note that we need to make sure that the limit is big enough to fit
all the podcasts's epsides.

This API returns JSON objects which contain the `trackId` for each
episode. This is the correct id to use when constructing the URL for Apple Podcasts.

In `jq` syntax the `trackId` is found at `.results[].trackId`.

More context about this application can be found in `plans/20250613-initial.md`

## Instructions to Fix
- Update the `update.js` file to fetch the lookup JSON using the URL provided
  above.
  - Make sure the limit parameter is big enough for all the podcasts episodes.
- Parse the downloaded JSON and filter for only the `wrapperType` that matches
  "podcastEpisode".
- Find the `trackId` of our selected podcast using `episodeGuid` field.
- Update the button's link to use this `trackId` instead of the `guid`.

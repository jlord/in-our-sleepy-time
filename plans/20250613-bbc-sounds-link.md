## Context
The app needs a new button that will allow users to listen to the podcast on the BBC Sounds app. This will be the third button on the generated HTML page.

The BBC Sounds app uses the `guid` in its urls. The `guid` can be found in the orginal RSS fetched by `update.js`.

From the `guid` in the original RSS is in this format: `urn:bbc:podcast:m002d8t2`. It needs to be reduced to just the characters following the colon. For example, from `urn:bbc:podcast:m002d8t2` we only need `m002d8t2`. We can call this the `shortGuid`

The construction of the URL for the BBC Sounds app episodes is `https://www.bbc.co.uk/sounds/play/` followed by the `shortGuid`.

## Instructions to Add New Button
- Add a new "🎧 Open in BBC Sounds" button to the generated HTML that uses the new link described above.

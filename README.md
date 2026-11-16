# Senate caucus support for Chris Van Hollen

A standalone, user-assisted campaign app for contacting senators about Senate Democratic leadership. It generates an editable message, looks up senators by state, and lists the Democratic caucus, including independents identified as caucusing with Democrats.

**The app does not send messages.** Users review and copy their message and submit it through each senator's contact form. Some offices may restrict submissions to their constituents.

## Run locally

Requirements: Node.js 22 or newer for tests, and Python 3 to run the example web server. The app itself uses browser-native JavaScript and has no build step or runtime dependencies.

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. A local web server is required for JavaScript modules; the page also needs internet access to load senator data. Deploy the project files to any static web host.

## Tests

```sh
npm test
```

No package installation is required for these tests. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development and review process.

## Optional desktop form helper

The website can export contact details and the current subject and message as a JSON file for the optional desktop helper. The export is unencrypted and contains personal information: keep it private, and delete it from your downloads and trash when finished. Do not share it in issues or logs. Exporting is optional and happens locally in the browser.

The helper supports the contact forms for **Senators Gillibrand, King, Cortez Masto, Padilla, Murphy, Schatz, Gallego, Schiff, Klobuchar, Kim, Alsobrooks, Luján, Sanders, Schumer, Van Hollen, Coons, Booker, Markey, Slotkin, Warren, Peters, Reed, Rosen, Shaheen, Merkley, Fetterman, Hickenlooper, Ossoff, Blunt Rochester, and Hassan**. The ten newest forms require the next desktop release. All other offices are unsupported; use the website's regular contact links for them. Forms may change, and the helper reports when its expected fields are missing rather than attempting to guess. Some offices restrict submissions to constituents.

1. Download an export from the website and obtain a desktop helper build from the project's [GitHub releases](https://github.com/ejameson91/senate-caucus-support-vanhollen/releases), once a release is available. Builds are unsigned and may trigger operating-system warnings. Inspect the source and verify the source of any download before running it.
2. Open the helper and import the JSON file. The helper holds the imported details in memory until closed; the export file remains on disk.
3. Select a supported senator and open the form. For Cortez Masto, open **share your opinion on legislation**; for Padilla, choose **Share your opinion or comments on bills or other issues**; for Murphy, choose a topic on his page first; for Van Hollen, open **Share your Opinion**. Return to the helper and select **Load topics from form** to choose from that office's current topics, then select **Fill form**. You can instead choose the topic manually on the form. If multiple topics share a value, those choices are disabled in the helper and must be selected on the form. For Murphy, the helper's topic must match the one already selected on his page. If your optional exported prefix is unavailable, select one manually where required; King has no prefix field. Schatz and Booker require a manual answer to their response questions. Schatz's form has no subject field; Sanders's form has no subject field and limits comments to 2,000 characters. Markey's form has no phone field. Some forms do not offer every territory. For Warren, review and answer the required federal-agency question yourself. Slotkin's form opens on the Senate outreach site. Review all values, including any unanswered questions. The form page and any services it uses can access the information entered there. Repeat for another supported senator if desired.
   Shaheen and Merkley have no subject field; select Merkley's country on the form. Fetterman's subject is a topic selection rather than a text field, and its message limit is 1,200 characters. Ossoff's form combines both address lines into one field. Review response and newsletter choices yourself.
4. Complete any CAPTCHA and submit the form yourself. The helper does not submit or report delivery. Close the helper and delete the export when done.

To develop the helper, run `npm ci` and then `npm run desktop`. `npm run dist -- --mac --x64 --arm64 --publish never` builds unsigned macOS ZIPs on macOS; `npm run dist -- --win --x64 --publish never` builds an unsigned Windows executable on Windows. The desktop-build workflow can be run manually to produce artifacts or by pushing a `v*` tag to publish a GitHub release. No release download is available until a tagged build has succeeded.

## Data and privacy

The app fetches the current JSON from [congress-legislators](https://github.com/unitedstates/congress-legislators) directly in the browser. It relies on that dataset's current-member list rather than interpreting term end dates, which can differ from when a successor takes office. It selects senators whose latest term is in the Senate and whose party or caucus is recorded as Democrat, including independents who caucus with Democrats. The state lookup includes all listed senators regardless of party. Five senators are highlighted by Bioguide ID.

Contact-form links and membership depend on the upstream data and may be stale or missing. Where no form URL is present, the app links to the senator's official website. It accepts only Senate.gov links, upgrades HTTP links to HTTPS, and explicitly reports when data or an official link is unavailable. Check current membership and contact information against official sources before a campaign.

No message, contact details, or state is sent to this app's server. The optional export stores contact details and message in a local plaintext file; the desktop helper imports them into memory. Loading senator data contacts the external data host, and following a link, filling a form, or submitting it shares information according to the receiving site's policies. Browser clipboard access requires a secure context such as HTTPS or localhost; if copying fails, the text is selected for manual copying.

## Community and license

Please follow our [contribution guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md). Report security concerns using [SECURITY.md](SECURITY.md). This project is dedicated to the public domain under [CC0 1.0](LICENSE).

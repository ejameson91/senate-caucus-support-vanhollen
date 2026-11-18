# Senate and House leadership contact tool

A standalone, user-assisted campaign app for contacting senators about Senate Democratic leadership and Democratic representatives about the House speakership. It generates editable messages, looks up senators by state, lists the Democratic Senate caucus (including independents identified as caucusing with Democrats), and lists Democratic House members by state and district. Users choose their own House district; the app does not infer a representative from an address.

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

## Optional desktop form helpers

The website can export contact details and either the Senate or House subject and message as a JSON file. Use the Senate export with the Senate Form Helper and the House export with the House Form Helper. New exports include a campaign label; each app rejects exports for the other campaign. Legacy exports without a campaign label can still be imported, but the app asks you to verify the message. The export is unencrypted and contains personal information: keep it private, and delete it from your downloads and trash when finished. Do not share it in issues or logs. Exporting is optional and happens locally in the browser.

The Senate Form Helper supports the contact forms for **Senators Gillibrand, King, Cortez Masto, Padilla, Murphy, Schatz, Gallego, Schiff, Klobuchar, Kim, Alsobrooks, Luján, Sanders, Schumer, Van Hollen, Coons, Booker, Markey, Slotkin, Warren, Peters, Reed, Rosen, Shaheen, Merkley, Fetterman, Hickenlooper, Ossoff, Blunt Rochester, and Hassan**. The last ten forms listed require desktop version 1.1.0 or later. The separate House Form Helper currently supports Representative Pete Aguilar. Other House offices are not yet supported for autofill; use the website's official contact pages and complete them manually. Adams, Amo, Ansari, and Auchincloss currently present address/ZIP authentication, which the helper does not bypass. Forms may change, and each helper reports when its expected fields are missing rather than attempting to guess. Some offices restrict submissions to constituents. Published builds predate this split; the House app will be available in a release built from this version.

1. Download the matching export from the website and obtain the Senate or House app from the project's [GitHub releases](https://github.com/ejameson91/senate-caucus-support-vanhollen/releases) after a release built from this version is available. Builds are unsigned and may trigger operating-system warnings. Inspect the source and verify the source of any download before running it.
2. Open the matching app and import the JSON file. The app holds the imported details in memory until closed; the export file remains on disk.
3. In the Senate Form Helper, select a supported senator and open the form. For Cortez Masto, open **share your opinion on legislation**; for Padilla, choose **Share your opinion or comments on bills or other issues**; for Murphy, choose a topic on his page first; for Van Hollen, open **Share your Opinion**. Return to the helper and select **Load topics from form** to choose from that office's current topics, then select **Fill form**. You can instead choose the topic manually on the form. If multiple topics share a value, those choices are disabled in the helper and must be selected on the form. For Murphy, the helper's topic must match the one already selected on his page. If your optional exported prefix is unavailable, select one manually where required; King has no prefix field. Schatz and Booker require a manual answer to their response questions. Schatz's form has no subject field; Sanders's form has no subject field and limits comments to 2,000 characters. Markey's form has no phone field. Some forms do not offer every territory. For Warren, review and answer the required federal-agency question yourself. Slotkin's form opens on the Senate outreach site. Review all values, including any unanswered questions.
   Shaheen and Merkley have no subject field; select Merkley's country on the form. Fetterman's subject is a topic selection rather than a text field, and its message limit is 1,200 characters. Ossoff's form combines both address lines into one field. Review response and newsletter choices yourself.
   In the House Form Helper, select Representative Aguilar and open the form. Manually answer the required response question; the helper leaves newsletter and speech options unchanged. The four other offices in the initial directory batch require ZIP/address authentication and are not supported for autofill. The form page and any services it uses can access information entered there.
4. Complete any CAPTCHA and submit the form yourself. The helper does not submit or report delivery. Close the helper and delete the export when done.

To develop, run `npm ci`, then `npm run desktop:senate` or `npm run desktop:house`. `npm run dist:senate -- --mac --x64 --arm64 --publish never` and `npm run dist:house -- --mac --x64 --arm64 --publish never` build separate unsigned macOS ZIPs on macOS. Use `--win --x64 --publish never` with either command on Windows to build that app's unsigned portable executable. The desktop-build workflow builds both apps and can be run manually to produce artifacts or by pushing a `v*` tag to publish a GitHub release.

## Data and privacy

The app fetches the current JSON from [congress-legislators](https://github.com/unitedstates/congress-legislators) directly in the browser. It relies on that dataset's current-member list rather than interpreting term end dates, which can differ from when a successor takes office. It selects senators whose latest term is in the Senate and whose party or caucus is recorded as Democrat, including independents who caucus with Democrats, and House members whose latest representative term is recorded as Democrat. The state lookup includes all listed senators regardless of party. Five senators are highlighted by Bioguide ID.

Contact-form links and membership depend on the upstream data and may be stale or missing. Where no form URL is present, the app links to an official office website when available. It accepts only Senate.gov and House.gov links, upgrades HTTP links to HTTPS, and explicitly reports when data or an official link is unavailable. Check current membership and contact information against official sources before a campaign.

No message, contact details, or state is sent to this app's server. The optional export stores contact details and message in a local plaintext file; the desktop helper imports them into memory. Loading senator data contacts the external data host, and following a link, filling a form, or submitting it shares information according to the receiving site's policies. Browser clipboard access requires a secure context such as HTTPS or localhost; if copying fails, the text is selected for manual copying.

## Community and license

Please follow our [contribution guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md). Report security concerns using [SECURITY.md](SECURITY.md). This project is dedicated to the public domain under [CC0 1.0](LICENSE).

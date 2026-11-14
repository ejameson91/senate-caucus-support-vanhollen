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

No package installation is required. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development and review process.

## Data and privacy

The app fetches the current JSON from [congress-legislators](https://github.com/unitedstates/congress-legislators) directly in the browser. It relies on that dataset's current-member list rather than interpreting term end dates, which can differ from when a successor takes office. It selects senators whose latest term is in the Senate and whose party or caucus is recorded as Democrat, including independents who caucus with Democrats. The state lookup includes all listed senators regardless of party. Five senators are highlighted by Bioguide ID.

Contact-form links and membership depend on the upstream data and may be stale or missing. Where no form URL is present, the app links to the senator's official website. It accepts only Senate.gov links, upgrades HTTP links to HTTPS, and explicitly reports when data or an official link is unavailable. Check current membership and contact information against official sources before a campaign.

No message, name, or state is sent to this app's server or stored by the app. Loading senator data contacts the external data host, and following a link or submitting a form shares information according to the receiving site's policies. Browser clipboard access requires a secure context such as HTTPS or localhost; if copying fails, the text is selected for manual copying.

## Community and license

Please follow our [contribution guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md). Report security concerns using [SECURITY.md](SECURITY.md). This project is dedicated to the public domain under [CC0 1.0](LICENSE).

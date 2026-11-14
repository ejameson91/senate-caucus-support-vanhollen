# Contributing

Thank you for helping improve this project. By participating, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

## Before you start

- Search existing issues and pull requests before opening a new one.
- For a significant feature, behavioral change, or new dependency, open an issue first to discuss the approach.
- For security or privacy vulnerabilities, follow [SECURITY.md](SECURITY.md) rather than opening a public issue.
- Do not include private addresses, contact details, credentials, or real users' messages in issues, logs, screenshots, tests, or pull requests.

## Development

1. Fork the repository and clone your fork.
2. Create a descriptive branch from the default branch.
3. Use Node.js 22 or newer. Run the app locally using the instructions in [README.md](README.md).
4. Make a focused change and add or update tests for behavior changes. Preserve keyboard accessibility, readable labels, privacy, and honest delivery-status messaging.
5. Run `npm test`. For interface changes, also test the affected flows in a browser, including small screens and keyboard navigation. Do not send test messages to senators' offices.
6. Submit a pull request against the default branch. Explain the problem, your changes, how you tested them, and any limitations. Link relevant issues and include screenshots for visible changes when helpful.

Maintainers review submissions for correctness, accessibility, privacy, scope, and maintainability. They may request changes or decline a contribution; CI passing does not guarantee acceptance. Please respond constructively to review feedback.

## Data and content

Use reliable, current sources for changes to senator information or campaign claims. The upstream dataset can change and is not an authoritative guarantee of office membership or functioning links. Do not bypass contact-form protections or claim that a message was delivered without evidence.

## Licensing

By submitting a contribution, you confirm that you have the right to contribute it and agree to make it available under this project's [CC0 1.0 dedication](LICENSE). Do not submit material you cannot license on these terms.

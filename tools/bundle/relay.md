## Relay

This installation has the ASIMOV relay configured in `~/.asimov/.env` (Windows:
`$APPDATA/ASIMOV/.env`). When no enabled module handles a URL, `asimov fetch`
and `asimov list` send the request through the relay.

The relay supports these URLs:

| Platform  | `asimov fetch`                                                                           | `asimov list`                                                                            |
| --------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| X         | `https://x.com/:handle`                                                                  | `https://x.com/:handle/followers`, `/following`, `/mutuals`, `https://x.com/i/lists/:id` |
| Instagram | `https://instagram.com/:handle`                                                          | `https://instagram.com/:handle#followers`, `#following`                                  |
| GitHub    | `https://github.com/:handle`                                                             | `https://github.com/:handle?tab=followers`, `?tab=following`                             |
| LinkedIn  | `https://linkedin.com/in/:handle/`, `https://linkedin.com/company/:handle/`              |                                                                                          |
| Luma      | `https://luma.com/user/:handle`, `https://luma.com/:event`, `https://luma.com/:calendar` | `https://luma.com/:calendar?period=future`, `?period=past`                               |

Listings accept `--limit`, `--offset`, and `--sort=KEYS`, where keys are `id`,
`handle`, `name`, `followers`, `followees`, and `posts` (Instagram and X only),
comma-separated, with a `-` prefix for descending order.

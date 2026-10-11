# ASIMOV Alpha

<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.5.1/asimov-alpha-0.5.1-macos-arm.zip"><img width="220" alt="Download for macOS" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-macos.png?raw=true"/></a>
<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.5.1/asimov-alpha-0.5.1-windows-x64.zip"><img width="220" alt="Download for Windows" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-windows.png?raw=true"/></a>
<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.5.1/asimov-alpha-0.5.1-linux-x86-gnu.zip"><img width="220" alt="Download for Linux" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-linux.png?raw=true"/></a>

## ✨ Features

- An exclusive private distribution of [ASIMOV Platform] specialized for
  social media intelligence.
- Plugs into your current agent harness as a sidecar: verified with Hermes,
  OpenClaw, Claude Code, etc.
- Makes social graphs transparent, disregarding typical barriers such as
  restrictive, expensive APIs.
- Currently supports **LinkedIn**, **X** (fka Twitter), **Instagram**, **Luma**,
  **GitHub**, **Attio**, and <sup><sub>(coming soon!)</sub></sup> more sources.

## ⬇️ Installation

1. Download the [latest zip] file from the OS-specific download buttons above.

2. Instruct your agent harness (e.g., [Hermes], [OpenClaw], [Claude Code], etc.)
   to unzip the file and install the contents:

```
Install `asimov-alpha-0.5.1-macos-arm.zip` from my Downloads folder
```

<img alt="Screenshot of installation with Hermes Desktop" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/screenshot-install.png?raw=true"/>

<details>
<summary>Technical details for the curious</summary>

TBD
</details>

## 👉 Examples

Here follow some examples that you could try asking your agent:

### LinkedIn

```text
Use ASIMOV to verify you have access to my LinkedIn connections
```

```text
Use ASIMOV to show me my most recent LinkedIn connections
```

```text
Use ASIMOV to show me my earliest ever LinkedIn connections
```

### X (fka Twitter)

```text
Use ASIMOV to look up @ASIMOV_Platform on X
```

```text
Use ASIMOV to list ten of @ASIMOV_Platform's followers on X
```

```text
Use ASIMOV to show who @ASIMOV_Platform follows on X
```

### Instagram

```text
Use ASIMOV to look up @nasa on Instagram
```

### Luma

```text
Use ASIMOV to look up https://luma.com/user/arto
```

```text
Use ASIMOV to look up the Luma calendar at https://luma.com/asimov-sf
```

```text
Use ASIMOV to show today's events at https://luma.com/frontiertower
```

```text
Use ASIMOV to list past events at https://luma.com/asimov-sf
```

### GitHub

```text
Use ASIMOV to look up @asimov-platform on GitHub
```

### Attio

```text
Use ASIMOV to verify you have access to my Attio workspace export
```

```text
Use ASIMOV to list ten people and companies from my Attio workspace export, sorted by name
```

## ⚙️ Configuration

### LinkedIn Configuration (2 minutes)

To give ASIMOV access to your LinkedIn connections, follow these easy steps:

1. In LinkedIn, open **Me** → **Settings & Privacy** → **Data privacy** →
   [**Download your data**](https://www.linkedin.com/mypreferences/d/download-my-data)
2. Make sure to request a data export that includes **Connections**,
   (*"Download larger data archive"*) and download it when it is ready.
3. Leave the export ZIP in your system's Downloads folder, where it will be
   automatically detected by ASIMOV. Both the original ZIP and an
   autoextracted export directory are supported.
   (In case you have multiple LinkedIn data exports downloaded, ASIMOV
   will use the newest one.)

<p align="center"><img alt="Screenshot of requesting your data from LinkedIn" width="640" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/screenshot-linkedin-request.png?raw=true"/></p>

### Attio Configuration (2 minutes)

To give ASIMOV access to your Attio CRM workspace, follow these easy steps:

1. In [Attio](https://app.attio.com), open **Workspace**
   → **Workspace settings** → **General**.
2. Click the **Start new export** button and wait for the export to complete.
3. Download the workspace export using the download icon. The file is named
   `export_UUID.zip`, where UUID is a random string.
2. Leave the export ZIP in your system's Downloads folder, where it will be
   automatically detected by ASIMOV. Both the original ZIP and an
   autoextracted export directory are supported.
   (In case you have multiple LinkedIn data exports downloaded, ASIMOV
   will use the newest one.)

<p align="center"><img alt="Screenshot of exporting your workspace data from Attio" width="640" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/screenshot-attio-export.png?raw=true"/></p>

## 🧩 Compatibility

### Compatibility with Agents

We currently test compatibility with Hermes, Claude Code, and OpenCode.
Any comparably powerful agent harness is likely to work with ASIMOV.

### Compatibility with Models

<details>
<summary>Full model compatibility table</summary>

| Model  | Compatible?  | Notes |
| ------ | ------------ | ----- |
| Anthropic Claude Fable 5.1  | ✓  |  |
| Anthropic Claude Fable 5  | ✓  |  |
| Anthropic Claude Haiku 4.5  | ✓  |  |
| Anthropic Claude Opus 5  | ✓  |  |
| Anthropic Claude Opus 4.6  | ✓  |  |
| Anthropic Claude Sonnet 5  | ✓  |  |
| DeepSeek V4 Flash 0731  | ✓  |  |
| DeepSeek V4 Pro  | ✓  |  |
| MoonshotAI Kimi K3  | ✓  |  |
| OpenAI GPT-6 Astra  | ✓  |  |
| OpenAI GPT-5.6 Luna  | ✓  |  |
| OpenAI GPT-5.5  | ✓  |  |
| OpenAI GPT-5.4  | ✓  | Hermes & Claude Code OK, OpenCode not |
| Z.ai GLM 5.2  | ✓  |  |
</details>

## ⚖️ Legal

> [!NOTE]
> *This is proprietary and confidential software not for redistribution.*

[latest zip]: https://github.com/asimov-systems/asimov-alpha/releases

[ASIMOV Platform]: https://github.com/asimov-platform
[Claude Code]: https://claude.com/product/claude-code
[Hermes]: https://hermes-agent.nousresearch.com/desktop
[OpenClaw]: https://openclaw.ai

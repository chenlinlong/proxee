# proxee (@linlong/proxee)

A simple and lightweight CLI proxy for logging and inspecting HTTP/API requests during development.

---

## Features (功能特性)

* **Transparent Proxying**: Forwards requests to your backend server without interference.
* **Detailed Logging**: Logs request and response details to both the console and a file.
* **Gzip Decompression**: Automatically decompresses gzipped responses for clear-text logging.
* **Request Timing**: Calculates and logs the duration of each API call.
* **Highly Configurable**: Can be configured via a JSON file or command-line arguments.

## Installation (安装)

Install the package globally using npm:

```bash
npm install -g @linlong/proxee
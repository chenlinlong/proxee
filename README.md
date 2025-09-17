
# proxee (@linlongchen/proxee)

A simple and lightweight CLI proxy for logging and inspecting HTTP/API requests during development.


## Features

* **Transparent Proxying**: Forwards requests to your backend server without interference.
* **Detailed Logging**: Logs request and response details to both the console and a file.
* **Gzip Decompression**: Automatically decompresses gzipped responses for clear-text logging.
* **Request Timing**: Calculates and logs the duration of each API call.
* **Highly Configurable**: Can be configured via a JSON file or command-line arguments.

## Installation

Install the package globally using npm: `npm install -g @linlongchen/proxee`

## Usage

`proxee` can be configured in two ways, with command-line arguments taking precedence over the configuration file.

### 1. Using a Configuration File

* Create a proxee.config.json file in your project's root directory:

`{
  "port": 8080,
  "target": "http://localhost:3000",
  "logPath": "logs/api-logs",
  "logLevel": "info"
}`

* Then, simply run the command in your terminal to start the proxy:
`proxee`

### 2. Using Command-Line Arguments

* You can override any setting using command-line flags.
`proxee --port 9000 --target "[https://api.example.com](https://api.example.com)"`

* Available Options:

| Option | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--port` | `-p` | Port for proxee to listen on | `8080` |
| `--target`| `-t` | The target URL to proxy to | `"http://localhost:3000"` |
| `--logPath` | | Base path for the log file (no .log) | `"logs/proxee"` |
| `--logLevel`| | The level for file logging | `"info"` |
| `--help` | `-h` | Show help | |

### 3. License

ISC

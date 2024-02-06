```markdown
# Proxy App

This is a simple proxy application built with Node.js and Express.js. It allows you to proxy HTTP requests to a specified target URL.

## Features

- Proxy HTTP requests to a target URL
- Modify response headers and body
- Support for custom schema parameters in response payload

## Getting Started

To get started with the Proxy app, follow these steps:

### Prerequisites

- Node.js installed on your machine
- npm (Node Package Manager) or yarn

### Installation

1. Clone the repository:

```
git clone <repository-url>
```

2. Navigate to the project directory:

```
cd proxy-app
```

3. Install dependencies:

```
npm install
```

### Configuration

1. Create a `.env` file in the root directory of the project.
2. Set the following configuration parameters in the `.env` file:

```
PROXY_HOST=example-proxy.metatavu.io
PROXY_PORT=3128
PROXY_PROTOCOL=https
PROXY_USERNAME=proxyuser
PROXY_PASSWORD=proxypass
```

### Starting the Server

To start the server, run:

```
npm start
```

The server will start listening on port 3000 by default. You can change the port by setting the `PORT` environment variable in the `.env` file.

### Development

To start development mode with hot reloading, run:

```
npm run dev
```

This command uses `nodemon` to watch for changes in your files and automatically restarts the server.

## Usage

Once the server is running, you can make HTTP requests to `http://localhost:3000/proxy` and specify the target URL in the `Proxy` header.

For example:

```
curl --head --proxy http://localhost:3000 http://www.google.com
```

This command will send a `HEAD` request to `http://www.google.com` through the proxy server running on `http://localhost:3000`.

## License

This project is licensed under the [MIT License](LICENSE).
```
```
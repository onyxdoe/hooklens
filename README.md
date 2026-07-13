# Hooklens

You know how tough it can be to get webhooks working right, especially in local development? Hooklens gives you a simple way to catch, inspect, and even replay those webhooks straight to your local app. It's built to take the headache out of debugging webhooks from services like Stripe or GitHub, without needing complex tools like ngrok.

## Installation

Let's get Hooklens running on your machine.

1. **Clone the Repository:**
  ```bash
    git clone https://github.com/onyxdoe/hooklens.git
    cd hooklens
  ```
2. **Install Dependencies:**
  ```bash
    pnpm install
  ```
3. **Set up Environment Variables:**
  ```bash
    cp .env.example .env
  ```
    You can adjust settings like `PORT` or `DATABASE_URL` in the `.env` file if needed.
4. **Run Database Migrations:**
  ```bash
    pnpm db:migrate
  ```
5. **Start the Development Server:**
  ```bash
    pnpm dev
  ```
    Now, open your browser to [http://localhost:3000](http://localhost:3000) to see Hooklens in action.

## Usage

Here’s how you can use Hooklens to streamline your webhook debugging:

1. **Get a Webhook URL:**
  Once the app is running, click the "Get a webhook URL" button on the homepage. You'll be redirected to a unique URL like:
    This is your new Hooklens endpoint. Copy it and paste it into your webhook provider (e.g., Stripe, GitHub, your own backend).
2. **Send a Test Webhook:**
  To see it working, send a simple `POST` request to your new URL:
    You should instantly see the request appear in your Hooklens dashboard. You can inspect its headers, body, query parameters, and more.
3. **Connect to Localhost for Replay and Auto-forward:**
  To send captured webhooks to your local development server, go to the "Setup" panel in the Hooklens dashboard and copy the relay command. It will look something like this:
    Run this command in your terminal where your local application is listening for webhooks (e.g., a Node.js server running on port `4000`).
  - **Replay:** Once the relay status turns green in the dashboard, you can click "Replay" on any captured event. Hooklens will send that event again directly to your local application, letting you debug specific scenarios without re-triggering the original source.
  - **Auto-forward:** You can also enable auto-forwarding in the "Setup" panel. With this enabled, every *new* webhook received by Hooklens will automatically be sent to your configured local URL.

## Features

- **Instant Webhook URLs:** Quickly generate a unique URL to start capturing webhooks in one click.
- **Real-time Inspection:** See every incoming webhook event live, including headers, request body, query parameters, timing, and client metadata.
- **Event Replay:** Replay any captured webhook event to a specified destination, including your local development server, as many times as you need.
- **Localhost Auto-forwarding:** Automatically send new incoming webhooks to your local app using the provided CLI relay, eliminating the need for complex tunneling solutions during development.
- **Configurable Forwarding:** Easily enable or disable auto-forwarding and set a custom destination URL for your webhooks.
- **Request Management:** Clear individual requests or all requests for an endpoint directly from the dashboard.
- **Open Source:** Hooklens is open source, welcoming contributions and improvements from the community.

## Technologies Used


| Category     | Technology    | Description                                                  |
| ------------ | ------------- | ------------------------------------------------------------ |
| **Backend**  | TypeScript    | Primary language for type-safe server-side logic.            |
|              | Hono          | A lightweight, fast web framework for Node.js.               |
|              | Node.js       | Runtime environment for the server.                          |
|              | Drizzle ORM   | TypeScript ORM for declarative schema and queries.           |
|              | LibSQL/SQLite | Embedded database for data storage and persistence.          |
|              | WebSockets    | Real-time communication for CLI relay and dashboard updates. |
| **Frontend** | React         | JavaScript library for building interactive user interfaces. |
|              | TypeScript    | Enhances React components with strong typing.                |
|              | Inertia.js    | Connects client-side React with server-side Hono.            |
|              | Tailwind CSS  | Utility-first CSS framework for rapid UI development.        |
|              | Vite          | Next-generation frontend tooling for fast development.       |
| **Tooling**  | pnpm          | Fast, disk-space efficient package manager.                  |
|              | Docker        | Containerization for consistent environments.                |
|              | tsx           | TypeScript executor for seamless development.                |


## Contributing

Hooklens is an open-source project, and we welcome contributions from the community. Whether it's a bug fix, a new feature, or documentation improvement, your help is valuable.

- **Report Bugs or Suggest Features:** If you find a bug or have an idea for a new feature, please open an issue on the GitHub repository.
- **Submit Pull Requests:** If you'd like to contribute code, feel free to fork the repository and submit a pull request with your changes. We appreciate clear, well-documented code.

You can find the project repository here: [https://github.com/onyxdoe/hooklens](https://github.com/onyxdoe/hooklens)

## License

This project is open-source. Please refer to the project's repository for specific licensing details.

## Author Info

- **X (Twitter):** [@onyx_doe](https://x.com/onyx_doe)

---

[TypeScript](https://www.typescriptlang.org/)
[React](https://react.dev/)
[Hono](https://hono.dev/)
[Drizzle ORM](https://drizzle.team/)
[Tailwind CSS](https://tailwindcss.com/)
[Vite](https://vitejs.dev/)
[Node.js](https://nodejs.org/)
[Docker](https://www.docker.com/)

---

[Readme was generated by Dokugen](https://www.npmjs.com/package/dokugen)
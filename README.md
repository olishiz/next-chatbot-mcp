# next-chatbot-mcp
Testing Next chatbot powered by MCP
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## MCP Inspector Setup

The Model Context Protocol (MCP) Inspector helps you debug and monitor your chatbot's interactions. Here's how to set it up for local development:

### Prerequisites
- Node.js 16.8 or later
- Running instance of your Next.js application

### Installation

1. First, install the MCP Inspector package:

```bash
npm install @modelcontextprotocol/inspector
```

### Usage

1. Start your Next.js development server if it's not already running:

```bash
npm run dev
```

2. In a new terminal, start the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

3. The MCP Inspector will automatically connect to your local Next.js application at `http://localhost:3000`.

4. Open the MCP Inspector in your browser at [http://localhost:3000/__mcp__](http://localhost:3000/__mcp__)

### Features
- Real-time monitoring of model interactions
- Request/response inspection
- Conversation history
- Model performance metrics

### Troubleshooting
- Ensure your Next.js app is running before starting the inspector
- If the inspector doesn't connect automatically, verify your app's URL in the inspector settings
- Check the console for any error messages

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

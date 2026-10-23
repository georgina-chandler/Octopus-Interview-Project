<img src="https://static.octopuscdn.com/constantine/constantine.svg" alt="Octopus Energy mascot, Constantine" width="100" />

# Octopus Energy Frontend code test

In this code test, you'll be asked to:

- Make a React application that follows the design in `design.jpg` and consumes the API. Even though the app is quite simple, it should be designed in a scalable and maintainable way. Ideally the app should be responsive.

We've included:

- A sample [Next.js](https://nextjs.org/) project with a Typescript setup for your convenience.
- Some CSS colour variables that match the colours in the design as guidance.
- The assets that you will need to complete the design.

## Getting started

First you'll need to install your dependencies

```sh
cd client && pnpm install
```

## Start the app

```sh
cd client && pnpm dev
```

This will do two things:

- Start a Next.js app running in development on <http://localhost:3000>
- Start a graphQL stub server running on <http://localhost:3001/graphql>

## Running tests

You can run tests from the client directory.

```sh
cd client && pnpm test
```

## Basket API (full-stack)

The provided GraphQL stub is enough to complete the task above. As this is a full-stack role, we'd also like to see how you'd shape the API for a real basket. Please include a GraphQL schema for the basket operations you'd expect, such as fetching a basket and adding, updating or removing items.

Implementing it is optional, in any language or framework you like. The stub is generic CRUD and can't host custom logic, so run your own server alongside it or replace it, but keep serving `products`. If you don't implement it, briefly explain in your README how you'd build and persist it in production.

In your README, note where responsibilities sit (e.g. totals, validation) and any performance and security considerations.

## What we're looking for

We want to see how you approach this problem in a real-world scenario. Consider how your solution scales, handles edge cases, and anticipates future requirements in a production environment.

We would like you to demonstrate your ability to:

- Reason through a programming problem
- Proficiently use Nextjs and Typescript
- Implement a visual design accurately
- Implement some user interactions
- Write production-ready code for a high traffic app
- Design a clear API contract, with sound front-end/back-end responsibilities and awareness of performance and security
- Write tests that document and safeguard the program's behaviour
- Use a version control system (e.g. git) to effectively convey intent

Best of luck!

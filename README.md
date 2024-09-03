# Hello Kasten

A chat bot for Veeam Kasten that uses custom data uploaded to the OpenAI Assistant API.
I scraped data from the [Veeam Kasten documentation](https://docs.kasten.io/docs/kasten-platform/data-sources/veeam-kasten-data-sources/) and other public facing sources.

Ask it question about using the Kasten Data Management Platform and it will respond with the relevant information.

## Getting Started

First, you'll need to get an OpenAI API key. You can get one [here](https://platform.openai.com/account/api-keys).

Once you have your API key, copy the `.env-example` file to `.env` and replace the `OPENAI_API_KEY` value with your actual API key.

## Install the Dependencies

```sh
pnpm install
```

## Start the Frontend

```sh
pnpm dev
```

## Start the Backend

```sh
pnpm dev:server
```

Visit http://localhost:5173 to see the chatbot in action.

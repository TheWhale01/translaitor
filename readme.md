# Translaitor

This is a simple translator application built using [Svelte](https://svelte.dev/), [Gemini](https://gemini.google.com/) and [SkeletonUI](https://skeleton.dev/). That can be used to translate books from one language to another. It is designed to be user-friendly and easy to use.

## Setup

Before starting, make sure you have Docker installed on your system. And you will also need a gemini api key to make this work.

```bash
echo "GOOGLE_TRANSLATE_API_KEY=your_api_key_here" >> app/.env
docker compose up --build -d
```

## Todo

- [ ] Refactor the Language Selection component
- [ ] Add error handling
- [ ] Check if the server splits the book by paragraph
- [ ] Change the output directory to a more appropriate location
- [ ] Add support for multiple gemini api keys
- [ ] Make this a NixOS package
- [ ] The server compresses the book every time a translation is made
- [ ] Notification system
- [ ] Check if a translation is already being processed
- [ ] The percentage of the progress bar is wrong
- [ ] Change the book name by the original title + ({language} AI translated)
- [ ] Prettier configuration for code formatting
- [ ] Get the supported languages from the gemini api

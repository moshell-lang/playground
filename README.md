moshell-playground
==================

An interactive playground for the [Moshell](https://github.com/moshell-lang/moshell) scripting language.

The frontend consists in a few static assets to write code and to see the result. The backend servers execute it in a sandboxed environment and stream the result.

Use locally
===========

Build the image and start a container:

```sh
cd backend
docker build -t kronoss:0.1 .
docker run -it --privileged --rm -p 3000:3000 kronoss:0.1
```

Prepare the frontend:

```sh
cd frontend
pnpm install # Or your favorite package manager (npm, yarn, bun...)
pnpm run dev # Start a development server
# pnpm run build # Bundle assets
```

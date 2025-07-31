#!/bin/bash

# Dev server
npm install
npm run dev -- --host ${HOST} --port ${PORT}

# Prod server
npm run build
node server.js

# Voice Activated Recipe Finder

## Introduction
The Voice Activated Recipe Finder is a Chrome extension that allows users to search for recipes using voice commands. This project is built using Flask for the backend and JavaScript for the Chrome extension.

## Features
- Voice recognition to capture user's spoken ingredients.
- Fetches recipes based on the identified ingredients, continents, and sub-regions.
- Displays a list of recipes in the Chrome extension popup.

## Installation
1. Clone the repository.
2. Install the required dependencies for the Flask backend.
3. Load the extension in Chrome.

## Usage
- Click on the extension icon in Chrome.
- Start recording your voice by clicking the "Start Recording" button.
- Speak out the ingredients or cuisines you're interested in.
- Stop the recording and wait for the recipes to be displayed.

## File Structure
- `app.py`: Flask backend server.
- `background.js`: Background script for the Chrome extension.
- `popup.css`: Styles for the popup interface.
- `popup.html`: HTML for the popup interface.
- `popup.js`: JavaScript for handling the popup's functionality.
- `manifest.json`: Chrome extension manifest file.

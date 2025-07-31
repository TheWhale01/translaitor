# Translaitor 📚

AI-powered book translation web application that translates entire EPUB books using Google's Gemini AI API.

## Features

- **Drag & Drop Upload**: Simply drop your EPUB file onto the web interface
- **Real-time Progress**: Live progress tracking with WebSocket updates
- **Multi-language Support**: Translate between 19+ languages
- **Concurrent Protection**: Prevents multiple simultaneous translations
- **Responsive Design**: Works on desktop and mobile devices
- **Chapter-by-chapter Translation**: Maintains book structure and formatting

## Prerequisites

- **Node.js** - [website](https://nodejs.org/en)
- **Google Gemini API Key** - Get yours at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **EPUB files** - Valid EPUB format books

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd translaitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Build and start the application**
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm run preview
   ```

## Usage

### Basic Translation

1. **Upload Book**: Drag and drop your EPUB file or click to browse
2. **Select Languages**: Choose source language (or auto-detect) and target language
3. **Start Translation**: Click "Start Translation" to begin the process
4. **Monitor Progress**: Watch real-time progress updates
5. **Download Result**: Download your translated book when complete

### Translation Process

The application follows these steps:

1. **Extract**: Unpack the EPUB file structure
2. **Parse**: Extract text content from each chapter
3. **Translate**: Send paragraphs to Gemini AI for translation
4. **Build**: Reconstruct the EPUB with translated content
5. **Complete**: Make the translated file available for download

### Progress Tracking

- Real-time progress bar showing completion percentage
- Current chapter and paragraph counters
- Translation status updates
- Estimated time remaining
- Error handling and recovery

## Technology Stack

### Frontend
- **SvelteKit**: Full-stack web framework
- **TypeScript**: Type-safe JavaScript
- **SocketIO**: Real-time communication
- **SkeletonUI**: Custom responsive styling

### Backend
- **Node.js**: Server runtime
- **SvelteKit**: Server-side rendering and API routes
- **WebSocket**: Real-time updates

### Libraries
- **@google/genai**: Gemini AI integration
- **jszip**: ZIP file manipulation
- **socketio**: WebSocket server

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run check`: Type checking
- `npm run lint`: Code linting
- `npm run format`: Code formatting

## Performance

- **Concurrent translations**: Limited to 1 at a time
- **Translation speed**: 1 paragraph every 5 seconds (for free tier at google)

**Note**: This application requires a valid Google Gemini API key to function. Translation quality and speed depend on the Gemini AI service availability and performance.

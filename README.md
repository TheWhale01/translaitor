# Translaitor 📚

AI-powered book translation web application that translates entire EPUB books using Google's Gemini AI API.

## Features

- **Drag & Drop Upload**: Simply drop your EPUB file onto the web interface
- **Real-time Progress**: Live progress tracking with WebSocket updates
- **Multi-language Support**: Translate between 19+ languages
- **Concurrent Protection**: Prevents multiple simultaneous translations
- **Auto-cleanup**: Automatically removes old files after 24 hours
- **Responsive Design**: Works on desktop and mobile devices
- **Chapter-by-chapter Translation**: Maintains book structure and formatting
- **Download Management**: Secure file download with automatic cleanup

## Supported Languages

- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean, Chinese, Arabic, Hindi
- Turkish, Polish, Dutch, Swedish, Danish, Norwegian, Finnish

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **Google Gemini API Key** - Get yours at [Google AI Studio](https://makersuite.google.com/app/apikey)
- **EPUB files** - Valid EPUB format books (max 50MB)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd translaitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Create required directories**
   ```bash
   mkdir -p uploads output cache
   ```

5. **Build and start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm run preview
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5173` (dev) or `http://localhost:4173` (preview)

## Usage

### Basic Translation

1. **Select Languages**: Choose source language (or auto-detect) and target language
2. **Upload Book**: Drag and drop your EPUB file or click to browse
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

## API Endpoints

### POST `/api/translate`
Start a new translation job
- **Body**: FormData with `file`, `targetLanguage`, `sourceLanguage`
- **Response**: Translation job status
- **Status Codes**: 200 (success), 400 (bad request), 409 (translation in progress), 500 (error)

### GET `/api/translate`
Get current translation status
- **Response**: Current translation state and progress
- **Status Codes**: 200 (success), 500 (error)

### GET `/api/download`
Download translated file
- **Query Params**: `id` (translation ID), `file` (filename)
- **Response**: EPUB file download
- **Status Codes**: 200 (success), 404 (not found), 410 (expired), 500 (error)

### DELETE `/api/download`
Delete translated file
- **Query Params**: `id` (translation ID), `file` (filename)
- **Response**: Deletion confirmation
- **Status Codes**: 200 (success), 404 (not found), 500 (error)

## WebSocket Events

### Client → Server
- `ping`: Connection keepalive
- `pong`: Response to server ping

### Server → Client
- `progress`: Translation progress updates
- `status`: Translation status changes
- `error`: Error notifications
- `ping`: Connection keepalive

## Technology Stack

### Frontend
- **SvelteKit**: Full-stack web framework
- **TypeScript**: Type-safe JavaScript
- **WebSocket**: Real-time communication
- **CSS**: Custom responsive styling

### Backend
- **Node.js**: Server runtime
- **SvelteKit**: Server-side rendering and API routes
- **WebSocket**: Real-time updates
- **Multer**: File upload handling

### Libraries
- **@google/generative-ai**: Gemini AI integration
- **epub2**: EPUB file processing
- **jszip**: ZIP file manipulation
- **ws**: WebSocket server
- **uuid**: Unique ID generation

## Project Structure

```
translaitor/
├── src/
│   ├── lib/
│   │   ├── translationService.ts    # Core translation logic
│   │   ├── websocketService.ts      # Server WebSocket handling
│   │   └── clientWebSocket.ts       # Client WebSocket service
│   ├── routes/
│   │   ├── api/
│   │   │   ├── translate/+server.ts # Translation API
│   │   │   └── download/+server.ts  # Download API
│   │   ├── +layout.svelte          # App layout
│   │   └── +page.svelte            # Main page
│   ├── app.html                    # HTML template
│   ├── app.d.ts                    # Type definitions
│   └── hooks.server.ts             # Server hooks
├── static/                         # Static assets
├── uploads/                        # Temporary uploads
├── output/                         # Generated files
├── cache/                          # Cache directory
└── package.json                    # Dependencies
```

## Development

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run check`: Type checking
- `npm run lint`: Code linting
- `npm run format`: Code formatting

### Environment Variables
```env
# Required
GEMINI_API_KEY=your_api_key

# Optional
PORT=3000
HOST=localhost
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
OUTPUT_DIR=output
```

### Development Tips
- Use browser DevTools to monitor WebSocket connections
- Check server logs for translation progress
- Files are automatically cleaned up after 24 hours
- Rate limiting prevents API abuse

## Troubleshooting

### Common Issues

**"Translation service not configured"**
- Ensure GEMINI_API_KEY is set in your .env file
- Verify the API key is valid and has quota remaining

**"File upload failed"**
- Check file size (max 50MB)
- Ensure file is a valid EPUB format
- Verify upload directory permissions

**"WebSocket connection failed"**
- Check if port is available
- Verify firewall settings
- Try refreshing the page

**"Translation stuck or failed"**
- Check server logs for detailed errors
- Verify internet connection
- Ensure Gemini API is accessible

### Debugging

1. **Enable debug logging**
   ```env
   DEBUG=true
   NODE_ENV=development
   ```

2. **Check server logs**
   ```bash
   # Development
   npm run dev
   
   # Production logs
   pm2 logs translaitor
   ```

3. **Monitor WebSocket connections**
   - Open browser DevTools
   - Go to Network tab
   - Filter by WS (WebSocket)

## Security Considerations

- API keys are server-side only
- File uploads are validated and sanitized
- Directory traversal protection
- Automatic file cleanup
- Rate limiting on API endpoints
- WebSocket connection limits

## Performance

- **Concurrent translations**: Limited to 1 at a time
- **File size limit**: 50MB maximum
- **Translation speed**: ~1-3 paragraphs per second
- **Resource usage**: Moderate CPU and memory
- **Network**: Depends on API response times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow existing formatting conventions
- Add JSDoc comments for public APIs
- Test your changes thoroughly

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for translation capabilities
- SvelteKit team for the excellent framework
- epub2 library for EPUB processing
- WebSocket community for real-time updates

---

**Note**: This application requires a valid Google Gemini API key to function. Translation quality and speed depend on the Gemini AI service availability and performance.
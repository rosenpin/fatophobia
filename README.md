# Body Perception Assessment

A web-based interactive assessment tool that measures users' tendencies in perceiving body images. Built with vanilla JavaScript and deployed on Cloudflare Pages with Workers for backend functionality.

## Features

- **Interactive Assessment**: Users classify 12 body images in randomized order
- **Multiple Input Methods**: Button clicks, keyboard navigation (←/→), and touch gestures
- **Responsive Design**: Optimized for mobile and desktop with smooth animations
- **Results Analysis**: Visual grids showing classifications and percentile ranking
- **PWA Support**: Installable web app with offline capabilities
- **Real-time Analytics**: Server-side data collection and percentile calculations

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare KV storage
- **Hosting**: Cloudflare Pages
- **PWA**: Service Worker for offline functionality

## Setup and Deployment

### Prerequisites

1. Node.js (v16 or higher)
2. Cloudflare account
3. Wrangler CLI installed globally:
   ```bash
   npm install -g wrangler
   ```

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Cloudflare KV namespace**:
   ```bash
   wrangler kv:namespace create "ASSESSMENT_DATA"
   wrangler kv:namespace create "ASSESSMENT_DATA" --preview
   ```
   
3. **Update wrangler.toml** with your KV namespace IDs

4. **Start local development**:
   ```bash
   # Start Pages development server
   npm run dev
   
   # Start Worker development (in separate terminal)
   npm run worker:dev
   ```

### Production Deployment

1. **Deploy the Worker**:
   ```bash
   npm run worker:deploy
   ```

2. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```
   
   Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

3. **Configure custom domain** (optional):
   - Set up your domain in Cloudflare Pages dashboard
   - Update `wrangler.toml` with your domain information

### Environment Configuration

Update the following files with your specific configuration:

- **wrangler.toml**: Replace placeholder domains and KV namespace IDs
- **worker.js**: Adjust scoring algorithm if needed
- **manifest.json**: Update icons and screenshots paths

## Game Flow

1. **Welcome Screen**: Brief explanation and start button
2. **Assessment Phase**: 12 randomized images with binary classification
3. **Results Screen**: 
   - Two grids showing user's classifications
   - Animated spectrum meter showing percentile ranking
   - Comparison to other users' responses

## Scoring Algorithm

The assessment uses a weighted scoring system:
- Images 1-6: Typically considered "not fat" (higher weight if marked as fat)
- Images 7-12: Typically considered "fat" (standard weight)
- Final score normalized to 0-100 range
- Percentile calculated against all user submissions

## Fallback Mode

If the server is unavailable, the app uses a local fallback:
- Default assumption: transition between images 5 and 6
- Local percentile calculation based on deviation from default
- Clear indication of offline mode in results

## Privacy and Data

- No personal information collected
- Only assessment responses and basic metadata stored
- IP addresses logged for abuse prevention only
- Data retention: 1 year maximum

## Customization

### Adding More Images

1. Add new images to `/src/` directory (numbered sequentially)
2. Update `totalImages` in `script.js`
3. Update `STATIC_ASSETS` in `sw.js`
4. Adjust scoring algorithm in `worker.js` if needed

### Modifying Categories

Update the `getCategoryFromScore()` function in `worker.js` to adjust the percentile ranges and descriptions.

### Styling Changes

All visual customization can be done through `styles.css`. The design uses CSS custom properties for easy theming.

## Browser Support

- Modern browsers with ES6+ support
- Progressive Web App features in supported browsers
- Graceful degradation for older browsers
- Touch gesture support on mobile devices

## Performance

- Optimized images and assets
- Service Worker caching for offline use
- Lazy loading and preloading strategies
- Minimal JavaScript bundle size

## License

MIT License - feel free to modify and distribute as needed.
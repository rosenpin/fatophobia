# Deployment Checklist

## Pre-deployment Steps

### 1. Cloudflare Setup

- [x] Create Cloudflare account
- [x] Install Wrangler CLI: `npm install -g wrangler`
- [x] Authenticate Wrangler: `wrangler login`

### 2. KV Storage Setup

- [x] Create KV namespace: `wrangler kv:namespace create "ASSESSMENT_DATA"`
- [x] Create preview namespace: `wrangler kv:namespace create "ASSESSMENT_DATA" --preview`
- [x] Update `wrangler.toml` with the generated namespace IDs

### 3. Domain Configuration (Optional)

- [x] Purchase/configure domain in Cloudflare
- [ ] Update `wrangler.toml` with your domain
- [ ] Update `_headers` file if using custom domain

### 4. Asset Preparation

- [ ] Ensure all 12 images (1.png - 12.png) are in `/src/` directory
- [ ] Create PWA icons (icon-192.png, icon-512.png) in root directory
- [ ] Create screenshots for app store listings (optional)

## Deployment Commands

### Worker Deployment

```bash
# Deploy to production
wrangler deploy

# Deploy to staging
wrangler deploy --env staging
```

### Pages Deployment

```bash
# Direct deployment
wrangler pages deploy .

# Or connect GitHub repository for automatic deployments
```

## Post-deployment Verification

### 1. Frontend Testing

- [ ] Visit deployed URL
- [ ] Test welcome screen loads correctly
- [ ] Verify all 12 images load properly
- [ ] Test button interactions (Not Fat / Fat)
- [ ] Test keyboard controls (← / →)
- [ ] Test swipe gestures on mobile
- [ ] Verify progress bar updates
- [ ] Check results screen displays correctly
- [ ] Test spectrum meter animation

### 2. Backend Testing

- [ ] Complete full assessment to test API submission
- [ ] Verify data is stored in KV namespace
- [ ] Check percentile calculation works
- [ ] Test fallback mode (disconnect network)
- [ ] Validate CORS headers work correctly

### 3. PWA Testing

- [ ] Verify manifest.json loads
- [ ] Test "Add to Home Screen" functionality
- [ ] Check offline functionality
- [ ] Verify service worker caching

### 4. Performance Testing

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test loading speed on mobile/desktop
- [ ] Verify image optimization

### 5. Cross-browser Testing

- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

## Monitoring & Analytics

### 1. Cloudflare Analytics

- [ ] Monitor Worker invocations
- [ ] Check error rates
- [ ] Review performance metrics

### 2. KV Storage Monitoring

- [ ] Monitor storage usage
- [ ] Check read/write operations
- [ ] Verify data retention

### 3. User Analytics (Optional)

- [ ] Set up Google Analytics or similar
- [ ] Track completion rates
- [ ] Monitor user flow

## Troubleshooting

### Common Issues

1. **Images not loading**: Check file paths and case sensitivity
2. **API not working**: Verify Worker deployment and KV bindings
3. **CORS errors**: Check Worker CORS headers configuration
4. **PWA not installing**: Verify manifest.json and HTTPS
5. **Swipe not working**: Check touch event handlers and CSS

### Debug Commands

```bash
# Check Worker logs
wrangler tail

# Test KV storage
wrangler kv:key list --binding=ASSESSMENT_DATA

# Preview deployment
wrangler pages dev .
```

## Security Considerations

- [ ] Verify no sensitive data in client-side code
- [ ] Check Content Security Policy headers
- [ ] Review data collection practices
- [ ] Ensure HTTPS-only deployment
- [ ] Validate input sanitization in Worker

## Performance Optimization

- [ ] Enable Cloudflare caching for static assets
- [ ] Compress images if needed
- [ ] Minimize JavaScript bundle size
- [ ] Enable Brotli compression
- [ ] Set appropriate cache headers

## Backup & Recovery

- [ ] Export KV data regularly
- [ ] Keep deployment configurations in version control
- [ ] Document rollback procedures
- [ ] Monitor for data loss

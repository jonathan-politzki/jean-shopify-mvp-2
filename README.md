# Twitter Product Recommendations App - Development Context

## Project Overview
This is a Shopify app that allows merchants to connect their customers' Twitter profiles to provide personalized product recommendations. The app currently has a basic frontend UI with a floating button and popup dialog for Twitter profile connection.

## Current Structure

### App Configuration
- **shopify.app.toml**: Main app configuration
  ```toml
  name = "jean-mvp-2"
  type = "theme"
  ```

### Theme App Extension
Location: `extensions/jean-extension-mvp/`

#### Configuration
**shopify.extension.toml**:
```toml
name = "jean-extension-mvp"
type = "theme"

extension_points = [
  'Product.Layout.Start',
  'Product.Layout.End',
  'Cart.Lines.Start',
  'Cart.Lines.End'
]

[capabilities]
api_access = true
network_access = true

[settings]
heading = { type = "text", label = "Heading", default = "My Extension" }
```

#### Frontend Components

1. **Main Block** (`blocks/twitter-recommendations.liquid`):
```liquid
{% schema %}
{
  "name": "Twitter Connect",
  "target": "body",
  "stylesheet": "twitter-popup.css",
  "javascript": "twitter-popup.js",
  "settings": [
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Connect Twitter"
    }
  ]
}
{% endschema %}

<div class="twitter-widget" id="twitter-widget-{{ block.id }}">
  <!-- Floating Button -->
  <button type="button" class="twitter-floating-button">...</button>
  <!-- Popup Dialog -->
  <dialog id="twitter-popup" class="twitter-popup">...</dialog>
</div>
```

2. **JavaScript** (`assets/twitter-popup.js`):
- Handles popup open/close functionality
- Form submission handling
- Preliminary API integration structure
- Currently points to placeholder endpoint: `/apps/twitter-recommendations/connect`

3. **CSS** (`assets/twitter-popup.css`):
- Styling for floating button (fixed position, bottom right)
- Popup dialog styling
- Twitter-themed color scheme
- Responsive design considerations

## Key Features Implemented

1. **UI Components**:
   - Floating action button in bottom right corner
   - Modal popup dialog
   - Twitter URL input form
   - Basic error handling structure

2. **Theme Integration**:
   - Successfully integrates with Shopify theme
   - Maintains consistent styling
   - Responsive across device sizes

3. **User Interaction**:
   - Click to open popup
   - Form input for Twitter URL
   - Close button functionality
   - Click-outside-to-close behavior

## API Integration Points

Current placeholder endpoint in frontend code:
```javascript
fetch('/apps/twitter-recommendations/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ twitterUrl })
})
```

## Technical Dependencies
- Shopify App Bridge
- Shopify Admin GraphQL API access
- React framework for main app
- Liquid templating for theme extension

## Current Limitations
1. No backend implementation for Twitter URL processing
2. Placeholder API endpoints
3. No actual Twitter API integration
4. No database schema for storing connections
5. No recommendation algorithm implementation

## Next Implementation Steps Required

### Backend Development
1. Create `/apps/twitter-recommendations/connect` endpoint
2. Implement Twitter API authentication
3. Create database models for:
   - User connections
   - Twitter profile data
   - Product recommendations

### Frontend Enhancements
1. Add loading states
2. Implement proper error handling
3. Add success/failure notifications
4. Add Twitter profile disconnection functionality

### Data Processing
1. Implement Twitter profile analysis
2. Create recommendation algorithm
3. Set up caching mechanism for recommendations

## Development Environment
- App is currently set up as a development store app
- Theme app extension is properly configured
- Local development server runs on custom port
- Uses Shopify CLI for deployment

## Deployment Information
- Development store URL: jean-personalization.myshopify.com
- App deployed through Shopify Partners dashboard
- Theme app extension deployed via CLI

## Security Considerations for Implementation
1. Implement CSRF protection
2. Add rate limiting
3. Secure Twitter API credentials
4. Validate Twitter URLs
5. Implement proper error logging

## Testing Requirements
1. Unit tests for Twitter URL processing
2. Integration tests for API endpoints
3. UI component testing
4. Cross-browser compatibility testing
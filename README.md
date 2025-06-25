# Iran Protest Interactive Map

An interactive map showing protests in Iran with video evidence and detailed information.

## Environment Setup

This project uses environment variables to manage sensitive configuration. Before running the application, you need to set up your environment variables.

### Required Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values in your `.env` file:

   ```env
   # Mapbox Configuration
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   
   # Google Sheets Configuration
   VITE_GOOGLE_SHEETS_URL=your_google_sheets_url_here
   VITE_STATISTICS_SHEETS_URL=your_statistics_sheets_url_here
   ```

### Getting API Keys

#### Mapbox Token
1. Create an account at [mapbox.com](https://www.mapbox.com/)
2. Go to your [account page](https://account.mapbox.com/access-tokens/)
3. Create a new access token with the appropriate scopes
4. Add your domain to the token restrictions for security

#### Google Sheets URLs
If you're using Google Sheets as a data source:
1. Make your Google Sheet public
2. Get the published CSV URL from Google Sheets
3. Use the URL in your environment variables

## Security Notes

⚠️ **Important Security Information:**

- Environment variables in React applications are **still visible in the final bundle** sent to browsers
- The `.env` approach helps keep secrets out of your source code repository
- For true security, sensitive operations should be handled by a backend API
- Mapbox tokens can be restricted by domain for additional security
- Never commit your `.env` file to version control (it's already in `.gitignore`)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Never include your `.env` file in your deployment
3. Consider using domain restrictions on your Mapbox token
4. Monitor your API usage for any suspicious activity

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make sure to update `.env.example` if you add new environment variables
4. Submit a pull request

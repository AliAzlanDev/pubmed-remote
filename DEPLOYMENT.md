# Deployment Guide for PubMed MCP Server

## Render.com Deployment (Step-by-Step)

### Prerequisites
- GitHub account
- Render.com account (free tier available)
- Git installed on your computer

### Step 1: Prepare Your Repository

1. **Clone or Fork this repository**
   ```bash
   git clone <repository-url>
   cd pubmed-mcp-remote
   ```

2. **Verify files are present**
   ```bash
   ls -la
   # Should see: render.yaml, package.json, src/, dist/ (after build)
   ```

3. **Push to your GitHub repository** (if you cloned)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pubmed-mcp-remote.git
   git push -u origin main
   ```

### Step 2: Deploy to Render.com

1. **Sign in to Render.com**
   - Go to https://render.com
   - Sign up or log in with GitHub

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub account if not already connected

3. **Select Repository**
   - Find and select your `pubmed-mcp-remote` repository
   - Click "Connect"

4. **Configure Service** (Render auto-detects render.yaml)
   - **Name**: `pubmed-mcp-server` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:remote`

5. **Set Environment Variables**
   
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   NODE_ENV = production
   MCP_TRANSPORT = sse
   PORT = 8000
   HOST = 0.0.0.0
   LOG_LEVEL = info
   NCBI_EMAIL = your-actual-email@example.com  # IMPORTANT: Use your real email!
   ```

6. **Create Web Service**
   - Review settings
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)

### Step 3: Verify Deployment

1. **Check Health Endpoint**
   ```bash
   curl https://your-service-name.onrender.com/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "service": "pubmed-mcp-server",
     "version": "1.0.2",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **Check Logs**
   - In Render dashboard, click "Logs"
   - Should see: "PubMed MCP Server v1.0.2 is running..."

### Step 4: Configure Claude Desktop

1. **Find your configuration file**
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add server configuration**
   ```json
   {
     "mcpServers": {
       "pubmed-remote": {
         "url": "https://your-service-name.onrender.com/sse"
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close completely
   - Reopen
   - Check for MCP server icon (🔌) in interface

4. **Test the connection**
   ```
   Ask Claude: "Search PubMed for recent COVID-19 vaccine studies"
   ```

## Troubleshooting

### Issue: Deployment fails

**Problem**: Build or start command fails

**Solutions**:
1. Check build logs in Render dashboard
2. Verify `package.json` has correct dependencies
3. Ensure Node.js version is 18+ (check in render.yaml)
4. Try manual build locally:
   ```bash
   npm install
   npm run build
   ```

### Issue: Health check fails

**Problem**: `/health` endpoint returns error

**Solutions**:
1. Verify `PORT` environment variable is set to `8000`
2. Check `HOST` is set to `0.0.0.0`
3. Ensure `MCP_TRANSPORT=sse` is set
4. Check logs for startup errors

### Issue: Claude can't connect to server

**Problem**: Claude Desktop shows connection error

**Solutions**:
1. Verify URL in config is correct (should end with `/sse`)
2. Check service is running in Render dashboard
3. Test health endpoint manually
4. Restart Claude Desktop
5. Check for typos in configuration JSON

### Issue: NCBI API errors

**Problem**: "Failed to fetch from PubMed" errors

**Solutions**:
1. Verify `NCBI_EMAIL` is set to a real email address
2. Check if NCBI is experiencing downtime: https://www.ncbi.nlm.nih.gov/
3. Review rate limiting (wait a few seconds between requests)
4. Check NCBI_EMAIL format is valid

### Issue: Slow response times

**Problem**: Searches take too long

**Solutions**:
1. Reduce `maxResults` parameter in searches
2. Use more specific search queries
3. Check Render service region (choose closest)
4. Consider upgrading Render plan for better performance
5. Monitor Render resource usage

### Issue: Service goes to sleep (Free tier)

**Problem**: First request after inactivity is slow

**Solutions**:
1. Render free tier services sleep after 15 minutes
2. Upgrade to paid plan for always-on service
3. Use external monitor service (e.g., UptimeRobot)
4. Set up cron job to ping health endpoint every 10 minutes

## Alternative Deployment Platforms

### Heroku

```bash
# Install Heroku CLI
# heroku login
heroku create pubmed-mcp-server
heroku config:set MCP_TRANSPORT=sse
heroku config:set NCBI_EMAIL=your-email@example.com
git push heroku main
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm install && npm run build`
4. Set run command: `npm run start:remote`

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Railway auto-detects Node.js and deploys

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV MCP_TRANSPORT=sse
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["npm", "run", "start:remote"]
```

Build and run:
```bash
docker build -t pubmed-mcp-server .
docker run -p 8000:8000 \
  -e NCBI_EMAIL=your-email@example.com \
  -e MCP_TRANSPORT=sse \
  pubmed-mcp-server
```

## Performance Optimization

### 1. Enable Caching

Add Redis for result caching (future enhancement):
```javascript
// Cache search results for 1 hour
const CACHE_TTL = 3600;
```

### 2. Connection Pooling

For high-traffic deployments, consider:
- Load balancer
- Multiple instances
- CDN for static assets

### 3. Monitoring

Set up monitoring with:
- Render built-in metrics
- External services (DataDog, New Relic)
- Custom logging

### 4. Rate Limiting

Implement client-side rate limiting:
```javascript
// Max 10 requests per minute per client
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000; // 1 minute
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Render's encrypted environment variables
   - Rotate sensitive values regularly

2. **API Keys**
   - Use NCBI API key for higher rate limits (optional)
   - Store in environment variables only

3. **CORS Configuration**
   - Restrict origins in production
   - Use allowlist for trusted domains

4. **Input Validation**
   - All user inputs are validated
   - Zod schemas enforce type safety

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   git commit -am "Update dependencies"
   git push
   ```

2. **Monitor Logs**
   - Check Render logs weekly
   - Look for error patterns
   - Monitor API rate limits

3. **Test Functionality**
   - Run test searches monthly
   - Verify all tools work correctly
   - Check health endpoint

4. **Review Performance**
   - Check response times
   - Monitor resource usage
   - Optimize slow queries

## Support Resources

- **Render Documentation**: https://render.com/docs
- **NCBI E-utilities**: https://www.ncbi.nlm.nih.gov/books/NBK25497/
- **MCP SDK**: https://modelcontextprotocol.io/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

## Cost Estimation

### Render.com Free Tier
- ✅ 750 hours/month of service runtime
- ✅ Service sleeps after 15 minutes of inactivity
- ✅ Perfect for testing and light usage

### Render.com Starter ($7/month)
- ✅ Always-on service
- ✅ 512 MB RAM
- ✅ Good for moderate usage

### Render.com Standard ($25/month)
- ✅ 2 GB RAM
- ✅ Better performance
- ✅ Production-ready

## Next Steps

After successful deployment:

1. ✅ Test all tools from Claude Desktop
2. ✅ Monitor initial usage and performance
3. ✅ Set up monitoring/alerting (optional)
4. ✅ Share service URL with team members
5. ✅ Consider upgrading plan based on usage

## Questions?

If you encounter issues not covered here:
1. Check Render logs for error messages
2. Review NCBI API documentation
3. Open GitHub issue with details
4. Contact support channels

Happy deploying! 🚀

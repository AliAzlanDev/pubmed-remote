# PubMed MCP Server - Remote Edition

A comprehensive Model Context Protocol (MCP) server for PubMed database access, optimized for deployment on render.com and other cloud platforms. This server provides advanced biomedical literature search, retrieval, and analysis capabilities through both local (stdio) and remote (SSE/HTTP) transports.

## 🚀 Features

### 🔧 Tools

- **`search_pubmed`**: Search PubMed with comprehensive summaries and metadata
- **`get_full_abstract`**: Retrieve complete abstracts by PMID
- **`get_full_text`**: Extract full text from PMC open access articles
- **`export_ris`**: Export citations in RIS format for reference managers
- **`get_citation_counts`**: Analyze citation metrics using NCBI elink API
- **`optimize_search_query`**: Transform natural language to optimized PubMed queries with MeSH terms
- **`find_similar_articles`**: Find similar articles using NCBI's similarity algorithm
- **`batch_process`**: Process multiple PMIDs with multiple operations efficiently

### 🌐 Deployment Modes

- **Local Mode**: Traditional stdio transport for Claude Desktop
- **Remote Mode**: SSE/HTTP transport for cloud deployment (render.com, etc.)

## 📋 Prerequisites

- Node.js v18.x or higher
- npm or yarn package manager
- (Optional) render.com account for cloud deployment

## 🎯 Installation & Usage

### Option 1: Deploy to Render.com (Recommended for Remote Access)

1. **Fork or clone this repository**

2. **Connect to Render.com**
   - Sign up at [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   MCP_TRANSPORT=sse
   PORT=8000
   HOST=0.0.0.0
   LOG_LEVEL=info
   NCBI_EMAIL=your-email@example.com
   ```

4. **Deploy**
   - Render will automatically detect `render.yaml` and deploy
   - Your service URL will be: `https://pubmed-mcp-server.onrender.com`

5. **Add to Claude Desktop**

Add to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pubmed-remote": {
      "url": "https://your-service-name.onrender.com/sse"
    }
  }
}
```

### Option 2: Local Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd pubmed-mcp-remote
npm install
npm run build
```

2. **Configure for Local Mode**

Add to Claude Desktop configuration:

```json
{
  "mcpServers": {
    "pubmed": {
      "command": "node",
      "args": ["/path/to/pubmed-mcp-remote/dist/index.js"],
      "env": {
        "NCBI_EMAIL": "your-email@example.com"
      }
    }
  }
}
```

### Option 3: Development Mode

```bash
# Local stdio mode
npm run dev

# Remote SSE mode
MCP_TRANSPORT=sse npm run dev
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `MCP_TRANSPORT` | Transport mode (`sse` or `stdio`) | `stdio` | No |
| `PORT` | Server port (remote mode only) | `8000` | No |
| `HOST` | Server host (remote mode only) | `0.0.0.0` | No |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` | No |
| `NCBI_EMAIL` | Email for NCBI API (required by NCBI) | `user@example.com` | **Yes** |
| `MAX_RESULTS` | Maximum search results | `100` | No |
| `REQUEST_TIMEOUT` | API timeout in milliseconds | `30000` | No |

### Transport Modes

#### Stdio Mode (Local)
- Traditional MCP transport for local Claude Desktop
- Activated by default or when `MCP_TRANSPORT=stdio`
- Communication via stdin/stdout

#### SSE Mode (Remote)
- HTTP/SSE transport for remote deployment
- Activated when `MCP_TRANSPORT=sse` or `--remote` flag
- Provides HTTP endpoints:
  - `/sse` - SSE connection endpoint
  - `/health` - Health check endpoint
  - `/message` - Client-to-server messaging

## 🔍 Example Usage

### 1. Query Optimization
```
Input: "covid vaccine effectiveness in elderly"
→ Output: Optimized PubMed query with MeSH terms
```

### 2. Literature Search
```
Tool: search_pubmed
Query: "diabetes treatment 2023"
Max Results: 10
→ Returns: Detailed articles with abstracts and metadata
```

### 3. Citation Analysis
```
Tool: get_citation_counts
PMIDs: ["36038128", "30105375"]
→ Returns: Citation counts and citing articles
```

### 4. Batch Processing
```
Tool: batch_process
PMIDs: ["36038128", "35105375", "34567890"]
Operations: ["abstract", "citations", "similar"]
→ Returns: Comprehensive analysis of all articles
```

## 📊 API Limits

| Operation | Limit | Notes |
|-----------|-------|-------|
| Search results | 100 articles | Per query |
| Full abstracts | 20 PMIDs | Per request |
| Full text | 10 PMC articles | Per request |
| Citation analysis | 20 PMIDs | Per request |
| RIS export | 50 PMIDs | Per batch |
| Similar articles | 50 articles | Per PMID (default: 10) |
| Batch processing | 50 PMIDs | Per batch, 5 concurrent ops |
| API delays | 200-600ms | Between requests |

## 🛡️ Rate Limiting & Best Practices

1. **NCBI Guidelines Compliance**
   - Always provide a valid email address in `NCBI_EMAIL`
   - Respect API rate limits (3 requests/second without API key)
   - Use delays between requests (automatically handled)

2. **Error Handling**
   - Network connectivity issues
   - Invalid PMIDs or queries
   - API timeouts
   - Missing full text content

3. **Performance Optimization**
   - Use batch processing for multiple articles
   - Cache results when possible
   - Use query optimization for better search results

## 🏗️ Project Structure

```
pubmed-mcp-remote/
├── src/
│   ├── index.ts           # Main server with dual transport support
│   └── pubmed-api.ts      # PubMed API integration
├── dist/                  # Compiled JavaScript output
├── render.yaml            # Render.com deployment config
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔧 Development

### Build
```bash
npm run build
```

### Run Locally (stdio)
```bash
npm start
```

### Run as Remote Server (SSE)
```bash
npm run start:remote
# or
MCP_TRANSPORT=sse npm start
```

### Clean Build
```bash
npm run clean
```

## 🚀 Deployment

### Render.com

The repository includes a `render.yaml` file for automatic deployment:

1. Push your code to GitHub
2. Connect repository to Render
3. Render automatically deploys using `render.yaml`
4. Update environment variables in Render dashboard

### Other Platforms

For deployment to other platforms (Heroku, AWS, DigitalOcean, etc.):

1. Set `MCP_TRANSPORT=sse` environment variable
2. Set `PORT` to platform-required value
3. Run `npm run build && npm run start:remote`

## 📖 MeSH Term Optimization

The server includes extensive medical term mappings:

- **COVID-19 & Vaccines**: covid, coronavirus, vaccination
- **Cardiovascular**: heart attack, myocardial infarction
- **Cancer**: tumor, oncology, carcinoma
- **Mental Health**: depression, anxiety
- **Study Types**: clinical trial, meta-analysis, RCT
- **Treatment Types**: therapy, surgery, medication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both local and remote modes)
5. Submit a pull request

## 📝 Version History

### v1.0.2 (Current)
- ✨ Added remote/SSE transport support
- 🌐 Render.com deployment configuration
- 🔧 Environment variable configuration
- 📊 Health check endpoint
- ⚡ Dual mode support (stdio/SSE)

### v1.0.1
- 🆕 Similar articles feature
- 📊 Citation analysis improvements

### v1.0.0
- 🚀 Initial release
- 📖 Core PubMed functionality

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and reproduction steps

## 🔗 Related Resources

- [NCBI E-utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25497/)
- [PubMed Search Tips](https://pubmed.ncbi.nlm.nih.gov/help/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Render.com Docs](https://render.com/docs)
- [Claude Desktop](https://claude.ai/download)

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Build project (`npm run build`)
- [ ] Set `NCBI_EMAIL` environment variable
- [ ] Choose deployment mode (local or remote)
- [ ] Configure Claude Desktop
- [ ] Test with a simple search query

## ⚡ Performance Tips

1. **Use query optimization** for better search results
2. **Batch process** when analyzing multiple articles
3. **Cache results** to avoid redundant API calls
4. **Monitor rate limits** to prevent API throttling
5. **Use specific PMIDs** when possible for faster retrieval

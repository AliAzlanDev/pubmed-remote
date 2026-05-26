#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import express from 'express'
import {
  searchPubMed,
  getArticleDetails,
  getFullAbstract,
  getFullText,
  exportRIS,
  getCitationCounts,
  optimizeSearchQuery,
  findSimilarArticles,
  batchProcess,
} from './pubmed-api.js'

// Environment configuration
const PORT = parseInt(process.env.PORT || '8000')
const HOST = process.env.HOST || '0.0.0.0'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const IS_REMOTE =
  process.env.MCP_TRANSPORT === 'sse' || process.argv.includes('--remote')

// Logging utility
function log(level: string, message: string, ...args: any[]) {
  const levels = ['debug', 'info', 'warn', 'error']
  const currentLevel = levels.indexOf(LOG_LEVEL)
  const messageLevel = levels.indexOf(level)

  if (messageLevel >= currentLevel) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args)
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'pubmed-mcp-server',
    version: '1.0.2',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
)

// Tool: Search PubMed articles
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_pubmed',
      description:
        'Search PubMed database for biomedical literature. Returns detailed article information including abstracts and PMIDs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for PubMed database',
          },
          maxResults: {
            type: 'number',
            description:
              'Maximum number of results to return (default: 10, max: 100)',
            default: 10,
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_full_abstract',
      description:
        'Get complete, untruncated abstracts for specific PubMed articles by their PMID(s).',
      inputSchema: {
        type: 'object',
        properties: {
          pmids: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Array of PubMed IDs (PMIDs) to get full abstracts for',
          },
        },
        required: ['pmids'],
      },
    },
    {
      name: 'get_full_text',
      description:
        'Get complete full text of articles from PubMed Central (PMC) by PMC ID.',
      inputSchema: {
        type: 'object',
        properties: {
          pmcIds: {
            type: 'array',
            items: { type: 'string' },
            description: "Array of PMC IDs (e.g., 'PMC1234567' or '1234567')",
          },
        },
        required: ['pmcIds'],
      },
    },
    {
      name: 'export_ris',
      description:
        'Export citations in RIS format for reference management software (Zotero, Mendeley, EndNote).',
      inputSchema: {
        type: 'object',
        properties: {
          pmids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of PMIDs to export',
          },
        },
        required: ['pmids'],
      },
    },
    {
      name: 'get_citation_counts',
      description:
        'Analyze citation metrics and find citing articles using NCBI elink API.',
      inputSchema: {
        type: 'object',
        properties: {
          pmids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of PMIDs to analyze',
          },
        },
        required: ['pmids'],
      },
    },
    {
      name: 'optimize_search_query',
      description:
        'Transform natural language queries into optimized PubMed searches with MeSH terms and field tags.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language search query to optimize',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'find_similar_articles',
      description:
        "Find articles similar to a given PMID using NCBI's similarity algorithm.",
      inputSchema: {
        type: 'object',
        properties: {
          pmid: {
            type: 'string',
            description: 'PMID to find similar articles for',
          },
          maxResults: {
            type: 'number',
            description:
              'Maximum number of similar articles to return (default: 10, max: 50)',
            default: 10,
          },
        },
        required: ['pmid'],
      },
    },
    {
      name: 'batch_process',
      description:
        'Process multiple PMIDs with multiple operations efficiently for bulk analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          pmids: {
            oneOf: [
              { type: 'array', items: { type: 'string' } },
              { type: 'string' },
            ],
            description: 'Array of PMIDs or comma-separated string',
          },
          operations: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'abstract',
                'citations',
                'similar',
                'ris_export',
                'full_text',
              ],
            },
            description: 'Operations to perform on each PMID',
          },
          maxConcurrency: {
            type: 'number',
            description: 'Maximum concurrent operations (default: 3, max: 5)',
            default: 3,
          },
        },
        required: ['pmids', 'operations'],
      },
    },
  ],
}))

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params

    log('info', `Tool called: ${name}`)

    switch (name) {
      case 'search_pubmed': {
        const { query, maxResults = 10 } = args as {
          query: string
          maxResults?: number
        }
        const limitedMax = Math.min(maxResults, 100)

        const searchResult = await searchPubMed(query, limitedMax)

        if (searchResult.idList.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No articles found for query: "${query}"\n\nTotal search hits: ${searchResult.count}`,
              },
            ],
          }
        }

        const articles = await getArticleDetails(searchResult.idList)

        const formattedResults = articles
          .map((article, index) => {
            const authorsText =
              article.authors.length > 0
                ? article.authors.slice(0, 3).join(', ') +
                  (article.authors.length > 3 ? ', et al.' : '')
                : 'Unknown authors'

            let result = `**${index + 1}. ${article.title}**\n`
            result += `Authors: ${authorsText}\n`
            result += `Journal: ${article.journal}\n`
            result += `Publication Date: ${article.publicationDate}\n`
            result += `PMID: ${article.pmid}\n`

            if (article.doi) result += `DOI: ${article.doi}\n`
            if (article.pmcId) result += `PMC ID: ${article.pmcId}\n`

            result += `URL: ${article.url}\n`

            if (article.abstract) {
              const truncatedAbstract =
                article.abstract.length > 500
                  ? article.abstract.substring(0, 500) +
                    '... (Use get_full_abstract for complete abstract)'
                  : article.abstract
              result += `\nAbstract: ${truncatedAbstract}\n`
            }

            return result
          })
          .join('\n' + '='.repeat(80) + '\n\n')

        const pmids = articles.map((a) => a.pmid)

        let searchSummary = `📊 **Search Results Summary**\n`
        searchSummary += `Query: "${query}"\n`
        searchSummary += `Total articles found: **${searchResult.count.toLocaleString()}**\n`
        searchSummary += `Showing: **${articles.length}** articles (requested: ${limitedMax})\n`

        if (searchResult.queryTranslation) {
          searchSummary += `Query translation: ${searchResult.queryTranslation}\n`
        }

        searchSummary += `\nPMIDs: ${pmids.join(', ')}\n`

        return {
          content: [
            {
              type: 'text',
              text: `${searchSummary}\n${'='.repeat(100)}\n\n${formattedResults}\n\n💡 Use get_full_abstract with PMIDs for complete abstracts\n💡 Use get_full_text with PMC IDs for full article text`,
            },
          ],
        }
      }

      case 'get_full_abstract': {
        const { pmids } = args as { pmids: string[] }
        const limitedPmids = pmids.slice(0, 20)

        const abstracts = await getFullAbstract(limitedPmids)

        if (abstracts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No abstracts found for PMIDs: ${limitedPmids.join(', ')}`,
              },
            ],
          }
        }

        const formattedResults = abstracts
          .map((article, index) => {
            const authorsText =
              article.authors.length > 0
                ? article.authors.join(', ')
                : 'Unknown authors'

            let result = `**${index + 1}. ${article.title}**\n`
            result += `Authors: ${authorsText}\n`
            result += `Journal: ${article.journal}\n`
            result += `Publication Date: ${article.publicationDate}\n`
            result += `PMID: ${article.pmid}\n`

            if (article.doi) result += `DOI: ${article.doi}\n`
            if (article.pmcId) result += `PMC ID: ${article.pmcId}\n`

            if (article.fullAbstract) {
              result += `\n**Full Abstract:**\n${article.fullAbstract}\n`
            } else {
              result += `\nNo abstract available for this article.\n`
            }

            return result
          })
          .join('\n' + '='.repeat(80) + '\n\n')

        return {
          content: [
            {
              type: 'text',
              text: `Full abstracts for PMIDs: ${limitedPmids.join(', ')}\n\n${formattedResults}`,
            },
          ],
        }
      }

      case 'get_full_text': {
        const { pmcIds } = args as { pmcIds: string[] }
        const limitedPmcIds = pmcIds.slice(0, 10)

        const fullTexts = await getFullText(limitedPmcIds)

        if (fullTexts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No full text available for PMC IDs: ${limitedPmcIds.join(', ')}\nNote: Only Open Access articles from PMC can be retrieved.`,
              },
            ],
          }
        }

        const formattedResults = fullTexts
          .map((article, index) => {
            let result = `**${index + 1}. ${article.title}**\n`
            result += `PMC ID: ${article.pmcId}\n`
            result += `PMID: ${article.pmid}\n\n`

            if (article.sections && article.sections.length > 0) {
              article.sections.forEach((section) => {
                result += `## ${section.title}\n\n${section.content}\n\n`
              })
            } else if (article.fullText) {
              result += `${article.fullText}\n`
            }

            return result
          })
          .join('\n' + '='.repeat(80) + '\n\n')

        return {
          content: [
            {
              type: 'text',
              text: `Full text for PMC IDs: ${limitedPmcIds.join(', ')}\n\n${formattedResults}`,
            },
          ],
        }
      }

      case 'export_ris': {
        const { pmids } = args as { pmids: string[] }
        const limitedPmids = pmids.slice(0, 50)

        const result = await exportRIS(limitedPmids)

        let responseText = `📋 **RIS Export Results**\n\n`
        responseText += `Successfully exported: ${result.successCount} articles\n`

        if (result.errorCount > 0) {
          responseText += `Failed: ${result.errorCount} articles\n`
          responseText += `Errors: ${result.errors.join(', ')}\n\n`
        }

        responseText += `\n${'='.repeat(80)}\n\n`
        responseText += `**RIS Format Data:**\n\`\`\`\n${result.risData}\n\`\`\`\n\n`
        responseText += `💡 Copy the RIS data above and save it as a .ris file to import into your reference manager`

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        }
      }

      case 'get_citation_counts': {
        const { pmids } = args as { pmids: string[] }
        const limitedPmids = pmids.slice(0, 20)

        const results = await getCitationCounts(limitedPmids)

        let responseText = `📊 **Citation Analysis**\n\n`

        results.forEach((result, index) => {
          responseText += `**${index + 1}. ${result.title}**\n`
          responseText += `PMID: ${result.pmid}\n`
          responseText += `Citation count: ${result.citationCount}\n`

          if (result.error) {
            responseText += `Error: ${result.error}\n`
          } else if (result.citingPmids.length > 0) {
            responseText += `Citing PMIDs (first 10): ${result.citingPmids.slice(0, 10).join(', ')}\n`
          }

          responseText += `\n`
        })

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        }
      }

      case 'optimize_search_query': {
        const { query } = args as { query: string }

        const result = await optimizeSearchQuery(query)

        let responseText = `🔍 **Query Optimization**\n\n`
        responseText += `**Original Query:** ${result.originalQuery}\n\n`
        responseText += `**Optimized Query:** ${result.optimizedQuery}\n\n`

        if (result.improvements.length > 0) {
          responseText += `**Improvements Made:**\n`
          result.improvements.forEach((improvement, index) => {
            responseText += `${index + 1}. ${improvement}\n`
          })
          responseText += `\n`
        }

        if (result.meshTermsUsed.length > 0) {
          responseText += `**MeSH Terms Used:** ${result.meshTermsUsed.join(', ')}\n\n`
        }

        if (result.fieldTagsUsed.length > 0) {
          responseText += `**Field Tags Used:** ${result.fieldTagsUsed.join(', ')}\n\n`
        }

        if (result.estimatedResults !== undefined) {
          responseText += `**Estimated Results:** ${result.estimatedResults.toLocaleString()}\n`
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        }
      }

      case 'find_similar_articles': {
        const { pmid, maxResults = 10 } = args as {
          pmid: string
          maxResults?: number
        }
        const limitedMax = Math.min(maxResults, 50)

        const articles = await findSimilarArticles(pmid, limitedMax)

        if (articles.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No similar articles found for PMID: ${pmid}`,
              },
            ],
          }
        }

        let responseText = `🔍 **Similar Articles to PMID: ${pmid}**\n\n`

        articles.forEach((article, index) => {
          responseText += `**${index + 1}. ${article.title}**\n`
          responseText += `PMID: ${article.pmid}\n`
          responseText += `Authors: ${article.authors.join(', ')}\n`
          responseText += `Journal: ${article.journal}\n`

          if (article.similarityScore !== undefined) {
            responseText += `Similarity Score: ${article.similarityScore}\n`
          }

          if (article.abstract) {
            const preview = article.abstract.substring(0, 200) + '...'
            responseText += `\nAbstract preview: ${preview}\n`
          }

          responseText += `\n`
        })

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        }
      }

      case 'batch_process': {
        let {
          pmids,
          operations,
          maxConcurrency = 3,
        } = args as {
          pmids: string[] | string
          operations: string[]
          maxConcurrency?: number
        }

        // Handle different PMID input formats
        let pmidArray: string[]
        if (typeof pmids === 'string') {
          pmidArray = pmids.split(/[\s,]+/).filter(Boolean)
        } else {
          pmidArray = pmids
        }

        if (pmidArray.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No PMIDs provided for batch processing',
              },
            ],
            isError: true,
          }
        }

        if (!operations || operations.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No operations specified for batch processing',
              },
            ],
            isError: true,
          }
        }

        const limitedPmids = pmidArray.slice(0, 50)
        const limitedConcurrency = Math.min(maxConcurrency, 5)

        const result = await batchProcess(
          limitedPmids,
          operations,
          limitedConcurrency,
        )

        let responseText = `📦 **Batch Processing Results**\n\n`
        responseText += `**Task ID**: ${result.taskId}\n`
        responseText += `**PMIDs processed**: ${limitedPmids.length}\n`
        responseText += `**Operations**: ${operations.join(', ')}\n\n`

        responseText += `📊 **Summary**:\n`
        responseText += `• Total operations: ${result.summary.total}\n`
        responseText += `• Completed: ${result.summary.completed}\n`
        responseText += `• Failed: ${result.summary.failed}\n`
        responseText += `• Success rate: ${((result.summary.completed / result.summary.total) * 100).toFixed(1)}%\n\n`

        // Abbreviated results summary
        if (result.results.abstracts && result.results.abstracts.length > 0) {
          responseText += `📄 **Abstracts**: ${result.results.abstracts.length} retrieved\n`
        }

        if (result.results.citations && result.results.citations.length > 0) {
          const totalCitations = result.results.citations.reduce(
            (sum, c) => sum + c.citationCount,
            0,
          )
          responseText += `📊 **Citations**: ${totalCitations} total citations found\n`
        }

        if (
          result.results.similar &&
          Object.keys(result.results.similar).length > 0
        ) {
          responseText += `🔍 **Similar Articles**: Found for ${Object.keys(result.results.similar).length} PMIDs\n`
        }

        if (result.results.risExports) {
          responseText += `📋 **RIS Export**: Generated\n`
        }

        if (result.results.fullTexts && result.results.fullTexts.length > 0) {
          responseText += `📖 **Full Texts**: ${result.results.fullTexts.length} retrieved\n`
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    log('error', 'Tool execution error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
})

// Resources handler
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [],
}))

// Prompts handler
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: 'generate_search_query',
      description:
        'Help generate an effective PubMed search query based on research topic',
      arguments: [
        {
          name: 'topic',
          description: 'Research topic or question',
          required: true,
        },
      ],
    },
  ],
}))

// Main function to start the server
async function main() {
  try {
    if (IS_REMOTE) {
      // Remote mode: Use SSE transport with Express
      log('info', 'Starting PubMed MCP Server in REMOTE mode...')

      const app = express()

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({
          status: 'healthy',
          service: 'pubmed-mcp-server',
          version: '1.0.2',
          timestamp: new Date().toISOString(),
        })
      })

      // SSE endpoint
      app.get('/sse', async (req, res) => {
        log('info', 'New SSE connection established')

        const transport = new SSEServerTransport('/message', res)
        await server.connect(transport)

        req.on('close', () => {
          log('info', 'SSE connection closed')
        })
      })

      // Message endpoint for client-to-server communication
      app.post('/message', express.json(), async (req, res) => {
        log('debug', 'Received message from client')
        res.status(200).end()
      })

      // Start Express server
      app.listen(PORT, HOST, () => {
        log(
          'info',
          `PubMed MCP Server v1.0.2 is running on http://${HOST}:${PORT}`,
        )
        log('info', `Health check: http://${HOST}:${PORT}/health`)
        log('info', `SSE endpoint: http://${HOST}:${PORT}/sse`)
      })
    } else {
      // Local mode: Use stdio transport
      log('info', 'Starting PubMed MCP Server in LOCAL mode...')

      const transport = new StdioServerTransport()
      await server.connect(transport)

      log('info', 'PubMed MCP Server v1.0.2 is running via stdio')
    }

    log(
      'info',
      'Available tools: search_pubmed, get_full_abstract, get_full_text, export_ris, get_citation_counts, optimize_search_query, find_similar_articles, batch_process',
    )
  } catch (error) {
    log('error', 'Failed to start server:', error)
    process.exit(1)
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('info', 'Shutting down server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('info', 'Shutting down server...')
  process.exit(0)
})

// Start the server
main().catch((error) => {
  log('error', 'Server error:', error)
  process.exit(1)
})

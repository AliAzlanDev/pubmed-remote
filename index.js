#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var express_1 = require("express");
var pubmed_api_js_1 = require("./pubmed-api.js");
// Environment configuration
var PORT = parseInt(process.env.PORT || "8000");
var HOST = process.env.HOST || "0.0.0.0";
var LOG_LEVEL = process.env.LOG_LEVEL || "info";
var IS_REMOTE = process.env.MCP_TRANSPORT === "sse" || process.argv.includes("--remote");
// Logging utility
function log(level, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var levels = ["debug", "info", "warn", "error"];
    var currentLevel = levels.indexOf(LOG_LEVEL);
    var messageLevel = levels.indexOf(level);
    if (messageLevel >= currentLevel) {
        var timestamp = new Date().toISOString();
        console.error.apply(console, __spreadArray(["[".concat(timestamp, "] [").concat(level.toUpperCase(), "] ").concat(message)], args, false));
    }
}
// Create MCP server
var server = new index_js_1.Server({
    name: "pubmed-mcp-server",
    version: "1.0.2"
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {}
    }
});
// Tool: Search PubMed articles
server.setRequestHandler("tools/list", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ({
                tools: [
                    {
                        name: "search_pubmed",
                        description: "Search PubMed database for biomedical literature. Returns detailed article information including abstracts and PMIDs.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Search query for PubMed database"
                                },
                                maxResults: {
                                    type: "number",
                                    description: "Maximum number of results to return (default: 10, max: 100)",
                                    default: 10
                                }
                            },
                            required: ["query"]
                        }
                    },
                    {
                        name: "get_full_abstract",
                        description: "Get complete, untruncated abstracts for specific PubMed articles by their PMID(s).",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmids: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of PubMed IDs (PMIDs) to get full abstracts for"
                                }
                            },
                            required: ["pmids"]
                        }
                    },
                    {
                        name: "get_full_text",
                        description: "Get complete full text of articles from PubMed Central (PMC) by PMC ID.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmcIds: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of PMC IDs (e.g., 'PMC1234567' or '1234567')"
                                }
                            },
                            required: ["pmcIds"]
                        }
                    },
                    {
                        name: "export_ris",
                        description: "Export citations in RIS format for reference management software (Zotero, Mendeley, EndNote).",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmids: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of PMIDs to export"
                                }
                            },
                            required: ["pmids"]
                        }
                    },
                    {
                        name: "get_citation_counts",
                        description: "Analyze citation metrics and find citing articles using NCBI elink API.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmids: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Array of PMIDs to analyze"
                                }
                            },
                            required: ["pmids"]
                        }
                    },
                    {
                        name: "optimize_search_query",
                        description: "Transform natural language queries into optimized PubMed searches with MeSH terms and field tags.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Natural language search query to optimize"
                                }
                            },
                            required: ["query"]
                        }
                    },
                    {
                        name: "find_similar_articles",
                        description: "Find articles similar to a given PMID using NCBI's similarity algorithm.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmid: {
                                    type: "string",
                                    description: "PMID to find similar articles for"
                                },
                                maxResults: {
                                    type: "number",
                                    description: "Maximum number of similar articles to return (default: 10, max: 50)",
                                    default: 10
                                }
                            },
                            required: ["pmid"]
                        }
                    },
                    {
                        name: "batch_process",
                        description: "Process multiple PMIDs with multiple operations efficiently for bulk analysis.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                pmids: {
                                    oneOf: [
                                        { type: "array", items: { type: "string" } },
                                        { type: "string" }
                                    ],
                                    description: "Array of PMIDs or comma-separated string"
                                },
                                operations: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        enum: ["abstract", "citations", "similar", "ris_export", "full_text"]
                                    },
                                    description: "Operations to perform on each PMID"
                                },
                                maxConcurrency: {
                                    type: "number",
                                    description: "Maximum concurrent operations (default: 3, max: 5)",
                                    default: 3
                                }
                            },
                            required: ["pmids", "operations"]
                        }
                    }
                ]
            })];
    });
}); });
// Tool call handler
server.setRequestHandler("tools/call", function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, args, _b, _c, query, _d, maxResults, limitedMax, searchResult, articles, formattedResults, pmids, searchSummary, pmids, limitedPmids, abstracts, formattedResults, pmcIds, limitedPmcIds, fullTexts, formattedResults, pmids, limitedPmids, result, responseText, pmids, limitedPmids, results, responseText_1, query, result, responseText_2, _e, pmid, _f, maxResults, limitedMax, articles, responseText_3, _g, pmids, operations, _h, maxConcurrency, pmidArray, limitedPmids, limitedConcurrency, result, responseText, totalCitations, error_1, errorMessage;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 20, , 21]);
                _a = request.params, name_1 = _a.name, args = _a.arguments;
                log("info", "Tool called: ".concat(name_1));
                _b = name_1;
                switch (_b) {
                    case "search_pubmed": return [3 /*break*/, 1];
                    case "get_full_abstract": return [3 /*break*/, 4];
                    case "get_full_text": return [3 /*break*/, 6];
                    case "export_ris": return [3 /*break*/, 8];
                    case "get_citation_counts": return [3 /*break*/, 10];
                    case "optimize_search_query": return [3 /*break*/, 12];
                    case "find_similar_articles": return [3 /*break*/, 14];
                    case "batch_process": return [3 /*break*/, 16];
                }
                return [3 /*break*/, 18];
            case 1:
                _c = args, query = _c.query, _d = _c.maxResults, maxResults = _d === void 0 ? 10 : _d;
                limitedMax = Math.min(maxResults, 100);
                return [4 /*yield*/, (0, pubmed_api_js_1.searchPubMed)(query, limitedMax)];
            case 2:
                searchResult = _j.sent();
                if (searchResult.idList.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No articles found for query: \"".concat(query, "\"\n\nTotal search hits: ").concat(searchResult.count)
                                }]
                        }];
                }
                return [4 /*yield*/, (0, pubmed_api_js_1.getArticleDetails)(searchResult.idList)];
            case 3:
                articles = _j.sent();
                formattedResults = articles.map(function (article, index) {
                    var authorsText = article.authors.length > 0
                        ? article.authors.slice(0, 3).join(", ") + (article.authors.length > 3 ? ", et al." : "")
                        : "Unknown authors";
                    var result = "**".concat(index + 1, ". ").concat(article.title, "**\n");
                    result += "Authors: ".concat(authorsText, "\n");
                    result += "Journal: ".concat(article.journal, "\n");
                    result += "Publication Date: ".concat(article.publicationDate, "\n");
                    result += "PMID: ".concat(article.pmid, "\n");
                    if (article.doi)
                        result += "DOI: ".concat(article.doi, "\n");
                    if (article.pmcId)
                        result += "PMC ID: ".concat(article.pmcId, "\n");
                    result += "URL: ".concat(article.url, "\n");
                    if (article.abstract) {
                        var truncatedAbstract = article.abstract.length > 500
                            ? article.abstract.substring(0, 500) + "... (Use get_full_abstract for complete abstract)"
                            : article.abstract;
                        result += "\nAbstract: ".concat(truncatedAbstract, "\n");
                    }
                    return result;
                }).join("\n" + "=".repeat(80) + "\n\n");
                pmids = articles.map(function (a) { return a.pmid; });
                searchSummary = "\uD83D\uDCCA **Search Results Summary**\n";
                searchSummary += "Query: \"".concat(query, "\"\n");
                searchSummary += "Total articles found: **".concat(searchResult.count.toLocaleString(), "**\n");
                searchSummary += "Showing: **".concat(articles.length, "** articles (requested: ").concat(limitedMax, ")\n");
                if (searchResult.queryTranslation) {
                    searchSummary += "Query translation: ".concat(searchResult.queryTranslation, "\n");
                }
                searchSummary += "\nPMIDs: ".concat(pmids.join(", "), "\n");
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "".concat(searchSummary, "\n").concat("=".repeat(100), "\n\n").concat(formattedResults, "\n\n\uD83D\uDCA1 Use get_full_abstract with PMIDs for complete abstracts\n\uD83D\uDCA1 Use get_full_text with PMC IDs for full article text")
                            }]
                    }];
            case 4:
                pmids = args.pmids;
                limitedPmids = pmids.slice(0, 20);
                return [4 /*yield*/, (0, pubmed_api_js_1.getFullAbstract)(limitedPmids)];
            case 5:
                abstracts = _j.sent();
                if (abstracts.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No abstracts found for PMIDs: ".concat(limitedPmids.join(", "))
                                }]
                        }];
                }
                formattedResults = abstracts.map(function (article, index) {
                    var authorsText = article.authors.length > 0
                        ? article.authors.join(", ")
                        : "Unknown authors";
                    var result = "**".concat(index + 1, ". ").concat(article.title, "**\n");
                    result += "Authors: ".concat(authorsText, "\n");
                    result += "Journal: ".concat(article.journal, "\n");
                    result += "Publication Date: ".concat(article.publicationDate, "\n");
                    result += "PMID: ".concat(article.pmid, "\n");
                    if (article.doi)
                        result += "DOI: ".concat(article.doi, "\n");
                    if (article.pmcId)
                        result += "PMC ID: ".concat(article.pmcId, "\n");
                    if (article.fullAbstract) {
                        result += "\n**Full Abstract:**\n".concat(article.fullAbstract, "\n");
                    }
                    else {
                        result += "\nNo abstract available for this article.\n";
                    }
                    return result;
                }).join("\n" + "=".repeat(80) + "\n\n");
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "Full abstracts for PMIDs: ".concat(limitedPmids.join(", "), "\n\n").concat(formattedResults)
                            }]
                    }];
            case 6:
                pmcIds = args.pmcIds;
                limitedPmcIds = pmcIds.slice(0, 10);
                return [4 /*yield*/, (0, pubmed_api_js_1.getFullText)(limitedPmcIds)];
            case 7:
                fullTexts = _j.sent();
                if (fullTexts.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No full text available for PMC IDs: ".concat(limitedPmcIds.join(", "), "\nNote: Only Open Access articles from PMC can be retrieved.")
                                }]
                        }];
                }
                formattedResults = fullTexts.map(function (article, index) {
                    var result = "**".concat(index + 1, ". ").concat(article.title, "**\n");
                    result += "PMC ID: ".concat(article.pmcId, "\n");
                    result += "PMID: ".concat(article.pmid, "\n\n");
                    if (article.sections && article.sections.length > 0) {
                        article.sections.forEach(function (section) {
                            result += "## ".concat(section.title, "\n\n").concat(section.content, "\n\n");
                        });
                    }
                    else if (article.fullText) {
                        result += "".concat(article.fullText, "\n");
                    }
                    return result;
                }).join("\n" + "=".repeat(80) + "\n\n");
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "Full text for PMC IDs: ".concat(limitedPmcIds.join(", "), "\n\n").concat(formattedResults)
                            }]
                    }];
            case 8:
                pmids = args.pmids;
                limitedPmids = pmids.slice(0, 50);
                return [4 /*yield*/, (0, pubmed_api_js_1.exportRIS)(limitedPmids)];
            case 9:
                result = _j.sent();
                responseText = "\uD83D\uDCCB **RIS Export Results**\n\n";
                responseText += "Successfully exported: ".concat(result.successCount, " articles\n");
                if (result.errorCount > 0) {
                    responseText += "Failed: ".concat(result.errorCount, " articles\n");
                    responseText += "Errors: ".concat(result.errors.join(", "), "\n\n");
                }
                responseText += "\n".concat("=".repeat(80), "\n\n");
                responseText += "**RIS Format Data:**\n```\n".concat(result.risData, "\n```\n\n");
                responseText += "\uD83D\uDCA1 Copy the RIS data above and save it as a .ris file to import into your reference manager";
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: responseText
                            }]
                    }];
            case 10:
                pmids = args.pmids;
                limitedPmids = pmids.slice(0, 20);
                return [4 /*yield*/, (0, pubmed_api_js_1.getCitationCounts)(limitedPmids)];
            case 11:
                results = _j.sent();
                responseText_1 = "\uD83D\uDCCA **Citation Analysis**\n\n";
                results.forEach(function (result, index) {
                    responseText_1 += "**".concat(index + 1, ". ").concat(result.title, "**\n");
                    responseText_1 += "PMID: ".concat(result.pmid, "\n");
                    responseText_1 += "Citation count: ".concat(result.citationCount, "\n");
                    if (result.error) {
                        responseText_1 += "Error: ".concat(result.error, "\n");
                    }
                    else if (result.citingPmids.length > 0) {
                        responseText_1 += "Citing PMIDs (first 10): ".concat(result.citingPmids.slice(0, 10).join(", "), "\n");
                    }
                    responseText_1 += "\n";
                });
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: responseText_1
                            }]
                    }];
            case 12:
                query = args.query;
                return [4 /*yield*/, (0, pubmed_api_js_1.optimizeSearchQuery)(query)];
            case 13:
                result = _j.sent();
                responseText_2 = "\uD83D\uDD0D **Query Optimization**\n\n";
                responseText_2 += "**Original Query:** ".concat(result.originalQuery, "\n\n");
                responseText_2 += "**Optimized Query:** ".concat(result.optimizedQuery, "\n\n");
                if (result.improvements.length > 0) {
                    responseText_2 += "**Improvements Made:**\n";
                    result.improvements.forEach(function (improvement, index) {
                        responseText_2 += "".concat(index + 1, ". ").concat(improvement, "\n");
                    });
                    responseText_2 += "\n";
                }
                if (result.meshTermsUsed.length > 0) {
                    responseText_2 += "**MeSH Terms Used:** ".concat(result.meshTermsUsed.join(", "), "\n\n");
                }
                if (result.fieldTagsUsed.length > 0) {
                    responseText_2 += "**Field Tags Used:** ".concat(result.fieldTagsUsed.join(", "), "\n\n");
                }
                if (result.estimatedResults !== undefined) {
                    responseText_2 += "**Estimated Results:** ".concat(result.estimatedResults.toLocaleString(), "\n");
                }
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: responseText_2
                            }]
                    }];
            case 14:
                _e = args, pmid = _e.pmid, _f = _e.maxResults, maxResults = _f === void 0 ? 10 : _f;
                limitedMax = Math.min(maxResults, 50);
                return [4 /*yield*/, (0, pubmed_api_js_1.findSimilarArticles)(pmid, limitedMax)];
            case 15:
                articles = _j.sent();
                if (articles.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No similar articles found for PMID: ".concat(pmid)
                                }]
                        }];
                }
                responseText_3 = "\uD83D\uDD0D **Similar Articles to PMID: ".concat(pmid, "**\n\n");
                articles.forEach(function (article, index) {
                    responseText_3 += "**".concat(index + 1, ". ").concat(article.title, "**\n");
                    responseText_3 += "PMID: ".concat(article.pmid, "\n");
                    responseText_3 += "Authors: ".concat(article.authors.join(", "), "\n");
                    responseText_3 += "Journal: ".concat(article.journal, "\n");
                    if (article.score) {
                        responseText_3 += "Similarity Score: ".concat(article.score, "\n");
                    }
                    if (article.abstract) {
                        var preview = article.abstract.substring(0, 200) + "...";
                        responseText_3 += "\nAbstract preview: ".concat(preview, "\n");
                    }
                    responseText_3 += "\n";
                });
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: responseText_3
                            }]
                    }];
            case 16:
                _g = args, pmids = _g.pmids, operations = _g.operations, _h = _g.maxConcurrency, maxConcurrency = _h === void 0 ? 3 : _h;
                pmidArray = void 0;
                if (typeof pmids === "string") {
                    pmidArray = pmids.split(/[\s,]+/).filter(Boolean);
                }
                else {
                    pmidArray = pmids;
                }
                if (pmidArray.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No PMIDs provided for batch processing"
                                }],
                            isError: true
                        }];
                }
                if (!operations || operations.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: "No operations specified for batch processing"
                                }],
                            isError: true
                        }];
                }
                limitedPmids = pmidArray.slice(0, 50);
                limitedConcurrency = Math.min(maxConcurrency, 5);
                return [4 /*yield*/, (0, pubmed_api_js_1.batchProcess)(limitedPmids, operations, limitedConcurrency)];
            case 17:
                result = _j.sent();
                responseText = "\uD83D\uDCE6 **Batch Processing Results**\n\n";
                responseText += "**Task ID**: ".concat(result.taskId, "\n");
                responseText += "**PMIDs processed**: ".concat(limitedPmids.length, "\n");
                responseText += "**Operations**: ".concat(operations.join(", "), "\n\n");
                responseText += "\uD83D\uDCCA **Summary**:\n";
                responseText += "\u2022 Total operations: ".concat(result.summary.total, "\n");
                responseText += "\u2022 Completed: ".concat(result.summary.completed, "\n");
                responseText += "\u2022 Failed: ".concat(result.summary.failed, "\n");
                responseText += "\u2022 Success rate: ".concat(((result.summary.completed / result.summary.total) * 100).toFixed(1), "%\n\n");
                // Abbreviated results summary
                if (result.results.abstracts && result.results.abstracts.length > 0) {
                    responseText += "\uD83D\uDCC4 **Abstracts**: ".concat(result.results.abstracts.length, " retrieved\n");
                }
                if (result.results.citations && result.results.citations.length > 0) {
                    totalCitations = result.results.citations.reduce(function (sum, c) { return sum + c.citationCount; }, 0);
                    responseText += "\uD83D\uDCCA **Citations**: ".concat(totalCitations, " total citations found\n");
                }
                if (result.results.similar && Object.keys(result.results.similar).length > 0) {
                    responseText += "\uD83D\uDD0D **Similar Articles**: Found for ".concat(Object.keys(result.results.similar).length, " PMIDs\n");
                }
                if (result.results.risExports) {
                    responseText += "\uD83D\uDCCB **RIS Export**: Generated\n";
                }
                if (result.results.fullTexts && result.results.fullTexts.length > 0) {
                    responseText += "\uD83D\uDCD6 **Full Texts**: ".concat(result.results.fullTexts.length, " retrieved\n");
                }
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: responseText
                            }]
                    }];
            case 18: throw new Error("Unknown tool: ".concat(name_1));
            case 19: return [3 /*break*/, 21];
            case 20:
                error_1 = _j.sent();
                log("error", "Tool execution error:", error_1);
                errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                return [2 /*return*/, {
                        content: [{
                                type: "text",
                                text: "Error: ".concat(errorMessage)
                            }],
                        isError: true
                    }];
            case 21: return [2 /*return*/];
        }
    });
}); });
// Resources handler
server.setRequestHandler("resources/list", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ({
                resources: []
            })];
    });
}); });
// Prompts handler
server.setRequestHandler("prompts/list", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ({
                prompts: [
                    {
                        name: "generate_search_query",
                        description: "Help generate an effective PubMed search query based on research topic",
                        arguments: [
                            {
                                name: "topic",
                                description: "Research topic or question",
                                required: true
                            }
                        ]
                    }
                ]
            })];
    });
}); });
// Main function to start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var app, transport, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!IS_REMOTE) return [3 /*break*/, 1];
                    // Remote mode: Use SSE transport with Express
                    log("info", "Starting PubMed MCP Server in REMOTE mode...");
                    app = (0, express_1.default)();
                    // Health check endpoint
                    app.get("/health", function (req, res) {
                        res.json({
                            status: "healthy",
                            service: "pubmed-mcp-server",
                            version: "1.0.2",
                            timestamp: new Date().toISOString()
                        });
                    });
                    // SSE endpoint
                    app.get("/sse", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var transport;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    log("info", "New SSE connection established");
                                    transport = new sse_js_1.SSEServerTransport("/message", res);
                                    return [4 /*yield*/, server.connect(transport)];
                                case 1:
                                    _a.sent();
                                    req.on("close", function () {
                                        log("info", "SSE connection closed");
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Message endpoint for client-to-server communication
                    app.post("/message", express_1.default.json(), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            log("debug", "Received message from client");
                            res.status(200).end();
                            return [2 /*return*/];
                        });
                    }); });
                    // Start Express server
                    app.listen(PORT, HOST, function () {
                        log("info", "PubMed MCP Server v1.0.2 is running on http://".concat(HOST, ":").concat(PORT));
                        log("info", "Health check: http://".concat(HOST, ":").concat(PORT, "/health"));
                        log("info", "SSE endpoint: http://".concat(HOST, ":").concat(PORT, "/sse"));
                    });
                    return [3 /*break*/, 3];
                case 1:
                    // Local mode: Use stdio transport
                    log("info", "Starting PubMed MCP Server in LOCAL mode...");
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 2:
                    _a.sent();
                    log("info", "PubMed MCP Server v1.0.2 is running via stdio");
                    _a.label = 3;
                case 3:
                    log("info", "Available tools: search_pubmed, get_full_abstract, get_full_text, export_ris, get_citation_counts, optimize_search_query, find_similar_articles, batch_process");
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    log("error", "Failed to start server:", error_2);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Handle process termination gracefully
process.on("SIGINT", function () {
    log("info", "Shutting down server...");
    process.exit(0);
});
process.on("SIGTERM", function () {
    log("info", "Shutting down server...");
    process.exit(0);
});
// Start the server
main().catch(function (error) {
    log("error", "Server error:", error);
    process.exit(1);
});

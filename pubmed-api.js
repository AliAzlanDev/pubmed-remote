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
exports.searchPubMed = searchPubMed;
exports.getArticleSummaries = getArticleSummaries;
exports.getArticleDetails = getArticleDetails;
exports.getFullAbstract = getFullAbstract;
exports.getFullText = getFullText;
exports.exportRIS = exportRIS;
exports.searchAndFetchArticles = searchAndFetchArticles;
exports.getCitationCounts = getCitationCounts;
exports.optimizeSearchQuery = optimizeSearchQuery;
exports.findSimilarArticles = findSimilarArticles;
exports.batchProcess = batchProcess;
var xml2js_1 = require("xml2js");
// PubMed E-utilities API base URLs
var ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
var EFETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
var ESUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
var ELINK_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi';
// Note: Now using E-utilities efetch for PMC full text instead of BioC API
// Literature Citation Exporter API
var LIT_CITATION_URL = 'https://api.ncbi.nlm.nih.gov/lit/ctxp/v1';
// XML parser utility
function parseXML(xml) {
    return new Promise(function (resolve, reject) {
        (0, xml2js_1.parseString)(xml, { explicitArray: false }, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
// Build query URL with parameters
function buildUrl(baseUrl, params) {
    var url = new URL(baseUrl);
    Object.entries(params).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        url.searchParams.set(key, value.toString());
    });
    return url.toString();
}
// Search PubMed articles
function searchPubMed(query_1) {
    return __awaiter(this, arguments, void 0, function (query, maxResults, startIndex) {
        var params, url, response, xmlData, parsed, eSearchResult, idList, error_1, errorMessage;
        var _a;
        if (maxResults === void 0) { maxResults = 20; }
        if (startIndex === void 0) { startIndex = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    params = {
                        db: 'pubmed',
                        term: query,
                        retmax: maxResults,
                        retstart: startIndex,
                        retmode: 'xml',
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    url = buildUrl(ESEARCH_URL, params);
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 3:
                    xmlData = _b.sent();
                    return [4 /*yield*/, parseXML(xmlData)];
                case 4:
                    parsed = _b.sent();
                    eSearchResult = parsed.eSearchResult;
                    idList = ((_a = eSearchResult.IdList) === null || _a === void 0 ? void 0 : _a.Id) || [];
                    return [2 /*return*/, {
                            idList: Array.isArray(idList) ? idList : [idList].filter(Boolean),
                            count: parseInt(eSearchResult.Count || '0'),
                            retMax: parseInt(eSearchResult.RetMax || '0'),
                            retStart: parseInt(eSearchResult.RetStart || '0'),
                            queryTranslation: eSearchResult.QueryTranslation
                        }];
                case 5:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    throw new Error("PubMed search failed: ".concat(errorMessage));
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Get article summaries by PMIDs
function getArticleSummaries(pmids) {
    return __awaiter(this, void 0, void 0, function () {
        var params, url, response, xmlData, parsed, docSums, summaries, error_2, errorMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (pmids.length === 0)
                        return [2 /*return*/, []];
                    params = {
                        db: 'pubmed',
                        id: pmids.join(','),
                        retmode: 'xml',
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    url = buildUrl(ESUMMARY_URL, params);
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 3:
                    xmlData = _b.sent();
                    return [4 /*yield*/, parseXML(xmlData)];
                case 4:
                    parsed = _b.sent();
                    docSums = ((_a = parsed.eSummaryResult) === null || _a === void 0 ? void 0 : _a.DocSum) || [];
                    summaries = Array.isArray(docSums) ? docSums : [docSums];
                    return [2 /*return*/, summaries.map(function (docSum) {
                            var items = Array.isArray(docSum.Item) ? docSum.Item : [docSum.Item];
                            var itemMap = {};
                            items.forEach(function (item) {
                                if (item && item.$.Name) {
                                    itemMap[item.$.Name] = item._;
                                }
                            });
                            // Parse authors
                            var authorList = itemMap.AuthorList || '';
                            var authors = authorList.split(',').map(function (author) { return author.trim(); }).filter(Boolean);
                            return {
                                pmid: docSum.Id,
                                title: itemMap.Title || 'No title available',
                                authors: authors,
                                journal: itemMap.Source || 'Unknown journal',
                                publicationDate: itemMap.PubDate || 'Unknown date',
                                doi: itemMap.DOI,
                                pmcId: itemMap.PMCID
                            };
                        })];
                case 5:
                    error_2 = _b.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                    throw new Error("Failed to get article summaries: ".concat(errorMessage));
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Get full article details by PMIDs
function getArticleDetails(pmids) {
    return __awaiter(this, void 0, void 0, function () {
        var params, url, response, xmlData, parsed, pubmedArticles, articles, error_3, errorMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (pmids.length === 0)
                        return [2 /*return*/, []];
                    params = {
                        db: 'pubmed',
                        id: pmids.join(','),
                        retmode: 'xml',
                        rettype: 'abstract',
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    url = buildUrl(EFETCH_URL, params);
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 3:
                    xmlData = _b.sent();
                    return [4 /*yield*/, parseXML(xmlData)];
                case 4:
                    parsed = _b.sent();
                    pubmedArticles = ((_a = parsed.PubmedArticleSet) === null || _a === void 0 ? void 0 : _a.PubmedArticle) || [];
                    articles = Array.isArray(pubmedArticles) ? pubmedArticles : [pubmedArticles];
                    return [2 /*return*/, articles.map(function (article) {
                            var _a, _b, _c, _d, _e, _f, _g;
                            var medlineCitation = article.MedlineCitation;
                            var pmid = medlineCitation.PMID._ || medlineCitation.PMID;
                            var articleData = medlineCitation.Article;
                            // Extract title
                            var title = articleData.ArticleTitle || 'No title available';
                            // Extract authors
                            var authorList = ((_a = articleData.AuthorList) === null || _a === void 0 ? void 0 : _a.Author) || [];
                            var authors = (Array.isArray(authorList) ? authorList : [authorList])
                                .map(function (author) {
                                if (author.ForeName && author.LastName) {
                                    return "".concat(author.ForeName, " ").concat(author.LastName);
                                }
                                else if (author.CollectiveName) {
                                    return author.CollectiveName;
                                }
                                return 'Unknown Author';
                            })
                                .filter(Boolean);
                            // Extract journal info
                            var journal = ((_b = articleData.Journal) === null || _b === void 0 ? void 0 : _b.Title) || 'Unknown journal';
                            // Extract publication date
                            var pubDate = (_d = (_c = articleData.Journal) === null || _c === void 0 ? void 0 : _c.JournalIssue) === null || _d === void 0 ? void 0 : _d.PubDate;
                            var publicationDate = 'Unknown date';
                            if (pubDate) {
                                var year = pubDate.Year || '';
                                var month = pubDate.Month || '';
                                var day = pubDate.Day || '';
                                publicationDate = [year, month, day].filter(Boolean).join(' ');
                            }
                            // Extract abstract
                            var abstractTexts = ((_e = articleData.Abstract) === null || _e === void 0 ? void 0 : _e.AbstractText) || [];
                            var abstract = '';
                            if (Array.isArray(abstractTexts)) {
                                abstract = abstractTexts.map(function (text) {
                                    if (typeof text === 'string')
                                        return text;
                                    if (text._ && text.$.Label)
                                        return "".concat(text.$.Label, ": ").concat(text._);
                                    return text._ || text;
                                }).join('\n\n');
                            }
                            else if (typeof abstractTexts === 'string') {
                                abstract = abstractTexts;
                            }
                            else if (abstractTexts._) {
                                abstract = abstractTexts._;
                            }
                            // Extract DOI and PMC ID
                            var articleIds = ((_g = (_f = article.PubmedData) === null || _f === void 0 ? void 0 : _f.ArticleIdList) === null || _g === void 0 ? void 0 : _g.ArticleId) || [];
                            var ids = Array.isArray(articleIds) ? articleIds : [articleIds];
                            var doi = '';
                            var pmcId = '';
                            ids.forEach(function (id) {
                                if (id.$.IdType === 'doi') {
                                    doi = id._;
                                }
                                else if (id.$.IdType === 'pmc') {
                                    pmcId = id._;
                                }
                            });
                            return {
                                pmid: pmid,
                                title: title,
                                authors: authors,
                                journal: journal,
                                publicationDate: publicationDate,
                                abstract: abstract,
                                doi: doi,
                                pmcId: pmcId,
                                url: "https://pubmed.ncbi.nlm.nih.gov/".concat(pmid, "/")
                            };
                        })];
                case 5:
                    error_3 = _b.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                    throw new Error("Failed to get article details: ".concat(errorMessage));
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Get full abstract for specific PMIDs
function getFullAbstract(pmids) {
    return __awaiter(this, void 0, void 0, function () {
        var params, url, response, xmlData, parsed, pubmedArticles, articles, error_4, errorMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (pmids.length === 0)
                        return [2 /*return*/, []];
                    params = {
                        db: 'pubmed',
                        id: pmids.join(','),
                        retmode: 'xml',
                        rettype: 'abstract',
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    url = buildUrl(EFETCH_URL, params);
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 3:
                    xmlData = _b.sent();
                    return [4 /*yield*/, parseXML(xmlData)];
                case 4:
                    parsed = _b.sent();
                    pubmedArticles = ((_a = parsed.PubmedArticleSet) === null || _a === void 0 ? void 0 : _a.PubmedArticle) || [];
                    articles = Array.isArray(pubmedArticles) ? pubmedArticles : [pubmedArticles];
                    return [2 /*return*/, articles.map(function (article) {
                            var _a, _b, _c, _d, _e, _f, _g;
                            var medlineCitation = article.MedlineCitation;
                            var pmid = medlineCitation.PMID._ || medlineCitation.PMID;
                            var articleData = medlineCitation.Article;
                            // Extract title
                            var title = articleData.ArticleTitle || 'No title available';
                            // Extract authors
                            var authorList = ((_a = articleData.AuthorList) === null || _a === void 0 ? void 0 : _a.Author) || [];
                            var authors = (Array.isArray(authorList) ? authorList : [authorList])
                                .map(function (author) {
                                if (author.ForeName && author.LastName) {
                                    return "".concat(author.ForeName, " ").concat(author.LastName);
                                }
                                else if (author.CollectiveName) {
                                    return author.CollectiveName;
                                }
                                return 'Unknown Author';
                            })
                                .filter(Boolean);
                            // Extract journal info
                            var journal = ((_b = articleData.Journal) === null || _b === void 0 ? void 0 : _b.Title) || 'Unknown journal';
                            // Extract publication date
                            var pubDate = (_d = (_c = articleData.Journal) === null || _c === void 0 ? void 0 : _c.JournalIssue) === null || _d === void 0 ? void 0 : _d.PubDate;
                            var publicationDate = 'Unknown date';
                            if (pubDate) {
                                var year = pubDate.Year || '';
                                var month = pubDate.Month || '';
                                var day = pubDate.Day || '';
                                publicationDate = [year, month, day].filter(Boolean).join(' ');
                            }
                            // Extract FULL abstract (without truncation)
                            var abstractTexts = ((_e = articleData.Abstract) === null || _e === void 0 ? void 0 : _e.AbstractText) || [];
                            var fullAbstract = '';
                            if (Array.isArray(abstractTexts)) {
                                fullAbstract = abstractTexts.map(function (text) {
                                    if (typeof text === 'string')
                                        return text;
                                    if (text._ && text.$.Label)
                                        return "".concat(text.$.Label, ": ").concat(text._);
                                    return text._ || text;
                                }).join('\n\n');
                            }
                            else if (typeof abstractTexts === 'string') {
                                fullAbstract = abstractTexts;
                            }
                            else if (abstractTexts._) {
                                fullAbstract = abstractTexts._;
                            }
                            // Extract DOI and PMC ID
                            var articleIds = ((_g = (_f = article.PubmedData) === null || _f === void 0 ? void 0 : _f.ArticleIdList) === null || _g === void 0 ? void 0 : _g.ArticleId) || [];
                            var ids = Array.isArray(articleIds) ? articleIds : [articleIds];
                            var doi = '';
                            var pmcId = '';
                            ids.forEach(function (id) {
                                if (id.$.IdType === 'doi') {
                                    doi = id._;
                                }
                                else if (id.$.IdType === 'pmc') {
                                    pmcId = id._;
                                }
                            });
                            return {
                                pmid: pmid,
                                title: title,
                                authors: authors,
                                journal: journal,
                                publicationDate: publicationDate,
                                fullAbstract: fullAbstract,
                                doi: doi,
                                pmcId: pmcId
                            };
                        })];
                case 5:
                    error_4 = _b.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                    throw new Error("Failed to get full abstracts: ".concat(errorMessage));
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Get full text from PMC for articles with PMC ID using E-utilities
function getFullText(pmcIds) {
    return __awaiter(this, void 0, void 0, function () {
        var results, _loop_1, _i, pmcIds_1, pmcId;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (pmcIds.length === 0)
                        return [2 /*return*/, []];
                    results = [];
                    _loop_1 = function (pmcId) {
                        // Function to extract text from any element recursively
                        function extractText(element) {
                            if (typeof element === 'string') {
                                return element;
                            }
                            if (typeof element === 'object') {
                                if (element._) {
                                    return element._;
                                }
                                var text_1 = '';
                                Object.values(element).forEach(function (value) {
                                    if (Array.isArray(value)) {
                                        value.forEach(function (item) {
                                            text_1 += extractText(item) + ' ';
                                        });
                                    }
                                    else {
                                        text_1 += extractText(value) + ' ';
                                    }
                                });
                                return text_1.trim();
                            }
                            return '';
                        }
                        // Function to process sections
                        function processSections(element, sectionTitle) {
                            if (sectionTitle === void 0) { sectionTitle = 'Content'; }
                            if (element.sec) {
                                var secs = Array.isArray(element.sec) ? element.sec : [element.sec];
                                secs.forEach(function (section) {
                                    // Extract section title
                                    var secTitle = sectionTitle;
                                    if (section.title) {
                                        var titleText = extractText(section.title);
                                        if (titleText.trim()) {
                                            secTitle = titleText.trim();
                                        }
                                    }
                                    // Extract section content
                                    var secContent = '';
                                    // Get paragraphs
                                    if (section.p) {
                                        var paragraphs = Array.isArray(section.p) ? section.p : [section.p];
                                        paragraphs.forEach(function (para) {
                                            var paraText = extractText(para);
                                            if (paraText.trim()) {
                                                secContent += paraText.trim() + '\n\n';
                                            }
                                        });
                                    }
                                    // Process nested sections
                                    if (section.sec) {
                                        processSections(section, secTitle);
                                    }
                                    else if (secContent.trim()) {
                                        sections_1.push({
                                            title: secTitle,
                                            content: secContent.trim()
                                        });
                                        fullText_1 += "".concat(secTitle, "\n").concat(secContent, "\n");
                                    }
                                });
                            }
                            // Also check for direct paragraphs
                            if (element.p) {
                                var paragraphs = Array.isArray(element.p) ? element.p : [element.p];
                                var content_1 = '';
                                paragraphs.forEach(function (para) {
                                    var paraText = extractText(para);
                                    if (paraText.trim()) {
                                        content_1 += paraText.trim() + '\n\n';
                                    }
                                });
                                if (content_1.trim()) {
                                    sections_1.push({
                                        title: sectionTitle,
                                        content: content_1.trim()
                                    });
                                    fullText_1 += "".concat(sectionTitle, "\n").concat(content_1, "\n");
                                }
                            }
                        }
                        // Fallback extraction function for the entire article
                        function fallbackExtractText(element) {
                            if (typeof element === 'string') {
                                return element;
                            }
                            if (typeof element === 'object') {
                                if (element._) {
                                    return element._;
                                }
                                var text_2 = '';
                                Object.values(element).forEach(function (value) {
                                    if (Array.isArray(value)) {
                                        value.forEach(function (item) {
                                            text_2 += fallbackExtractText(item) + ' ';
                                        });
                                    }
                                    else if (typeof value === 'object' || typeof value === 'string') {
                                        text_2 += fallbackExtractText(value) + ' ';
                                    }
                                });
                                return text_2.trim();
                            }
                            return '';
                        }
                        var cleanPmcId, params, url, response, xmlData, parsed, articleSet, article, front, body, articleMeta, title, titleGroup, articleTitle, pmid, articleIds, ids, pmidEntry, sections_1, fullText_1, bodyContent, allText, error_5;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 4, , 5]);
                                    cleanPmcId = pmcId.replace(/^PMC/, '');
                                    params = {
                                        db: 'pmc',
                                        id: cleanPmcId,
                                        retmode: 'xml',
                                        tool: 'mcp-pubmed-server',
                                        email: process.env.NCBI_EMAIL || 'user@example.com'
                                    };
                                    url = buildUrl(EFETCH_URL, params);
                                    return [4 /*yield*/, fetch(url)];
                                case 1:
                                    response = _e.sent();
                                    if (!response.ok) {
                                        console.warn("Failed to fetch full text for PMC".concat(cleanPmcId, ": ").concat(response.status));
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, response.text()];
                                case 2:
                                    xmlData = _e.sent();
                                    // Check if we got an error response
                                    if (xmlData.includes('Error occurred') || xmlData.includes('esearchresult')) {
                                        console.warn("No full text available for PMC".concat(cleanPmcId));
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, parseXML(xmlData)];
                                case 3:
                                    parsed = _e.sent();
                                    articleSet = parsed['pmc-articleset'];
                                    if (!articleSet || !articleSet.article) {
                                        console.warn("No article found in PMC".concat(cleanPmcId));
                                        return [2 /*return*/, "continue"];
                                    }
                                    article = Array.isArray(articleSet.article) ? articleSet.article[0] : articleSet.article;
                                    front = article.front;
                                    body = article.body;
                                    articleMeta = ((_b = (_a = front === null || front === void 0 ? void 0 : front[0]) === null || _a === void 0 ? void 0 : _a['article-meta']) === null || _b === void 0 ? void 0 : _b[0]) || (front === null || front === void 0 ? void 0 : front['article-meta']);
                                    title = 'Unknown title';
                                    titleGroup = articleMeta === null || articleMeta === void 0 ? void 0 : articleMeta['title-group'];
                                    if (titleGroup) {
                                        articleTitle = Array.isArray(titleGroup) ? (_c = titleGroup[0]) === null || _c === void 0 ? void 0 : _c['article-title'] : titleGroup['article-title'];
                                        if (articleTitle) {
                                            title = Array.isArray(articleTitle) ? articleTitle[0] : articleTitle;
                                            // Clean up XML content in title
                                            if (typeof title === 'object' && title._) {
                                                title = title._;
                                            }
                                        }
                                    }
                                    pmid = '';
                                    articleIds = articleMeta === null || articleMeta === void 0 ? void 0 : articleMeta['article-id'];
                                    if (articleIds) {
                                        ids = Array.isArray(articleIds) ? articleIds : [articleIds];
                                        pmidEntry = ids.find(function (id) { var _a; return ((_a = id.$) === null || _a === void 0 ? void 0 : _a['pub-id-type']) === 'pmid'; });
                                        if (pmidEntry) {
                                            pmid = pmidEntry._ || pmidEntry;
                                        }
                                    }
                                    sections_1 = [];
                                    fullText_1 = '';
                                    if (body) {
                                        bodyContent = Array.isArray(body) ? body[0] : body;
                                        // Process the body content
                                        processSections(bodyContent);
                                    }
                                    // If no sections were found, try to extract any available text
                                    if (sections_1.length === 0 && fullText_1.trim() === '') {
                                        allText = fallbackExtractText(article);
                                        if (allText.trim()) {
                                            fullText_1 = allText.trim();
                                            sections_1.push({
                                                title: 'Full Article Content',
                                                content: fullText_1
                                            });
                                        }
                                    }
                                    if (fullText_1.trim() || sections_1.length > 0) {
                                        results.push({
                                            pmid: pmid,
                                            pmcId: "PMC".concat(cleanPmcId),
                                            title: title,
                                            fullText: fullText_1.trim(),
                                            sections: sections_1
                                        });
                                    }
                                    else {
                                        console.warn("No extractable content found for PMC".concat(cleanPmcId));
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_5 = _e.sent();
                                    console.warn("Error processing PMC".concat(pmcId, ": ").concat(error_5));
                                    return [2 /*return*/, "continue"];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, pmcIds_1 = pmcIds;
                    _d.label = 1;
                case 1:
                    if (!(_i < pmcIds_1.length)) return [3 /*break*/, 4];
                    pmcId = pmcIds_1[_i];
                    return [5 /*yield**/, _loop_1(pmcId)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
            }
        });
    });
}
// Export citations in RIS format using Literature Citation Exporter API
function exportRIS(pmids) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, allRISData, successCount, batchSize, delayBetweenRequests, i, batch, url, response, risData, tyCount, error_6, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (pmids.length === 0) {
                        return [2 /*return*/, {
                                pmids: [],
                                risData: '',
                                successCount: 0,
                                errorCount: 0,
                                errors: []
                            }];
                    }
                    errors = [];
                    allRISData = '';
                    successCount = 0;
                    batchSize = 10;
                    delayBetweenRequests = 400;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < pmids.length)) return [3 /*break*/, 9];
                    batch = pmids.slice(i, i + batchSize);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    url = "".concat(LIT_CITATION_URL, "/pubmed/?format=ris&id=").concat(batch.join(','));
                    return [4 /*yield*/, fetch(url)];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 4:
                    risData = _a.sent();
                    // Check if we got valid RIS data
                    if (risData.trim() && !risData.includes('Error') && !risData.includes('error')) {
                        allRISData += risData;
                        if (!risData.endsWith('\n')) {
                            allRISData += '\n';
                        }
                        tyCount = (risData.match(/^TY  -/gm) || []).length;
                        successCount += tyCount;
                    }
                    else {
                        errors.push("No valid RIS data for PMIDs: ".concat(batch.join(', ')));
                    }
                    if (!(i + batchSize < pmids.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delayBetweenRequests); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_6 = _a.sent();
                    errorMessage = error_6 instanceof Error ? error_6.message : String(error_6);
                    errors.push("Failed to fetch RIS for PMIDs ".concat(batch.join(', '), ": ").concat(errorMessage));
                    return [3 /*break*/, 8];
                case 8:
                    i += batchSize;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/, {
                        pmids: pmids,
                        risData: allRISData,
                        successCount: successCount,
                        errorCount: pmids.length - successCount,
                        errors: errors
                    }];
            }
        });
    });
}
// Combined search and fetch function
function searchAndFetchArticles(query_1) {
    return __awaiter(this, arguments, void 0, function (query, maxResults) {
        var searchResult, articles, error_7, errorMessage;
        if (maxResults === void 0) { maxResults = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, searchPubMed(query, maxResults)];
                case 1:
                    searchResult = _a.sent();
                    if (searchResult.idList.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, getArticleDetails(searchResult.idList)];
                case 2:
                    articles = _a.sent();
                    return [2 /*return*/, articles];
                case 3:
                    error_7 = _a.sent();
                    errorMessage = error_7 instanceof Error ? error_7.message : String(error_7);
                    throw new Error("Search and fetch failed: ".concat(errorMessage));
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get citation count for specific PMIDs using elink
function getCitationCounts(pmids) {
    return __awaiter(this, void 0, void 0, function () {
        var results, _i, pmids_1, pmid, articleDetails, title, params, url, response, xmlData, parsed, linkSets, linkSetArray, citingPmids, _a, linkSetArray_1, linkSet, linkSetDbs, _b, linkSetDbs_1, linkSetDb, links, linkArray, error_8, errorMessage;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (pmids.length === 0)
                        return [2 /*return*/, []];
                    console.error("getCitationCounts called with ".concat(pmids.length, " PMIDs: ").concat(pmids.join(', ')));
                    results = [];
                    _i = 0, pmids_1 = pmids;
                    _d.label = 1;
                case 1:
                    if (!(_i < pmids_1.length)) return [3 /*break*/, 10];
                    pmid = pmids_1[_i];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, getArticleDetails([pmid])];
                case 3:
                    articleDetails = _d.sent();
                    title = articleDetails.length > 0 ? articleDetails[0].title : 'Unknown title';
                    params = {
                        dbfrom: 'pubmed',
                        db: 'pubmed',
                        id: pmid,
                        linkname: 'pubmed_pubmed_citedin',
                        retmode: 'xml',
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    url = buildUrl(ELINK_URL, params);
                    return [4 /*yield*/, fetch(url)];
                case 4:
                    response = _d.sent();
                    if (!response.ok) {
                        results.push({
                            pmid: pmid,
                            title: title,
                            citationCount: 0,
                            citingPmids: [],
                            error: "HTTP error! status: ".concat(response.status)
                        });
                        return [3 /*break*/, 9];
                    }
                    return [4 /*yield*/, response.text()];
                case 5:
                    xmlData = _d.sent();
                    return [4 /*yield*/, parseXML(xmlData)];
                case 6:
                    parsed = _d.sent();
                    linkSets = ((_c = parsed.eLinkResult) === null || _c === void 0 ? void 0 : _c.LinkSet) || [];
                    linkSetArray = Array.isArray(linkSets) ? linkSets : [linkSets];
                    citingPmids = [];
                    // Find the linkset with pubmed_pubmed_citedin
                    for (_a = 0, linkSetArray_1 = linkSetArray; _a < linkSetArray_1.length; _a++) {
                        linkSet = linkSetArray_1[_a];
                        if (linkSet.LinkSetDb) {
                            linkSetDbs = Array.isArray(linkSet.LinkSetDb) ? linkSet.LinkSetDb : [linkSet.LinkSetDb];
                            for (_b = 0, linkSetDbs_1 = linkSetDbs; _b < linkSetDbs_1.length; _b++) {
                                linkSetDb = linkSetDbs_1[_b];
                                if (linkSetDb.LinkName === 'pubmed_pubmed_citedin') {
                                    links = linkSetDb.Link || [];
                                    linkArray = Array.isArray(links) ? links : [links];
                                    citingPmids = linkArray.map(function (link) { return link.Id; }).filter(Boolean);
                                    break;
                                }
                            }
                        }
                    }
                    results.push({
                        pmid: pmid,
                        title: title,
                        citationCount: citingPmids.length,
                        citingPmids: citingPmids.slice(0, 100) // Limit to first 100 citing PMIDs for performance
                    });
                    // Rate limiting to be respectful to NCBI servers
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 200); })];
                case 7:
                    // Rate limiting to be respectful to NCBI servers
                    _d.sent(); // 200ms delay
                    return [3 /*break*/, 9];
                case 8:
                    error_8 = _d.sent();
                    errorMessage = error_8 instanceof Error ? error_8.message : String(error_8);
                    results.push({
                        pmid: pmid,
                        title: 'Unknown title',
                        citationCount: 0,
                        citingPmids: [],
                        error: "Failed to get citation count: ".concat(errorMessage)
                    });
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, results];
            }
        });
    });
}
// Common medical term mappings to MeSH terms
var MESH_MAPPINGS = {
    // COVID-19 related
    'covid': ['COVID-19', 'SARS-CoV-2'],
    'covid-19': ['COVID-19', 'SARS-CoV-2'],
    'coronavirus': ['COVID-19', 'SARS-CoV-2', 'Coronavirus'],
    'sars-cov-2': ['SARS-CoV-2'],
    // Vaccination related
    'vaccine': ['Vaccination', 'Vaccines', 'Immunization'],
    'vaccination': ['Vaccination', 'Immunization'],
    'immunization': ['Immunization', 'Vaccination'],
    'immunisation': ['Immunization', 'Vaccination'],
    // Heart disease
    'heart attack': ['Myocardial Infarction'],
    'myocardial infarction': ['Myocardial Infarction'],
    'heart disease': ['Heart Disease', 'Cardiovascular Diseases'],
    'cardiac': ['Heart', 'Cardiovascular System'],
    'cardiovascular': ['Cardiovascular Diseases'],
    // Cancer
    'cancer': ['Neoplasms'],
    'tumor': ['Neoplasms'],
    'tumour': ['Neoplasms'],
    'carcinoma': ['Carcinoma'],
    'oncology': ['Medical Oncology', 'Neoplasms'],
    // Diabetes
    'diabetes': ['Diabetes Mellitus'],
    'diabetic': ['Diabetes Mellitus'],
    'insulin': ['Insulin'],
    'blood sugar': ['Blood Glucose'],
    'glucose': ['Glucose', 'Blood Glucose'],
    // Mental health
    'depression': ['Depression', 'Depressive Disorder'],
    'anxiety': ['Anxiety', 'Anxiety Disorders'],
    'mental health': ['Mental Health'],
    'psychiatric': ['Mental Disorders', 'Psychiatry'],
    'psychology': ['Psychology'],
    // Age groups
    'elderly': ['Aged', 'Aged, 80 and over'],
    'older adults': ['Aged'],
    'seniors': ['Aged'],
    'children': ['Child'],
    'pediatric': ['Child', 'Pediatrics'],
    'paediatric': ['Child', 'Pediatrics'],
    'infant': ['Infant'],
    'adolescent': ['Adolescent'],
    // Treatment types
    'treatment': ['Therapeutics', 'Therapy'],
    'therapy': ['Therapy'],
    'drug': ['Pharmaceutical Preparations', 'Drug Therapy'],
    'medication': ['Pharmaceutical Preparations'],
    'surgery': ['Surgical Procedures, Operative'],
    'operation': ['Surgical Procedures, Operative'],
    // Study types
    'clinical trial': ['Clinical Trials as Topic', 'Randomized Controlled Trials as Topic'],
    'randomized': ['Randomized Controlled Trials as Topic'],
    'rct': ['Randomized Controlled Trials as Topic'],
    'meta-analysis': ['Meta-Analysis as Topic'],
    'systematic review': ['Systematic Reviews as Topic'],
    'cohort': ['Cohort Studies'],
    'case-control': ['Case-Control Studies'],
    // Common symptoms
    'pain': ['Pain'],
    'fever': ['Fever'],
    'cough': ['Cough'],
    'fatigue': ['Fatigue'],
    'headache': ['Headache'],
    // Effectiveness terms
    'effectiveness': ['Treatment Outcome', 'Efficacy'],
    'efficacy': ['Treatment Outcome'],
    'outcome': ['Treatment Outcome'],
    'results': ['Treatment Outcome']
};
// Field tag mappings
var FIELD_TAGS = {
    'title': '[ti]',
    'abstract': '[ab]',
    'author': '[au]',
    'journal': '[ta]',
    'text word': '[tw]',
    'mesh': '[MeSH Terms]',
    'major': '[MeSH Major Topic]',
    'publication type': '[pt]',
    'language': '[la]',
    'publication date': '[pdat]'
};
// Optimize search query by adding MeSH terms and proper formatting
function optimizeSearchQuery(originalQuery) {
    return __awaiter(this, void 0, void 0, function () {
        var improvements, meshTermsUsed, fieldTagsUsed, lowerQuery, words, queryParts, processedTerms, i, word, meshTerms, meshQuery, twoWordPhrase, threeWordPhrase, meshTerms, meshQuery, meshTerms, meshQuery, optimizedQuery, estimatedResults, searchResult, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    improvements = [];
                    meshTermsUsed = [];
                    fieldTagsUsed = [];
                    lowerQuery = originalQuery.toLowerCase();
                    words = lowerQuery.split(/\s+/);
                    queryParts = [];
                    processedTerms = new Set();
                    // Process each word and find MeSH mappings
                    for (i = 0; i < words.length; i++) {
                        word = words[i].replace(/[^\w\s-]/g, '');
                        // Check for exact matches first
                        if (MESH_MAPPINGS[word] && !processedTerms.has(word)) {
                            meshTerms = MESH_MAPPINGS[word];
                            meshQuery = meshTerms.map(function (term) { return "\"".concat(term, "\"[MeSH Terms]"); }).join(' OR ');
                            if (meshTerms.length > 1) {
                                queryParts.push("(".concat(meshQuery, ")"));
                            }
                            else {
                                queryParts.push(meshQuery);
                            }
                            meshTermsUsed.push.apply(meshTermsUsed, meshTerms);
                            fieldTagsUsed.push('[MeSH Terms]');
                            processedTerms.add(word);
                            improvements.push("Added MeSH terms for \"".concat(word, "\": ").concat(meshTerms.join(', ')));
                        }
                        // Check for multi-word phrases
                        else if (i < words.length - 1) {
                            twoWordPhrase = "".concat(word, " ").concat(words[i + 1]);
                            threeWordPhrase = i < words.length - 2 ? "".concat(word, " ").concat(words[i + 1], " ").concat(words[i + 2]) : '';
                            if (MESH_MAPPINGS[threeWordPhrase] && !processedTerms.has(threeWordPhrase)) {
                                meshTerms = MESH_MAPPINGS[threeWordPhrase];
                                meshQuery = meshTerms.map(function (term) { return "\"".concat(term, "\"[MeSH Terms]"); }).join(' OR ');
                                if (meshTerms.length > 1) {
                                    queryParts.push("(".concat(meshQuery, ")"));
                                }
                                else {
                                    queryParts.push(meshQuery);
                                }
                                meshTermsUsed.push.apply(meshTermsUsed, meshTerms);
                                fieldTagsUsed.push('[MeSH Terms]');
                                processedTerms.add(threeWordPhrase);
                                improvements.push("Added MeSH terms for \"".concat(threeWordPhrase, "\": ").concat(meshTerms.join(', ')));
                                i += 2; // Skip next two words
                            }
                            else if (MESH_MAPPINGS[twoWordPhrase] && !processedTerms.has(twoWordPhrase)) {
                                meshTerms = MESH_MAPPINGS[twoWordPhrase];
                                meshQuery = meshTerms.map(function (term) { return "\"".concat(term, "\"[MeSH Terms]"); }).join(' OR ');
                                if (meshTerms.length > 1) {
                                    queryParts.push("(".concat(meshQuery, ")"));
                                }
                                else {
                                    queryParts.push(meshQuery);
                                }
                                meshTermsUsed.push.apply(meshTermsUsed, meshTerms);
                                fieldTagsUsed.push('[MeSH Terms]');
                                processedTerms.add(twoWordPhrase);
                                improvements.push("Added MeSH terms for \"".concat(twoWordPhrase, "\": ").concat(meshTerms.join(', ')));
                                i += 1; // Skip next word
                            }
                            else if (!processedTerms.has(word)) {
                                // Keep original word with text word tag for broader search
                                queryParts.push("\"".concat(word, "\"[tw]"));
                                fieldTagsUsed.push('[tw]');
                                processedTerms.add(word);
                            }
                        }
                        else if (!processedTerms.has(word)) {
                            // Single word with no MeSH mapping
                            queryParts.push("\"".concat(word, "\"[tw]"));
                            fieldTagsUsed.push('[tw]');
                            processedTerms.add(word);
                        }
                    }
                    optimizedQuery = queryParts.join(' AND ');
                    // Add general improvements
                    if (meshTermsUsed.length > 0) {
                        improvements.push("Applied MeSH standardization for better precision");
                    }
                    if (fieldTagsUsed.includes('[tw]')) {
                        improvements.push("Added text word tags for comprehensive search");
                    }
                    // Add parentheses for complex queries
                    if (queryParts.length > 2) {
                        improvements.push("Structured query with proper boolean logic");
                    }
                    // If no improvements were made, provide a basic optimization
                    if (improvements.length === 0) {
                        optimizedQuery = "\"".concat(originalQuery, "\"[tw]");
                        improvements.push("Added text word field tag for better search targeting");
                        fieldTagsUsed.push('[tw]');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, searchPubMed(optimizedQuery, 1)];
                case 2:
                    searchResult = _a.sent();
                    estimatedResults = searchResult.count;
                    improvements.push("Estimated ".concat(estimatedResults.toLocaleString(), " results with optimized query"));
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, {
                        originalQuery: originalQuery,
                        optimizedQuery: optimizedQuery,
                        improvements: improvements,
                        meshTermsUsed: __spreadArray([], new Set(meshTermsUsed), true), // Remove duplicates
                        fieldTagsUsed: __spreadArray([], new Set(fieldTagsUsed), true), // Remove duplicates
                        estimatedResults: estimatedResults
                    }];
            }
        });
    });
}
// Find similar articles using PubMed's ELink API
function findSimilarArticles(pmid_1) {
    return __awaiter(this, arguments, void 0, function (pmid, maxResults) {
        var elinkParams, elinkUrl, elinkResponse, elinkXml, elinkParsed, linkSets, linkSet, linkSetDbs, targetLinkSetDb, _i, linkSetDbs_2, lsdb, similarLinks, similarPmids_1, pmidList, articles, results, error_10, errorMessage;
        if (maxResults === void 0) { maxResults = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    elinkParams = {
                        dbfrom: 'pubmed',
                        db: 'pubmed',
                        id: pmid,
                        linkname: 'pubmed_pubmed', // Use the full similar articles linkname
                        cmd: 'neighbor',
                        retmode: 'xml',
                        retmax: maxResults + 10, // Request extra to account for filtering
                        tool: 'mcp-pubmed-server',
                        email: process.env.NCBI_EMAIL || 'user@example.com'
                    };
                    elinkUrl = buildUrl(ELINK_URL, elinkParams);
                    return [4 /*yield*/, fetch(elinkUrl)];
                case 1:
                    elinkResponse = _a.sent();
                    if (!elinkResponse.ok) {
                        throw new Error("HTTP error! status: ".concat(elinkResponse.status));
                    }
                    return [4 /*yield*/, elinkResponse.text()];
                case 2:
                    elinkXml = _a.sent();
                    return [4 /*yield*/, parseXML(elinkXml)];
                case 3:
                    elinkParsed = _a.sent();
                    // Debug: Log the raw response structure
                    console.error('ELink Response:', JSON.stringify(elinkParsed, null, 2).substring(0, 500));
                    // Extract similar PMIDs with scores
                    // Check if we have any LinkSet
                    if (!elinkParsed.eLinkResult || !elinkParsed.eLinkResult.LinkSet) {
                        console.error('No LinkSet in response');
                        return [2 /*return*/, []];
                    }
                    linkSets = Array.isArray(elinkParsed.eLinkResult.LinkSet)
                        ? elinkParsed.eLinkResult.LinkSet
                        : [elinkParsed.eLinkResult.LinkSet];
                    linkSet = linkSets[0];
                    if (!linkSet) {
                        console.error('Empty LinkSet');
                        return [2 /*return*/, []];
                    }
                    // Check if we have LinkSetDb (contains the similar articles)
                    if (!linkSet.LinkSetDb) {
                        console.error('No LinkSetDb found - article may not have similar articles');
                        return [2 /*return*/, []];
                    }
                    linkSetDbs = Array.isArray(linkSet.LinkSetDb) ? linkSet.LinkSetDb : [linkSet.LinkSetDb];
                    targetLinkSetDb = null;
                    for (_i = 0, linkSetDbs_2 = linkSetDbs; _i < linkSetDbs_2.length; _i++) {
                        lsdb = linkSetDbs_2[_i];
                        if (lsdb.LinkName === 'pubmed_pubmed' || lsdb.LinkName === 'pubmed_pubmed_five') {
                            targetLinkSetDb = lsdb;
                            break;
                        }
                    }
                    if (!targetLinkSetDb || !targetLinkSetDb.Link) {
                        console.error('No similar articles links found');
                        return [2 /*return*/, []];
                    }
                    similarLinks = Array.isArray(targetLinkSetDb.Link) ? targetLinkSetDb.Link : [targetLinkSetDb.Link];
                    console.error("Found ".concat(similarLinks.length, " similar articles for PMID ").concat(pmid));
                    similarPmids_1 = similarLinks
                        .slice(0, maxResults + 1) // Get one extra in case we need to filter out the original
                        .map(function (link) {
                        // Handle both direct ID and nested structure
                        var linkId = link.Id || link;
                        return {
                            pmid: linkId.toString(),
                            score: link.Score ? link.Score.toString() : undefined
                        };
                    })
                        .filter(function (item) { return item.pmid && item.pmid !== pmid; }) // Exclude the original article
                        .slice(0, maxResults);
                    if (similarPmids_1.length === 0) {
                        return [2 /*return*/, []];
                    }
                    pmidList = similarPmids_1.map(function (item) { return item.pmid; });
                    return [4 /*yield*/, getArticleDetails(pmidList)];
                case 4:
                    articles = _a.sent();
                    results = articles.map(function (article, index) {
                        var similarItem = similarPmids_1.find(function (item) { return item.pmid === article.pmid; });
                        return {
                            pmid: article.pmid,
                            title: article.title,
                            authors: article.authors,
                            journal: article.journal,
                            publicationDate: article.publicationDate,
                            abstract: article.abstract,
                            similarityScore: (similarItem === null || similarItem === void 0 ? void 0 : similarItem.score) ? parseFloat(similarItem.score) : undefined,
                            doi: article.doi,
                            pmcId: article.pmcId
                        };
                    });
                    // Sort by similarity score (higher is better)
                    results.sort(function (a, b) {
                        if (a.similarityScore && b.similarityScore) {
                            return b.similarityScore - a.similarityScore;
                        }
                        return 0;
                    });
                    return [2 /*return*/, results];
                case 5:
                    error_10 = _a.sent();
                    errorMessage = error_10 instanceof Error ? error_10.message : String(error_10);
                    throw new Error("Failed to find similar articles: ".concat(errorMessage));
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Utility function to delay execution
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
// Batch processing function
function batchProcess(pmids_2, operations_1) {
    return __awaiter(this, arguments, void 0, function (pmids, operations, maxConcurrency) {
        var taskId, batchOperations, _i, pmids_3, pmid, _a, operations_2, operation, results, operationGroups, _b, pmids_4, pmid, _c, operations_3, operation, _loop_2, _d, _e, _f, operation, pmidList, summary, error_11, errorMessage;
        if (maxConcurrency === void 0) { maxConcurrency = 3; }
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    taskId = "batch_".concat(Date.now());
                    batchOperations = [];
                    // Initialize operations for each PMID
                    for (_i = 0, pmids_3 = pmids; _i < pmids_3.length; _i++) {
                        pmid = pmids_3[_i];
                        for (_a = 0, operations_2 = operations; _a < operations_2.length; _a++) {
                            operation = operations_2[_a];
                            batchOperations.push({
                                pmid: pmid,
                                operation: operation,
                                status: 'pending'
                            });
                        }
                    }
                    results = {};
                    operationGroups = {};
                    for (_b = 0, pmids_4 = pmids; _b < pmids_4.length; _b++) {
                        pmid = pmids_4[_b];
                        for (_c = 0, operations_3 = operations; _c < operations_3.length; _c++) {
                            operation = operations_3[_c];
                            if (!operationGroups[operation]) {
                                operationGroups[operation] = [];
                            }
                            operationGroups[operation].push(pmid);
                        }
                    }
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 6, , 7]);
                    _loop_2 = function (operation, pmidList) {
                        var _h, i, chunk, abstracts, i, chunk, citations, _j, pmidList_1, pmid, similar, error_12, risChunks, i, chunk, risResult, error_13, articlesWithPMC, pmcIds, i, chunk, fullTexts, error_14, error_15;
                        var _k, _l, _m;
                        return __generator(this, function (_o) {
                            switch (_o.label) {
                                case 0:
                                    console.error("Processing ".concat(operation, " for ").concat(pmidList.length, " PMIDs..."));
                                    // Update status to processing
                                    batchOperations
                                        .filter(function (op) { return op.operation === operation; })
                                        .forEach(function (op) { return op.status = 'processing'; });
                                    _o.label = 1;
                                case 1:
                                    _o.trys.push([1, 42, , 43]);
                                    _h = operation;
                                    switch (_h) {
                                        case 'abstract': return [3 /*break*/, 2];
                                        case 'citations': return [3 /*break*/, 8];
                                        case 'similar': return [3 /*break*/, 14];
                                        case 'ris_export': return [3 /*break*/, 22];
                                        case 'full_text': return [3 /*break*/, 31];
                                    }
                                    return [3 /*break*/, 41];
                                case 2:
                                    // Process in chunks to respect rate limits
                                    results.abstracts = [];
                                    i = 0;
                                    _o.label = 3;
                                case 3:
                                    if (!(i < pmidList.length)) return [3 /*break*/, 7];
                                    chunk = pmidList.slice(i, i + 20);
                                    return [4 /*yield*/, getFullAbstract(chunk)];
                                case 4:
                                    abstracts = _o.sent();
                                    (_k = results.abstracts).push.apply(_k, abstracts);
                                    if (!(i + 20 < pmidList.length)) return [3 /*break*/, 6];
                                    return [4 /*yield*/, delay(300)];
                                case 5:
                                    _o.sent(); // Rate limiting
                                    _o.label = 6;
                                case 6:
                                    i += 20;
                                    return [3 /*break*/, 3];
                                case 7: return [3 /*break*/, 41];
                                case 8:
                                    results.citations = [];
                                    console.error("Processing citations for ".concat(pmidList.length, " PMIDs..."));
                                    i = 0;
                                    _o.label = 9;
                                case 9:
                                    if (!(i < pmidList.length)) return [3 /*break*/, 13];
                                    chunk = pmidList.slice(i, i + 10);
                                    console.error("Processing citation chunk ".concat(i / 10 + 1, ": PMIDs ").concat(chunk.join(', ')));
                                    return [4 /*yield*/, getCitationCounts(chunk)];
                                case 10:
                                    citations = _o.sent();
                                    console.error("Got ".concat(citations.length, " citation results for chunk"));
                                    (_l = results.citations).push.apply(_l, citations);
                                    if (!(i + 10 < pmidList.length)) return [3 /*break*/, 12];
                                    return [4 /*yield*/, delay(400)];
                                case 11:
                                    _o.sent(); // Rate limiting
                                    _o.label = 12;
                                case 12:
                                    i += 10;
                                    return [3 /*break*/, 9];
                                case 13:
                                    console.error("Total citation results: ".concat(results.citations.length));
                                    return [3 /*break*/, 41];
                                case 14:
                                    results.similar = {};
                                    _j = 0, pmidList_1 = pmidList;
                                    _o.label = 15;
                                case 15:
                                    if (!(_j < pmidList_1.length)) return [3 /*break*/, 21];
                                    pmid = pmidList_1[_j];
                                    _o.label = 16;
                                case 16:
                                    _o.trys.push([16, 19, , 20]);
                                    return [4 /*yield*/, findSimilarArticles(pmid, 5)];
                                case 17:
                                    similar = _o.sent();
                                    results.similar[pmid] = similar;
                                    return [4 /*yield*/, delay(300)];
                                case 18:
                                    _o.sent(); // Rate limiting
                                    return [3 /*break*/, 20];
                                case 19:
                                    error_12 = _o.sent();
                                    console.error("Error finding similar articles for ".concat(pmid, ":"), error_12);
                                    results.similar[pmid] = [];
                                    return [3 /*break*/, 20];
                                case 20:
                                    _j++;
                                    return [3 /*break*/, 15];
                                case 21: return [3 /*break*/, 41];
                                case 22:
                                    risChunks = [];
                                    i = 0;
                                    _o.label = 23;
                                case 23:
                                    if (!(i < pmidList.length)) return [3 /*break*/, 30];
                                    chunk = pmidList.slice(i, i + 50);
                                    _o.label = 24;
                                case 24:
                                    _o.trys.push([24, 28, , 29]);
                                    return [4 /*yield*/, exportRIS(chunk)];
                                case 25:
                                    risResult = _o.sent();
                                    if (risResult.risData) {
                                        risChunks.push(risResult.risData);
                                    }
                                    if (!(i + 50 < pmidList.length)) return [3 /*break*/, 27];
                                    return [4 /*yield*/, delay(500)];
                                case 26:
                                    _o.sent(); // Rate limiting
                                    _o.label = 27;
                                case 27: return [3 /*break*/, 29];
                                case 28:
                                    error_13 = _o.sent();
                                    console.error("Error exporting RIS for chunk:", error_13);
                                    return [3 /*break*/, 29];
                                case 29:
                                    i += 50;
                                    return [3 /*break*/, 23];
                                case 30:
                                    results.risExports = risChunks.join('\n\n');
                                    return [3 /*break*/, 41];
                                case 31:
                                    results.fullTexts = [];
                                    return [4 /*yield*/, getArticleDetails(pmidList)];
                                case 32:
                                    articlesWithPMC = _o.sent();
                                    pmcIds = articlesWithPMC
                                        .filter(function (article) { return article.pmcId; })
                                        .map(function (article) { return article.pmcId; });
                                    if (!(pmcIds.length > 0)) return [3 /*break*/, 40];
                                    i = 0;
                                    _o.label = 33;
                                case 33:
                                    if (!(i < pmcIds.length)) return [3 /*break*/, 40];
                                    chunk = pmcIds.slice(i, i + 10);
                                    _o.label = 34;
                                case 34:
                                    _o.trys.push([34, 38, , 39]);
                                    return [4 /*yield*/, getFullText(chunk)];
                                case 35:
                                    fullTexts = _o.sent();
                                    (_m = results.fullTexts).push.apply(_m, fullTexts);
                                    if (!(i + 10 < pmcIds.length)) return [3 /*break*/, 37];
                                    return [4 /*yield*/, delay(600)];
                                case 36:
                                    _o.sent(); // Rate limiting
                                    _o.label = 37;
                                case 37: return [3 /*break*/, 39];
                                case 38:
                                    error_14 = _o.sent();
                                    console.error("Error getting full text for chunk:", error_14);
                                    return [3 /*break*/, 39];
                                case 39:
                                    i += 10;
                                    return [3 /*break*/, 33];
                                case 40: return [3 /*break*/, 41];
                                case 41:
                                    // Mark operations as completed
                                    batchOperations
                                        .filter(function (op) { return op.operation === operation; })
                                        .forEach(function (op) { return op.status = 'completed'; });
                                    return [3 /*break*/, 43];
                                case 42:
                                    error_15 = _o.sent();
                                    console.error("Error processing ".concat(operation, ":"), error_15);
                                    // Mark operations as failed
                                    batchOperations
                                        .filter(function (op) { return op.operation === operation; })
                                        .forEach(function (op) {
                                        op.status = 'error';
                                        op.error = error_15 instanceof Error ? error_15.message : String(error_15);
                                    });
                                    return [3 /*break*/, 43];
                                case 43: return [2 /*return*/];
                            }
                        });
                    };
                    _d = 0, _e = Object.entries(operationGroups);
                    _g.label = 2;
                case 2:
                    if (!(_d < _e.length)) return [3 /*break*/, 5];
                    _f = _e[_d], operation = _f[0], pmidList = _f[1];
                    return [5 /*yield**/, _loop_2(operation, pmidList)];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4:
                    _d++;
                    return [3 /*break*/, 2];
                case 5:
                    summary = {
                        total: batchOperations.length,
                        completed: batchOperations.filter(function (op) { return op.status === 'completed'; }).length,
                        failed: batchOperations.filter(function (op) { return op.status === 'error'; }).length,
                        processing: batchOperations.filter(function (op) { return op.status === 'processing'; }).length
                    };
                    return [2 /*return*/, {
                            taskId: taskId,
                            operations: batchOperations,
                            summary: summary,
                            results: results
                        }];
                case 6:
                    error_11 = _g.sent();
                    errorMessage = error_11 instanceof Error ? error_11.message : String(error_11);
                    throw new Error("Batch processing failed: ".concat(errorMessage));
                case 7: return [2 /*return*/];
            }
        });
    });
}

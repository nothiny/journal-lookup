// API配置
const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1/paper/search';
const CCF_DIRECTORY_URL = 'https://www.ccf.org.cn/Academic_Evaluation/By_category/';
const REQUEST_TIMEOUT = 15000; // 15秒超时
const MAX_RETRIES = 2; // 最大重试次数
const MIN_SEARCH_INTERVAL = 1500; // 最小搜索间隔，避免过快触发限流
const DEFAULT_RATE_LIMIT_COOLDOWN = 10000; // 429后的默认冷却时间

const CCF_VENUE_MAPPINGS = [
    { abbr: 'AAAI', level: 'A', aliases: ['aaai', 'aaai conference on artificial intelligence'] },
    { abbr: 'ACL', level: 'A', aliases: ['acl', 'annual meeting of the association for computational linguistics'] },
    { abbr: 'AAMAS', level: 'B', aliases: ['aamas', 'international conference on autonomous agents and multiagent systems'] },
    { abbr: 'ACMMM', level: 'A', aliases: ['acm mm', 'acmmm', 'acm international conference on multimedia', 'international conference on multimedia'] },
    { abbr: 'ASE', level: 'A', aliases: ['ase', 'international conference on automated software engineering'] },
    { abbr: 'ASPLOS', level: 'A', aliases: ['asplos', 'architectural support for programming languages and operating systems'] },
    { abbr: 'CCS', level: 'A', aliases: ['ccs', 'acm conference on computer and communications security'] },
    { abbr: 'CHI', level: 'A', aliases: ['chi', 'conference on human factors in computing systems'] },
    { abbr: 'CIKM', level: 'B', aliases: ['cikm', 'international conference on information and knowledge management'] },
    { abbr: 'COLING', level: 'B', aliases: ['coling', 'international conference on computational linguistics'] },
    { abbr: 'COLT', level: 'B', aliases: ['colt', 'conference on learning theory'] },
    { abbr: 'CVPR', level: 'A', aliases: ['cvpr', 'ieee conference on computer vision and pattern recognition', 'ieee cvf conference on computer vision and pattern recognition'] },
    { abbr: 'DAC', level: 'A', aliases: ['dac', 'design automation conference'] },
    { abbr: 'ECCV', level: 'B', aliases: ['eccv', 'european conference on computer vision'] },
    { abbr: 'ECIR', level: 'B', aliases: ['ecir', 'european conference on information retrieval'] },
    { abbr: 'EMNLP', level: 'B', aliases: ['emnlp', 'conference on empirical methods in natural language processing'] },
    { abbr: 'EUROCRYPT', level: 'A', aliases: ['eurocrypt', 'annual international conference on the theory and applications of cryptographic techniques'] },
    { abbr: 'FAST', level: 'A', aliases: ['fast', 'usenix conference on file and storage technologies'] },
    { abbr: 'FOCS', level: 'A', aliases: ['focs', 'annual ieee symposium on foundations of computer science'] },
    { abbr: 'ICCAD', level: 'B', aliases: ['iccad', 'international conference on computer aided design'] },
    { abbr: 'ICCV', level: 'A', aliases: ['iccv', 'international conference on computer vision'] },
    { abbr: 'ICDE', level: 'A', aliases: ['icde', 'international conference on data engineering'] },
    { abbr: 'ICDM', level: 'B', aliases: ['icdm', 'ieee international conference on data mining'] },
    { abbr: 'ICLR', level: 'A', aliases: ['iclr', 'international conference on learning representations'] },
    { abbr: 'ICML', level: 'A', aliases: ['icml', 'international conference on machine learning'] },
    { abbr: 'ICSE', level: 'A', aliases: ['icse', 'international conference on software engineering'] },
    { abbr: 'IJCAI', level: 'A', aliases: ['ijcai', 'international joint conference on artificial intelligence'] },
    { abbr: 'INFOCOM', level: 'A', aliases: ['infocom', 'ieee international conference on computer communications'] },
    { abbr: 'IROS', level: 'C', aliases: ['iros', 'ieee rsj international conference on intelligent robots and systems'] },
    { abbr: 'ISCA', level: 'A', aliases: ['isca', 'international symposium on computer architecture'] },
    { abbr: 'KDD', level: 'A', aliases: ['kdd', 'acm sigkdd international conference on knowledge discovery and data mining'] },
    { abbr: 'MICRO', level: 'A', aliases: ['micro', 'ieee acm international symposium on microarchitecture'] },
    { abbr: 'MM', level: 'C', aliases: ['mm', 'acm multimedia'] },
    { abbr: 'MMSEC', level: 'C', aliases: ['mmsec', 'workshop on multimedia and security'] },
    { abbr: 'MOBICOM', level: 'A', aliases: ['mobicom', 'annual international conference on mobile computing and networking'] },
    { abbr: 'NAACL', level: 'B', aliases: ['naacl', 'north american chapter of the association for computational linguistics'] },
    { abbr: 'NDSS', level: 'A', aliases: ['ndss', 'network and distributed system security symposium'] },
    { abbr: 'NeurIPS', level: 'A', aliases: ['neurips', 'nips', 'conference on neural information processing systems', 'advances in neural information processing systems'] },
    { abbr: 'NSDI', level: 'A', aliases: ['nsdi', 'usenix symposium on networked systems design and implementation'] },
    { abbr: 'OSDI', level: 'A', aliases: ['osdi', 'usenix symposium on operating systems design and implementation'] },
    { abbr: 'PAMI', level: 'A', aliases: ['pami', 'ieee transactions on pattern analysis and machine intelligence', 'tpami'] },
    { abbr: 'PETS', level: 'B', aliases: ['pets', 'privacy enhancing technologies symposium'] },
    { abbr: 'PLDI', level: 'A', aliases: ['pldi', 'acm sigplan conference on programming language design and implementation'] },
    { abbr: 'PODS', level: 'A', aliases: ['pods', 'symposium on principles of database systems'] },
    { abbr: 'PPoPP', level: 'A', aliases: ['ppopp', 'symposium on principles and practice of parallel programming'] },
    { abbr: 'S&P', level: 'A', aliases: ['s p', 'oakland', 'ieee symposium on security and privacy'] },
    { abbr: 'SC', level: 'A', aliases: ['sc', 'international conference for high performance computing networking storage and analysis', 'supercomputing'] },
    { abbr: 'SIGGRAPH', level: 'A', aliases: ['siggraph', 'acm siggraph annual conference on computer graphics and interactive techniques'] },
    { abbr: 'SIGIR', level: 'A', aliases: ['sigir', 'international acm sigir conference on research and development in information retrieval'] },
    { abbr: 'SIGMOD', level: 'A', aliases: ['sigmod', 'international conference on management of data', 'acm sigmod international conference on management of data'] },
    { abbr: 'SOSP', level: 'A', aliases: ['sosp', 'symposium on operating systems principles'] },
    { abbr: 'STOC', level: 'A', aliases: ['stoc', 'annual acm symposium on theory of computing'] },
    { abbr: 'TACL', level: 'B', aliases: ['tacl', 'transactions of the association for computational linguistics'] },
    { abbr: 'TIFS', level: 'A', aliases: ['tifs', 'ieee transactions on information forensics and security'] },
    { abbr: 'TKDE', level: 'A', aliases: ['tkde', 'ieee transactions on knowledge and data engineering'] },
    { abbr: 'TOCHI', level: 'A', aliases: ['tochi', 'acm transactions on computer human interaction'] },
    { abbr: 'TODS', level: 'A', aliases: ['tods', 'acm transactions on database systems'] },
    { abbr: 'TOMM', level: 'B', aliases: ['tomm', 'acm transactions on multimedia computing communications and applications'] },
    { abbr: 'TPDS', level: 'A', aliases: ['tpds', 'ieee transactions on parallel and distributed systems'] },
    { abbr: 'TSE', level: 'A', aliases: ['tse', 'ieee transactions on software engineering'] },
    { abbr: 'UAI', level: 'B', aliases: ['uai', 'conference on uncertainty in artificial intelligence'] },
    { abbr: 'UIST', level: 'A', aliases: ['uist', 'annual acm symposium on user interface software and technology'] },
    { abbr: 'USENIX Security', level: 'A', aliases: ['usenix security', 'usenix security symposium'] },
    { abbr: 'VLDB', level: 'A', aliases: ['vldb', 'very large data bases', 'international conference on very large data bases'] },
    { abbr: 'WWW', level: 'A', aliases: ['www', 'web conference', 'world wide web conference', 'international world wide web conference'] }
];

// DOM元素
const paperInput = document.getElementById('paperInput');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const errorMessage = document.getElementById('errorMessage');

// 请求状态
let isSearching = false;
let lastRequestTimestamp = 0;
let rateLimitCooldownUntil = 0;
const searchCache = new Map();

function normalizeQuery(query) {
    return query.trim().toLowerCase();
}

function normalizeVenueName(text) {
    return text
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\b(proceedings|conference|international|annual|ieee|acm|the|on|of|for|and|symposium|workshop|journal|transactions)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getRemainingCooldownSeconds() {
    return Math.max(1, Math.ceil((rateLimitCooldownUntil - Date.now()) / 1000));
}

function parseRetryAfterSeconds(value) {
    if (!value) return null;

    const asSeconds = Number(value);
    if (Number.isFinite(asSeconds) && asSeconds >= 0) {
        return asSeconds;
    }

    const retryDate = new Date(value);
    const delayMs = retryDate.getTime() - Date.now();
    if (Number.isFinite(delayMs) && delayMs > 0) {
        return Math.ceil(delayMs / 1000);
    }

    return null;
}

function setSearchControlsDisabled(disabled) {
    searchBtn.disabled = disabled;
    paperInput.disabled = disabled;
}

function resolveCcfVenue(paper) {
    const candidates = [
        getVenueInfo(paper),
        paper.venue,
        paper.publicationVenue && paper.publicationVenue.name
    ].filter(Boolean);

    const normalizedCandidates = candidates.map(normalizeVenueName);

    for (const mapping of CCF_VENUE_MAPPINGS) {
        const normalizedAliases = mapping.aliases.map(normalizeVenueName);
        if (normalizedCandidates.some(candidate => normalizedAliases.includes(candidate))) {
            return mapping;
        }
    }

    return null;
}

// 带超时的 fetch 请求
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接或稍后重试');
        }
        throw error;
    }
}

// 检查网络连接
function checkNetworkConnection() {
    if (!navigator.onLine) {
        return false;
    }
    return true;
}

// 搜索功能（带重试机制）
async function searchPaper(query, retryCount = 0) {
    if (!query || query.trim().length === 0) {
        showError('请输入论文标题');
        return;
    }

    const normalizedQuery = normalizeQuery(query);

    if (isSearching && retryCount === 0) {
        showError('请求进行中，请稍候再试');
        return;
    }

    if (Date.now() < rateLimitCooldownUntil) {
        showError(`请求过于频繁，请在 ${getRemainingCooldownSeconds()} 秒后重试`);
        return;
    }

    if (retryCount === 0) {
        const cachedResult = searchCache.get(normalizedQuery);
        if (cachedResult) {
            hideError();
            if (cachedResult.length > 0) {
                displayResults(cachedResult, query);
            } else {
                showNoResults();
            }
            return;
        }

        const elapsedSinceLastRequest = Date.now() - lastRequestTimestamp;
        if (elapsedSinceLastRequest < MIN_SEARCH_INTERVAL) {
            const waitSeconds = Math.max(1, Math.ceil((MIN_SEARCH_INTERVAL - elapsedSinceLastRequest) / 1000));
            showError(`请求过于频繁，请在 ${waitSeconds} 秒后重试`);
            return;
        }
    }

    // 检查网络连接
    if (!checkNetworkConnection()) {
        showError('网络未连接，请检查您的网络设置');
        return;
    }

    // 显示加载状态
    isSearching = true;
    lastRequestTimestamp = Date.now();
    setSearchControlsDisabled(true);
    showLoading();
    hideResults();
    hideError();

    try {
        // 使用Semantic Scholar API搜索（带超时）
        const response = await fetchWithTimeout(
            `${SEMANTIC_SCHOLAR_API}?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,venue,publicationVenue,externalIds,citationCount,paperId,url`
        );

        if (!response.ok) {
            // 处理不同的HTTP状态码
            if (response.status === 429) {
                const rateLimitError = new Error('RATE_LIMIT');
                rateLimitError.retryAfterSeconds = parseRetryAfterSeconds(response.headers.get('Retry-After'));
                throw rateLimitError;
            } else if (response.status === 503) {
                throw new Error('SERVICE_UNAVAILABLE');
            } else if (response.status >= 500) {
                throw new Error('SERVER_ERROR');
            } else {
                throw new Error(`API请求失败: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            searchCache.set(normalizedQuery, data.data);
            displayResults(data.data, query);
        } else {
            searchCache.set(normalizedQuery, []);
            showNoResults();
        }
    } catch (error) {
        console.error('搜索错误:', error);
        
        let errorMsg = '';
        let shouldRetry = false;
        
        // 根据错误类型提供不同的提示
        if (error.message.includes('请求超时') || error.message.includes('AbortError')) {
            errorMsg = '请求超时，可能是网络较慢或API响应延迟';
            shouldRetry = retryCount < MAX_RETRIES;
        } else if (error.message.includes('Failed to fetch') || 
                   error.message.includes('NetworkError') ||
                   error.message.includes('Network request failed')) {
            errorMsg = '网络连接失败，可能的原因：\n• 网络连接不稳定\n• API服务暂时不可用\n• 浏览器安全策略限制\n\n请检查网络连接后重试';
            shouldRetry = retryCount < MAX_RETRIES;
        } else if (error.message === 'RATE_LIMIT') {
            const retryAfterSeconds = error.retryAfterSeconds || DEFAULT_RATE_LIMIT_COOLDOWN / 1000;
            rateLimitCooldownUntil = Date.now() + retryAfterSeconds * 1000;
            errorMsg = `请求过于频繁，API速率限制。请在 ${retryAfterSeconds} 秒后重试`;
        } else if (error.message === 'SERVICE_UNAVAILABLE') {
            errorMsg = 'API服务暂时不可用，请稍后再试';
            shouldRetry = retryCount < MAX_RETRIES;
        } else if (error.message === 'SERVER_ERROR') {
            errorMsg = '服务器错误，请稍后重试';
            shouldRetry = retryCount < MAX_RETRIES;
        } else if (error.message.includes('CORS')) {
            errorMsg = '跨域请求被阻止，可能是浏览器安全设置或网络问题';
        } else {
            errorMsg = `搜索失败: ${error.message}\n\n可能的原因：\n• 网络连接问题\n• API服务暂时不可用\n• 请求超时\n\n请稍后重试`;
            shouldRetry = retryCount < MAX_RETRIES;
        }
        
        // 如果需要重试且未达到最大重试次数
        if (shouldRetry) {
            console.log(`重试搜索 (${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // 递增延迟
            return searchPaper(query, retryCount + 1);
        }
        
        showError(errorMsg);
    } finally {
        isSearching = false;
        setSearchControlsDisabled(false);
        hideLoading();
    }
}

// 判断是否为arXiv发表（没有正式期刊/会议）
function isArXivOnly(paper) {
    const venue = getVenueInfo(paper);
    // 如果没有venue，或者venue是arXiv相关，且没有DOI，则认为是仅arXiv
    if (!venue) {
        return true;
    }
    // 如果venue名称包含arXiv，且没有DOI，认为是仅arXiv
    const venueLower = venue.toLowerCase();
    if ((venueLower.includes('arxiv') || venueLower.includes('preprint')) && 
        (!paper.externalIds || !paper.externalIds.DOI)) {
        return true;
    }
    return false;
}

// 判断是否有正式发表位置
function hasFormalPublication(paper) {
    const venue = getVenueInfo(paper);
    if (!venue) return false;
    
    const venueLower = venue.toLowerCase();
    
    // 如果有DOI，通常说明已正式发表（即使venue是arXiv）
    if (paper.externalIds && paper.externalIds.DOI) {
        // 但如果venue明确是arXiv且没有其他信息，仍视为预印本
        if (venueLower.includes('arxiv') && !venueLower.includes('journal') && 
            !venueLower.includes('conference') && !venueLower.includes('proceedings')) {
            return false;
        }
        return true;
    }
    
    // 排除arXiv和preprint（没有DOI的情况）
    if (venueLower.includes('arxiv') || venueLower.includes('preprint')) {
        return false;
    }
    
    // 其他情况视为正式发表
    return true;
}

// 显示搜索结果
function displayResults(papers, query) {
    resultsList.innerHTML = '';
    
    // 对结果进行排序：有正式发表的排在前面
    const sortedPapers = papers.sort((a, b) => {
        const aHasFormal = hasFormalPublication(a);
        const bHasFormal = hasFormalPublication(b);
        
        if (aHasFormal && !bHasFormal) return -1;
        if (!aHasFormal && bHasFormal) return 1;
        
        // 如果都有或都没有，按引用数排序
        const aCitations = a.citationCount || 0;
        const bCitations = b.citationCount || 0;
        return bCitations - aCitations;
    });
    
    sortedPapers.forEach((paper, index) => {
        const card = createPaperCard(paper, query);
        // 添加延迟动画
        card.style.animationDelay = `${index * 0.1}s`;
        resultsList.appendChild(card);
    });
    
    showResults();
}

// 获取论文链接
function getPaperUrl(paper) {
    // 优先使用API返回的url
    if (paper.url) {
        return paper.url;
    }
    // 如果有paperId，构建Semantic Scholar链接
    if (paper.paperId) {
        return `https://www.semanticscholar.org/paper/${paper.paperId}`;
    }
    // 如果有arXiv ID，构建arXiv链接
    if (paper.externalIds && paper.externalIds.ArXiv) {
        return `https://arxiv.org/abs/${paper.externalIds.ArXiv}`;
    }
    // 如果有DOI，构建DOI链接
    if (paper.externalIds && paper.externalIds.DOI) {
        return `https://doi.org/${paper.externalIds.DOI}`;
    }
    return null;
}

// 创建论文卡片
function createPaperCard(paper, query) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    // 判断是否有正式发表
    const hasFormal = hasFormalPublication(paper);
    const isArXiv = isArXivOnly(paper);
    
    // 获取论文链接
    const paperUrl = getPaperUrl(paper);
    
    // 如果有链接，添加点击跳转功能
    if (paperUrl) {
        card.style.cursor = 'pointer';
        card.title = '点击查看论文详情';
        card.setAttribute('data-clickable', 'true');
        card.addEventListener('click', (e) => {
            // 如果点击的是按钮或链接，不触发卡片跳转
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            window.open(paperUrl, '_blank');
        });
        card.classList.add('clickable');
    }
    
    // 如果有正式发表，添加特殊样式
    if (hasFormal) {
        card.classList.add('has-formal-publication');
    } else if (isArXiv) {
        card.classList.add('arxiv-only');
    }
    
    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'flex-start';
    titleRow.style.gap = '10px';
    titleRow.style.marginBottom = '12px';
    
    const title = document.createElement('div');
    title.className = 'paper-title';
    title.style.flex = '1';
    title.textContent = paper.title || '未知标题';
    titleRow.appendChild(title);
    
    // 添加含金量标签
    if (hasFormal) {
        const badge = document.createElement('span');
        badge.className = 'publication-badge formal';
        badge.textContent = '✓ 正式发表';
        badge.title = '该论文已正式发表在期刊或会议上';
        titleRow.appendChild(badge);
    } else if (isArXiv) {
        const badge = document.createElement('span');
        badge.className = 'publication-badge arxiv';
        badge.textContent = '⚠ 仅arXiv';
        badge.title = '该论文仅在arXiv发表，未找到正式发表位置';
        titleRow.appendChild(badge);
    }
    
    card.appendChild(titleRow);
    
    const info = document.createElement('div');
    info.className = 'paper-info';
    
    // 期刊/会议信息（优先显示正式发表位置）
    const venue = getVenueInfo(paper);
    if (venue) {
        let venueLabel = '📖 发表位置';
        let venueValue = venue;
        
        // 如果是arXiv，明确标注
        if (isArXiv && !hasFormal) {
            venueLabel = '📄 预印本';
            venueValue = venue + ' (预印本)';
        }
        
        const venueItem = createInfoItem(venueLabel, venueValue);
        info.appendChild(venueItem);

        const ccfVenue = resolveCcfVenue(paper);
        if (ccfVenue) {
            const ccfItem = createLinkItem('🏷️ CCF简称', ccfVenue.abbr, CCF_DIRECTORY_URL);
            ccfItem.title = '点击跳转到 CCF 官方目录，可用简称继续检索';
            info.appendChild(ccfItem);

            const ccfLevelItem = createInfoItem('📊 CCF等级', ccfVenue.level);
            info.appendChild(ccfLevelItem);
        } else {
            const ccfItem = createLinkItem('🏷️ CCF目录', '去官网检索', CCF_DIRECTORY_URL);
            ccfItem.title = '当前未匹配到内置简称，可打开 CCF 官方目录手动查询';
            info.appendChild(ccfItem);
        }
    } else {
        // 如果没有venue信息，显示提示
        const venueItem = createInfoItem('📄 发表状态', '未找到发表信息');
        info.appendChild(venueItem);

        const ccfItem = createLinkItem('🏷️ CCF目录', '去官网检索', CCF_DIRECTORY_URL);
        ccfItem.title = '可打开 CCF 官方目录手动查询';
        info.appendChild(ccfItem);
    }
    
    // 年份
    if (paper.year) {
        const yearItem = createInfoItem('📅 年份', `${paper.year}`);
        info.appendChild(yearItem);
    }
    
    // 作者
    if (paper.authors && paper.authors.length > 0) {
        const authorsText = paper.authors
            .slice(0, 5)
            .map(a => a.name || '未知作者')
            .join(', ') + (paper.authors.length > 5 ? ' 等' : '');
        const authorsItem = createInfoItem('👥 作者', authorsText);
        info.appendChild(authorsItem);
    }
    
    // 引用数
    if (paper.citationCount !== undefined) {
        const citationItem = createInfoItem('📊 引用数', paper.citationCount.toLocaleString());
        info.appendChild(citationItem);
    }
    
    // arXiv ID（如果有）
    if (paper.externalIds && paper.externalIds.ArXiv) {
        const arxivLink = `https://arxiv.org/abs/${paper.externalIds.ArXiv}`;
        const arxivItem = createLinkItem('🔗 arXiv', `arXiv:${paper.externalIds.ArXiv}`, arxivLink);
        info.appendChild(arxivItem);
    }
    
    // DOI（如果有）
    if (paper.externalIds && paper.externalIds.DOI) {
        const doiLink = `https://doi.org/${paper.externalIds.DOI}`;
        const doiItem = createLinkItem('🔗 DOI', paper.externalIds.DOI, doiLink);
        info.appendChild(doiItem);
    }
    
    // 添加查看详情按钮
    if (paperUrl) {
        const viewButton = document.createElement('button');
        viewButton.className = 'view-button';
        viewButton.innerHTML = '<span>🔗</span> 查看详情';
        viewButton.onclick = (e) => {
            e.stopPropagation();
            window.open(paperUrl, '_blank');
        };
        info.appendChild(viewButton);
    }
    
    card.appendChild(info);
    return card;
}

// 获取期刊/会议信息
function getVenueInfo(paper) {
    // 优先使用 publicationVenue（更准确）
    if (paper.publicationVenue) {
        if (paper.publicationVenue.name) {
            return paper.publicationVenue.name;
        }
    }
    
    // 其次使用 venue
    if (paper.venue) {
        return paper.venue;
    }
    
    return null;
}

// 创建信息项
function createInfoItem(label, value) {
    const item = document.createElement('div');
    item.className = 'info-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'info-label';
    labelSpan.textContent = label;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'info-value';
    
    // 如果是期刊名称，添加特殊样式
    if (label.includes('发表位置')) {
        valueSpan.className += ' journal-name';
    }
    
    valueSpan.textContent = value;
    
    item.appendChild(labelSpan);
    item.appendChild(valueSpan);
    
    return item;
}

// 创建链接信息项
function createLinkItem(label, value, url) {
    const item = document.createElement('div');
    item.className = 'info-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'info-label';
    labelSpan.textContent = label;
    
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'info-link';
    link.textContent = value;
    link.onclick = (e) => e.stopPropagation();
    
    item.appendChild(labelSpan);
    item.appendChild(link);
    
    return item;
}

// 显示/隐藏函数
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showResults() {
    resultsContainer.classList.remove('hidden');
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

function showError(message) {
    // 支持多行文本显示
    errorMessage.innerHTML = message.replace(/\n/g, '<br>');
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showNoResults() {
    resultsList.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>未找到相关论文</h3>
            <p>请尝试使用不同的关键词或检查拼写</p>
        </div>
    `;
    showResults();
}

// 事件监听
searchBtn.addEventListener('click', () => {
    const query = paperInput.value.trim();
    searchPaper(query);
});

paperInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = paperInput.value.trim();
        searchPaper(query);
    }
});

paperInput.addEventListener('input', (e) => {
    if (e.target.value.trim().length === 0) {
        hideResults();
        hideError();
        hideLoading();
    }
});

// 监听网络状态变化
window.addEventListener('online', () => {
    console.log('网络连接已恢复');
    // 可以在这里添加提示，但不要过于打扰用户
});

window.addEventListener('offline', () => {
    console.log('网络连接已断开');
    showError('网络连接已断开，请检查您的网络设置');
});

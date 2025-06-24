// test_components.js
// Simple test script for component interactions

// Mock DOM and browser environment
const mockDocument = {
  getElementById: () => ({})
};

const mockWindow = {
  innerWidth: 1024,
  marked: {
    parse: (content) => `<p>${content}</p>`
  },
  DOMPurify: {
    sanitize: (html, options) => html
  }
};

// Mock React
const mockReact = {
  useState: (initialValue) => [initialValue, () => {}],
  useEffect: (callback, deps) => callback(),
  useMemo: (callback, deps) => callback()
};

// Mock fetch response
const mockFetch = async (url) => {
  if (url.includes('NOT_EXIST')) {
    return {
      ok: false,
      status: 404,
      text: async () => ''
    };
  }
  return {
    ok: true,
    text: async () => '# Test Markdown'
  };
};

// Test App component state management
function testAppStateManagement() {
  console.log('Testing App component state management...');

  // Mock the useState hook to track state changes
  let activePageState = 'docsHub';
  let isSidebarOpenState = true;

  const setActivePage = (newValue) => {
    activePageState = newValue;
    console.log(`Active page changed to: ${newValue}`);
  };

  const setIsSidebarOpen = (newValue) => {
    isSidebarOpenState = newValue;
    console.log(`Sidebar open state changed to: ${newValue}`);
  };

  mockReact.useState = (initialValue) => {
    if (initialValue === 'docsHub') {
      return [activePageState, setActivePage];
    }
    if (initialValue === true) {
      return [isSidebarOpenState, setIsSidebarOpen];
    }
    return [initialValue, () => {}];
  };

  // Simulate menu toggle
  const handleMenuToggle = () => setIsSidebarOpen(!isSidebarOpenState);
  handleMenuToggle();

  // Test result
  console.log(`Test ${isSidebarOpenState === false ? 'PASSED' : 'FAILED'}: handleMenuToggle should toggle sidebar state`);

  // Reset state for next test
  isSidebarOpenState = true;
}

// Test DocsHub component caching and error handling
async function testDocsHubComponent() {
  console.log('\nTesting DocsHub component caching and error handling...');

  // Mock states
  let docContent = '';
  let isLoading = true;
  let error = null;
  let docCache = {};

  const setDocContent = (value) => { docContent = value; };
  const setIsLoading = (value) => { isLoading = value; };
  const setError = (value) => { error = value; };
  const setDocCache = (callback) => { docCache = callback(docCache); };

  mockReact.useState = (initialValue) => {
    if (initialValue === '') return [docContent, setDocContent];
    if (initialValue === true) return [isLoading, setIsLoading];
    if (initialValue === null) return [error, setError];
    if (typeof initialValue === 'object' && initialValue !== null) return [docCache, setDocCache];
    return [initialValue, () => {}];
  };

  // Test successful fetch and caching
  global.fetch = (url) => mockFetch(url);

  const activeDoc = { trackId: 'project', docType: 'roadmap' };
  const docFileMapping = {
    "project": {
      files: {
        roadmap: "PROJECT--ROADMAP.md"
      }
    }
  };

  // Simulate fetchDoc function
  const fetchDoc = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate cache key
      const cacheKey = `${activeDoc.trackId}-${activeDoc.docType}`;

      // Check if document is in cache
      if (docCache[cacheKey]) {
        setDocContent(docCache[cacheKey]);
        setIsLoading(false);
        return;
      }

      const fileName = docFileMapping[activeDoc.trackId]?.files[activeDoc.docType];

      if (!fileName) {
        throw new Error(`File mapping not found`);
      }

      const url = `https://example.com/${fileName}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      if (!text || text.trim() === '') {
        throw new Error("Empty document content");
      }

      setDocContent(text);

      // Add to cache
      setDocCache(prevCache => ({
        ...prevCache,
        [cacheKey]: text
      }));
    } catch (e) {
      console.error("Error fetching document:", e);
      setError(e.message);
      setDocContent('');
    } finally {
      setIsLoading(false);
    }
  };

  // Test successful fetch
  await fetchDoc();
  console.log(`Test ${docContent === '# Test Markdown' ? 'PASSED' : 'FAILED'}: Document content should be set after successful fetch`);
  console.log(`Test ${isLoading === false ? 'PASSED' : 'FAILED'}: Loading state should be false after fetch`);
  console.log(`Test ${error === null ? 'PASSED' : 'FAILED'}: Error should be null after successful fetch`);

  // Test cache usage
  const cachedContent = docCache['project-roadmap'];
  console.log(`Test ${cachedContent === '# Test Markdown' ? 'PASSED' : 'FAILED'}: Document should be stored in cache`);

  // Reset states
  docContent = '';
  isLoading = true;

  // Fetch again (should use cache)
  await fetchDoc();
  console.log(`Test ${docContent === '# Test Markdown' ? 'PASSED' : 'FAILED'}: Document content should be retrieved from cache`);

  // Test error handling
  activeDoc.docType = 'nonexistent';
  await fetchDoc();
  console.log(`Test ${error !== null ? 'PASSED' : 'FAILED'}: Error should be set when file mapping not found`);
}

// Test DOMPurify sanitization
function testDOMPurifySanitization() {
  console.log('\nTesting DOMPurify sanitization...');

  // Mock window.DOMPurify with tracking
  let sanitizeCalled = false;
  let sanitizeOptions = null;

  window = {
    ...mockWindow,
    DOMPurify: {
      sanitize: (html, options) => {
        sanitizeCalled = true;
        sanitizeOptions = options;
        return html;
      }
    },
    marked: {
      parse: (content) => '<div>Parsed markdown</div>'
    }
  };

  // Mock useMemo to execute callback
  mockReact.useMemo = (callback) => callback();

  // Test function similar to parsedHtml in DocsHub
  const getParsedHtml = (content) => {
    if (!window.marked || !content) {
      return { __html: '' };
    }

    try {
      // Generate HTML from markdown
      const rawHtml = window.marked.parse(content);

      // Sanitize HTML to prevent XSS attacks
      const sanitizedHtml = window.DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'],
        ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class', 'id']
      });

      return { __html: sanitizedHtml };
    } catch (e) {
      console.error("Error parsing markdown:", e);
      return { __html: '<p>Error parsing markdown content.</p>' };
    }
  };

  // Test sanitization
  const result = getParsedHtml('# Test content with <script>alert("XSS")</script>');

  console.log(`Test ${sanitizeCalled ? 'PASSED' : 'FAILED'}: DOMPurify.sanitize should be called`);
  console.log(`Test ${sanitizeOptions && sanitizeOptions.ALLOWED_TAGS ? 'PASSED' : 'FAILED'}: Sanitization should specify allowed tags`);
}

// Run tests
console.log('=== COMPONENT TESTS ===');
testAppStateManagement();
testDocsHubComponent().then(() => {
  testDOMPurifySanitization();
  console.log('\nTests completed.');
});

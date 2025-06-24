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
      text: async () => '',
      headers: {
        get: (name) => name === 'content-type' ? 'text/plain' : null
      }
    };
  }
  return {
    ok: true,
    text: async () => '# Test Markdown',
    headers: {
      get: (name) => name === 'content-type' ? 'text/markdown' : null
    }
  };
};

// Test App component state management
function testAppStateManagement() {
  console.log('Testing App component state management...');

  // Test initial state
  const appProps = {};
  const app = new App(appProps);

  if (app.state.activePage !== 'docsHub') {
    console.error('❌ Initial activePage state should be docsHub');
  } else {
    console.log('✅ Initial activePage state is correct');
  }

  if (!app.state.isSidebarOpen) {
    console.error('❌ Initial sidebar state should be open');
  } else {
    console.log('✅ Initial sidebar state is correct');
  }

  console.log('App component state management tests completed');
}

// Test DocsHub component
async function testDocsHubComponent() {
  console.log('\nTesting DocsHub component...');

  // Mock successful fetch
  window.fetch = (url) => mockFetch(url);

  // Test successful document fetch
  const docsHubProps = {
    isSidebarOpen: true,
    setIsSidebarOpen: () => {},
    docFileMapping: {
      "project": {
        name: "Project Overview",
        icon: "🌟",
        files: { prd: "PROJECT--PRD.md" }
      }
    }
  };

  const docsHub = new DocsHub(docsHubProps);
  await docsHub.fetchDoc();

  if (docsHub.state.error) {
    console.error('❌ DocsHub should not have error when fetch is successful');
  } else {
    console.log('✅ DocsHub handles successful fetch correctly');
  }

  // Test failed fetch
  window.fetch = (url) => mockFetch('NOT_EXIST');
  await docsHub.fetchDoc();

  if (!docsHub.state.error) {
    console.error('❌ DocsHub should have error when fetch fails');
  } else {
    console.log('✅ DocsHub handles failed fetch correctly');
  }

  // Test invalid content type
  window.fetch = async () => ({
    ok: true,
    text: async () => 'Not markdown content',
    headers: {
      get: (name) => name === 'content-type' ? 'application/json' : null
    }
  });

  await docsHub.fetchDoc();

  if (!docsHub.state.error || !docsHub.state.error.includes('content type')) {
    console.error('❌ DocsHub should validate content type');
  } else {
    console.log('✅ DocsHub validates content type correctly');
  }

  console.log('DocsHub component tests completed');
}

// Test sanitization with DOMPurify
function testDOMPurifySanitization() {
  console.log('\nTesting DOMPurify sanitization...');

  // Malicious script input
  const maliciousContent = '# Heading\n\n<script>alert("XSS")</script>';
  const parsedHtml = window.marked.parse(maliciousContent);

  // Test sanitization
  const sanitizedHtml = window.DOMPurify.sanitize(parsedHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['h1', 'p', 'a'],
    ALLOWED_ATTR: ['href']
  });

  if (sanitizedHtml.includes('<script>')) {
    console.error('❌ DOMPurify sanitization failed to remove script tag');
  } else {
    console.log('✅ DOMPurify sanitization successfully removes script tags');
  }

  console.log('DOMPurify sanitization tests completed');
}

// Test sidebar state management
function testSidebarStateManagement() {
  console.log('\nTesting Sidebar state management...');

  const sidebar = new Sidebar({
    onSelect: () => {},
    activeDoc: { trackId: 'project', docType: 'roadmap' },
    isSidebarOpen: true,
    docFileMapping: {
      "project": { name: "Project Overview", icon: "🌟" }
    }
  });

  if (!sidebar.state.openTracks.project) {
    console.error('❌ Initial project track state should be open');
  } else {
    console.log('✅ Initial track state is correct');
  }

  sidebar.toggleTrack('project');

  if (sidebar.state.openTracks.project) {
    console.error('❌ Track state should toggle to closed');
  } else {
    console.log('✅ Track state toggle works correctly');
  }

  console.log('Sidebar state management tests completed');
}

// Run all tests
function runTests() {
  console.log('Running component tests...');
  testAppStateManagement();
  testDocsHubComponent();
  testDOMPurifySanitization();
  testSidebarStateManagement();
  console.log('\nAll tests completed');
}

// Setup mock environment
globalThis.document = mockDocument;
globalThis.window = mockWindow;
globalThis.React = mockReact;

// Run tests
runTests();

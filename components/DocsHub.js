// DocsHub.js
// Main documentation hub component for the LUMIN.AI Project Hub
const { useState, useEffect, useMemo } = React;

const DocsHub = ({ isSidebarOpen, setIsSidebarOpen, docFileMapping }) => {
  const [activeDoc, setActiveDoc] = useState({
    trackId: "project",
    docType: "roadmap",
  });
  const [docContent, setDocContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache for storing fetched documents to avoid redundant network requests
  const [docCache, setDocCache] = useState({});

  // GitHub repo URL for fetching docs
  const GITHUB_REPO_URL_BASE =
    "https://raw.githubusercontent.com/uelkerd/lumin-ai/main/docs/architecture/";

  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!activeDoc || !activeDoc.trackId || !activeDoc.docType) {
          throw new Error("Invalid document selection");
        }

        // Generate cache key
        const cacheKey = `${activeDoc.trackId}-${activeDoc.docType}`;

        // Check if document is in cache
        if (docCache[cacheKey]) {
          setDocContent(docCache[cacheKey]);
          setIsLoading(false);
          return;
        }

        if (!docFileMapping || !docFileMapping[activeDoc.trackId]) {
          throw new Error("Cannot find document mapping for selected track");
        }

        const fileName =
          docFileMapping[activeDoc.trackId]?.files[activeDoc.docType];

        if (!fileName) {
          throw new Error("Cannot find filename for selected document");
        }

        const url = `${GITHUB_REPO_URL_BASE}${fileName}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} - Could not fetch ${fileName}`,
          );
        }

        // Validate content type
        const contentType = response.headers.get("content-type");
        if (
          contentType &&
          !contentType.includes("text/plain") &&
          !contentType.includes("text/markdown")
        ) {
          throw new Error(`Unexpected content type: ${contentType}`);
        }

        const text = await response.text();

        if (!text || text.trim() === "") {
          throw new Error("Document is empty");
        }

        setDocContent(text);

        // Add to cache
        setDocCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: text,
        }));
      } catch (e) {
        console.error(`Error fetching document: ${e.message}`);
        setError(`Error fetching document: ${e.message}`);
        setDocContent(""); // Clear content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();
  }, [activeDoc, docFileMapping, docCache]);

  const handleSelect = (trackId, docType) => {
    if (trackId && docType) {
      setActiveDoc({ trackId, docType });
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } else {
      console.error("Invalid trackId or docType in handleSelect");
    }
  };

  const parsedHtml = useMemo(() => {
    if (
      typeof window.marked !== "undefined" &&
      typeof window.DOMPurify !== "undefined" &&
      docContent
    ) {
      try {
        // Use DOMPurify to sanitize the HTML before rendering
        const rawHtml = window.marked.parse(docContent);
        const sanitizedHtml = window.DOMPurify.sanitize(rawHtml, {
          USE_PROFILES: { html: true },
          ALLOWED_TAGS: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "a",
            "ul",
            "ol",
            "li",
            "code",
            "pre",
            "strong",
            "em",
            "blockquote",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "hr",
            "br",
            "img",
          ],
          ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id"],
        });
        return { __html: sanitizedHtml };
      } catch (e) {
        console.error("Error parsing markdown:", e);
        // Use generic error message instead of exposing specific error details
        setError("Error rendering content. Please try again later.");
        return { __html: "<p>Error rendering markdown content</p>" };
      }
    }
    return { __html: "" };
  }, [docContent]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar
        onSelect={handleSelect}
        activeDoc={activeDoc}
        isSidebarOpen={isSidebarOpen}
        docFileMapping={docFileMapping}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 min-h-full">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={parsedHtml}
            />
          )}
        </div>
      </main>
    </div>
  );
};

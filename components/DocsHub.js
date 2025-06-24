// DocsHub.js
// Main documentation hub component for the LUMIN.AI Project Hub
const { useState, useEffect, useMemo } = React;

const DocsHub = ({ isSidebarOpen, setIsSidebarOpen, docFileMapping }) => {
    const [activeDoc, setActiveDoc] = useState({ trackId: 'project', docType: 'roadmap' });
    const [docContent, setDocContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache for storing fetched documents to avoid redundant network requests
    const [docCache, setDocCache] = useState({});

    // GitHub repo URL for fetching docs
    const GITHUB_REPO_URL_BASE = "https://raw.githubusercontent.com/uelkerd/lumin-ai/main/docs/architecture/";

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

                const fileName = docFileMapping[activeDoc.trackId]?.files[activeDoc.docType];

                if (!fileName) {
                    throw new Error(`File mapping not found for ${activeDoc.trackId}/${activeDoc.docType}`);
                }

                const url = `${GITHUB_REPO_URL_BASE}${fileName}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - Could not fetch ${url}`);
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
                setDocContent(''); // Clear content on error
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
            console.error("Invalid selection:", trackId, docType);
        }
    };

    const parsedHtml = useMemo(() => {
        // Ensure both marked and DOMPurify are available
        if (window.marked && window.DOMPurify && docContent) {
            try {
                // Generate HTML from markdown
                const rawHtml = window.marked.parse(docContent);

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
                setError(`Error parsing markdown content: ${e.message}`); // Provide specific error to user
                return { __html: '<p>Error parsing markdown content.</p>' };
            }
        }
        return { __html: '' };
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
                        <LoadingSpinner/>
                    ) : error ? (
                        <ErrorMessage error={error}/>
                    ) : (
                        <div className="markdown-content" dangerouslySetInnerHTML={parsedHtml}/>
                    )}
                </div>
            </main>
        </div>
    );
};
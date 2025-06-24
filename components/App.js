// App.js
const { useState } = React;

const App = () => {
    const [activePage, setActivePage] = useState('docsHub'); // docsHub, roadmapCanvas, overview
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Configuration for fetching docs from GitHub
    const docFileMapping = {
        "project": { 
            name: "Project Overview", 
            icon: "🌟", 
            files: { 
                prd: "PROJECT--PRD.md", 
                mvp: "PROJECT--MVP.md", 
                roadmap: "PROJECT--ROADMAP.md" 
            }
        },
        "web-dev": { 
            name: "Web Development", 
            icon: "💻", 
            files: { 
                prd: "WebDev--PRD.md", 
                mvp: "WebDev--MVP.md", 
                roadmap: "WebDev--ROADMAP.md" 
            }
        },
        "ux-design": { 
            name: "UX Design", 
            icon: "🎨", 
            files: { 
                prd: "UX--PRD.md", 
                mvp: "UX--MVP.md", 
                roadmap: "UX--ROADMAP.md" 
            }
        },
        "data-science": { 
            name: "Data Science", 
            icon: "📊", 
            files: { 
                prd: "DataSci--PRD.md", 
                mvp: "DataSci--MVP.md", 
                roadmap: "DataSci--ROADMAP.md" 
            }
        },
        "deep-learning": { 
            name: "Deep Learning", 
            icon: "🧠", 
            files: { 
                prd: "DeepLearn--PRD.md", 
                mvp: "DeepLearn--MVP.md", 
                roadmap: "DeepLearn--ROADMAP.md" 
            }
        }
    };

    const handleMenuToggle = () => setIsSidebarOpen(!isSidebarOpen);

    const Header = () => {
        const Logo = () => (
            <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#4f46e5'}} />
                        <stop offset="50%" style={{stopColor: '#3b82f6'}} />
                        <stop offset="100%" style={{stopColor: '#1e3a8a'}} />
                    </linearGradient>
                </defs>
                <g id="icon" fill="url(#logoGradient)">
                    <path d="M 25,50 Q 50,20 75,50" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.8" />
                    <path d="M 25,50 Q 50,80 75,50" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.8" />
                    <path d="M 75,50 Q 95,50 115,50" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <path d="M 25,50 C 45,5 105,5 115,50" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.4" />
                    <path d="M 25,50 C 45,95 105,95 115,50" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.4" />
                    <circle cx="25" cy="50" r="7" opacity="0.7"/>
                    <circle cx="75" cy="50" r="9" />
                    <circle cx="115" cy="50" r="7" opacity="0.7"/>
                    <circle cx="50" cy="32" r="3.5" opacity="0.9"/>
                    <circle cx="50" cy="68" r="3.5" opacity="0.9"/>
                </g>
                <text x="150" y="62" fontFamily="'Exo 2', sans-serif" fontSize="40" fontWeight="600" fill="url(#logoGradient)">LUMIN.AI</text>
            </svg>
        );
        
        const NavButton = ({ pageId, children }) => (
            <button 
                onClick={() => setActivePage(pageId)} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activePage === pageId ? 
                    'bg-indigo-600 text-white shadow' : 
                    'text-gray-600 hover:bg-gray-200'
                }`}
            >
                {children}
            </button>
        );
        
        return (
            <header className="bg-white shadow-sm sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <button 
                        onClick={handleMenuToggle} 
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4 md:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <Logo />
                </div>
                <div className="flex items-center space-x-2">
                    <NavButton pageId="docsHub">📄 Docs Hub</NavButton>
                    <NavButton pageId="roadmapCanvas">🗺️ Roadmap Canvas</NavButton>
                    <NavButton pageId="overview">✨ Overview</NavButton>
                </div>
            </header>
        );
    };

    // Render the appropriate page based on state and pass down necessary props for state management
    const renderPage = () => {
        switch(activePage) {
            case 'docsHub':
                return <DocsHub 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen}
                    docFileMapping={docFileMapping}
                />;
            case 'roadmapCanvas':
                return (
                    <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        <LuminAIRoadmapCanvas />
                    </main>
                );
            case 'overview':
                return (
                    <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        <OverviewPage />
                    </main>
                );
            default:
                return <DocsHub 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen}
                    docFileMapping={docFileMapping}
                />;
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                {renderPage()}
            </div>
        </div>
    );
};

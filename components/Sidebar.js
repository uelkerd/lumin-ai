// Sidebar.js
// Sidebar navigation component for the LUMIN.AI Project Hub
const { useState } = React;

const Sidebar = ({ onSelect, activeDoc, isSidebarOpen, docFileMapping }) => {
  const [openTracks, setOpenTracks] = useState({
    project: true,
    "web-dev": true,
    "ux-design": true,
    "data-science": true,
    "deep-learning": true,
  });

  const toggleTrack = (trackId) =>
    setOpenTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));

  const NavItem = ({ trackId, docType, children }) => (
    <li
      onClick={() => onSelect(trackId, docType)}
      className={`pl-10 pr-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
        activeDoc.trackId === trackId && activeDoc.docType === docType
          ? "bg-indigo-100 text-indigo-700 font-semibold"
          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {children}
    </li>
  );

  return (
    <aside
      className={`bg-gray-100 border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-4 h-full overflow-y-auto custom-scrollbar">
        <nav>
          <ul>
            {Object.entries(docFileMapping).map(([trackId, track]) => (
              <li key={trackId} className="mb-2">
                <div
                  onClick={() => toggleTrack(trackId)}
                  className="flex items-center justify-between px-3 py-2 text-md font-semibold text-gray-800 rounded-md cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-xl">{track.icon}</span>
                    <span>{track.name}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${openTracks[trackId] ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                {openTracks[trackId] && (
                  <ul className="mt-1 space-y-1">
                    <NavItem trackId={trackId} docType="prd">
                      PRD
                    </NavItem>
                    <NavItem trackId={trackId} docType="mvp">
                      MVP
                    </NavItem>
                    <NavItem trackId={trackId} docType="roadmap">
                      Roadmap
                    </NavItem>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

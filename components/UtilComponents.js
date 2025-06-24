// UtilComponents.js
// Utility components for the LUMIN.AI Project Hub

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 loading-spinner"></div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
    <p className="font-bold">Error loading document</p>
    <p>{error}</p>
    <p className="mt-2 text-sm">Please check the file name and path in your GitHub repository.</p>
  </div>
);
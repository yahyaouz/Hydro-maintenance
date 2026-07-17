import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DataLoadErrorProps {
  message?: string;
}

export const DataLoadError: React.FC<DataLoadErrorProps> = ({ message }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-red-800" id="data-load-error-banner">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <p className="font-medium">
            {message || "Impossible de charger certaines données. Vérifiez votre connexion et réessayez."}
          </p>
        </div>
      </div>
      <button
        onClick={handleReload}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-900 rounded-md text-sm font-medium transition-colors shrink-0"
        id="data-load-error-reload-btn"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
};

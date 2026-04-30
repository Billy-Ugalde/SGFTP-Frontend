import "../styles/ListState.css";

interface ListStateProps {
  isLoading: boolean;
  loadingText: string;
  error?: unknown;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
};

const ListState = ({
  isLoading,
  loadingText,
  error,
  errorTitle,
  errorDescription,
  onRetry,
}: ListStateProps) => {
  if (isLoading) {
    return (
      <div className="users-list__state">
        <div className="users-list__spinner" />
        <span>{loadingText}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-list__state users-list__state--error">
        <p className="users-list__state-title">{errorTitle || "Error al cargar"}</p>
        <p className="users-list__state-desc">
          {errorDescription || getErrorMessage(error)}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="users-list__retry-btn">
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default ListState;

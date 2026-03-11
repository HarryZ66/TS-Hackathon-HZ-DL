export function getErrorMessage(error) {
  if (error.message === "REQUEST_TIMEOUT") {
    return {
      type: "timeout",
      title: "Request timed out",
      message: "The AI is taking too long. Please try again.",
      action: "Retry",
    };
  }
  if (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    error.message === "Failed to fetch"
  ) {
    return {
      type: "network",
      title: "No internet connection",
      message: "Check your connection and try again.",
      action: "Retry",
    };
  }
  if (error.status >= 400) {
    return {
      type: "api",
      title: "Something went wrong",
      message: `Error ${error.status}: ${error.statusText || "API error"}. Please try again.`,
      action: "Retry",
    };
  }
  return {
    type: "unknown",
    title: "Unexpected error",
    message: error.message || "Please try again.",
    action: "Retry",
  };
}

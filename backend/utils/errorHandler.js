/**
 * Shared error response helper.
 * Logs the full error server-side but only sends a generic message to the client.
 * This prevents leaking stack traces, DB details, or internal paths to attackers.
 */
const handleError = (res, error, context = 'Server') => {
  console.error(`[${context}]`, error.message);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};

module.exports = { handleError };

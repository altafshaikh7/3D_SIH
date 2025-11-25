import React from 'react';

// Runtime enum replacement for view modes
export const ViewMode = {
  OVERVIEW: 'overview',
  TRANSFORMER: 'transformer',
  BREAKER: 'breaker',
};

// NOTE:
// Other TypeScript-only interfaces and types (DeviceStat, SelectedObject, etc.)
// were used only at type level and are no longer needed in plain JS.
// The components now work with plain JS objects without compile-time typing.

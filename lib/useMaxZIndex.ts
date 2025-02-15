/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useMemo } from "react";

import { useThreads } from "@liveblocks/react";

// Returns the highest z-index of all threads
export const useMaxZIndex = () => {
  // get all threads
  const { threads } = useThreads();

  // calculate the max z-index
  return useMemo(() => {
    let max = 0;
    if (!threads) return max;
    for (const thread of threads) {
      // @ts-expect-error
      if (thread.metadata.zIndex > max) {
        // @ts-expect-error
        max = thread.metadata.zIndex;
      }
    }
    return max;
  }, [threads]);
};

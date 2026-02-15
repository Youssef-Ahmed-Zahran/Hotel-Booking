import type { RefObject } from "react";
import "./infiniteScrollFooter.scss";

interface InfiniteScrollFooterProps {
  isFetching: boolean;
  hasMore: boolean;
  endMessage?: string;
  loaderText?: string;
  observerRef: RefObject<HTMLDivElement | null>;
}

const InfiniteScrollFooter = ({
  isFetching,
  hasMore,
  endMessage = "You've reached the end of the list.",
  loaderText = "Loading more...",
  observerRef,
}: InfiniteScrollFooterProps) => {
  return (
    <div ref={observerRef} className="infinite-scroll-footer">
      {isFetching && (
        <div className="infinite-scroll-footer__loading">
          <div className="infinite-scroll-footer__spinner"></div>
          <p className="infinite-scroll-footer__text">{loaderText}</p>
        </div>
      )}
      {!hasMore && !isFetching && (
        <p className="infinite-scroll-footer__end-message">{endMessage}</p>
      )}
    </div>
  );
};

export default InfiniteScrollFooter;

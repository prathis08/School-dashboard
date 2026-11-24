import React, { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Reusable modal dialog with backdrop, ESC-to-close, and click-outside-to-close.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen           — controls visibility
 * @param {Function} props.onClose          — invoked on backdrop click or ESC
 * @param {string}  [props.title]           — heading text rendered in the modal header
 * @param {string}  [props.size]            — "sm" | "md" | "lg" | "xl" (default "md")
 * @param {boolean} [props.closeOnBackdrop] — defaults true
 * @param {React.ReactNode} props.children  — body content
 */
const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full ${SIZE_CLASSES[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  closeOnBackdrop: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Modal;

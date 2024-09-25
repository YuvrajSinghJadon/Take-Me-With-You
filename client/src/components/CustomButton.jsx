const CustomButton = ({
  title,
  containerStyles = "", // Default to an empty string if not provided
  iconRight,
  type = "button", // Default type to "button"
  onClick,
  backgroundColor = "bg-blue-600", // Default background color as Tailwind class
  textColor = "text-white", // Default text color as Tailwind class
  disabled = false, // Add disabled prop
  size = "md", // Add size prop (sm, md, lg)
  ariaLabel, // Optional aria-label for accessibility
  hoverBackgroundColor = "hover:bg-blue-700",
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={`inline-flex justify-center items-center ${
        sizeClasses[size]
      } ${containerStyles} ${backgroundColor} ${textColor} ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : `${hoverBackgroundColor} active:bg-blue-800`
      } transition-colors duration-200 ease-in-out`}
      disabled={disabled}
      aria-label={ariaLabel || title} // Provide default aria-label if not passed
    >
      {title}
      {iconRight && <div className="ml-2">{iconRight}</div>}
    </button>
  );
};

export default CustomButton;

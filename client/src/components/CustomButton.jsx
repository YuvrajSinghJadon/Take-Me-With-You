const CustomButton = ({
  title,
  containerStyles,
  iconRight,
  type,
  onClick,
  backgroundColor = "#2f27ce", // Default background color
  textColor = "#fff", // Default text color
  disabled = false, // Add disabled prop
}) => {
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      className={`inline-flex justify-center items-center text-base ${containerStyles} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`} // Add styles for disabled state
      style={{
        backgroundColor: disabled ? "#ccc" : backgroundColor, // Set background color
        color: textColor, // Set text color
      }}
      disabled={disabled} // Set disabled attribute
    >
      {title}

      {iconRight && <div className="ml-2">{iconRight}</div>}
    </button>
  );
};

export default CustomButton;

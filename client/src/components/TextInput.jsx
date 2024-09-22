import React from "react";

const TextInput = React.forwardRef(
  (
    {
      type = "text",
      placeholder,
      styles,
      label,
      labelStyles,
      register,
      name,
      error,
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col mt-2">
        {/* Label */}
        {label && (
          <p className={`text-ascent-2 text-sm mb-2 ${labelStyles}`}>{label}</p>
        )}

        {/* Input Field */}
        <div>
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            ref={ref}
            className={`bg-secondary rounded border border-[#66666690] outline-none text-sm text-ascent-1 px-4 py-3 placeholder:text-[#666] ${styles}`}
            {...register} // Spread register to pass down form validation functionality
            aria-invalid={!!error} // Conditionally apply aria-invalid attribute
          />
        </div>

        {/* Error Message */}
        {error && (
          <span className="text-xs text-[#f64949fe] mt-0.5 ">{error}</span>
        )}
      </div>
    );
  }
);

export default TextInput;

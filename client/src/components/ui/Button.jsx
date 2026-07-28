const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

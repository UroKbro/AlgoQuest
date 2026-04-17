function Button({ className = '', variant = 'primary', size = 'md', children, ...props }) {
  return (
  <button
    {...props}
    className={`rounded-md transition-colors duration-200 ${size === 'sm' ? 'px-4 py-2 text-sm' :
      size === 'md' ? 'px-6 py-3 text-base' :
      'px-8 py-4 text-lg'} ${
        variant === 'primary' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : variant === 'secondary'
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      } ${className}`}
  >
    {children}
  </button>
  )
}

export { Button }
export default Button

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', gradient = false, ...props }) => {
  return (
    <div
      {...props}
      className={`
        w-full h-full inline-block
        ${gradient 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gray-900'
        }
        border border-gray-800 rounded-xl shadow-lg backdrop-blur-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;


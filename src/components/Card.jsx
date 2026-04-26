import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
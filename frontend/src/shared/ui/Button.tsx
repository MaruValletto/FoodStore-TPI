import type { ButtonHTMLAttributes } from 'react';
export const Button=({secondary=false,className='',type='button',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{secondary?:boolean})=><button type={type} className={`${secondary?'button-secondary':'button-primary'} ${className}`} {...props}/>;

import React from 'react'

import { Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

const MenuItem = ({ to, children, onClick, ...rest }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <Link to={to} onClick={handleClick}>
        <Text className='text-gray-800 font-medium' display='block' {...rest}>
            {children}
        </Text>
    </Link>
  )
}

export default MenuItem
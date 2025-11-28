import React, { useEffect, useState } from 'react';
import { Stack, Box, Button } from '@chakra-ui/react';
import MenuItem from './MenuItem';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import UserProfile from './UserProfile';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const MenuLinks = ({ isOpen, onClose }) => {
  const [loginState, setLoginState] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoginState(true);
      } else {
        setLoginState(false);
      }
    });
  }, []);

  const handleMenuItemClick = () => {
    onClose(); // Close the menu when a menu item is clicked
  };

  return (
    <Box
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      flexBasis={{ base: '100%', md: 'auto' }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <MenuItem to="/" onClick={handleMenuItemClick}>Startseite</MenuItem>
        <MenuItem to="/category/sale" onClick={handleMenuItemClick}>Fahrzeuge</MenuItem>
        <MenuItem to="/contactus" onClick={handleMenuItemClick}>Kontakt</MenuItem>
        <MenuItem to="/impressum" onClick={handleMenuItemClick}>Impressum</MenuItem>
        <MenuItem to="/datenschutz" onClick={handleMenuItemClick}>Datenschutz</MenuItem>

        {loginState && (
          <>
            <MenuItem to="/profile">Profil</MenuItem>
            <MenuItem to="/create-listing">
              <AiOutlineAppstoreAdd color='orange' size='1.7rem' />
            </MenuItem>
            <UserProfile />
          </>
        )}
      </Stack>
    </Box>
  );
};

export default MenuLinks;

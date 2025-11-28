// src/CarCompanies.js
import React from 'react';
import { Flex, Image, VStack, Text, Heading } from '@chakra-ui/react';
import ToyotaLogo from '../images/toyota.png';
import AudiLogo from '../images/audi.gif';
import FordLogo from '../images/ford.png';
import FiatLogo from '../images/fiat.png';
import MazdaLogo from '../images/mazda.png';
import MercedesLogo from '../images/mercedes.png';
import MiniLogo from '../images/mini.png';
import SeatLogo from '../images/seat.png';
import SkodaLogo from '../images/skoda.png';
import SmartLogo from '../images/smart.png';
import VolkswagenLogo from '../images/volswagon.png';

const carCompanies = [
  { name: 'Toyota', logo: ToyotaLogo },
  { name: 'Audi', logo: AudiLogo },
  { name: 'Ford', logo: FordLogo },
  { name: 'Fiat', logo: FiatLogo },
  { name: 'Mazda', logo: MazdaLogo },
  { name: 'Mercedes-Benz', logo: MercedesLogo },
  { name: 'Smart', logo: SmartLogo },
  { name: 'Seat', logo: SeatLogo },
  { name: 'Skoda', logo: SkodaLogo },
  { name: 'Mini', logo: MiniLogo },
  { name: 'Volkswagen', logo: VolkswagenLogo },
];

const CarCompanies = () => {
  const logosPerRow = 4;

  return (
    <VStack align="center" p={8} mt={10} backgroundColor="#0C0404">
      <Heading as="h1" fontSize="xl" mb={4} color="white" fontWeight="bold">
        Car Companies We Deal In
      </Heading>

      <Flex justify="center" wrap="wrap" mt={10}>
        {carCompanies.map((company, index) => (
          <Flex
            key={company.name}
            direction="column"
            align="center"
            m={4}
            flex="1 0 25%" // Set flex properties to achieve 4 logos per row
          >
            <Image src={company.logo} alt={company.name} maxW="100px" maxH="100px" mb={2} />
            {/* <Text color="white">{company.name}</Text> */}
          </Flex>
        ))}
      </Flex>
    </VStack>
  );
};

export default CarCompanies;

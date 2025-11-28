import React from 'react';
import { Box, Flex, Heading, Text, VStack, Image } from '@chakra-ui/react';
import AboutImg from "../images/for-sale2.jpg"

const About = () => {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="center"
      p={10}
      mt={10}
      backgroundColor="#36454F"
      color="white"
    >
      <VStack spacing={4} align="start" flex={1}>
        <Heading as="h1" size="xl">
        Über uns
        </Heading>

        <Text fontSize="lg">
        Bei Auto-Online.de sind wir mehr als nur ein Autohändler – wir sind Ihre vertrauenswürdige Quelle für hochwertige Fahrzeuge und kundenorientierten Service. Unser Engagement für Exzellenz spiegelt sich in unserem sorgfältig kuratierten Angebot wider, das sowohl neue Modelle als auch geprüfte Gebrauchtwagen umfasst.
        </Text>

        <Text fontSize="lg">
        Mit einem Team von Automobil-Experten setzen wir auf Qualität und Transparenz, um sicherzustellen, dass Ihre Fahrzeugwahl Ihren individuellen Bedürfnissen entspricht. Bei Auto-Online.de geht es nicht nur um den Verkauf von Autos, sondern um die Schaffung einer nahtlosen, vertrauensvollen Erfahrung für unsere Kunden. Besuchen Sie uns und entdecken Sie, warum Auto-Online.de die erste Anlaufstelle für anspruchsvolle Fahrer ist.
        </Text>

      </VStack>

      <Box flex={1} ml={{ base: 0, md: 8 }} mt="8">
        <Image src={AboutImg} alt="About Us" maxW="100%" borderRadius="md" />
      </Box>
    </Flex>
  );
};

export default About;

// src/components/Impressum.js
import React from 'react';
import { Box, Heading, Text, Link, VStack, Divider } from '@chakra-ui/react';

const Impressum = () => {
  return (
    <Box p={8} maxW="800px" mx="auto" id='impressum'>
      <Heading as="h1" mb={4}>
        Impressum
      </Heading>
      <VStack align="start" spacing={4}>
      <Text fontSize="lg" fontWeight="bold" mb={2}>Angaben gemäß § 5 TMG:</Text>
      <Text>
        Imran Hussain
        <br />
        Auto Online
        <br />
        Goldäckerstr. 66
        <br />
        71144 Steinenbronn
      </Text>
      </VStack>
      <Divider my={6} />

      <VStack align="start" spacing={4}>
      <Text fontWeight="bold" mt={4}>Kontakt:</Text>
        <Text>
        Telefon: +49 176 37130790
        <br />
        E-Mail: <Link href="mailto:info@imranhussain.de">info@imranhussain.de</Link>
      </Text>
      </VStack>
      <Divider my={6} />

      <VStack align="start" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          Umsatzsteuer-ID:
        </Text>
        <Text>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz: DE815268039</Text>
      </VStack>

      <Divider my={6} />

      
      <Text fontSize="1.5rem" mt={4}>
        <strong>Haftungsausschluss (Disclaimer)</strong>
      </Text>
      <Text mt={2}>
        <strong>Haftung für Inhalte</strong>
        <br />
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
        allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
        verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
        forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </Text>
      <Text mt={2}>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
        Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
        Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
        Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
      </Text>
      <Text mt={2}>
        <strong>Haftung für Links</strong>
        <br />
        Unser Angebot enthält Links zu externen Webseiten
Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
Verlinkung nicht erkennbar.

Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
werden wir derartige Links umgehend entfernen.
        </Text>
        <Text mt={2}>
        <strong>Urheberrecht</strong>
        <br />
        <br />
        Die durch die Seitenbetreiber <br/>
erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die
Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.<br/> Downloads<br/>
und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. <br/>

<br/>Soweit<br/>
die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden
von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </Text>
        <Text mt={2}>
        <strong>Datenschutz</strong>
        <br />
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr
ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
Datenschutzvorschriften sowie dieser Datenschutzerklärung. <br/>
Die Nutzung unserer Webseite ist in <br /> 
der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten
personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies,
soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung
nicht an Dritte weitergegeben. <br/>
Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B.
bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der
Daten vor dem Zugriff durch Dritte ist nicht möglich.
        </Text>
        <Text mt={4} fontSize="1.5rem">
            <strong>Datenschutzerklärung</strong>
        </Text>
        <Text fontSize="1.5rem">
            <strong>für die Nutzung von Google Analytics</strong>
        </Text>
        <br/>
        <Text>
        Diese Website nutzt Funktionen des Webanalysedienstes
Google Analytics. Anbieter ist die Google Inc., 1600 Amphitheatre Parkway Mountain View, CA 94043, USA. <br/> <br/>
Google Analytics verwendet sog. “Cookies”. Das sind Textdateien, die auf Ihrem Computer gespeichert
werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. Die durch den Cookie
erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von
Google in den USA übertragen und dort gespeichert. <br/> <br/>
Mehr Informationen zum Umgang mit
Nutzerdaten bei Google Analytics finden Sie in der Datenschutzerklärung von Google: <Link href='https://web.archive.org/web/20201205032534/https://support.google.com/analytics/answer/6004245?hl=de'>https://support.google.com/analytics/answer/6004245?</Link> <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>Datenschutz</strong>
        <br />
        <br />
        Sie können die Speicherung der Cookies durch eine
entsprechende Einstellung Ihrer Browser-Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in <br/>
diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen
können. Sie können darüber hinaus die Erfassung der durch das Cookie erzeugten und auf
Ihre Nutzung der Website bezogenen Daten (inkl. Ihrer IP-Adresse) an Google sowie die Verarbeitung dieser <br/>
Daten durch Google verhindern, indem sie das unter dem folgenden Link verfügbare Browser-Plugin
herunterladen und installieren: <Link href='https://web.archive.org/web/20201205032534/https://tools.google.com/dlpage/gaoptout?hl=de'>https://tools.google.com/dlpage/gaoptout?hl=de</Link> <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>Widerspruch gegen Datenerfassung</strong>
        <br />
        <br />
        Sie können die Erfassung Ihrer Daten <br/>
        durch Google Analytics verhindern, indem Sie auf folgenden Link klicken. Es wird ein Opt-Out-Cookie gesetzt, <br/>
        dass das Erfassung Ihrer Daten bei zukünftigen Besuchen dieser Website verhindert: <Link href='Google Analytics deaktivieren'>Google Analytics deaktivieren</Link> <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>IPAnonymisierung</strong>
        <br />
        <br />
        Wir nutzen die Funktion “Aktivierung der IP-Anonymisierung” auf
dieser Webseite. Dadurch wird Ihre IP-Adresse von Google jedoch innerhalb von Mitgliedstaaten der
Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen
Wirtschaftsraum zuvor gekürzt. Nur in Ausnahmefällen wird die volle IP-Adresse an einen Server von
Google in den USA übertragen und dort gekürzt. Im Auftrag des Betreibers dieser Website wird
Google diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über die
Websiteaktivitäten zusammenzustellen und um weitere mit der Websitenutzung und der Internetnutzung
verbundene Dienstleistungen gegenüber dem Websitebetreiber zu erbringen. Die im Rahmen von Google
Analytics von Ihrem Browser übermittelte IP-Adresse wird nicht mit anderen Daten von Google
zusammengeführt. <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>Auskunft, Löschung, Sperrung</strong>
        <br />
        <br />
        Sie haben jederzeit
das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft
und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder
Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten
können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns
wenden. <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>Cookies</strong>
        <br />
        <br />
        Die Internetseiten verwenden teilweise so genannte<br/>
Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen <br/>
dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Cookies sind kleine Textdateien, die <br/>
auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert. <br/> <br/>

Die meisten der von uns <br/>
verwendeten Cookies sind so genannte „Session-Cookies“. Sie werden nach Ende Ihres Besuchs automatisch <br/>
gelöscht. Andere Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen. Diese <br/>
Cookies ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen. <br/> <br/>

Sie <br/>
können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und <br/>
Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell <br/>
ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browser <br/>
aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt <br/>
sein. <br/> <br/>
        </Text>
        <Text mt={2}>
        <strong>Kontaktformular</strong>
        <br />
        <br />
        Wenn Sie uns per Kontaktformular Anfragen zukommen <br />
lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten <br />
zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten <br />
geben wir nicht ohne Ihre Einwilligung weiter.
        </Text>
    </Box>
  );
};

export default Impressum;

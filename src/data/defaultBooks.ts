import { Book } from '../types';

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'creanga-amintiri',
    title: 'Amintiri din copilărie',
    author: 'Ion Creangă',
    description: 'Capodopera memorialistică a lui Ion Creangă, zugrăvind universul magic al satului Humulești și năzdrăvăniile copilăriei românești.',
    coverColor: '#800020', // Burgundy
    coverDesign: 'ornate',
    dateAdded: '04.06.2026',
    chapters: [
      {
        id: 'amintiri-ch1',
        title: 'Capitolul I - Humuleștiul natal',
        content: `
          <p>La Humulești, în satul nostru cel cu oameni gospodari și vătămători de mândrie, trăiam pe atunci o viață plină de veselie și fără griji.</p>
          <p>Dragi mi-erau tata și mama, frații și surorile, și băieții satului, tovarășii mei de joacă, cu care în zilele geroase de iarnă ne dădeam pe gheață și ne bucuram din toată inima.</p>
          <p>Nu știu alții cum sunt, dar eu, când mă gândesc la locul nașterii mele, la Humulești, la stâlpul hornului unde lega mama ața cu motocei de se jucau pisicile cu ea, la prichiciul vetrei cel humuit, de care mă țineam când începusem a merge binișor, la cuptorul pe care mă ascundeam, când ne jucam noi, băieții, de-a mijoarca, și la alte jocuri și jucării pline de hazul și farmecul copilăresc, parcă-mi saltă și acum inima de bucurie!</p>
          <p>Și, Doamne, frumos mai era pe atunci, căci și părinții, și frații, și vecinii, toți se arătau buni cu mine. Mama, care mă descânta când eram bolnav și îmi făcea turte calde în cuptor, mă privea cu ochi blânzi și plini de îndurare. Tatăl meu, om muncitor și chibzuit, ne aducea de la târg mere dulci și ne învăța cum să fim oameni de treabă în viață.</p>
          <p>Școala din Humulești era pe atunci o noutate, abia deschisă sub îngrijirea preotului Ioan. Ne strângeam acolo băieți și fete, unii mai mari, alții mai mărunți, și ne minunam de literele din ceaslov. Iar părintele ne mai și coropia din când în când cu „Sfântul Neculai”, spre marea noastră spaimă și învățătură de minte!</p>
        `
      },
      {
        id: 'amintiri-ch2',
        title: 'Capitolul II - La scăldat și alte pățanii',
        content: `
          <p>Într-o zi, pe o căldură mare de vară, când soarele dogorea de ardea pietrele, mă cuprinse un dor grozav de scăldat. Mama, biata mamă, îmi dăduse de lucru să am grijă de frățiorul meu mai mic și să torc o mână de fuior.</p>
          <p>Însă eu, cuprins de lene și de ispită, am lăsat și fuior și copil, și am fugit repede ca vântul spre Ozana cea frumos curgătoare și limpede ca cristalul.</p>
          <p>Odată ajuns acolo, m-am dezbrăcat în grabă și m-am aruncat în valurile răcoroase, uitând de tot și de toate, de mustrările mamei și de datoria pe care o aveam acasă. Cât de dulce e apa când arde soarele deasupra capului! Pluteam, mă scufundam, făceam valuri și mă simțeam cel mai fericit băiat de pe pământ.</p>
          <p>Dar fericirea nu a durat mult. Mama, văzând că am lăsat treaba de izbeliște, a venit pe furiș la scăldătoare. Fără să zică o vorbă, mi-a luat toate hainele de pe mal, lăsându-mă doar în pielea goală!</p>
          <p>Să te ții atunci rușine și necaz! Cum să te întorci în sat fără haine, pe ulițele pline de oameni și fete de seama ta? M-am furișat prin grădini, prin păpușoi, zgâriat de mărăcini și plângând în hohote, jurându-mă că nu voi mai ascunde adevărul de mama niciodată.</p>
        `
      },
      {
        id: 'amintiri-ch3',
        title: 'Capitolul III - Smărăndița și pupăza din tei',
        content: `
          <p>Cine nu a auzit de vestita Smărăndița a popii, o fată ageră la minte și plină de viață, care ne punea pe toți la respect în băncile școlii? Era mândria părintelui Ioan și pilda noastră de învățătură.</p>
          <p>Iar când venea vorba de pupăza din tei, pasărea aceea care ne deștepta în fiecare dimineață cu strigătul ei răsunător, toată lumea din sat o cunoștea. Cânta dis-de-dimineață în teiul cel bătrân, de-i scula pe toți gospodarii la muncă.</p>
          <p>Dar mie, somnoros și poznaș, îmi intrase în cap să o prind și să-i vin de hac, ca să pot dormi în tihnă. M-am urcat în tei cu inima la gât, am băgat mâna în scorbură și, după mari eforturi, am reușit să scot pasărea cea moțată!</p>
          <p>Ce a urmat la târg, când am încercat să o vând, și cum m-a păcălit un moșneag care a lăsat-o să zboare sub ochii mei, este o altă poveste veselă pe care o povestesc oricând cu drag și nostalgie.</p>
        `
      }
    ]
  },
  {
    id: 'eminescu-poezii',
    title: 'Poezii Alese',
    author: 'Mihai Eminescu',
    description: 'O culegere a celor mai faimoase creații lirice ale poetului național, incluzând capodopera universală Luceafărul și superbe poeme de dragoste și natură.',
    coverColor: '#1F3443', // Deep Blue
    coverDesign: 'classic',
    dateAdded: '04.06.2026',
    chapters: [
      {
        id: 'eminescu-ch1',
        title: 'Luceafărul',
        content: `
          <p class="text-center italic my-2">A fost odată ca-n povești,<br/>A fost ca niciodată,<br/>Din rude mari împărătești,<br/>O prea frumoasă fată.</p>
          <p class="text-center italic my-2">Și era una la părinți<br/>Și mândră-n toate cele,<br/>Cum e Fecioara între sfinți<br/>Și luna între stele.</p>
          <p class="text-center italic my-2">Din umbra falnicelor bolți<br/>Ea pasul și-l îndreaptă<br/>Lângă fereastră, în colț,<br/>Luceafărul așteaptă.</p>
          <p class="text-center italic my-2">Îl vede azi, îl vede mâni,<br/>Astfel dorința-i gata;<br/>El iar, privind de săptămâni,<br/>Îi cade dragă fata.</p>
          <p class="text-center italic my-2">Cum ea pe coate-și răzima<br/>Visând ale ei tâmple,<br/>De dorul lui și inima<br/>Și sufletu-i se împle...</p>
          <p class="text-center italic my-2">„Cobori în jos, luceafăr blând,<br/>Alunecând pe-o rază,<br/>Pătrunde-n casă și în gând<br/>Și viața-mi luminează!”</p>
        `
      },
      {
        id: 'eminescu-ch2',
        title: 'Lacul',
        content: `
          <p class="text-center italic my-4">Lacul codrilor albastru<br/>Nuferi galbeni îl încarcă;<br/>Tresărind în cercuri albe<br/>El cutremură o barcă.</p>
          <p class="text-center italic my-4">Și eu trec de-a lung de maluri,<br/>Parc-asculț și parc-aștept<br/>Ea din trestii să răsară<br/>Și să-mi cadă lin pe piept;</p>
          <p class="text-center italic my-4">Să sărim în luntrea mică,<br/>Îngânați de glas de ape,<br/>Și să scap din mână cârma,<br/>Și lopețile să-mi scape;</p>
          <p class="text-center italic my-4">Să plutim cuprinși de farmec<br/>Sub lumina blândei lune -<br/>Vântu-n trestii lin foșnească,<br/>Undoioasa apă sune!</p>
          <p class="text-center italic my-4">Dar nu vine... Singuratic<br/>În zadar suspin și sufăr<br/>Lângă lacul cel albastru<br/>Încărcat cu flori de nufăr.</p>
        `
      }
    ]
  },
  {
    id: 'jules-verne-submarine',
    title: '20.000 de leghe sub mări',
    author: 'Jules Verne',
    description: 'Aventura submarină revoluționară la bordul faimosului submarin Nautilus condus de misteriosul și răzbunătorul Căpitan Nemo.',
    coverColor: '#2A4325', // Forest Green
    coverDesign: 'geometric',
    dateAdded: '04.06.2026',
    chapters: [
      {
        id: 'verne-ch1',
        title: 'Capitolul I - Un recif fugitiv',
        content: `
          <p>Anul 1866 a fost marcat de un eveniment bizar, un fenomen inexplicabil și misterios, pe care nimeni nu l-a putut uita prea curând.</p>
          <p>De câtva timp, diverse nave de pe mare se întâlniseră cu „un lucru enorm”, un obiect lung, fusiform, uneori fosforescent, infinit mai mare și mai rapid decât o balenă.</p>
          <p>Faptele consemnate în diverse registre de bord se acordau destul de exact asupra structurii ființei sau a obiectului respectiv, asupra uimitoarei viteze de deplasare, a puterii lui de propulsie surprinzătoare și a vieții deosebite cu care părea înzestrat.</p>
          <p>Dacă era un cetaceu, depășea în volum pe toți cei pe care știința îi clasifica până atunci. Nici Cuvier, nici Lacépède nu ar fi admis existența unui asemenea monstru, decât dacă l-ar fi văzut cu propriii lor ochi de savanți.</p>
          <p>La început, s-a crezut că este o insulă plutitoare sau un recif necunoscut, însă mișcările sale rapide și imprevizibile au spulberat rapid această ipoteză. Monstrul exista, iar curiozitatea întregii lumi era ațâțată la maximum.</p>
        `
      },
      {
        id: 'verne-ch2',
        title: 'Capitolul II - Nautilus și Căpitanul Nemo',
        content: `
          <p>„Suntem în pântecele unui uriaș de oțel, domnule profesor Aronnax”, îmi spuse însoțitorul meu, credinciosul Conseil, în timp ce lumina electrică inunda celula în care fuseserăm închiși.</p>
          <p>După câteva picioare de fier bătute pe punte, ușa masivă se deschise. Un bărbat de statură înaltă, cu ochi pătrunzători și o privire plină de o mândrie sălbatică, își făcu apariția. Era Căpitanul Nemo.</p>
          <p>— Domnilor, zise el într-o limbă franceză impecabilă, dar cu un accent rece, eu nu sunt ceea ce voi numiți un om civilizat. Am rupt legăturile cu întreaga societate de pe uscat, pentru motive pe care doar eu singur am dreptul să le judec.</p>
          <p>— Nu mă supun legilor voastre și vă sfătuiesc să nu le pomeniți niciodată în fața mea! Aici, la bordul submarinului Nautilus, nu există decât o singură lege: voința mea!</p>
          <p>Am privit prin geamurile masive din cristal de pe pereții salonului Nautilus. În fața ochilor noștri se deschidea abisul oceanului, populat de milioane de pești multicolori, recife de corali strălucitori și ruine acoperite de alge ale unor civilizații demult uitate în adâncuri.</p>
        `
      }
    ]
  }
];

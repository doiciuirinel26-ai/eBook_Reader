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
    id: 'slavici-moara-cu-noroc',
    title: 'Moara cu noroc',
    author: 'Ioan Slavici',
    description: 'O nuvelă clasică a literaturii române despre lăcomie, destin și prăbușirea morală a unui om cinstit, distrus de setea de îmbogățire.',
    coverColor: '#5C3317',
    coverDesign: 'ornate',
    dateAdded: '04.06.2026',
    chapters: [
      {
        id: 'moara-ch1',
        title: 'Capitolul I - Pornirea la drum',
        content: `
          <p>„Omul să fie mulțumit cu sărăcia sa, căci, dacă e vorba, nu bogăția, ci liniștea colibei tale te face fericit." Acestea au fost cuvintele bătrânei, soacra lui Ghiță, rostite în seara când ginerele ei a hotărât să ia în arendă moara de la răscruce, locul cunoscut de toți sub numele de Moara cu noroc.</p>
          <p>Ghiță era un om tânăr, zdravăn și harnic, care până atunci trăise din meseria de cizmar, lucrând cu mâinile lui zi de zi, fără să câștige prea mult, dar nici fără să ducă lipsă de cele trebuincioase. Ana, nevasta lui, era o femeie cuminte și harnică, de omenie și dragoste plină, iar copiii lor, doi băieți sprinteni și o fetiță cu ochi albaștri, umpleau casa de veselie.</p>
          <p>Totuși, Ghiță simțea că îi lipsește ceva. Vedea cum alți oameni se îmbogățeau, vedea cum negustorii treceau pe drum cu căruțe pline și se întorceau cu pungi grele, și inima i se strângea de necaz. Nu era vorba de lăcomie, se spunea el singur, ci de dorința firească de a le da copiilor săi un trai mai bun, de a nu-i lăsa să trăiască în sărăcie toată viața.</p>
          <p>Moara cu noroc era un loc potrivit pentru o cârciumă și han. Drumul mare trecea chiar pe lângă ea, și mulți călători se opreau acolo să adape caii, să mănânce și să se odihnească. Arendașul de dinainte se îmbogățise bine din acea afacere, dar plecase la oraș să-și cheltuiască câștigul, lăsând locul fără stăpân.</p>
          <p>Bătrâna soacră asculta în tăcere planurile lui Ghiță, dar inima ei simțea un fior de teamă. Ea trăise destui ani pe lumea aceasta și știa că norocul grabnic nu vine niciodată singur, ci aduce cu el ispite și primejdii pe care un om de treabă cu greu le poate birui.</p>
          <p>„Fă cum crezi tu, Ghiță, că tu ești capul familiei și tu hotărăști," spuse ea în cele din urmă, cu un glas blând dar trist. „Dar să nu uiți că omul sfințește locul, nu locul pe om. Dacă mori ai inima curată și mâinile curate, poți locui și-n moara diavolului fără să pățești nimic."</p>
          <p>Ana îl privea pe Ghiță cu ochii plini de încredere. Ea era gata să-l urmeze oriunde, căci acolo unde era el, acolo era și casa ei. Strânse cu grijă lucrurile, îmbrăcă copiii frumos și, într-o dimineață de toamnă, familia porni spre Moara cu noroc.</p>
          <p>Drumul era lung și prăfuit. Căruța se legăna ușor pe pietrele drumului mare, iar copiii dormeau grămadă pe paie, obosiți de trezitul de dimineață. Ghiță mâna caii tăcut, cu gândurile duse departe, calculând câștiguri și cheltuieli în mintea lui de om practic.</p>
          <p>Pe ambele laturi ale drumului se întindeau câmpuri galbene de miriște, semn că secerișul fusese bun în acel an. Din când în când, o cârdaie de ciori se ridica vuind din lan și trecea umbrele lor negre peste spinarea cailor. Soarele de toamnă bătea cald, dar fără ardoarea verii, cu o lumină aurie și obosită.</p>
          <p>La prânz, se opriră lângă un izvor să adape caii și să mănânce. Ana desfăcu traista cu merinde și împărți pâine, brânză și ceapă verde. Bătrâna mușcă în tăcere din pâinea ei, privind departe, spre locurile pe care le lăsau în urmă.</p>
          <p>„Tot acolo înapoi mă gândesc," mărturisi ea la un moment dat, „la coliba noastră mică, la vecini, la pomii din grădină. Acolo știam pe toată lumea și toată lumea ne știa pe noi. Acolo era liniștea noastră."</p>
          <p>Ghiță zâmbi cu îngăduință. „Mamă, nu plecăm să nu ne mai întoarcem. Plecăm să câștigăm ceva mai mult, și atunci ne vom întoarce acasă mai cu dare de mână, și poate că vom cumpăra o casă mai bună chiar în sat."</p>
          <p>Spre seară, când soarele cobora spre apus, Moara cu noroc se ivi în zare. Era o clădire solidă, din cărămidă și piatră, cu acoperișul de șindrilă, cu un grajd mare alăturat și o fântână în curte. Lângă drum stătea așezat un stejar bătrân, cu ramuri întinse ca niște brațe primitoare.</p>
          <p>Ghiță opri căruța și privi locul cu ochi cercetători. Totul părea în ordine, deși casa era pustie de ceva vreme și o patină de abandonare se lăsase peste ea. Geamurile erau prăfuite, curtea plină de buruieni, dar structura era solidă și cu puțin efort totul putea fi adus la starea cuvenită.</p>
          <p>„Nu este rău," spuse el în cele din urmă, cu satisfacție în glas. „Cu mână de lucru și cu voință, în câteva săptămâni va arăta ca nou."</p>
          <p>Descărcară căruța în amurg. Ghiță cară cele mai grele lăzi, Ana aranjă lucrurile înăuntru, iar bătrâna aprinsese un foc în vatră și pusese la fiert o oală de fasole. Copiii alergau veseli prin curte, bucurați de spațiul larg, atât de diferit de ulița înghesuită din sat.</p>
          <p>Prima noapte la Moara cu noroc fu liniștită. Focul pâlpâia în vatră, copiii adormiseră repede, iar Ghiță și Ana stăteau de vorbă în șoaptă, punând la cale treburile de a doua zi. Afară, vântul de toamnă șoptea prin frunzele stejarului.</p>
          <p>Bătrâna nu dormi mult. Se sculă de noapte și stătu la fereastră, privind drumul pustiu luminat de lună. O tristețe adâncă o cuprinsese, dar nu ar fi știut să spună de unde venea. Era poate doar oboseala drumului, sau poate o presimțire pe care inima bătrână o simte uneori fără să știe de ce.</p>
          <p>În zilele care urmară, Ghiță munci cu neodihnă. Curăță curtea, spălă geamurile, văruit pereții, reparase ușile și geamurile care scârțâiau. Ana îi era alături în toate, gătind, aranjând, punând ordine acolo unde era dezordine. Casa prindea viață sub mâinile lor harnice.</p>
          <p>Primul călător care se opri la han fu un negustor bătrân cu o căruță de mărfuri. Ghiță îi ieși în întâmpinare cu zâmbet larg, îi adăpă caii, îi aduse un ulcior de vin și o farfurie cu mâncare caldă. Negustorul mâncă mulțumit și, la plecare, lăsă o monedă de argint pe masă.</p>
          <p>„Prima monedă câștigată la Moara cu noroc," spuse Ghiță, ridicând-o cu mândrie. „Semn bun, Ana, semn bun."</p>
          <p>Ana zâmbi și ea, dar ochii îi rămaseră gânditori. Ea era fericită că bărbatul ei era mulțumit, dar ceva o neliniștea, o umbră care nu putea fi numită și care trecea uneori ca un nor ușor peste soarele zilelor lor.</p>
          <p>Vestea se răspândi repede în împrejurimi că Moara cu noroc s-a redeschis și că noul hangiu e om de omenie, cu mâncare bună și vin nestricat. Călătorii începură să se oprească tot mai des, iar câștigul lui Ghiță creștea zi de zi, săptămână de săptămână.</p>
          <p>Toamna trecu, iarna veni cu zăpezi grele, și Moara cu noroc deveni un loc cunoscut și căutat. Ghiță era fericit. Muncea mult, dar câștiga bine, și visul lui de a-i asigura copiilor un trai mai bun părea că se împlinea cu fiecare zi.</p>
          <p>Bătrâna privi cum casa se umplea de oameni, cum banii intrau în pungă, și inima ei se mai liniști. Poate că se înșelase cu presimțirile ei, poate că băiatul ei de suflet avusese dreptate și locul era cu adevărat cu noroc.</p>
          <p>Dar norocul, ca toate lucrurile din lumea asta, nu vine niciodată singur și neînsoțit. Și odată cu primăvara, la Moara cu noroc sosi un om pe care Ghiță nu-l mai văzuse, dar despre care auzise vorbindu-se în șoaptă în tot ținutul.</p>
        `
      },
      {
        id: 'moara-ch2',
        title: 'Capitolul II - Lică Sămădăul',
        content: `
          <p>Era într-o dimineață de mai, când câmpiile înfloreau și cerul era de un albastru adânc și senin, când în curtea Morii cu noroc intrară trei călăreți. Caii lor erau buni și bine hrăniți, șeile frumos cusute, iar călăreții înșiși aveau înfățișarea unor oameni cu dare de mână și cu multă siguranță de sine.</p>
          <p>Cel din față era un bărbat de vreo patruzeci de ani, înalt și uscat, cu mustăți negre răsucite și cu ochi de un verde-cenușiu, reci și pătrunzători ca ai unui lup bătrân. Purta un suman negru frumos, cizme galbene lustruite și un brâu roșu în care luceau mânerele unor pistoale. Se numea Lică Sămădăul.</p>
          <p>Ghiță îl cunoscuse din auzite. Lică era omul care stăpânea toate turmele de porci din ținut, care se ocupa cu vânzarea și cumpărarea de vite la bâlciuri, și despre care se zicea în șoaptă că are legătură cu toți hoții și tâlharii din regiune. Nimeni nu îndrăznea să-l înfrunte deschis, pentru că Lică era omul care știa multa și care putea să facă rău multora.</p>
          <p>Se așeză la masa cea mai bună din han, ca și cum ar fi fost stăpânul locului, și porunci mâncare și vin fără să se uite la prețuri. Cei doi tovarăși ai lui se așezară mai la margine, tăcuți și atenți la toate mișcările din jur.</p>
          <p>Ghiță îl servi cu grijă, simțind sub privirea aceea rece o neliniște pe care nu o mai simțise cu nimeni altcineva. Lică mâncă lent, savurând fiecare îmbucătură, și nu spuse nimic mult timp. Abia la urmă, când ridică paharul cu vin și îl goli dintr-o sorbitură, deschise gura.</p>
          <p>„Bun vin ai, Ghiță," zise el, ca și cum l-ar fi cunoscut de ani de zile. „Și casa e curată, și mâncarea e bună. Îmi place. Am să mai vin pe la tine."</p>
          <p>„Ești binevenit," răspunse Ghiță politicos, deși ceva îl îndemna să spună altceva.</p>
          <p>Lică îl privi lung, cu un zâmbet care nu ajungea la ochi. „Binevenit. Bine zis. Dar să știi că eu nu vin ca un musafir obișnuit, Ghiță. Eu vin ca un prieten. Și prietenii mei trăiesc bine pe lumea asta, pentru că eu am grijă de ei."</p>
          <p>Ghiță tăcu. Nu știa ce să răspundă la asta, și simțea că orice vorbă ar fi spus ar fi fost greșită. Lică se ridică, aruncă o pungă pe masă — mult mai mult decât valorau mâncarea și vinul — și ieși fără să mai aștepte restul.</p>
          <p>Ana, care urmărise scena de la distanță, veni lângă Ghiță când Lică plecă. „Cine a fost omul acela?" întrebă ea cu voce joasă.</p>
          <p>„Lică Sămădăul," răspunse Ghiță scurt, privind în urma călăreților care dispăreau în colbul drumului.</p>
          <p>„Nu-mi place cum privește," spuse Ana. „Are ochi de om care nu iartă."</p>
          <p>Ghiță nu răspunse, dar înăuntrul lui ceva se schimbase. Seara aceea dormi rău, cu vise tulburate în care chipul lui Lică apărea și dispărea ca o umbră fără față.</p>
          <p>Lică reveni a doua zi, și a treia zi, și tot mai des după aceea. Uneori venea singur, alteori cu oamenii lui, totdeauna cu același aer stăpânitor, ca și cum Moara cu noroc ar fi fost proprietatea lui. Plătea bine și nu făcea scandal, dar prezența lui acolo aducea cu ea o tensiune de nepătruns.</p>
          <p>Treptat, Ghiță înțelese că Lică nu venea acolo numai pentru mâncare și vin. Venea pentru că moara era un loc potrivit pentru întâlniri, un punct de trecere pentru oamenii lui, un loc unde se puteau face tranzacții care nu suportau lumina zilei. Și Ghiță era proprietarul locului, deci, implicit, un complice tăcut.</p>
          <p>Primul semn limpede veni când Lică lăsă la han un sac greu, rugându-l pe Ghiță să-l păstreze câteva zile. Ghiță nu întrebă ce era în sac. Știa că nu trebuia să întrebe. Dar noaptea, când Ana și copiii dormeau, deschise sacul cu mâini tremurânde și văzu în lumina lumânării strălucirea unor monede de aur și argint.</p>
          <p>Puse sacul la loc, se întoarse în pat și rămase cu ochii deschiși până dimineața. Monedele acelea nu aveau miros curat. El o știa. Dar ce să facă? Să-l înfrunte pe Lică era să-și primejduiască viața și familia. Să fugă de la moară era să piardă tot ce construise.</p>
          <p>Se spuse că omul se obișnuiește cu orice. Ghiță se obișnui și el, puțin câte puțin, cu prezența lui Lică, cu sacii și cu pachetele lăsate în grija lui, cu oamenii suspecți care veneau noaptea și plecau înainte de zorii zilei. Își spunea că nu face rău nimănui, că pur și simplu ținea gura închisă și nu vedea ceea ce nu trebuia văzut.</p>
          <p>Dar conștiința lui nu dormea. Devenise irascibil, nervos, dur cu Ana și cu copiii, care nu pricepeau ce se întâmpla cu el. Ana îl privea uneori cu ochi triști și îngrjorați, dar nu îndrăznea să întrebe direct, știind că Ghiță, când era cuprins de tăcerea aceea apăsătoare, nu vorbea cu nimeni.</p>
          <p>Bătrâna soacră vedea și ea schimbarea. Venea pe la ei rar, și de fiecare dată pleca mai îngrijorată decât venise. Odată, prinsă un moment singură cu Ghiță, îi spuse: „Ghiță, ce ți s-a întâmplat? Nu mai ești tu cel de altădată."</p>
          <p>„Nimic nu mi s-a întâmplat," răspunse el sec. „Sunt obosit, atâta tot."</p>
          <p>Bătrâna clătină din cap și nu mai spuse nimic, dar lacrimile îi glisat în tăcere pe obraji în timp ce se întorcea acasă.</p>
          <p>Vara aceea, la Moara cu noroc intrase o mulțime de bani, mai mulți decât visase Ghiță vreodată. Dar cu fiecare monedă câștigată, ceva din sufletul lui se pierduse. Nu mai putea privi cu aceiași ochi senini câmpurile înflorite sau chipurile copiilor săi. Umbra lui Lică Sămădăul se întinsese ca o pânză de păianjen peste toată viața lui.</p>
          <p>„Trebuie să scap de el," își spuse Ghiță într-o seară, strângând pumnii. „Trebuie să găsesc o cale să scap de el fără să mă distrug pe mine însumi."</p>
          <p>Dar calea aceea, dacă exista, era mult mai greu de găsit decât credea el.</p>
        `
      },
      {
        id: 'moara-ch3',
        title: 'Capitolul III - Capcana',
        content: `
          <p>Toamna adusese cu ea primele răcori și mirosul de frunze uscate. La Moara cu noroc, hanul era plin în fiecare seară, iar focul din vatră ardea viu, răspândind căldură și lumină în sala de mâncare. Pe dinafară, viața părea normală, chiar înfloritoare. Pe dinăuntru, Ghiță trăia cu o teamă surdă care nu-l mai lăsa să doarmă liniștit.</p>
          <p>Undeva, la orașe, exista un jandarm pe nume Pintea, renumit pentru că urmărea cu înverșunare bandele de hoți și tâlhari din toată regiunea. Numele lui era rostit cu frică de oamenii lui Lică, ceea ce îi spunea lui Ghiță că Pintea era aproape, că cerceta, că mai devreme sau mai târziu va ajunge și la Moara cu noroc.</p>
          <p>Ghiță începu să se gândească la posibilitatea de a colabora cu jandarmerița. Dacă îi furniza lui Pintea informații despre Lică, poate că scăpa de povara aceasta. Poate că primea chiar o răsplată, poate că putea să-și ia familia și să plece departe, departe de Moara cu noroc și de tot ce reprezentase ea pentru el.</p>
          <p>Dar gândul acesta îl umplea deopotrivă de speranță și de teamă. Lică era un om care știa totul despre toată lumea. Dacă afla că Ghiță vorbise cu jandarmii, nu ar mai fi existat un loc destul de departe unde să fugă. Lică ajungea oriunde voia el să ajungă.</p>
          <p>Pintea veni la moară în chip de călător obișnuit, cu hainele prăfuite și înfățișarea unui negustor obosit. Ghiță îl recunoscu după ceva în privire — ochii lui aveau aceeași răceală cu a lui Lică, dar pe fond o lumină diferită, ceva care semăna cu dreptatea.</p>
          <p>Vorbiră câteva minute în bucătărie, sub pretextul că Pintea comanda ceva de mâncare. Ghiță îi spuse puțin, nu destul de mult, dar suficient pentru ca Pintea să înțeleagă că omul din fața lui știa mai multe decât spunea. La plecare, Pintea îi lăsă o adresă și un semn de recunoaștere.</p>
          <p>„Dacă te hotărăști să vorbești," îi spuse Pintea, „fă-o repede. Oamenii lui Lică te vor supraveghea cu atenție din ce în ce mai mult."</p>
          <p>Ghiță rămase cu vorbele acelea în minte zile întregi. „Te vor supraveghea." Poate că deja o făceau. Se uita la oamenii care veneau la han cu alți ochi de acum, întrebându-se care din ei raporta lui Lică ce vedea și auzea la moară.</p>
          <p>Într-o seară, Lică veni singur și mai devreme decât de obicei. Puse o pungă mare de bani pe masă și îl privi pe Ghiță cu ochii aceia care parcă vedeau prin oameni.</p>
          <p>„Cineva a vorbit cu Pintea la tine la han," spuse el, fără altă introducere.</p>
          <p>Ghiță simți că i s-a oprit inima. Dar se stăpâni, și cu o nepăsare pe care nu o simțea, răspunse: „Vin mulți oameni la mine la han, Lică. Nu știu cu cine vorbești."</p>
          <p>Lică îl mai privi o clipă, cercetător, apoi zâmbi — acel zâmbet care nu ajungea niciodată la ochi. „Bine. Poate că mă înșel. Dar să știi că prietenii mei nu se înșală niciodată de două ori în privința cuiva."</p>
          <p>Plecă la fel de brusc cum venise. Ghiță rămase singur la masă, cu tremuratul mâinilor pe care cu greu îl putea stăpâni. Știa că Lică nu îl creduse. Știa că de acum înainte era urmărit, că fiecare mișcare a lui era înregistrată și raportată.</p>
          <p>Ana îl găsi palid la masă și se așeză lângă el fără să spună nimic. Îi luă mâna și o ținuse în tăcere, ca și cum ar fi știut tot fără să fi auzit nimic. Ghiță o privi și pentru prima dată în luni de zile simți că ar fi vrut să-i spună totul, să se mărturisească, să arunce povara aceasta de pe umeri.</p>
          <p>„Ana," începu el, „eu..."</p>
          <p>Dar în acel moment, ușa hanului se deschise și intrară câțiva drumeți gălăgioși, și momentul se pierdu. Ghiță se ridică și se duse să-i servească, lăsând în urmă vorbele nerostite să atârne în aer.</p>
          <p>Noaptea, când toți dormeau, Ghiță stătea treaz și plănuia. Trebuia să acționeze repede, dar cu grijă. Trebuia să dea lui Pintea dovezi concrete despre Lică — nu zvonuri și bănuieli, ci fapte, locuri, ore, nume. Și pentru asta, trebuia să intre mai adânc în cercul lui Lică, să-i câștige complet încrederea, să ajungă să știe destul.</p>
          <p>Era o strategie periculoasă. Era posibil să se piardă în ea, să uite cine era cu adevărat și de ce intrase în această capcană. Era posibil să devină ceea ce se prefăcea că este. Dar nu vedea altă cale.</p>
          <p>În dimineața următoare, când Lică trecu pe la han, Ghiță îl întâmpină cu un zâmbet cald și îi spuse că vrea să vorbească cu el în privat. Lică ridică o sprânceană, dar acceptă.</p>
          <p>„Am auzit că ai o afacere cu niște vite la bâlciul de la Pecica," spuse Ghiță cu voce joasă. „Dacă ai nevoie de cineva de încredere să stea cu ochii pe ele noaptea, eu pot trimite pe cineva."</p>
          <p>Lică îl privi lung. Ceva în privirea lui se schimbă ușor, o relaxare aproape imperceptibilă. „Tu ești un om deștept, Ghiță," spuse el în cele din urmă. „Mai deștept decât credeam."</p>
          <p>Astfel se strânse mai tare nodulul care îl lega pe Ghiță de Lică. Nu mai era un simplu hangiu care ținea gura închisă. Acum era complice activ, un om care alegea în cunoștință de cauză să ajute un tâlhar. Și cu fiecare pas adâncindu-se în această viață dublă, întoarcerea părea tot mai grea și mai îndepărtată.</p>
          <p>Ana simțea că ceva nu era în regulă, că Ghiță se schimba în față ei, că bărbatul pe care îl iubise devenea cineva necunoscut. Dar nu știa cum să vorbească cu el, nu știa cum să ajungă la inima lui care se împietrise ca o stâncă.</p>
          <p>Copiii creșteau neștiutori de dramele ce se desfășurau în jurul lor, bucurându-se de spațiile largi ale morii, de jocurile lor nevinovate, de dragostea simplă pe care le-o arăta Ana în fiecare zi.</p>
          <p>Bătrâna nu mai venea deloc. Poate că presimțea că nu mai era binevenită, sau poate că îi era teamă de ceea ce urma să vadă dacă venea.</p>
        `
      },
      {
        id: 'moara-ch4',
        title: 'Capitolul IV - Zbuciumul',
        content: `
          <p>Iarna venise timpuriu în acel an, cu viscol și geruri aspre care îngropau drumurile sub zăpadă albă și înaltă. La Moara cu noroc, viața continuă în ritmul ei, dar o tensiune apăsătoare se instalase peste tot, în fiecare colț al casei, în fiecare privire schimbată între oameni.</p>
          <p>Ghiță reușise să trimită câteva informații lui Pintea — locuri de întâlnire, drumuri folosite de oamenii lui Lică, câteva nume. Dar nu era destul. Pintea îi ceruse ceva mai concret, dovezi de necontestat, momente în care să-i prindă pe hoți cu mâna în sac.</p>
          <p>Și Ghiță adâncea tot mai mult în mocirla în care intrase. Acționa din ce în ce mai natural alături de oamenii lui Lică, ca și cum ar fi uitat complet că juca un rol. Uneori, în mijlocul unei tranzacții dubioase, îl prindea o spaimă rece: cum de ajunsese aici? Cum se întâmplase toate acestea?</p>
          <p>Lică, la rândul lui, devenise tot mai deschis față de Ghiță, tot mai sincer în planurile lui, tot mai nerușinat în fărădelegile pe care le plănuia. Asta era, pe de o parte, exact ceea ce voia Ghiță — informații. Pe de altă parte, fiecare confidență a lui Lică îl implica și mai tare pe Ghiță în treburile sale murdare.</p>
          <p>Într-o seară geroasă, când vântul urla prin crăpăturile ușilor, Lică veni la han cu o veste care îi îngheță sângele lui Ghiță în vine. Doi oameni de-ai lui fuseseră arestați de Pintea. Interogatoriile începuseră. Lică bănuia că cineva aproape de el îl trădase.</p>
          <p>„Cine crezi că a vorbit?" îl întrebă Ghiță, cu un calm pe care numai dumnezeu știa cum îl menținea.</p>
          <p>„Nu știu încă," spuse Lică, cu ochii strânși. „Dar am să aflu. Și atunci..." Nu termină fraza, dar zâmbetul lui spunea mai mult decât orice cuvânt.</p>
          <p>Ghiță nu dormi deloc în noaptea aceea. Stătea în pat în întuneric, ascultând respirația liniștită a Anei, gândindu-se că dacă Lică afla că el era informatorul, Ana și copiii ar fi în pericol. Nu el — Ana. Copiii. Asta îl sfâșia cu adevărat.</p>
          <p>Se sculă în zori, se îmbrăcă în grabă și trimise o vorbă lui Pintea că trebuia să se vadă urgent. Jandarmul veni deghizat a doua zi la han și îl ascultă pe Ghiță cu fața impasibilă.</p>
          <p>„Trebuie să acționăm acum sau niciodată," spuse Ghiță. „Dacă așteptăm mai mult, Lică va afla tot."</p>
          <p>Pintea clătină din cap. „Nu suntem pregătiți. Mai avem nevoie de o săptămână, două."</p>
          <p>„Eu nu mai am o săptămână," spuse Ghiță cu vocea tremurând ușor. „Familia mea nu mai are o săptămână."</p>
          <p>Pintea îl privi lung. „Poți să-ți trimiți familia la soacra ta câteva zile? Sub pretextul că sunt bolnave copiii, sau că bătrâna are nevoie de ajutor?"</p>
          <p>Era o idee. Ghiță se agăță de ea. Seara, îi spuse Anei că mama ei îl chemase și că era mai bine să meargă să petreacă câteva zile acolo cu copiii.</p>
          <p>Ana îl privi cu ochi în care se citeau o mie de întrebări nerostite. „De ce?" întrebă ea simplu.</p>
          <p>„Nu pot să îți explic acum. Pleacă, te rog. Fă-o pentru mine."</p>
          <p>Fu prima dată când îi ceru ceva fără să dea nicio explicație. Ana înțelese că era ceva grav. Tăcu, îl privi o clipă cu ochii în lacrimi, apoi se duse să pregătească lucrurile copiilor.</p>
          <p>Înainte de a pleca, se întoarse și îl îmbrățișă strâns, fără să spună nimic. Ghiță o ținuse strâns, simțind că ceva în el se frânge, că plecarea ei era un adio de un fel sau altul.</p>
          <p>„Ai grijă de tine," șopti Ana.</p>
          <p>„Și voi, de voi," răspunse el.</p>
          <p>Privind căruța cum se depărta pe drumul înzăpezit, Ghiță simți o singurătate vastă, un gol care se deschisese în pieptul lui. Dar simți și ceva altceva — o hotărâre rece, o claritate de care dusese lipsă luni de zile.</p>
          <p>Acea noapte fu una dintre cele mai lungi din viața lui. Stătea singur în han, ascultând scrâșnetul zăpezii sub pașii cuiva care trecea pe drum, clipind lumânărilor pe mesele goale, vijeliei care bătea în geamuri.</p>
          <p>Lică veni noaptea, mai târziu decât de obicei, cu chipul schimonosit de furie abia ținută în frâu. Îl însoțeau doi oameni pe care Ghiță nu îi mai văzuse.</p>
          <p>„Unde e nevastă-ta?" întrebă Lică, privind în jur.</p>
          <p>„La mama ei. Copiii erau bolnavi."</p>
          <p>Lică îl studie. Ceva în privirea lui îi spunea lui Ghiță că Sămădăul ghicise că nu era întâmplător că Ana plecase. Dar nu spuse nimic. Ceru vin, se așeză, și începu o lungă tăcere în care Ghiță simțea că fiecare secundă putea fi ultima.</p>
          <p>La un moment dat, Lică spuse cu glas scăzut: „Știi ce fac eu cu oamenii care mă trădează, Ghiță?"</p>
          <p>Ghiță ridică privirea de pe paharul lui. „Nu."</p>
          <p>„Același lucru pe care îl fac cu un câine care mușcă stăpânul," spuse Lică simplu, ca și cum ar fi vorbit despre vreme.</p>
          <p>Ghiță nu răspunse. Înăuntrul lui, totuși, ceva se hotărî definitiv în clipa aceea.</p>
        `
      },
      {
        id: 'moara-ch5',
        title: 'Capitolul V - Sfârșitul',
        content: `
          <p>Dimineața veni cu un cer limpede și cu un frig tăios care îngheța suflul în nări. Ghiță se trezi din scurtul lui somn înainte de răsăritul soarelui, cu sufletul plin de hotărârea de ajun. Astăzi se termina totul, într-un fel sau altul.</p>
          <p>Trimisese vorbă lui Pintea prin băiatul morarului cel bătrân, un copil de doisprezece ani care nu știa ce ducea și cui ducea. Mesajul era simplu: „Astă-noapte. Moara cu noroc. Vino cu oameni."</p>
          <p>Lică urma să vină seara cu o marfă importantă, ceva legat de furtul unui transport de monede de la o casă de bani din comitatul vecin. Era cea mai mare lovitură pe care o plănuise în anii lui de tâlhărie, și pentru că avea nevoie de un loc sigur unde să ascundă marfa câteva zile, alesese Moara cu noroc.</p>
          <p>Ghiță pregăti hanul în tăcere. Aduse lemne, aprinse focul, curăță mesele. Mâinile lui lucrau automat în timp ce mintea lui era altundeva, gândindu-se la Ana și la copii, la bătrâna soacră cu vorbele ei de înțelepciune pe care nu le ascultase la timp.</p>
          <p>„Omul să fie mulțumit cu sărăcia sa." Câtă dreptate avusese ea. Câtă nebunie fusese toată odiseea lui de la moară, cât de mult pierduse în goana după câștig. Nu câștigase mai mult, câștigase mai puțin — pierduse liniștea, pierduse demnitatea, pierduse bucuria simplă de a privi în ochii nevestei lui fără să se simtă vinovat.</p>
          <p>Pintea ajunse cu oamenii lui în amurg, ascunzându-se în hambar și în spatele morii. Ghiță îi instalase în liniște, fără să schimbe mai mult de câteva cuvinte.</p>
          <p>„Ești sigur că vine?" îl întrebă Pintea.</p>
          <p>„Vine. Lică nu se dezdice niciodată de cuvântul dat."</p>
          <p>Pintea dădu din cap și dispăru în umbra hambarului.</p>
          <p>Noaptea se lăsă grea și tăcută. Ghiță stătea la bar, turnând vin pe care nu-l bea, ascultând fiecare sunet din afară. Lumânările ardeau jos, aproape de capăt. Focul din vatră se stinsese la jumătate.</p>
          <p>Lică veni cu patru oameni, mai mulți decât de obicei. Ghiță băgă de seamă imediat că ceva era diferit — Lică era mai tăcut, mai atent, privea în colțuri, simțea ceva în aer fără să știe ce anume.</p>
          <p>„Unde e marfa?" întrebă Ghiță, jucând rolul până la capăt.</p>
          <p>„Vine," spuse Lică scurt. „Unde e nevastă-ta?"</p>
          <p>„Tot la mama ei. Mi-am spus că e mai bine să fie departe în noaptea asta."</p>
          <p>Lică se întoarse brusc spre el, cu privirea ascuțită ca un cuțit. „Departe în noaptea asta. De ce în noaptea asta anume, Ghiță?"</p>
          <p>Ghiță simți că se prăbușea totul. Fusese un moment de slăbiciune, o vorbă prea mult. Deschise gura să spună ceva, orice, dar în acel moment ușa hambarului se trânti și Pintea intră cu oamenii lui, cu armele trase.</p>
          <p>Ce urmă fu scurt și violent. Oamenii lui Lică scoaseră armele, dar fură doborâți înainte de a putea trage. Lică însuși se repezi spre ușa din spate, dar Pintea îi tăiase calea. Se luptară câteva clipe, Lică, cu puterea disperată a animalului prins în cursă, înainte de a fi doborât la pământ.</p>
          <p>Ghiță stătea nemișcat în tot tumultul acesta, cu spatele la bar, privind tot. Nu simțea nici bucurie, nici ușurare, nici triumf. Simțea o oboseală imensă și un gol pe care nu știa cum să-l numească.</p>
          <p>Pintea veni la el după ce Lică și oamenii lui fură înlănțuiți și duși afară. „Ai făcut bine, Ghiță. Ai ajutat la prinderea celui mai periculos tâlhar din ținut."</p>
          <p>Ghiță clătină din cap. „Nu am făcut bine deloc. Am greșit de la început, de când am lăsat prima dată sacul lui să rămână în casa mea."</p>
          <p>Pintea îl privi cu ceva care semăna cu mila. „Nimeni nu iese nevătămat dintr-o întâlnire cu Lică. Tu ai ieșit cu viață. Sunt oameni care nu au reușit nici atât."</p>
          <p>Când se lumină de ziuă, Ghiță stingea ultimele lumânări din han. Curtea Morii cu noroc era plină de urme de pași în zăpadă, de sânge pe care înghețul îl năclăise, de martor tăcut al nopții de coșmar ce trecuse.</p>
          <p>Trimise vorbă Anei să vină. Ea veni grăbită, cu copiii în urmă și cu bătrâna care abia ținea pasul cu ei. Când îl văzu, Ana îl îmbrățișă tăcută, fără să întrebe nimic, simțind că trecuse printr-o încercare grea.</p>
          <p>„Plecăm," îi spuse Ghiță simplu. „Plecăm de la Moara cu noroc. Vindem tot ce se poate vinde și plecăm."</p>
          <p>Ana nu protesta. Nici nu se bucură vizibil. Îl privi doar cu acei ochi mari și blânzi care îl iubiseră întotdeauna mai mult decât meritase el.</p>
          <p>Bătrâna, auzind vorbele lui Ghiță, puse mâna pe umărul ginerelui ei. Nu spuse nimic. Nu era nevoie. În îmbrățișarea ei bătrânească era toată compasiunea, toată iertarea și toată înțelepciunea pe care ea o purtase cu ea pe tot parcursul acestei povești.</p>
          <p>Moara cu noroc rămase în urma lor, cu acoperișul de șindrilă, cu stejarul cel bătrân, cu izvorul din curte. Rămase acolo, la răscruce de drumuri, așteptând poate un alt om care să uite vorbele bătrânelor și să caute norocul în locurile unde nu se poate găsi.</p>
          <p>Căci norocul adevărat, dacă există, nu stă în moșii sau în bani câștigați cu prețul sufletului. Stă în liniștea colibei tale și în ochii celor care te iubesc. Asta știuse bătrâna din prima zi. Asta înțelegea Ghiță abia acum, când lăsa în urmă tot ce câștigase și se întoarce, cu mâinile goale dar cu conștiința mai curată decât o avusese de mult.</p>
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

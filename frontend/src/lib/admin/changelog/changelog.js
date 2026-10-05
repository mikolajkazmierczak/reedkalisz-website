// What changed for the admins, newest first: every update gets a version here (shown at the bottom of the menu, the
// changelog opens by itself after a new one). X.Y.Z: X - 0 before the public launch (1.0.0, 2023-03-09), 1 since;
// Y - something new or noticeably different; Z - a fix, a tweak, work nobody sees, or a change to this changelog.
// One version per commit, written in the same commit. `date`: YYYY-MM-DD.
//   { version, date, title, highlight, all }
//
// How to write one (Polish, for the admins - so they don't have to ask what changed):
// - `title`: what the update is about, in 2-4 words ("Nowy wygląd panelu", "Poprawki w kalkulacjach").
// - `highlight`: short paragraphs of prose, read by everyone: 1-3 for a Y, a sentence or two for a Z. Pick only what
//   matters: the most useful new thing, what changed a lot, and what could confuse or look like a bug (e.g. changes
//   showing up later on the site). Say where it is and how to use it, as you'd tell a colleague; not a list in prose.
//   **bold** the few phrases worth spotting while scanning (the feature's name, a warning). A personal note goes last
//   as its own paragraph ("**P.S.** ..."). Plain and factual; a rare deadpan joke only where something is genuinely
//   funny, never at the admins' expense, and never personifying the site.
// - `all`: behind "Pełne zmiany", every change an admin or a client could notice - one plain sentence each, ~10-20
//   words, from what it does: buttons, labels, fields, behaviour, the site ("„Anuluj” nazywa się teraz „Wróć”" is
//   fine). No code: no variable, file, component or library names, refactors, migrations, scripts or deploys; work
//   nobody sees is left out, or told by its effect ("strona główna ładuje się szybciej"). Fixes start "Poprawka: ".
//   Most important first. With many changes over several areas, group them: { label: 'Kalkulacje', items: [...] }
//   (Wygląd panelu, Produkty, Kalkulacje, API, Strona...); a few stay plain strings. Empty - no "Pełne zmiany" - when
//   the highlight already says it all (a small update), or when nothing is visible.
// - Only what this version changed: never repeat what was already true before it (an earlier entry says so, or the
//   code before the commit did it) - e.g. saving that was always slow isn't news because a warning appeared, only the
//   warning is. Check the earlier entries and the commit's diff, not just its message.
// - Once published an entry stays as it is, unless asked to clarify it.
export const changelog = [
  {
    version: '1.28.2',
    date: '2026-10-05',
    title: 'Nowa historia zmian',
    highlight: [
      'Historia zmian ma nowy układ: przy każdej wersji najpierw krótko opisane jest to, co najważniejsze, a **„Pełne zmiany”** rozwija listę wszystkich zmian.',
      'Cała historia, od 2022 roku, jest przepisana na nowo. Wpisy nie powtarzają już tego, co działało wcześniej, a kilka starych, które opisywały zmianę nie całkiem tak, jak było naprawdę, jest poprawionych.',
    ],
    all: [
      'Każda wersja zaczyna się od krótkiego opisu najważniejszych zmian.',
      '„Pełne zmiany” rozwija listę wszystkich zmian wersji, przy dużych pogrupowaną; „Zwiń pełne zmiany” ją chowa.',
      'Numer wersji jest w chmurce przed tytułem: niebieskiej, a pomarańczowej z „NOWE”, gdy wersja wyszła od ostatniego otwarcia historii.',
      'Cała historia zmian jest przepisana od pierwszej wersji, z poprawionymi nieścisłościami w starych wpisach.',
    ],
  },
  {
    version: '1.28.1',
    date: '2026-10-04',
    title: 'Poprawki w kalkulacjach',
    highlight: [
      'Dwie drobne poprawki w tabelach kalkulacji: krótka tabela znakowań nie ma już pod sobą pustego paska, a **zaznaczoną komórkę widać ze wszystkich stron** – wcześniej sąsiednie komórki zasłaniały część jej ramki.',
    ],
    all: [],
  },
  {
    version: '1.28.0',
    date: '2026-10-04',
    title: 'Nowy wygląd panelu',
    highlight: [
      'Panel wygląda teraz jak formularz leżący na macie do cięcia: granatowe napisy, białe pola i kratka pod spodem. **Układ się nie zmienił** – każdy przycisk, tytuł i sekcja są tam, gdzie były, tylko wszystko jest ciaśniej ułożone, więc na ekranie mieści się więcej.',
      'W **Kalkulacjach** po tabeli znakowań chodzi się klawiaturą jak w Excelu: strzałki przechodzą między komórkami, Enter albo samo pisanie zaczyna edycję, a Esc cofa zmianę. Zmienione komórki robią się żółte, a pod tabelą widać listę zmienionych znakowań, więc przed zapisem łatwo sprawdzić, co się zmieni.',
      '**Uwaga:** żeby strona główna ładowała się szybciej, jej kopia jest trzymana dłużej: zmiany na stronie głównej, w Kontakcie i w politykach klienci mogą zobaczyć **do 5 minut później** (wcześniej do minuty), a w menu kategorii i stopce do 2,5 minuty. Pozostałe strony, np. produkty i kategorie, pokazują zmiany szybciej niż dotąd. To nie błąd zapisu – wystarczy chwilę poczekać.',
    ],
    all: [
      {
        label: 'Wygląd panelu',
        items: [
          'Panel ma nowy wygląd: granatowy tekst, białe pola i niebiesko-szara mata do cięcia z kratką w tle.',
          'Układ jest ten sam: żaden przycisk, tytuł ani sekcja nie zmieniły miejsca.',
          'Okna, paski i etykiety leżą równo na liniach kratki, a całość jest gęstsza.',
          'Pola i przyciski mają mocniej zaokrąglone rogi, a karty pozycji są jaśniejsze.',
          'Menu ma z boku perforację jak w bloczku; zostaje na miejscu, gdy przewija się menu.',
          'Logo w menu ma proste rogi.',
          'Okno logowania leży na macie i ma granatową ramkę.',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          'Strzałki przechodzą między komórkami tabeli znakowań, a Tab wzdłuż wiersza (na jego końcu do następnego).',
          'Enter, F2, ponowne kliknięcie albo samo pisanie zaczyna edycję komórki; pisanie zastępuje jej wartość.',
          'W trakcie edycji Enter zatwierdza i schodzi niżej, a Esc przywraca poprzednią wartość.',
          'Strzałka w prawo za ostatnią komórką wiersza przechodzi na przycisk dodawania kolumny ilości.',
          'Zmienione komórki są żółte, a nowo dodana kolumna ilości cała.',
          'Pod tabelą widać listę znakowań, które się zmieniły.',
          'Komórki ilości w nagłówku są białe, a wiersz pod kursorem robi się szary.',
          'Nad przyciskiem zapisu jest teraz wprost napisane, że zapis może długo potrwać.',
          'Poprawka: żółte oznaczenie działa też w kolumnach, które nie przewijają się w bok, i w nagłówkach ilości po zmianie ich kolejności.',
          'Poprawka: Esc przywraca właściwą, poprzednią wartość komórki.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'Notatki wypełniają całą kolumnę i są żółte, gdy coś zawierają.',
          'Kategorię dodaną ręcznie można usunąć przed zapisem, nawet gdy jest w mapowaniu API.',
          'Poprawka: przełączniki znakowań i wariantów nie migają przy przełączaniu, a pola wyboru nie mrugają.',
          'Poprawka: powtórzone znakowanie ma czerwoną ramkę.',
          'Znaczki skanera w listach wyboru są mniejsze i stoją po prawej.',
        ],
      },
      {
        label: 'Wybór pliku',
        items: [
          'Przycisk „Anuluj” nazywa się teraz „Wróć”.',
          '„Wyczyść” od razu zdejmuje plik i zmienia się w „Przywróć”, które go oddaje.',
          'Zdjęty plik zostaje w swojej grupie z wyblakłą, przerywaną ramką.',
          'Poprawka: szybka zmiana wybranego pliku nie pokazuje już poprzedniego.',
        ],
      },
      {
        label: 'API',
        items: [
          'W API › Produkty można zmienić firmę, zanim skończy się pobieranie danych poprzedniej.',
          'API › Produkty pokazuje domyślnie 50 pozycji na stronę, tak jak pozostałe listy.',
          'Wyszukiwarka w API › Produkty chowa się na czas skanu, bo szukanie przerywało go pytaniem o wyjście ze strony.',
          'W przeglądzie zdjęć przycisk otwierający produkt jest w jego etykiecie, po lewej.',
          'Na szerokim ekranie test miejsc w zakładce Miejsca stoi obok tabeli, a nie pod nią.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Strona główna ładuje się szybciej dzięki kilku usprawnieniom po stronie serwera.',
          'Przy przejściu na stronę główną z innej podstrony strona pokazuje się od razu, a slidery doczytują się, w międzyczasie pulsując szarymi kafelkami.',
          'Zmiany na stronie głównej, w Kontakcie i w politykach klienci mogą zobaczyć do 5 minut później (wcześniej do minuty), a w menu kategorii i stopce do 2,5 minuty.',
          'Pozostałe strony, np. produkty i kategorie, nie są już trzymane w kopii przez minutę, więc pokazują zmiany szybciej.',
          'Statystyki liczą tylko publiczne strony reed.kalisz.pl, bez wizyt z przeglądarek, w których admin logował się do panelu.',
          'Przyciski admina na stronie są zawsze na wierzchu treści.',
          'Maszyna w nagłówku strony głównej rzuca cień.',
        ],
      },
    ],
  },
  {
    version: '1.27.0',
    date: '2026-10-03',
    title: 'Przegląd zdjęć jako edytor',
    highlight: [
      '**Przegląd zdjęć z API** pokazuje teraz wszystkie zdjęcia produktu, nie tylko nowe, i działa jak pełny edytor zdjęć: także te, które już były, można usuwać i przenosić między galerią a wariantami. Usunięcie zaznacza się koszem w rogu zdjęcia i można je cofnąć; zdjęcia znikają dopiero po zapisie.',
      'Każde nowe zdjęcie po skanie ma znak NOWE i fioletową ramkę. Przy imporcie znak pojawia się tylko u produktów, które już są w bazie – u zupełnie nowych wszystkie zdjęcia są nowe, więc znak nic by nie mówił.',
    ],
    all: [
      'Przegląd zdjęć pokazuje wszystkie miejsca produktu (galerię i każdy wariant), a nie tylko te z nowymi zdjęciami.',
      'Zdjęcia, które już były, można usuwać i przenosić między galerią a wariantami, tak jak nowe.',
      'Obok strzałki w rogu każdego zdjęcia jest kosz, a po kliknięciu przycisk cofnięcia; kliknięcie samego zdjęcia działa tak samo.',
      'Pasek przeglądu pokazuje, ile zdjęć zostanie usuniętych.',
      'Po skanie każde nowe zdjęcie ma znak NOWE; przy imporcie tylko u produktów, które już są w bazie.',
      'Nowe zdjęcia mają fioletową ramkę wewnątrz kafelka, a znak NOWE jest nad przyciskami w rogu.',
      'Zniknęła notka „Niektóre ze zdjęć były już w naszej bazie”, a nazwa i kod produktu są na szarym tle.',
      'Usunięte i przeniesione zdjęcia znikają na samym końcu zapisu, więc przerwany zapis ich nie gubi.',
      'Dwa paski nad listą w API › Produkty są połączone w jeden, z linią pośrodku.',
      'Przyciski Skanuj i Importuj są równej szerokości.',
    ],
  },
  {
    version: '1.26.0',
    date: '2026-10-03',
    title: 'Szybsze skanowanie i lupa',
    highlight: [
      '**Skany są kilka razy szybsze**, najbardziej te duże, jak AXPOL, a przeliczanie cen po nich trwa krócej. Skan nie może już wisieć bez końca: dostawca, który nie odpowiada przez 8 minut, kończy skan komunikatem z jego nazwą. Drugiego skanu tej samej firmy nie da się zacząć, dopóki trwa pierwszy.',
      'Każde zdjęcie w panelu ma w rogu **lupę**, która otwiera je w pełnym rozmiarze; to samo robi prawy przycisk myszy. Edytory mają najwyżej trzy kolumny, więc na szerokim ekranie pola nie rozjeżdżają się już tak bardzo.',
      '**P.S.** Dziękuję za prezent!!! ❤️ Superancki jest :))',
    ],
    all: [
      {
        label: 'Skanowanie',
        items: [
          'Skany są kilka razy szybsze, najbardziej te duże, jak AXPOL.',
          'Dostawca, który nie odpowiada, kończy skan po najwyżej 8 minutach, a komunikat podaje jego nazwę.',
          'Drugiego skanu tej samej firmy nie da się zacząć, dopóki trwa pierwszy; panel prosi, żeby spróbować za chwilę.',
          'Skan, który stracił połączenie z serwerem skanera, kończy się błędem zamiast czekać w nieskończoność.',
          'Poprawka: duże skany (np. MidOcean) nie przerywają się już z braku pamięci na serwerze.',
          'Przeliczanie cen jest szybsze i zapisuje tylko ceny, które naprawdę się zmieniły.',
          'Gdy skan zmienia tylko miejsce lub pole znakowania, ceny nie są przeliczane.',
          'Baza odpowiada szybciej przy zapisie produktów i przeliczaniu cen.',
        ],
      },
      {
        label: 'Zdjęcia',
        items: [
          'Każde zdjęcie w panelu ma w rogu lupę, która otwiera je w pełnym rozmiarze; to samo robi prawy przycisk myszy.',
          'W przeglądzie zdjęć uchwyt i strzałka wysuwają się razem z lupą, zamiast pojawiać się w miejscu.',
          'Przegląd zdjęć oznacza NOWE tylko u produktów, które mają też wcześniejsze zdjęcia, a w tytule ma najpierw nazwę, potem kod.',
          'Linia między grupami zdjęć w przeglądzie jest grubsza.',
          'Zdjęcie używane też w innym produkcie zachowuje swoją nazwę przy zapisie.',
        ],
      },
      {
        label: 'Edytor',
        items: [
          'Edytor ma najwyżej trzy kolumny; poprawka: pole na całą szerokość nie dodaje już ukrytej kolumny.',
          'Kafelki galerii i załączników wypełniają cały wiersz.',
          'Samotny „Dodaj” jest szeroki jak kafelek galerii, a w kalkulacjach też stoi bokiem obok karty, jak w wariantach.',
          'Lewa kolumna cennika jest szeroka jak karta wariantu.',
          'Puste warianty znikają przy zapisie.',
          'Pole Widok pokazuje po nazwie widoku jego ilości.',
          'Wartości marż odgórnych są w chmurce obok nich, niebieskiej, gdy marża jest w użyciu.',
          'Podpowiedź o znakowaniu zarządzanym przez skaner jest w dwóch linijkach.',
        ],
      },
      {
        label: 'Menu',
        items: ['Wyloguj, imię i wersja są na środku menu, a ikona wylogowania nad awatarem.'],
      },
    ],
  },
  {
    version: '1.25.0',
    date: '2026-10-03',
    title: 'Zdjęcia, API i strona produktu',
    highlight: [
      'Zdjęcia i załączniki w edytorze produktu **przestawia się, przeciągając je za uchwyt** w rogu kafelka; Esc albo upuszczenie obok anuluje. Przycisk ze strzałką obok uchwytu przenosi zdjęcie między galerią a wariantami. **Warianty i znakowania układają się same** – warianty po kodzie, znakowania w kolejności z Kalkulacji – więc ich strzałek już nie ma.',
      '**Przegląd nowych zdjęć z API** pokazuje je obok zdjęć, które produkt już ma, w kolejności dostawcy i ze znakiem NOWE. Przy imporcie produktów pytanie o zgodę pada dopiero po przejrzeniu zdjęć, a „Anuluj” niczego nie zapisuje.',
      'Na stronie produkt bez cen pokazuje **„Zapytaj o cenę”**, także na karcie PDF. Znacznik „Brak” nazywa się teraz „Koniec nakładu”, a gdy żaden wariant nie ma towaru, produkt sam dostaje szary **„Chwilowy brak”**.',
    ],
    all: [
      {
        label: 'Produkty',
        items: [
          'Zdjęcia w galerii i wariantach oraz załączniki przestawia się, przeciągając je za uchwyt w rogu (albo strzałkami z klawiatury); Esc lub upuszczenie obok anuluje.',
          'Przycisk ze strzałką w rogu zdjęcia przenosi je do galerii albo do innego wariantu.',
          'Warianty układają się po kodzie, a znakowania w kolejności z Kalkulacji, przy otwarciu i przy zapisie; strzałek do ich przestawiania już nie ma.',
          'Niebieska ramka oznacza zdjęcie, które pokazuje kafelek produktu na stronie, a przerywana – zdjęcie po najechaniu (wcześniej przerywana ramka była na pierwszym zdjęciu galerii).',
          'Kafelki bez wybranego pliku znikają przy zapisie: w galerii, w wariantach i w załącznikach.',
          'Kafelki galerii i załączników są mniejsze i stoją w równym rzędzie z kartami wariantów, po trzy na szerokość karty.',
          '„Dodaj” stojący w rzędzie obok kafelka albo karty jest obrócony bokiem.',
          'Wariant bez zdjęć ma przycisk „Zdjęcie”, a ze zdjęciami przerywany „Dodaj”; nagłówek „Zdjęcia” i pole „Galeria” przy zdjęciach wariantu zniknęły.',
          'W wyborze znakowania nieaktywne są te, które dodaje skaner API („Dodaje je skaner API”), i te, które produkt już ma na tym polu („Już jest w produkcie”).',
          '„Dodaj” w znakowaniach wybiera pierwsze wolne znakowanie, a gdy wolnego nie ma, mówi o tym.',
          'Powtórzone znakowanie nie ma już nad sobą napisu „DUPLIKAT”; oznacza je czerwona ramka.',
          'Wyliczone cenniki w znakowaniach układają się poziomo (ilości w rzędzie, ceny pod nimi), gdy mieszczą się w wierszu, a nagłówki tabel mają ikony.',
          'Poprawka: wyłączenie i ponowne włączenie znakowania nie zostawia produktu jako niezapisanego.',
        ],
      },
      {
        label: 'API',
        items: [
          'Przegląd nowych zdjęć pokazuje je obok zdjęć, które produkt już ma, w kolejności dostawcy; nowe mają znak NOWE i fioletową ramkę.',
          'W przeglądzie zdjęcia przestawia się uchwytem i przenosi strzałką do galerii lub innego wariantu; oba przyciski pojawiają się po najechaniu.',
          'Po przejrzeniu zdjęć ich nazwy w Bibliotece odpowiadają miejscu, które zajmują w produkcie (np. „MO9469 / MO9469-03 / #1”).',
          'Przy imporcie produktów pytanie o zgodę pada dopiero po przejrzeniu zdjęć; przegląd ma „Anuluj” zamiast „Później”, a anulowanie niczego nie zapisuje.',
          'Nowe zdjęcie, które dostawca pokazuje też w wariancie już zaimportowanym, trafia przy imporcie również tam.',
          'Produkt zapisany przez kogoś w trakcie przeglądu zdjęć jest pomijany, a jego nowe zdjęcia zaproponuje kolejny skan.',
          'Zdjęcie usunięte u dostawcy znika z produktu, nawet jeśli zostało przeniesione do galerii albo innego wariantu.',
          'Zamiast „Najpierw wycofane” i „Najpierw zaimportowane” nad listą są przyciski Wycofane, Nowe warianty, Komplikacje i Zaimportowane, które przenoszą takie produkty na górę; „Nowe warianty” jest włączony od początku.',
          'Lista jest domyślnie ułożona po kodzie (wcześniej po nazwie), a warianty produktu też po kodzie.',
          'Fioletowa chmurka oznacza nowe warianty u dostawcy, a pomarańczowo-fioletowa – wycofane i nowe naraz.',
          'Kolumna Stan nazywa się teraz Komplikacje.',
          'Poprawka: materiały z PAR i MidOcean nie powtarzają się po skanie.',
        ],
      },
      {
        label: 'Wygląd panelu',
        items: [
          'Wszystkie okna wyglądają jednakowo: tytuł i „Zamknij” na górze, treść przewija się pod matowym paskiem, a przyciski zostają na dole.',
          'Każdy przycisk „Anuluj” jest jasny, z krzyżykiem.',
          'Okno błędu ma czerwoną ramkę, a każdy błąd jest w osobnym polu.',
          'Kafelki plików mienią się, dopóki zdjęcie się nie wczyta.',
          'W listach wyboru opcje bez ikony są wyrównane z tymi, które ją mają.',
          'Przycisk dodawania ilości w tabeli znakowań w Kalkulacjach jest małym, przerywanym „+”.',
          'Poprawka: okno z pytaniem nie psuje strony, gdy znika.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Produkt bez cen (ukrytych albo pustych) pokazuje w miejscu ceny „Zapytaj o cenę ↓”, a karta PDF – „Zapytaj o cenę”.',
          'Cennik włączony, ale bez żadnej ceny, nie pokazuje się na stronie ani na karcie PDF.',
          'Znacznik „Brak” nazywa się „Koniec nakładu”; gdy żaden wariant nie ma towaru, produkt sam dostaje szary „Chwilowy brak”, a jego kafelek jest lekko przygaszony.',
          'Znaczniki mają nowe kolory: Promocja jest czerwona, Bestseller zielony, a Wkrótce jasnoniebieski.',
          'Wariant bez towaru ma napis „CHWILOWY BRAK” i przygaszone zdjęcia, a „Dostępność” stoi na kartach wariantów na równej wysokości.',
          'Galeria produktu pokazuje wszystkie zdjęcia wariantów, w najwyżej dwóch rzędach miniatur; resztę otwiera kafelek „+N”.',
          'Kod i „ze znakowaniem” na kafelku produktu stoją ciaśniej.',
        ],
      },
    ],
  },
  {
    version: '1.24.1',
    date: '2026-10-02',
    title: 'Poprawki',
    highlight: [
      'Poprawka błędu „Cannot read properties of null”, który od 1.24.0 pokazywał się przy otwieraniu produktu (zapis działał mimo niego), a obok numeru wersji na dole menu widać datę jej wydania.',
    ],
    all: [
      'Poprawka: otwarcie produktu nie pokazuje już błędu „Cannot read properties of null”.',
      'Obok wersji na dole menu widać datę jej wydania.',
      'W przeglądarce, w której historii zmian jeszcze nie otwierano, nowe są wersje z ostatniego tygodnia (wcześniej tylko najnowsza).',
    ],
  },
  {
    version: '1.24.0',
    date: '2026-10-02',
    title: 'Produkty, Zapytania i API',
    highlight: [
      'Listy produktów i API mają **miniatury**: najechanie powiększa zdjęcie, a kliknięcie otwiera oryginał. Filtr **Producent** pozwala zaznaczyć kilku naraz, a nowy filtr **Kolor** pokazuje produkty z wariantem w danym kolorze. Na końcu edytora produktu są **Załączniki** – pliki, które klienci pobiorą ze strony produktu.',
      '**Zdjęć nie da się już ukryć**: zdjęcie, które nie ma się pokazywać, usuwa się z produktu, a plik zostaje w Bibliotece; wcześniej ukryte zdjęcia zostały w ten sposób zdjęte. W zakładkach API Kategorie, Znakowania i Miejsca są **gotowe reguły dla dostawców** – przejrzyj je przed skanem, bo skan od razu stosuje je do znakowań, kategorii i cen produktów.',
      'Numer wersji na dole menu otwiera **historię zmian**, która po każdej nowej wersji otworzy się też sama.',
    ],
    all: [
      {
        label: 'Produkty',
        items: [
          'Lista produktów ma miniatury przed nazwą; najechanie powiększa zdjęcie, a kliknięcie otwiera oryginał.',
          'W filtrze Producent można zaznaczyć kilku naraz, a „Brak” pokazuje produkty bez producenta.',
          'Nowy filtr Kolor pokazuje produkty z wariantem w wybranych kolorach (z ikonką producenta i wartością koloru); „Brak” – produkty bez koloru.',
          'Filtr bez zaznaczenia pokazuje swoją nazwę, a przy kilku zaznaczonych ich liczbę („3 Wybrane”).',
          'Na końcu edytora produktu są Załączniki: pliki, które klienci pobiorą ze strony produktu; każdy można wyłączyć.',
          'Zdjęć w galerii i wariantach nie da się już ukryć: zniknęły pola „Włączone” i „Pokaż”, a zdjęcie, które nie ma się pokazywać, usuwa się.',
          'Wcześniej ukryte zdjęcia zostały zdjęte z produktów; ich pliki zostały w Bibliotece.',
          'Strzałki do przestawiania zdjęć wariantu są u góry kafelka.',
          'Duplikat produktu kopiuje też załączniki.',
          'Poprawka: wyjście z edytora produktu nie zawiesza strony.',
          'Poprawka: lista produktów nie wraca po zapisie na pierwszą stronę, a zdjęcia wariantu nie przeskakują na początek.',
        ],
      },
      {
        label: 'Listy',
        items: [
          'Listy mieszczą się w oknie: przewija się sama tabela, a jej nagłówek, pasek nad nią i numery stron zostają na miejscu.',
          'Zmiana strony, sortowania, wyszukiwania albo filtrów przewija tabelę na górę.',
          'Nagłówek strony i pasek edytora są przezroczyste, dopóki nie przewinie się pod nimi treść; wtedy robią się matowe.',
          'Kolumna kodu produktu jest węższa; dłuższy kod widać w całości po najechaniu.',
        ],
      },
      {
        label: 'Zapytania',
        items: [
          'Zapytanie z karty produktu ma przycisk ze zdjęciem, nazwą i kodem produktu, który otwiera go w nowej karcie; wcześniej kod był na początku wiadomości.',
          'Wcześniejsze zapytania zostały połączone z produktem, którego kod miały w wiadomości.',
          'Z zapytania zniknęły „Szansa na spam” i pole na plik.',
        ],
      },
      {
        label: 'Kolory',
        items: [
          'Nowe rodzaje kolorów: Drewno i Neutralny, z własnymi wzorami zamiast jednolitego koloru.',
          'Kolor bez wartości ma przekreśloną białą kropkę: w panelu, na stronie (wcześniej „?”) i na karcie PDF.',
        ],
      },
      {
        label: 'API',
        items: [
          'Lista produktów w API ma miniatury: nasze zdjęcie u zaimportowanych, zdjęcie dostawcy u pozostałych.',
          'Ikona w nowej kolumnie Stan ostrzega, czego produktowi zabraknie po imporcie: znakowań (czerwona), kategorii albo tłumaczenia miejsc (pomarańczowa).',
          'W zakładkach Kategorie, Znakowania i Miejsca są gotowe reguły dla każdego dostawcy, przygotowane z tego, co robiliście ręcznie; przejrzyj je przed skanem.',
          'Uwaga: skan od razu stosuje te reguły do znakowań, kategorii i cen produktów.',
          'Reguła miejsc, bez której wynik byłby taki sam, jest oznaczona jako zbędna i podaje regułę, która robi to samo; wszystkie reguły widać naraz.',
          'Zakładka Miejsca ma pomarańczową obwódkę, gdy są reguły zbędne albo takie, które niczego nie tłumaczą.',
          'Kategorie pokazują obok liczby zmapowanych kategorii, ile produktów dostanie naszą kategorię.',
          'Reguła „ignoruj” ma szare tło zamiast pochyłego napisu.',
          'Przycisk „Dodaj” nad listą nazywa się teraz „Importuj”, a kolumna Kolory – Warianty.',
          'Pliki skanów nie pokazują się w Bibliotece.',
        ],
      },
      {
        label: 'Historia zmian',
        items: [
          'Pod imieniem w menu jest numer wersji; kliknięcie otwiera historię zmian, a po nowej wersji otwiera się ona sama.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Na stronie produktu są linki do pobrania załączników, z rodzajem i rozmiarem pliku.',
          '„Kolory i dostępność” nazywa się teraz „Warianty i dostępność”, na stronie i na karcie PDF.',
          'Kolumna treści jest węższa (najwyżej 1280 px), a banery stoją osobno i mają zaokrąglone rogi już od ok. 1600 px szerokości ekranu.',
          'Banery tuż pod nagłówkiem strony głównej zachodzą na jego granatowe tło.',
          'Wariant bez nazwy koloru pokazuje sam kod, na wysokości kropki koloru.',
          'Reklama zewnętrzna ma rysunki zamiast zdjęć, a w ofercie jest nowy, ukryty Roll-up – opis i ceny do uzupełnienia przed pokazaniem.',
          'Przyciski admina na stronie są czerwone, z białymi ikonami.',
        ],
      },
    ],
  },
  {
    version: '1.23.1',
    date: '2026-09-29',
    title: 'Ikona',
    highlight: [
      'Rysunek działu Nowości w siatce działów i obok tytułu działu jest przerysowany, z gwiazdkami jak w menu.',
    ],
    all: [],
  },
  {
    version: '1.23.0',
    date: '2026-09-29',
    title: 'Tabele i strona',
    highlight: [
      'Przy nazwach producentów w całym panelu widać **ich ikonki**, więc łatwiej ich rozróżnić. W ostatniej kolumnie każdej tabeli jest przycisk **Kolumny**: ukrywa się nim kolumny, których nie potrzebujesz, a ta przeglądarka pamięta wybór osobno dla każdej listy.',
      'Na stronie treść wszystkich podstron ma jedną szerokość, a nagłówek strony głównej jest **granatowy** zamiast czerwonego. Nazwy kategorii pisane w całości wielkimi literami są teraz pisane normalnie (np. „Notesy A4”).',
    ],
    all: [
      {
        label: 'Panel',
        items: [
          'Przy nazwach producentów widać ich ikonki: na przyciskach firm w API i Kalkulacjach, w listach wyboru, przy znakowaniach, w Bibliotece i w tabeli Kolorów.',
          'Filtr producenta jest zwykłą listą bez podpisu nad nią, z opcjami „Wszystkie” i „Brak” (wcześniej „Wszyscy” i „❌ Bez producenta”).',
          'W ostatniej kolumnie każdej tabeli jest przycisk Kolumny, którym ukrywa się i pokazuje kolumny; wybór pamięta ta przeglądarka, osobno dla każdej listy.',
          'Kolumny Utworzenie i Aktualizacja mają zębatkę, którą wybiera się, co pokazać: imię, nazwisko, datę, godzinę; godzina jest domyślnie wyłączona.',
          'W listach wyboru wybrana opcja jest pogrubiona i ma ptaszek na końcu.',
          'Filtr kategorii na liście produktów obejmuje też jej podkategorie, tak jak na stronie.',
          'W API › Produkty sortuje się przyciskami przy nagłówkach Kod i Nazwa (rosnąco, malejąco, z powrotem) zamiast „Kod (A-Z)” i „Nazwa (A-Z)”.',
          'Oznaczenia Bestseller, Koniec nakładu, Cennik i Promocja mają nowe ikony.',
          'Kliknięcie czerwonego krzyżyka przy zmienionej nazwie produktu przywraca nazwę z API; podpowiedź mówi, jaka to nazwa.',
          'W Kalkulacjach nad tabelą nie ma już nazwy firmy, a dopisek o kosztach manipulacyjnych („Koszty manipulacyjne dodawane są automatycznie”) stoi obok „Dodaj”.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Treść wszystkich podstron ma jedną maksymalną szerokość, tę samą co slidery z produktami.',
          'Nagłówek strony głównej jest granatowy (wcześniej czerwony), a „Napisz do nas” ma jaskrawopomarańczową ramkę.',
          'Siatka działów nie ma już falistej linii ani ramki, a rysunki działów mają pełny czerwony akcent.',
          'Na bardzo szerokich ekranach banery stoją w kolumnie treści, oddzielone i zaokrąglone; na węższych przylegają do siebie jak dotąd.',
          'Telefon w panelu bocznym i na karcie PDF ma numer kierunkowy +48.',
          'Galeria na stronie produktu jest mniejsza, a główna cena jest czarna zamiast czerwonej.',
          'Działy Nowości, Bestsellery i Promocje mają nazwy pisane normalnie, nie wielkimi literami.',
          'Nazwy kategorii pisane w całości wielkimi literami są pisane normalnie (np. „Notesy A4”), a telefony w stopce i w Kontakcie mają +48.',
        ],
      },
    ],
  },
  {
    version: '1.22.0',
    date: '2026-09-28',
    title: 'Skanowanie i panel',
    highlight: [
      '**Skan aktualizuje teraz prawie cały produkt**: oprócz cen i stanów także nazwę, opis, rozmiary, materiały, znakowania, kategorie i zdjęcia. Strona API ma zakładki Produkty, Kategorie, Znakowania i Miejsca – w trzech ostatnich przypisuje się kategorie, znakowania i miejsca dostawcy do naszych. Pola ustawiane przez skaner są w edytorze zablokowane i mają znaczek API. Doszedł nowy dostawca, **HappyBrands**.',
      '**Uwaga:** pierwsza reguła kategorii albo znakowań włącza dla dostawcy ich synchronizację. Kolejny skan dodaje i usuwa wszystko, do czego prowadzą reguły, także jeśli ktoś dodał to ręcznie; reszty nie rusza. Nowe zdjęcia od dostawcy czekają po skanie na akceptację.',
      'Panel ma nowy wygląd i menu z podpisami. **Nowości, Bestsellery i Promocje** nie są już kategoriami – zaznacza się je w produkcie, a działy na stronie tworzą się same. W edytorze produktu są przyciski **Duplikuj** i **PDF**, a nowe zapytania są pomarańczowe, dopóki ktoś ich nie otworzy.',
    ],
    all: [
      {
        label: 'Skanowanie',
        items: [
          'Nowy dostawca: HappyBrands (Lecce Pen, b1pen, thINKme, Enote, BAG&FLY), skanowany i importowany jak pozostali.',
          'Skan aktualizuje też nazwę, opis, rozmiary i materiały; nazwę tylko, dopóki nikt jej nie zmienił ręcznie.',
          'Poprawka: produkty Promotionway znów dostają materiały – od 1.11.1 przychodziły bez nich.',
          'U dostawcy z regułami znakowań skan dodaje, zmienia i usuwa znakowania, do których prowadzą reguły, zachowując ich marże.',
          'U dostawcy z mapowaniem kategorii skan dodaje i usuwa kategorie, do których prowadzi mapowanie.',
          'Skan usuwa z produktu zdjęcia, których dostawca już nie ma (gdy wszystkie warianty produktu są w skanie).',
          'Gdy skan chce naraz ukryć albo wyzerować dużo produktów (np. przy awarii API dostawcy), najpierw pyta „Zapisać wynik skanowania?”.',
          'Skan bez żadnych znakowań albo kategorii pomija tę część i niczego nie usuwa.',
          'Po skanie przeliczają się ceny produktów, którym zmieniły się znakowania.',
          'Kody wariantów są pełnymi kodami dostawcy (np. „MO9469-03” zamiast „03”), także w produktach, które już były.',
          'Kategorie przychodzą od wszystkich dostawców, a dane o znakowaniu od każdego, który je udostępnia.',
          'Pola znakowania z MidOcean są liczone na nowo, więc reguła progów może wybrać inne znakowanie niż wcześniej.',
          'Błędy skanu i importu pokazują się w oknach z opisem, np. „Skanowanie niemożliwe”, gdy dostawca chwilowo nie pozwala skanować.',
          'Ostrzeżenie przed opuszczeniem strony pojawia się tylko w trakcie zapisu skanu.',
          'Poprawka: przerwany albo niezapisany skan jest przy następnym porównywany z poprzednim, więc żadna zmiana nie umyka.',
          'Poprawka: długie skany BlueCollection nie przerywają się.',
        ],
      },
      {
        label: 'API',
        items: [
          'Strona API ma zakładki Produkty, Kategorie, Znakowania i Miejsca, ze wspólnym paskiem dostawców; wybrany dostawca zostaje przy zmianie zakładki.',
          'Zakładka z czymś do sprawdzenia (np. wycofane produkty, znakowania, które się nie zaimportują) ma pomarańczową obwódkę i opis po najechaniu.',
          'Przycisk „Skanuj API” nazywa się „Skanuj”; w innych zakładkach przenosi do Produktów i tam zaczyna skan.',
          'Rabat zapisuje się chwilę po wpisaniu; błędna wartość ma czerwoną ramkę i nie zapisuje się jako 0.',
          'Lista produktów jest tabelą z ikonami w nagłówku; statusy mają kolory, a pusty to „Brak statusu”.',
          'Oko przy zaimportowanym produkcie i wariancie ukrywa go albo pokazuje prosto z listy.',
          'Chmurka dostępności (Dostępny, Wycofane kolory, Wycofany) zawsze otwiera wyszukiwarkę dostawcy, a kostka otwiera zaimportowany produkt.',
          'Przycisk „Posprzątaj” usuwa wszystkie wycofane produkty i warianty dostawcy razem z ich nieużywanymi zdjęciami.',
          'Usunięcie produktu albo wariantu z listy usuwa też jego zdjęcia, których nic innego nie używa.',
          'Poprawka: zmiana statusu albo rabatu nie wraca na pierwszą stronę i nie gubi zaznaczenia.',
        ],
      },
      {
        label: 'Mapowania',
        items: [
          'W zakładce Kategorie kategorie dostawcy przypisuje się do naszych albo ignoruje; przypisanie obejmuje całą gałąź pod nią.',
          'Reguły znakowań, dotąd na dole strony API i tylko dla MidOcean i BlueCollection, mają własną zakładkę i działają u każdego dostawcy z danymi o znakowaniu.',
          'W zakładce Miejsca miejsca znakowania dostawcy tłumaczy się na nasze (np. „FRONT” → „przód”), z polem „Przetestuj”.',
          'Uwaga: skaner usuwa wszystko, do czego prowadzi reguła, także jeśli ktoś dodał to ręcznie; znakowań i kategorii spoza reguł nie rusza.',
          'Usunięcie reguły nie zdejmuje znakowania ani kategorii z produktów; okno „Uwaga” przypomina, że trzeba to zrobić ręcznie.',
        ],
      },
      {
        label: 'Import i nowe zdjęcia',
        items: [
          'Nowe zdjęcia od dostawcy czekają po skanie na akceptację w oknie „Nowe zdjęcia w API”; kliknięte są odrzucane i już nie wracają.',
          '„Później” zostawia decyzję do następnego skanu.',
          'Zdjęcie dostawcy usunięte ręcznie z produktu nie jest już proponowane.',
          'Przed importem produktów otwiera się przegląd zdjęć, które zostaną pobrane.',
          'Zaimportowane warianty są od razu widoczne; sam produkt nadal jest ukryty.',
          'Nowy produkt dostaje kategorie z mapowania i paragraf „NETTO”, a znakowania – od każdego dostawcy z danymi o znakowaniu (wcześniej tylko MidOcean i BlueCollection).',
          'Powtórzone znakowania z tym samym polem łączą się w jedno z kilkoma miejscami (np. „przód / tył”).',
          'Zdjęcia produktu od dostawcy trafiają też do galerii.',
          'Import pomija produkt, którego kod ma już inny produkt, zanim cokolwiek zapisze.',
          'Zdjęcie wspólne dla kilku wariantów pobiera się raz; pliki mają nazwy „kod / wariant / #n” i producenta, także te zaimportowane wcześniej.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'Pola ustawiane przez skaner (cena, koszty manipulacyjne, opis, rozmiary, materiały, ilość wariantu) są zablokowane i mają znaczek API.',
          'Nazwa ma znaczek API, dopóki nikt jej nie zmienił; po zmianie czerwony krzyżyk mówi, że skaner jej już nie ruszy.',
          'Znakowania i kategorie, do których prowadzą reguły, są zablokowane i nie da się ich usunąć.',
          'Nowości, Bestsellery i Promocje nie są już kategoriami: produkty z nich dostały oznaczenia Nowość, Bestseller i Promocja.',
          'Przycisk „Duplikuj” tworzy ukrytą kopię produktu jako produkt REED, z „(2)” w kodzie i nazwie, i ją otwiera.',
          'Przycisk „PDF” pobiera kartę produktu w zapisanej wersji, taką jak na stronie.',
          'Producent jest wymagany; nowy produkt dostaje producenta z listy albo REED, a produkty bez producenta dostały REED.',
          'Kategorie są listą z wyszukiwarką „Dodaj kategorię…”; produkt ma tylko najdokładniejsze, więc podkategoria zastępuje nadrzędną.',
          'Ceny promocyjnej wyższej od zwykłej nie da się zapisać.',
          '„Informacje handlowe” w produkcie to teraz „Paragraf”, a „Pokaż cenę” w cenniku – „Widoczny”; wyłączony chowa ceny i znakowania.',
          'Cena promocyjna i Wykluczenia stoją obok ceny, a koszty manipulacyjne pod cenami.',
          'Sekcja „Kolory” nazywa się „Warianty”, a „Włączone” wariantu – „Widoczny”; pole „Wielokolorowe” zniknęło, bo wielokolorowy jest teraz kolor.',
          'Listy Kolor 1 i Kolor 2 pokazują kropkę i nazwę koloru.',
          'Napis DUPLIKAT oznacza znakowanie tylko przy tym samym polu.',
          'Nowe znakowanie w produkcie to pierwsze znakowanie producenta w Kalkulacjach.',
          'Usunięcie produktu usuwa też jego zdjęcia, których nic innego nie używa.',
          'Pole SEO zniknęło z produktów, kategorii i stron.',
          'Poprawka: zmiana Widoku nie kasuje cen wpisanych ręcznie.',
          'Poprawka: usunięcie znakowania w Kalkulacjach podmienia albo usuwa wszystkie jego wystąpienia w produkcie, nie tylko pierwsze.',
        ],
      },
      {
        label: 'Listy',
        items: [
          'Listę produktów można filtrować po oznaczeniach (Widoczny, Nowość, Bestseller, Już wkrótce, Koniec nakładu, Cennik, Promocja): z nim albo bez niego.',
          'Produkty, Kolory i Biblioteka mają filtr Producent.',
          'Wyszukiwarka produktów szuka też w opisie i w kodach wariantów.',
          '„Wszystkie” i „Bez kategorii” stoją obok siebie; „Bez kategorii” ma pomarańczową obwódkę, gdy są takie produkty.',
          '„Dodaj” tworzy produkt w wybranej kategorii i u wybranego producenta; podpowiedź mówi, gdzie.',
          'Listy sortuje się przyciskiem przy nazwie kolumny (rosnąco, malejąco, z powrotem); kolumna ID zniknęła ze wszystkich list, a z produktów także API.',
          'Cały wiersz otwiera pozycję, a ucięty tekst widać w całości po najechaniu.',
          'Każda lista wyboru ma wyszukiwarkę; „Brak” i „Wszyscy” są przyciskami nad opcjami, a „---” nazywa się „Brak”.',
          'Można pokazać 15 pozycji na stronę.',
          'Przycisk dodawania podkategorii podaje numer, który dostanie nowa kategoria.',
        ],
      },
      {
        label: 'Wygląd panelu',
        items: [
          'Panel ma nowy wygląd: granat i szarość, zaokrąglone rogi i czcionka strony.',
          'Menu ma podpisy przy ikonach, a na dole Wyloguj, awatar oraz imię i nazwisko.',
          'Menu ma nową kolejność, a Dashboard zniknął: panel otwiera się na Produktach.',
          'Przycisk w menu świeci także na podstronach, np. w edytorze produktu i w zakładkach.',
          'Zapytania i Kolory mają w menu pomarańczową obwódkę, gdy są nieprzeczytane zapytania albo kolory bez wartości.',
          'Na telefonie menu wysuwa się przyciskiem w lewym dolnym rogu, a edytory zajmują cały ekran.',
          'Pytania i ostrzeżenia są oknami panelu zamiast okien przeglądarki; Enter odpowiada, a Esc mówi nie.',
          'Ostrzeżenie, że ktoś inny właśnie zapisał zmiany, działa też w kategoriach i plikach.',
          '„Usuń” w edytorach jest na pasku u góry, po prawej, i pojawia się dopiero po zapisie.',
          'Nagłówek zostaje na miejscu przy przewijaniu i jest półprzezroczysty.',
          'Poprawka: podwójne kliknięcie Zapisz nie tworzy nowej pozycji dwa razy.',
          'Poprawka: pytanie o niezapisane zmiany pada raz, także przy Wstecz i Dalej.',
        ],
      },
      {
        label: 'Biblioteka',
        items: [
          'Przycisk „Posprzątaj” pokazuje pliki, których nic nie używa, i usuwa zaznaczone.',
          'Edytor pliku pokazuje „Używany w” i „Kiedyś używany w”; używanego pliku nie da się usunąć.',
          'Edytor pliku ma pole Producent, a w tytule tytuł pliku.',
          'Pliki można upuścić w dowolnym miejscu Biblioteki.',
          'Wybór pliku w produkcie pokazuje najpierw pliki „W tym produkcie” i „Kiedyś w tym produkcie”.',
          'Usuwanie kilku plików pomija te, które są gdzieś używane, i mówi ile.',
          'Kafelki pokazują rodzaj, rozmiar i wymiary pliku, a wyszukiwarka szuka też po producencie.',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          'Kalkulacje mają dwie zakładki: Znakowania oraz Marże i widoki; „Jak wyliczane są ceny?” jest w nagłówku.',
          'Gwiazdka „Domyślne dla producenta” zniknęła: domyślne jest pierwsze znakowanie na liście.',
          'Usuwanie jest w pierwszej kolumnie, a ilość dodaje się przyciskiem „Dodaj” w nagłówku.',
          'Widoki cen są kartami z gwiazdką domyślnego; jedynego zapisanego widoku nie da się usunąć.',
          'Poprawka: tabela znakowań nie otwiera się z niezapisanymi zmianami.',
          'Poprawka: przeliczenie po zmianie marży albo widoku obejmuje wszystkie ceny.',
        ],
      },
      {
        label: 'Kolory, kategorie, zapytania',
        items: [
          'Kolor może być wielokolorowy albo przezroczysty, a podgląd pokazuje, jak wygląda na stronie.',
          'Pole „Widoczny” zniknęło z kolorów – wszystkie są publiczne – a „Firma” nazywa się „Producent”.',
          'Kolor bez wartości jest na liście pomarańczowy.',
          'Kategorii z podkategoriami nie da się usunąć; okno mówi, co zrobić najpierw.',
          'Nowe zapytania są pomarańczowe, a menu pokazuje ich liczbę; otwarcie oznacza zapytanie jako przeczytane.',
          'Przycisk „Oznacz jako nieprzeczytane” w zapytaniu przywraca je do nieprzeczytanych.',
          'Wcześniejsze zapytania są oznaczone jako przeczytane.',
          '„Informacje handlowe” nazywają się teraz „Paragrafy”; działają tak samo jak wcześniej.',
          'Edytor strony ma pole „Widoczna”.',
          'Edytor menu (strona Menu) zniknął.',
          'Poprawka: ukryte kafelki strony głównej zostają ukryte, a nieudany zapis układu zostawia edytor otwarty z komunikatem.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Na stronie produktu jest przycisk „Karta produktu / PDF”, który pobiera kartę z cenami, opisem i wariantami.',
          'Zdjęcia produktu otwierają się na cały ekran, ze strzałkami, licznikiem i paskiem miniatur; zdjęcie wariantu ma jego kolor i kod.',
          'Nowości, Bestsellery i Promocje tworzą się z oznaczeń produktów, mają podkategorie i stoją pierwsze w menu; stare linki do nich działają.',
          'Wyszukiwarka znajduje produkty także po kodzie wariantu.',
          'Karta wariantu pokazuje pełny kod dostawcy, a wariant wielokolorowy – nazwę swojego koloru.',
          'Kolor wielokolorowy ma kropkę z czterech kolorów, a przezroczysty – swój odcień na kratce.',
          'Paragraf stoi na początku Cennika, oddzielony linią (bez cen – pod opisem, też za linią).',
          'Tytuł produktu w Google to zawsze „nazwa — kod”, a opis pochodzi z opisu produktu.',
          'Paski przewijania są cieńsze, systemowe.',
          'Poprawka: wyłączone znakowanie nie liczy się do ceny „od” i nie tworzy pustego cennika.',
        ],
      },
    ],
  },
  {
    version: '1.21.0',
    date: '2026-09-24',
    title: 'Nowa strona na reed.kalisz.pl',
    highlight: [
      'Nowy wygląd strony, dotąd tylko na wersji testowej, **trafia na reed.kalisz.pl**. Ostatnie szlify przed startem: Nowości, Bestsellery i Promocje mają w menu własne rysunki, a formularz zapytania ma nowy wygląd i większe pole zgody.',
      'Panel boczny strony pokazuje już tylko telefon i e-mail, bez adresu i godzin. **Numer telefonu na stronie to teraz 62 753 15 91** (wcześniej 15 90).',
    ],
    all: [
      'Nowy wygląd strony, dotąd tylko na wersji testowej, trafia na reed.kalisz.pl.',
      'Nowości, Bestsellery i Promocje mają w menu strony własne małe rysunki.',
      'Strona działu ma jego rysunek obok tytułu.',
      'Panel boczny pokazuje tylko telefon i e-mail; adres i godziny otwarcia zniknęły z niego.',
      'Numer telefonu w nagłówku strony i w danych dla Google to teraz 62 753 15 91.',
      'Na telefonie menu otwiera się i zamyka płynnie, telefon i e-mail są w jednej linii, a przycisk Kontakt ma pomarańczową ramkę.',
      'Siatka działów na stronie głównej ma tytuł „Działy katalogu” i link „Wszystkie produkty”, a między nimi czerwoną falę, która płynie po najechaniu.',
      '„Napisz do nas” na górze strony głównej ma jasnopomarańczową ramkę i wypełnia się po najechaniu.',
      'Formularz zapytania na stronie produktu ma delikatne pomarańczowe kropki w tle, a na telefonie zajmuje całą szerokość, z pomarańczową linią pod tytułem.',
      'Pole zgody w formularzu jest większe, zaokrąglone i po zaznaczeniu pomarańczowe.',
      'Link „Pełny cennik według nakładu ↓” przewija stronę płynnie.',
      'Slidery doczytują kolejną stronę produktów dopiero, gdy są blisko ekranu, więc strona pobiera mniej na starcie.',
      'Poprawka: produkt bez kategorii nie psuje nawigacji i nie pokazuje „Podobnych produktów”, a jego tytuł stoi tam, gdzie na innych produktach.',
    ],
  },
  {
    version: '1.20.1',
    date: '2026-09-24',
    title: 'Strona główna',
    highlight: [
      'Strona główna pomija bloki, których jeszcze nie zna, zamiast przestać działać – np. nowe bloki z wersji testowej, która korzysta z tej samej bazy.',
    ],
    all: [],
  },
  {
    version: '1.20.0',
    date: '2026-09-24',
    title: 'Edytor strony głównej',
    highlight: [
      'W edytorze strony głównej **siatka działów** i sekcja **o siedzibie w Kaliszu** są teraz blokami („Katalog” i „Siedziba”), więc własne bloki można stawiać przed nimi i po nich – wcześniej zawsze stały nad wszystkimi. Tych dwóch nie da się przesunąć, ukryć ani usunąć.',
    ],
    all: [
      'Siatka działów („Katalog”) i sekcja „Siedziba w Kaliszu, wysyłkowo cała Polska” („Siedziba”) są blokami w edytorze strony głównej.',
      'Własne bloki można dodawać przed nimi i po nich; wcześniej oba zawsze stały nad wszystkimi blokami.',
      'Tych dwóch bloków nie da się przesunąć, ukryć ani usunąć – mają tylko etykietę.',
      'Przyciski bloku stoją w jednej linii z jego nazwą.',
      'Kafelki i stałe sekcje przylegają do siebie bez odstępu.',
      'Wyróżnione słowa w haśle na górze strony głównej („Porządnie, z Twoim logo.”) są jasnopomarańczowe.',
    ],
  },
  {
    version: '1.19.3',
    date: '2026-09-24',
    title: 'Czcionki',
    highlight: [
      'Przeglądarka i Cloudflare zapamiętują teraz czcionkę strony na stałe, więc przy kolejnych wizytach nie pobiera się jej od nowa.',
    ],
    all: [],
  },
  {
    version: '1.19.2',
    date: '2026-09-24',
    title: 'Pamięć podręczna',
    highlight: [
      '**Uwaga:** menu kategorii, stopka, liczby w działach i paski produktów na stronie głównej są teraz zapamiętywane na serwerze do 30 sekund, także przy przechodzeniu po stronie. Razem z kopią u Cloudflare zmiana zapisana w panelu może się pokazać klientom **do minuty później** – to nie błąd zapisu, wystarczy chwilę poczekać. Bloki ułożone w edytorze strony głównej widać od razu po zapisie.',
    ],
    all: [
      'Menu kategorii, stopka, liczby w działach i paski produktów na stronie głównej mogą być do 30 sekund starsze, także przy przechodzeniu po stronie.',
      'Strona otwarta z linku albo odświeżona pokazuje zmianę z panelu najwyżej minutę później.',
      'Strona główna i przejścia między podstronami są szybsze.',
    ],
  },
  {
    version: '1.19.1',
    date: '2026-09-24',
    title: 'Działy',
    highlight: [
      'Liczby produktów w działach na stronie głównej liczą się na bieżąco, a nie raz na 10 minut. **Uwaga:** klient, który otwiera stronę z linku albo ją odświeża, może dostać jej kopię sprzed **do minuty**, więc zmiana z panelu pojawi się u niego z opóźnieniem; przechodzenie po stronie zawsze pokazuje najnowszy stan.',
    ],
    all: [
      'Liczby produktów w działach na stronie głównej są zawsze aktualne, bez 10-minutowego opóźnienia.',
      'Strona otwarta z linku albo odświeżona może być do minuty starsza niż ostatnia zmiana w panelu; przejścia po stronie pokazują najnowszą.',
      'Strona „Taka strona nie istnieje” nie jest zapamiętywana, więc produkt opublikowany chwilę później od razu się otwiera.',
      '„Pełna mapa katalogu” ma na telefonach dwie kolumny.',
    ],
  },
  {
    version: '1.19.0',
    date: '2026-09-24',
    title: 'Ukryte produkty',
    highlight: [
      'Strona główna, kategorie i karty produktów przygotowuje teraz serwer, więc **pierwsze wejście na stronę jest szybsze**, a „Podobne produkty” na karcie produktu są gotowe od razu.',
      'Ukryty produkt nadal otworzy się zalogowanemu adminowi z linku – np. żeby sprawdzić go przed publikacją – ale teraz widać to od razu po czerwonym znaczku **„Ukryty produkt”** u góry strony. Dla klientów takiego produktu nie ma. Zalogowany admin widzi też przy kodzie produktu nazwę dostawcy.',
    ],
    all: [
      'Strona główna, kategorie, karty produktów i strony polityk przygotowuje serwer, więc pierwsze wejście jest szybsze.',
      '„Podobne produkty” na karcie produktu są gotowe od razu po wejściu.',
      'Ukryty produkt otwarty z linku ma u góry czerwony znaczek „Ukryty produkt” zamiast notki „Produkt ukryty — widoczny tylko dla zalogowanych.”.',
      'Ukryty produkt jest wyłączony z wyszukiwarek.',
      'Zalogowany admin widzi przy kodzie produktu nazwę dostawcy w nawiasie, tak jak przy znakowaniach.',
      'Zdjęcie w nagłówku strony głównej jest mniejsze na zwykłych ekranach, więc szybciej się wczytuje.',
      'Na stronie Kontakt przycisk „Kontakt” w panelu jest biały i bez strzałki.',
      'Na najmniejszych telefonach ceny na kafelkach są mniejsze, a kafelek w promocji nie pokazuje starej ceny.',
      'Drobne zmiany: „/szt” na kafelku wygląda jak „od”, tytuły i okruszki stoją równo z logo, granatowy pasek Kontaktu jest wysoki jak blok w panelu, nad sekcją o Kaliszu nie ma podwójnej linii, tła linijek na banerach są zaokrąglone, a linia pod „Podobne produkty” jest jak w innych sekcjach.',
    ],
  },
  {
    version: '1.18.0',
    date: '2026-09-24',
    title: 'Szybciej',
    highlight: [
      'Strona główna pokazuje się szybciej: pierwsze produkty w każdym pasku kategorii przychodzą od razu razem ze stroną, a następna strona paska wczytuje się z wyprzedzeniem, więc strzałki przewijają bez czekania.',
      'Kafelek produktu jest **klikalny w całości** i po najechaniu pokazuje drugie zdjęcie. Cena na nim jest większa, a pod nią stoi **„ze znakowaniem”**, gdy najniższa cena zawiera znakowanie; ten sam dopisek jest przy cenie na karcie produktu. Słowo „netto” zniknęło z kafelków, karty produktu i tabel cen.',
    ],
    all: [
      {
        label: 'Strona główna',
        items: [
          'Pierwsze produkty w paskach kategorii są gotowe od razu, bez doczytywania po wejściu.',
          'Następna strona paska wczytuje się z wyprzedzeniem, razem ze zdjęciami.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'Cały kafelek produktu jest klikalny, także kółka kolorów.',
          'Po najechaniu kafelek pokazuje drugie zdjęcie produktu, a zmiana zdjęcia przechodzi płynnie.',
          'Cena na kafelku jest większa, z „/szt” po niej i „ze znakowaniem” w osobnej linijce pod spodem.',
          'Na wąskich kafelkach długie ceny i promocje są trochę mniejsze, żeby zmieściły się w jednej linijce.',
          'Na karcie produktu przy cenie „od” stoi „ze znakowaniem”, gdy najniższa cena je zawiera.',
          'Słowo „netto” zniknęło z kafelków, karty produktu i tabel cen.',
          'Dwa kolory wariantu są zawsze w dwóch linijkach, np. „Pomarańczowy” i „/ Biały”.',
          '„Ceny zawierają znakowanie” stoi nad cennikiem osobno, a pole i miejsce znakowania mieszczą się w jednej linijce.',
        ],
      },
      {
        label: 'Formularz',
        items: [
          'Formularz na karcie produktu ma tytuł „Zapytanie o” z nazwą i kodem produktu.',
          'Pola formularza są zaokrąglone, a ramka zaznaczenia, pole zgody, gwiazdki i linki są pomarańczowe.',
          'W Kontakcie nad formularzem jest dopisek „Pisz śmiało także jeśli masz mniej konkretne pytanie, postaramy się pomóc :)”.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Czcionka ładuje się z naszego serwera, a strona nie czeka na nią przy pierwszym wyświetleniu.',
          'Strona ignoruje tryb ciemny przeglądarki i dodatków takich jak Dark Reader.',
          'Strzałki stronicowania wyglądają jak lista sortowania, a nieaktywna jest przygaszona.',
          'Górne stronicowanie w kategorii jest widoczne także wtedy, gdy produkty mieszczą się na jednej stronie.',
          'Przycisk wyszukiwarki jest przezroczysty, dopóki nic nie wpisano.',
        ],
      },
    ],
  },
  {
    version: '1.17.0',
    date: '2026-09-23',
    title: 'Działy',
    highlight: [
      'Kafelki działów na stronie głównej mają **własne rysunki** – kubek przy gadżetach, kalendarz, pieczątkę, tabliczkę i inne – a zamiast ceny „od” tylko liczbę pozycji. Rysunek dobiera się po słowie w nazwie działu, więc zostaje po zmianie nazwy, dopóki jest w niej np. „kalendarz”; emoji z początku nazwy na kafelku się nie pokazuje.',
      'Tekst na banerach ze zdjęciem ma zamiast obrysu **rozmyte tło pod każdą linijką**, więc czyta się go na każdym zdjęciu, a na spokojnym prawie go nie widać.',
    ],
    all: [
      'Każdy dział na stronie głównej ma rysunek dobrany do nazwy (gadżety, drukarnia, kalendarze, pieczątki, reklama zewnętrzna, tabliczki, nowości, bestsellery, promocje; pozostałe dostają pudełko).',
      'Kafelki działów nie pokazują już ceny „od”, tylko liczbę pozycji z poprawną odmianą („1 pozycja”, „3 pozycje”, „5 pozycji”).',
      'Emoji na początku nazwy działu nie pokazuje się na kafelku.',
      'Tekst na banerach ze zdjęciem ma rozmyte tło pod każdą linijką zamiast obrysu; puste linijki są pomijane.',
      'Przycisk na banerze jest rozmyty, bez wypełnienia.',
    ],
  },
  {
    version: '1.16.6',
    date: '2026-09-23',
    title: 'Strona główna',
    highlight: [
      'Przejście na stronę główną z innej podstrony jest szybsze: liczby produktów w działach liczy teraz serwer, zamiast pobierać do przeglądarki cały katalog.',
    ],
    all: [],
  },
  {
    version: '1.16.5',
    date: '2026-09-23',
    title: 'Formularz',
    highlight: [
      'Formularz na karcie produktu nazywa się teraz „Zapytanie”, a formularze mają nowy przykład w polu wiadomości i krótsze podziękowanie po wysłaniu.',
    ],
    all: [
      'Formularz na karcie produktu ma tytuł „Zapytanie” zamiast „Zapytaj o wycenę”.',
      'Nad formularzem zostało samo „Pytasz o …” z nazwą i kodem, bez dopisku o dołączeniu kodu do wiadomości.',
      'Przykład w polu wiadomości to „Np. Potrzebuję 250 sztuk z nadrukiem logo w dwóch kolorach. Jaki byłby czas realizacji i cena?”.',
      'Po wysłaniu formularz pokazuje krótkie „Dziękujemy, przyjęliśmy wiadomość!”.',
    ],
  },
  {
    version: '1.16.4',
    date: '2026-09-23',
    title: 'Kategorie',
    highlight: [
      'Na komputerze nagłówek strony kategorii jest równo z panelem po lewej: linia nad listą produktów leży na wysokości dolnego brzegu granatowego bloku z kontaktem.',
    ],
    all: [],
  },
  {
    version: '1.16.3',
    date: '2026-09-23',
    title: 'Beta',
    highlight: ['Wersja testowa beta.reed.kalisz.pl chwilowo nie wymaga hasła, więc łatwiej ją sprawdzać.'],
    all: [],
  },
  {
    version: '1.16.2',
    date: '2026-09-23',
    title: 'Sesja',
    highlight: [
      'Poprawka: gdy logowanie wygaśnie, strona nie kończy się już błędem aż do odświeżenia, tylko działa dalej jak dla niezalogowanego.',
    ],
    all: [],
  },
  {
    version: '1.16.1',
    date: '2026-09-23',
    title: 'Edytor strony głównej',
    highlight: [
      'Poprawka: edytor strony głównej nie zgłasza niezapisanych zmian, gdy nic nie zmieniono. Zgłaszał je, bo sam usuwał z układu stare bloki „Przerwa”, których już nie ma.',
    ],
    all: [],
  },
  {
    version: '1.16.0',
    date: '2026-09-23',
    title: 'Nowa strona',
    highlight: [
      'Strona dla klientów ma **zupełnie nowy wygląd** – czcionkę, kolory i układ – i wygodnie działa na telefonach. Na komputerze po lewej stoi stały panel z logo, przyciskiem Kontakt, telefonem, adresem, godzinami biura, wyszukiwarką i menu kategorii; na telefonie zastępuje go górny pasek z przyciskiem „Menu”. Od nowa są strona główna, kategorie, karta produktu (z formularzem obok ceny) i Kontakt, który ma teraz własny formularz zapytania.',
      '**Menu strony to teraz drzewo kategorii**: pokazuje wszystkie widoczne kategorie w ich kolejności, a górnego menu i menu w stopce już nie ma, więc zmiany w zakładce Menu w panelu nie wpływają na stronę. W edytorze strony głównej własne bloki stoją pod stałymi sekcjami, a bloku „Przerwa” już nie ma.',
      'Nowa strona działa na razie na wersji testowej **beta.reed.kalisz.pl**; reed.kalisz.pl wygląda po staremu, dopóki jej nie sprawdzimy.',
    ],
    all: [
      {
        label: 'Wygląd i nawigacja',
        items: [
          'Cała strona ma nową czcionkę, kolory i układ, i działa na telefonach i tabletach.',
          'Na komputerze stały panel po lewej ma logo, przycisk „Kontakt”, telefon, e-mail, adres z linkiem do mapy, godziny biura, wyszukiwarkę („Kod lub nazwa”) i menu kategorii.',
          'Na telefonie górny pasek ma logo i przycisk „Menu”, który otwiera ten panel na cały ekran; kategorie rozwija się w nim plusem.',
          'Menu kategorii to drzewo wszystkich widocznych kategorii; górne menu i menu w stopce zniknęły, a zakładka Menu w panelu nie zmienia już strony.',
          'Stopka ma logo, teksty o firmie i biurze, link do Facebooka i mapę; w Kontakcie zostaje z niej tylko dolna linijka.',
          'Zalogowany admin nie ma już na stronie przycisku wylogowania; wylogowuje się w panelu.',
        ],
      },
      {
        label: 'Strona główna',
        items: [
          'Nowy nagłówek z hasłem „Porządnie, z Twoim logo.” i przyciskami do katalogu i Kontaktu.',
          'Siatka działów katalogu, każdy z ceną „od” i liczbą pozycji; liczby odświeżają się co 10 minut.',
          'Sekcja „Siedziba w Kaliszu, wysyłkowo cała Polska” z godzinami biura i okolicznymi miastami.',
          'Na dole opis oferty z linkami do kategorii i „Pełna mapa katalogu” ze wszystkimi kategoriami.',
          'Paski kategorii pokazują tyle produktów, ile mieści jeden rząd, i podświetlają się na czerwono w trakcie wczytywania.',
          'Banery układają się na telefonie w dwie kolumny, a na najwęższych w jedną; szerokie zajmują cały wiersz, a ukryte znikają.',
          'Tekst na banerze dopasowuje się do jego wielkości, a na zdjęciu ma obrys w przeciwnym kolorze.',
        ],
      },
      {
        label: 'Edytor strony głównej',
        items: [
          'Własne bloki stoją pod nagłówkiem, siatką działów i sekcją o Kaliszu, a nad opisem oferty.',
          'Bloku „Przerwa” już nie ma, a dodane wcześniej przerwy nie pokazują się na stronie.',
          'Strzałki i kosz bloku są w pasku nad nim, wewnątrz ramki, a nie po bokach.',
          'W bloku Tytuł przycisk stoi obok nagłówka, a podtytuł pod nim.',
        ],
      },
      {
        label: 'Kategorie',
        items: [
          'Strona kategorii ma ścieżkę z okruszków, tytuł, opis zwijany przyciskiem „Czytaj dalej” i liczbę produktów.',
          'Produkty można sortować: „Cena rosnąco”, „Cena malejąco”, „Nazwa A–Z” i „Najnowsze”.',
          'Stronicowanie to dwie strzałki i pole z numerem strony, który można wpisać.',
          'Wyniki wyszukiwania mają tytuł „Wyniki: …”, a lista bez wyszukiwania „Cały katalog”.',
          'Gdy nic nie znaleziono, strona proponuje napisanie do nas, bo produkty sprowadzamy też na zamówienie.',
          'Kafelki pokazują najwyżej 6 kolorów z „+N” za resztą, a cenę jako „od … zł netto/szt”.',
          'Oznaczenia na kafelkach nazywają się „Brak” (było „Koniec nakładu”) i „Wkrótce” (było „Już wkrótce”).',
          'Poprawka: liczba stron w paskach kategorii nie liczy podwójnie produktów z kilku kategorii.',
        ],
      },
      {
        label: 'Karta produktu',
        items: [
          'Zdjęcia, opis i cennik są po lewej, a po prawej przewija się z ekranem panel z nazwą, kodem, oznaczeniami, ceną „od … zł netto / szt”, kolorami, rozmiarem, materiałem i formularzem.',
          '„Pełny cennik według nakładu” przenosi do cennika, a pływający przycisk „Zapytaj” do formularza.',
          'Pod spodem sekcja „Kolory i dostępność” pokazuje warianty z miniaturkami zdjęć.',
          'Tabela cen jest pozioma, gdy się mieści, a pionowa na wąskich ekranach; przy znakowaniach stoi „Ceny zawierają znakowanie”.',
          'Rozmiar i materiał widać także u produktów bez opisu.',
          'Przycisk „Wróć” zniknął; ścieżka z okruszków kończy się kodem produktu.',
          'Zalogowany admin nie widzi już na stronie ukrytych wariantów, zdjęć ani znakowań, a ukryty produkt zamiast znaczka „Wyłączony” ma notkę „Produkt ukryty — widoczny tylko dla zalogowanych.”.',
          'Nazwa firmy przy znakowaniu, widoczna dla zalogowanych, stoi w nawiasie po typie zamiast na czerwono.',
        ],
      },
      {
        label: 'Formularz i Kontakt',
        items: [
          'Kontakt ma nowy układ z formularzem zapytania, danymi firmy i mapą.',
          'Formularz sprawdza adres e-mail, wymaga zgody i nie wysyła drugi raz tej samej wiadomości.',
          'Zapytania z karty produktu są w panelu oznaczone „Zapytanie z formularza (Produkt)”, a z Kontaktu „(Kontakt)”.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Nowe strony „Taka strona nie istnieje” i „Coś poszło nie tak” z przyciskami do strony głównej i Kontaktu.',
          'Polityka prywatności i obowiązek informacyjny mają nowy wygląd.',
          'Strona jest lepiej opisana dla Google: tytuły, opisy, dane firmy i mapa strony ze wszystkimi produktami; panel jest wyłączony z wyszukiwarek.',
        ],
      },
    ],
  },
  {
    version: '1.15.1',
    date: '2026-09-23',
    title: 'Beta',
    highlight: [
      'Wersja testowa beta.reed.kalisz.pl pokazuje teraz osobną wersję strony, więc nowości można obejrzeć przed publikacją. **Uwaga:** korzysta z tej samej bazy co reed.kalisz.pl, więc zmiana zapisana na wersji testowej jest od razu na prawdziwej stronie.',
    ],
    all: [
      'beta.reed.kalisz.pl pokazuje testową wersję strony, budowaną osobno od reed.kalisz.pl.',
      'Gdy wersji testowej nie ma, beta.reed.kalisz.pl pokazuje „Brak wersji beta”.',
      'Wersja testowa i reed.kalisz.pl korzystają z tej samej bazy: zmiany zapisane na jednej są od razu na drugiej.',
    ],
  },
  {
    version: '1.15.0',
    date: '2026-09-22',
    title: 'Ukryte',
    highlight: [
      'Ukryte produkty, warianty i kategorie znikają ze strony także dla zalogowanych: produkt nie pokazuje się na listach, ukryty wariant nie dodaje kolorów ani zdjęć do kafelka, a ukryta kategoria kończy się stroną 404. Zalogowany admin widzi za to na karcie produktu, **czyje jest każde znakowanie** – nazwę firmy na czerwono przy kodzie.',
    ],
    all: [
      'Ukryte produkty nie pokazują się w kategoriach, wynikach wyszukiwania ani paskach produktów, także zalogowanym.',
      'Zniknęła nakładka, którą zalogowany admin widział na kafelku ukrytego produktu.',
      'Kafelek produktu nie pokazuje kolorów ani zdjęć ukrytych wariantów, także zalogowanym.',
      'Ukryta kategoria kończy się stroną 404 również dla zalogowanego admina.',
      'Na karcie produktu zalogowany admin widzi przy kodzie znakowania nazwę jego firmy, pogrubioną na czerwono.',
    ],
  },
  {
    version: '1.14.1',
    date: '2026-09-22',
    title: 'Porządki',
    highlight: [
      'Nic widocznego się nie zmienia: usunięty jednorazowy skrypt, który poprawił już kody produktów AXPOL i USBSystem w bazie.',
    ],
    all: [],
  },
  {
    version: '1.14.0',
    date: '2026-09-22',
    title: 'BlueCollection',
    highlight: [
      '**Produkty BlueCollection importują się ze znakowaniami** – miejscami i wymiarami pól nadruku – tak jak dotąd MidOcean. Kod znakowania bez reguły nie przepada już przy imporcie: bierze się nasze znakowanie tego dostawcy o tym samym kodzie, a dopiero gdy takiego nie ma, kod jest pomijany.',
      'Panel **„Reguły importowania znakowań”** w zakładce API jest przebudowany. Nad tabelą widać wszystkie kody znakowań z ostatniego skanu i regułę dodaje się, klikając kod; kody z regułą są wyszarzone, a te w czerwonej ramce przepadłyby przy imporcie. Reguła, która nie zadziała albo jest zbędna, ma nad sobą ostrzeżenie, a nowy typ **„Nie importuj”** pomija kod na stałe.',
    ],
    all: [
      {
        label: 'Reguły znakowań',
        items: [
          'Nad tabelą reguł są wszystkie kody znakowań z ostatniego skanu; kliknięcie kodu dodaje dla niego regułę.',
          'Kody z regułą są wyszarzone, a kody bez reguły i bez naszego znakowania o tym kodzie mają czerwoną ramkę.',
          'Kodu u producenta nie wpisuje się już ręcznie i nie ma przycisku „Dodaj”; reguły układają się alfabetycznie według kodu, bez pola kolejności.',
          'Tabela ma wspólny nagłówek: Kod, Typ, Warunek i Znakowanie u nas.',
          'Nowy typ reguły „Nie importuj” pomija znakowanie o tym kodzie przy każdym imporcie.',
          'Typy „Zależy od ceny produktu” i „Zależy od powierzchni” nazywają się teraz „Według ceny” i „Według powierzchni”.',
          'Firmę i znakowanie wybiera się z jednej listy (REED albo dostawca), a nowa reguła ma od razu wybrane domyślne znakowanie dostawcy.',
          'Reguła z błędem ma nad sobą czerwone „Reguła nie zadziała: …”, np. gdy kodu nie ma w API albo nie mamy takiego znakowania; kod spoza API jest przekreślony.',
          'Reguła wskazująca nasze znakowanie o tym samym kodzie jest oznaczona jako zbędna.',
          'Powtórzone kody są wypisane w ostrzeżeniu; działa pierwsza reguła.',
          'Progi mają jednostkę (zł albo mm²) i dodaje się je przyciskiem „Próg”; nowy próg zaczyna od wartości i znakowania poprzedniego.',
          'Progi działają niezależnie od kolejności wpisania – wygrywa najwyższy pasujący – a przy zapisie układają się rosnąco.',
          'Niewypełnione reguły i progi znikają przy zapisie.',
          'Panel reguł działa tylko dla MidOcean i BlueCollection; u innych dostawców jest informacja, że ich API nie podaje znakowań.',
        ],
      },
      {
        label: 'Import',
        items: [
          'Produkty BlueCollection importują się ze znakowaniami: każde miejsce i technika z wymiarami pola nadruku.',
          'Gdy pierwszy wariant nie podaje znakowań, produkt bierze je z kolejnego wariantu, który je ma.',
          'Kod bez reguły importuje się jako nasze znakowanie tego dostawcy o tym samym kodzie; gdy takiego nie ma, jest pomijany.',
          'Poprawka: import nie kończy się błędem, gdy znakowanie z reguły nie istnieje albo żaden próg nie pasuje – takie znakowanie jest pomijane.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Podczas skanu w pasku zostaje tylko ostrzeżenie „Nie zamykaj przeglądarki”; wybór firmy, data skanu i rabat wracają po skanie.',
          'Tabela produktów API przewija się w bok zamiast łamać komórki na kilka linijek.',
          'W cenniku produktu znakowania na liście wyboru mają postać „REED · L1 · nazwa (typ)”.',
        ],
      },
    ],
  },
  {
    version: '1.13.6',
    date: '2026-09-22',
    title: 'Kody',
    highlight: [
      'Dwie poprawki kodów w API. Produkty **AXPOL z kropką w kodzie** (np. P322.08) nie sklejają się już w jeden produkt – dotąd wszystko po kropce było brane za kolor, więc np. pod P322 siedziało 41 różnych produktów. Kody **USBSystem** biorą się teraz z adresu produktu na ich stronie, więc nie zmieniają się, gdy dostawca przestawi ofertę.',
    ],
    all: [
      'Poprawka: produkty AXPOL z kropką w kodzie (np. P322.08, P437.30) nie sklejają się w jeden produkt; każdy ma własny kod.',
      'Produkty AXPOL z ukośnikiem w kodzie (np. V2329/A) są osobnymi produktami, a nie kolorami jednego.',
      'Kody produktów USBSystem pochodzą z adresu produktu na usbsystem.pl i nie zmieniają się, gdy dostawca przestawi ofertę.',
      'Skan AXPOL pomija wiersz nagłówka i puste wiersze bez kodu z ich oferty.',
    ],
  },
  {
    version: '1.13.5',
    date: '2026-09-22',
    title: 'API',
    highlight: [
      'Poprawka: po nowym skanie lista w API od razu pokazuje jego wynik, a nie starszy skan, który przeglądarka miała zapamiętany.',
    ],
    all: [],
  },
  {
    version: '1.13.4',
    date: '2026-09-21',
    title: 'Skanowanie',
    highlight: ['Ostrzeżenie podczas skanu ma pod sobą odstęp i nie przylega już do opisu postępu.'],
    all: [],
  },
  {
    version: '1.13.3',
    date: '2026-09-21',
    title: 'Skanowanie',
    highlight: [
      'Ostrzeżenie **„Nie zamykaj przeglądarki”** stoi teraz nad postępem skanu, a przycisk „Skanuj API” jest w trakcie skanu nieaktywny, więc nie da się go uruchomić drugi raz.',
    ],
    all: [
      'Ostrzeżenie „Nie zamykaj przeglądarki i nie opuszczaj tej strony…” jest nad postępem skanu, a na czerwono tylko jego początek.',
      'Przycisk „Skanuj API” jest nieaktywny, dopóki trwa skan.',
      'Ostrzeżenie i pytanie przy wychodzeniu ze strony pojawiają się też na chwilę przy wczytywaniu listy dostawcy („Pobieranie danych”).',
    ],
  },
  {
    version: '1.13.2',
    date: '2026-09-21',
    title: 'Skanowanie',
    highlight: [
      'Skan API jest teraz przypięty do dostawcy, dla którego go uruchomiono. Wcześniej przełączenie dostawcy w trakcie skanu mogło **zapisać wynik u złego dostawcy**; teraz przełączyć się nie da, a wynik, który nie pasuje do wybranej firmy, panel odrzuca bez zmian w bazie.',
      'Nieudany skan kończy się komunikatem z przyczyną, zamiast czekać w nieskończoność albo odświeżać stronę. Wyjście z zakładki w trakcie skanu trzeba potwierdzić.',
    ],
    all: [
      'Poprawka: wynik skanu zapisuje się tylko u dostawcy, którego skanowano, a wynik dla innej firmy panel odrzuca komunikatem „Wynik skanowania nie pasuje do wybranej firmy”.',
      'W trakcie skanu nie da się przełączyć dostawcy.',
      'Nieudany skan pokazuje komunikat z przyczyną, zamiast wisieć bez końca albo odświeżać stronę.',
      'Wyjście z zakładki API w trakcie skanu trzeba potwierdzić.',
      'Pod postępem skanu jest czerwone ostrzeżenie, żeby nie zamykać przeglądarki i nie opuszczać strony.',
      'Poprawka: wyłączony produkt „✅ Gotowy” włącza się przy skanie także wtedy, gdy jego cena się nie zmieniła.',
    ],
  },
  {
    version: '1.13.1',
    date: '2026-08-28',
    title: '„Ryczałt”',
    highlight: [
      'Poprawka: napis „Ryczałt” w nagłówku tabeli znakowań nie wchodzi już na przypięte kolumny, gdy przewija się tabelę w bok.',
    ],
    all: [],
  },
  {
    version: '1.13.0',
    date: '2026-08-26',
    title: 'DOSTĘPNY',
    highlight: [
      'Każdy kolor w edytorze produktu ma nowe pole **„Dostępny”**, obok „Włączone”. Zaznacza się je, gdy produkt jest na stanie, ale nie znamy liczby sztuk – strona pokazuje wtedy „DOSTĘPNY” zamiast liczby, a pole Ilość robi się blade, bo strona go nie używa. Skan zdejmuje ten znak tylko wtedy, gdy kolor zniknie z oferty dostawcy.',
      '**Uwaga:** produkty Promotionway bez sztuk na magazynie pokazują teraz „BRAK” zamiast „ZAPYTAJ”. „ZAPYTAJ” zostaje tylko u tych, które dostawca oznacza jako dostępne na zamówienie. Zmiana pojawia się na stronie po najbliższym skanie Promotionway.',
    ],
    all: [
      'Kolor w edytorze produktu ma pole „Dostępny” obok „Włączone”; strona pokazuje wtedy „DOSTĘPNY” zamiast liczby sztuk.',
      'Przy zaznaczonym „Dostępny” pole Ilość jest blade, bo strona go nie używa.',
      'Gdy stan nie jest liczbą, przy napisie Ilość widać, co pokaże strona: „DOSTĘPNY”, „ZAPYTAJ” albo „BRAK”.',
      'Na stronie stan koloru to zawsze liczba sztuk, „DOSTĘPNY”, „ZAPYTAJ” albo „BRAK”, tak samo w podpowiedzi koloru i na stronie produktu.',
      'Kolor, który zniknął z oferty dostawcy, przy skanie traci też „Dostępny”, a nie tylko się wyłącza i zeruje.',
      'Produkty Promotionway bez sztuk na magazynie pokazują „BRAK”; „ZAPYTAJ” tylko te dostępne na zamówienie.',
      'Poprawka: produkt PAR bez danych o stanie nie psuje skanu; jego stan to „ZAPYTAJ”.',
    ],
  },
  {
    version: '1.12.14',
    date: '2026-08-25',
    title: 'Biblioteka',
    highlight: [
      'Biblioteka i okno wyboru pliku ukrywają teraz każdy plik, który ma jakikolwiek tag – takie pliki są techniczne i nie trzeba ich oglądać.',
    ],
    all: [],
  },
  {
    version: '1.12.13',
    date: '2026-08-25',
    title: 'Biblioteka',
    highlight: [
      'Biblioteka nie pokazuje plików technicznych oznaczonych jako ukryte, a z menu zniknął przycisk „Notyfikacje”. I tak pokazywał tylko napis „Cicho tu... zbyt cicho”.',
    ],
    all: [],
  },
  {
    version: '1.12.12',
    date: '2026-08-21',
    title: 'Porządki',
    highlight: ['Porządki w ustawieniach kopii zapasowych; nic widocznego się nie zmienia.'],
    all: [],
  },
  {
    version: '1.12.11',
    date: '2026-08-21',
    title: 'Kopie',
    highlight: [
      'Nic widocznego: kopie bazy z ostatnich 14 dni zostają też na samym serwerze, a nie tylko 3, i robią się nawet wtedy, gdy kopia poza serwerem nie jest ustawiona.',
    ],
    all: [],
  },
  {
    version: '1.12.10',
    date: '2026-08-21',
    title: 'Przeprowadzka',
    highlight: [
      'reed.kalisz.pl działa od dziś z **nowego serwera**, za Cloudflare. Strona i panel wyglądają i działają tak samo – nikt nie powinien niczego zauważyć i o to chodziło. Wersja testowa beta.reed.kalisz.pl działa obok, dalej na hasło.',
    ],
    all: [],
  },
  {
    version: '1.12.9',
    date: '2026-08-21',
    title: 'Kopie poza serwerem',
    highlight: [
      'Dalsze przygotowania nowego serwera; strona dalej działa ze starego, więc nic widocznego się nie zmienia. Nowy serwer co noc wysyła **zaszyfrowaną kopię** bazy, zdjęć i plików oraz ustawień poza serwer i trzyma kopie z ostatnich 14 dni, 4 tygodni i 6 miesięcy – awaria serwera nie zabierze już danych ze sobą.',
      'Na nowym serwerze działa też wersja testowa pod beta.reed.kalisz.pl, chroniona hasłem i ukryta przed wyszukiwarkami, do sprawdzania zmian przed publikacją.',
    ],
    all: [],
  },
  {
    version: '1.12.8',
    date: '2026-08-20',
    title: 'Nowy serwer',
    highlight: [
      'Przygotowania do przeniesienia strony na nowy serwer: instalacja jednym poleceniem i publikowanie nowych wersji jednym skryptem. Na razie nic się nie zmienia.',
    ],
    all: [],
  },
  {
    version: '1.12.7',
    date: '2026-07-28',
    title: 'Poprawka',
    highlight: [
      'Poprawka w Kalkulacjach: zapis, który przelicza produkty (zmiana cen albo usunięcie znakowania), znów przechodzi do końca. Od wersji 1.11.5 zatrzymywał się na pierwszym takim znakowaniu – dalsze zmiany się nie zapisywały, a panel zostawał na „Zapisuję...”.',
    ],
    all: [],
  },
  {
    version: '1.12.6',
    date: '2026-06-16',
    title: 'Kopie zapasowe',
    highlight: [
      'Nocna kopia zapasowa i sprzątanie bazy uruchamiają się teraz same, tak jak miały – wcześniej przy automatycznym uruchomieniu mogły się nie wykonać. Nic widocznego się nie zmienia.',
    ],
    all: [],
  },
  {
    version: '1.12.5',
    date: '2026-06-16',
    title: 'Porządki',
    highlight: ['Usunięty nieużywany plik konfiguracyjny; nic się nie zmienia.'],
    all: [],
  },
  {
    version: '1.12.4',
    date: '2026-06-16',
    title: 'Kopie zapasowe',
    highlight: [
      'Baza ma nocne sprzątanie: co noc o 3:00 robi się jej kopia zapasowa (zostają trzy ostatnie), a potem baza usuwa historię zmian i dziennik aktywności, żeby nie puchła. Na tę chwilę serwer danych się wyłącza, więc około 3:00 panel i strona mogą przez moment nie odpowiadać.',
    ],
    all: [],
  },
  {
    version: '1.12.3',
    date: '2026-05-09',
    title: 'Filtry',
    highlight: ['Przyciski filtrów (dostawcy w API i Kalkulacjach, wybór w Menu) są mniejsze i stoją ciaśniej.'],
    all: [],
  },
  {
    version: '1.12.2',
    date: '2026-05-09',
    title: 'Przeliczanie',
    highlight: [
      'Przeliczanie cen wszystkich produktów naraz, na ukrytej stronie technicznej, idzie partiami po 500 produktów, więc mniej obciąża serwer. Poza tym nic się nie zmienia.',
    ],
    all: [],
  },
  {
    version: '1.12.1',
    date: '2026-05-09',
    title: 'Porządki',
    highlight: ['Kod jest jednolicie sformatowany, żeby łatwiej się go czytało. Widać to tylko od środka.'],
    all: [],
  },
  {
    version: '1.12.0',
    date: '2026-05-09',
    title: 'USBSystem',
    highlight: [
      'W zakładce API jest nowy dostawca, **USBSystem**: pamięci USB i inna drobna elektronika. Jego produkty skanuje się i importuje tak jak u pozostałych. USBSystem nie podaje kodów, cen ani stanów magazynowych, więc kod produktu powstaje z jego nazwy, a stan na stronie to „ZAPYTAJ”.',
      'W tabeli API długie kody są ucięte, żeby nie rozpychały kolumny; cały kod widać po najechaniu.',
    ],
    all: [
      'W API jest nowy dostawca, USBSystem; jego produkty skanuje się i importuje jak u pozostałych.',
      'Kod produktu USBSystem powstaje z jego nazwy, bo dostawca nie podaje kodów.',
      'Produkty USBSystem przychodzą bez ceny i stanu magazynowego; stan na stronie to „ZAPYTAJ”.',
      'Nazwa produktu USBSystem zawiera jego pojemności (np. „8GB/16GB”), a opis – parametry od dostawcy, jak kolor, pojemność czy typ złącza.',
      'Znaczek „Dostępny” przy produkcie USBSystem otwiera wyszukiwarkę usbsystem.pl z jego nazwą.',
      'Długie kody w tabeli API są ucięte, a cały kod widać po najechaniu.',
      'Poprawka: wymiary podane jako dwa rozmiary po ukośniku (np. „2,5 cm / 3,5 cm”) nie są przy imporcie puste; liczy się pierwszy.',
    ],
  },
  {
    version: '1.11.5',
    date: '2026-03-19',
    title: 'AXPOL',
    highlight: [
      'AXPOL przeniósł swoje API z axpol.com.pl na axpol.com, więc skan znów działa. Podczas skanu pod nazwą etapu widać teraz **licznik postępu**, np. „Postęp: 120/800”, więc wiadomo, ile jeszcze zostało.',
    ],
    all: [],
  },
  {
    version: '1.11.4',
    date: '2026-03-15',
    title: 'Kalkulacje',
    highlight: [
      'Zapis w Kalkulacjach przelicza produkty tylko wtedy, gdy zmieniło się coś, co wpływa na cenę: ceny, nakłady, marża, minimum, przygotowalnia, transport albo jego próg. Zmiana np. nazwy, kodu czy kolejności zapisuje się od razu, bez czekania na przeliczenie produktów.',
    ],
    all: [
      'Zmiana znakowania, która nie wpływa na cenę (np. nazwa, kod, typ, kolejność), zapisuje się bez przeliczania produktów.',
      'Kolumny nakładów są ułożone rosnąco także zaraz po otwarciu karty dostawcy.',
      'Tabela nie zmienia się w trakcie zapisu, więc zniknął dopisek „Podczas zapisywania dane w tabeli mogą ulegać zmianom.”',
    ],
  },
  {
    version: '1.11.3',
    date: '2026-03-13',
    title: 'Promotionway',
    highlight: [
      'Produkty Promotionway, które mają kilka cen zależnych od nakładu, są w API oznaczone jako niekompatybilne. Panel bierze od dostawcy tylko jedną cenę, więc taki produkt trafiłby do bazy ze złą.',
    ],
    all: [],
  },
  {
    version: '1.11.2',
    date: '2026-03-13',
    title: 'Poprawka',
    highlight: [
      'Od wersji 1.8.0 skan dostawcy, u którego żaden produkt nie ma statusu „✅ Gotowy”, kończył się błędem. Już działa.',
    ],
    all: [],
  },
  {
    version: '1.11.1',
    date: '2026-03-13',
    title: 'Dostawcy',
    highlight: [
      'EasyGifts i Macma bez uprzedzenia przeszli na nową wersję swojego API i ich skany przestały działać – teraz znów działają. Przy okazji **stan magazynowy** EasyGifts, Macma i Promotionway to suma ich magazynów (na 24 h i na kilka dni), a nie tylko jeden z nich, więc po skanie liczby na stronie mogą wzrosnąć.',
    ],
    all: [
      'Poprawka: skan EasyGifts i Macma działa z nową wersją ich API (ceny, stany, materiały, zdjęcia i kolory).',
      'Stan EasyGifts i Macma to suma stanu na 24 h i na 2–3 dni, a nie jeden z nich.',
      'Stan Promotionway to suma stanu na 24 h i na 5–7 dni.',
      'Ceny i stany Promotionway przypisują się do konkretnego wariantu, a nie do całego produktu.',
    ],
  },
  {
    version: '1.11.0',
    date: '2026-01-30',
    title: '„Do edycji”',
    highlight: [
      'Na liście produktów w API jest nowy status **„✏️ Do edycji”**, wyróżniony na pomarańczowo – dla produktów, do których trzeba jeszcze wrócić. W Kalkulacjach pod przyciskiem zapisu jest teraz wprost napisane, że zapis może bardzo długo potrwać.',
    ],
    all: [
      'Produkt na liście API można oznaczyć statusem „✏️ Do edycji”; pole statusu robi się wtedy pomarańczowe.',
      'Pod przyciskiem zapisu w Kalkulacjach jest pogrubione „Zapisywanie może (bardzo) długo potrwać.”, a reszta informacji w osobnych linijkach.',
      'Długa lista zapisywanych znakowań obok przycisku zawija się do kolejnych linijek.',
    ],
  },
  {
    version: '1.10.0',
    date: '2026-01-22',
    title: 'Biblioteka',
    highlight: [
      'Biblioteka ma **wyszukiwarkę**: pliki szuka się po nazwie pliku albo tytule (wpisz i naciśnij Enter). Działa też w oknie wyboru pliku, np. przy dodawaniu zdjęć do produktu, więc nie trzeba już przewijać stron w poszukiwaniu jednego zdjęcia.',
    ],
    all: [
      'Nad biblioteką jest wyszukiwarka plików po nazwie, tytule albo dokładnym identyfikatorze.',
      'Wyszukiwarka działa też w oknie wyboru pliku.',
      'Gdy nic nie pasuje, biblioteka pokazuje „Cicho tu... zbyt cicho.” zamiast pustego miejsca.',
    ],
  },
  {
    version: '1.9.0',
    date: '2025-12-02',
    title: 'PAR',
    highlight: [
      'Cena produktu PAR to teraz cena jego **najdroższego wariantu** – wcześniej brana była cena wariantu, który przyszedł od dostawcy jako pierwszy. Po najbliższym skanie ceny niektórych produktów PAR mogą więc wzrosnąć.',
    ],
    all: [],
  },
  {
    version: '1.8.2',
    date: '2025-11-28',
    title: 'Porządki',
    highlight: [
      'Nic widocznego się nie zmienia: kod jest jednolicie sformatowany, a ukryta strona techniczna (bez linku w menu) dostała przycisk do przeliczenia cen wszystkich produktów naraz – na wypadek, gdyby kiedyś było trzeba.',
    ],
    all: [],
  },
  {
    version: '1.8.1',
    date: '2025-11-15',
    title: 'EasyGifts',
    highlight: [
      'Po zmianie w API EasyGifts skan dopasowuje ceny i stany do wariantów po ich pełnym kodzie, a nie po kodzie produktu.',
    ],
    all: [],
  },
  {
    version: '1.8.0',
    date: '2025-11-14',
    title: '„Gotowy”',
    highlight: [
      'Wyłączony produkt ze statusem **„✅ Gotowy”**, który wrócił do oferty dostawcy, włącza się przy skanie sam, razem ze swoimi wariantami. Produkty z innymi statusami zostają wyłączone, jak dotąd.',
      'Na razie sam produkt włącza się tylko wtedy, gdy skan zmienia też jego cenę albo koszt manipulacyjny; jego warianty – przy każdym skanie.',
    ],
    all: [],
  },
  {
    version: '1.7.0',
    date: '2025-09-28',
    title: 'Opis kategorii',
    highlight: [
      'Opis kategorii, który dotąd było widać tylko w panelu, **pokazuje się na stronie**: nad produktami kategorii jest ramka z jej nazwą i opisem. Opis może mieć pogrubienia, listy i linki – wygląda tak jak w podglądzie w edytorze kategorii. Kategorie bez opisu wyglądają jak wcześniej.',
    ],
    all: [],
  },
  {
    version: '1.6.11',
    date: '2025-09-24',
    title: 'Testy',
    highlight: [
      'Nic się nie zmienia: to próby szybszego zapisywania wielu produktów naraz, na stronie technicznej, której nie ma w menu.',
    ],
    all: [],
  },
  {
    version: '1.6.10',
    date: '2025-08-29',
    title: 'Kalkulacje',
    highlight: [
      '**Zapis w Kalkulacjach znów działa jak należy**: zapisuje tylko zmienione znakowania, a wcześniej zapisywał wszystkie znakowania dostawcy i przeliczał wszystkie ich produkty, co mogło trwać bez końca. Produkty przeliczają się też po 20 naraz zamiast po jednym, więc zapis jest szybszy.',
    ],
    all: [
      'Poprawka: zapis zapisuje i przelicza tylko zmienione znakowania, a nie wszystkie znakowania dostawcy.',
      'Produkty przeliczają się po 20 naraz, więc zapis jest szybszy.',
      'Pod przyciskami zapisu jest informacja, że czas zapisu zależy od liczby powiązanych produktów i że tabela może się w tym czasie zmieniać.',
    ],
  },
  {
    version: '1.6.9',
    date: '2025-08-22',
    title: 'Kalkulacje',
    highlight: [
      'Dwie poprawki w Kalkulacjach: **dodawanie nowych znakowań znów działa** (od wersji 1.4.0 przycisk „Dodaj” nic nie robił), a po zmianie znakowania ceny produktów liczą się z nowych wartości, a nie z tych sprzed zapisu.',
    ],
    all: [
      'Poprawka: „Dodaj” znów dodaje nowe znakowanie, a zapis je tworzy.',
      'Poprawka: po zmianie znakowania ceny produktów przeliczają się z nowych wartości, a nie starych.',
      'Nowe znakowanie dostaje te same kolumny nakładów co pozostałe.',
    ],
  },
  {
    version: '1.6.8',
    date: '2025-08-17',
    title: 'Reguły znakowań',
    highlight: [
      'Sekcja **„Reguły importowania znakowań”** w API jest w ramce i zajmuje mniej miejsca; u dostawców bez obsługi znakowań to tylko mała ramka z jednym zdaniem.',
    ],
    all: [
      'Sekcja reguł jest w ramce; u dostawców bez obsługi znakowań ramka jest mała, tylko na komunikat.',
      'Zniknął opis nad regułami dodany w poprzedniej wersji.',
      'Komunikat u dostawców bez obsługi brzmi „Nie zaimplementowano dla API tego producenta lub jego struktura nie zawiera znakowań.”',
      'Pole kodu dostawcy w regule podpowiada „Kod u producenta”.',
    ],
  },
  {
    version: '1.6.7',
    date: '2025-08-17',
    title: 'Reguły znakowań',
    highlight: [
      'Po przejściu od dostawcy, który ma reguły znakowań, do takiego, który ich nie obsługuje, nie widać już reguł poprzedniego. Sekcja nazywa się teraz „Reguły importowania znakowań” i ma krótki opis, jak działa.',
    ],
    all: [
      'Poprawka: po przełączeniu dostawcy nie widać reguł poprzedniego.',
      'Sekcja „Mapowanie automatycznych znakowań” nazywa się teraz „Reguły importowania znakowań” i ma krótki opis działania.',
      'Sekcja reguł pokazuje się dopiero po wczytaniu listy produktów.',
      'Komunikat u dostawców bez obsługi brzmi „API producenta nie jest jeszcze wspierane lub jego struktura nie zawiera znakowań.”',
    ],
  },
  {
    version: '1.6.6',
    date: '2025-06-30',
    title: 'AXPOL',
    highlight: [
      'Poprzednia poprawka AXPOL zostawiła ograniczenie z testów, przez które skan pobierał tylko pierwsze 1000 produktów. Już pobiera całą ofertę. Skan zrobiony w tych dwóch godzinach mógł uznać resztę produktów AXPOL za wycofane i je wyłączyć.',
    ],
    all: [],
  },
  {
    version: '1.6.5',
    date: '2025-06-29',
    title: 'AXPOL',
    highlight: [
      'Przez problem z certyfikatem bezpieczeństwa na serwerze AXPOL przestały działać skan i pobieranie ich zdjęć. Panel obchodzi go po swojej stronie, więc **skan i import zdjęć AXPOL znów działają**.',
      'Zmiany po skanie i przeliczanie cen produktów idą teraz po kolei, jedno po drugim, żeby nie przeciążać serwera. Trwa to dłużej, więc dłuższy zapis to nie błąd.',
    ],
    all: [],
  },
  {
    version: '1.6.4',
    date: '2025-06-29',
    title: 'Reguły',
    highlight: [
      'Przyciski usuwania reguł i progów w regułach znakowań są czerwone, żeby nie kliknąć ich przez przypadek.',
    ],
    all: [],
  },
  {
    version: '1.6.3',
    date: '2025-06-29',
    title: 'Menu kategorii',
    highlight: [
      'Podkategorie w bocznym menu strony mają równe wcięcie i pionową linię z boku, zamiast coraz większych odstępów na każdym kolejnym poziomie.',
    ],
    all: [],
  },
  {
    version: '1.6.2',
    date: '2025-06-27',
    title: 'Poprawka',
    highlight: [
      'Wersja 1.6.0 zmieniła adres, pod którym panel łączy się ze skanerem API, i połączenie przestało działać. Adres jest z powrotem właściwy.',
    ],
    all: [],
  },
  {
    version: '1.6.1',
    date: '2025-06-27',
    title: 'Poprawka',
    highlight: [
      'Literówka w poprzedniej wersji blokowała dodawanie nowych produktów z API – przez pół godziny żaden się nie zaimportował. Już działa.',
    ],
    all: [],
  },
  {
    version: '1.6.0',
    date: '2025-06-27',
    title: 'Reguły znakowań',
    highlight: [
      'Reguły, które decydują, jakie znakowania dostaje produkt importowany z API, **ustawia się teraz w panelu**: w API, pod listą produktów, jest sekcja „Mapowanie automatycznych znakowań”. Każda reguła łączy kod techniki znakowania u dostawcy z naszym znakowaniem z Kalkulacji (REED albo tego dostawcy) – bezpośrednio albo progami ceny produktu lub powierzchni nadruku.',
      'Reguły zapisują się osobno dla każdego dostawcy; na razie dane o znakowaniach podaje tylko MidOcean. Nowe produkty z MidOcean importują się z **odgórną marżą na całość** zamiast marży na produkt.',
    ],
    all: [
      'W API pod listą produktów jest sekcja „Mapowanie automatycznych znakowań” z regułami wybranego dostawcy.',
      'Reguła łączy kod dostawcy z naszym znakowaniem (REED lub tego dostawcy): „Bezpośrednio”, „Zależy od ceny produktu” albo „Zależy od powierzchni”.',
      'Reguła zależna od ceny lub powierzchni ma progi (>= albo >), każdy z własnym znakowaniem; wybierany jest ostatni spełniony.',
      'Kolejność reguł i progów ustawia się numerem; Zapisz i Anuluj pojawiają się po zmianie.',
      'U dostawców bez obsługi znakowań sekcja pokazuje „Struktura API producenta nie umożliwia konfiguracji automatycznych znakowań.”',
      'Nowe produkty z MidOcean liczą się z odgórną marżą na całość zamiast marży na produkt, a ich znakowania bez osobnej marży.',
    ],
  },
  {
    version: '1.5.1',
    date: '2025-06-26',
    title: 'Reguły znakowań',
    highlight: [
      'Pod listą produktów w API pojawił się szkic edytora reguł znakowań – na razie niegotowy. Zniknęło ostrzeżenie „BETA” ze strony API. Naprawiony jest też import nowych produktów od dostawców innych niż MidOcean, który od wersji 1.4.4 kończył się błędem.',
      'Na czas przenosin reguł z kodu do panelu produkty MidOcean importują się **bez automatycznych znakowań**.',
    ],
    all: [],
  },
  {
    version: '1.5.0',
    date: '2025-06-25',
    title: 'Znakowania z API',
    highlight: [
      'Produkty importowane z **MidOcean dostają znakowania same**: dostawca podaje, jakimi technikami i w jakich miejscach da się produkt znakować, a panel dobiera do tego nasze znakowania z Kalkulacji (REED albo MidOcean), z miejscem i wymiarami pola nadruku. Przy części technik wybór zależy od ceny produktu albo od powierzchni pola nadruku.',
      'Ceny znakowań liczą się od razu przy imporcie. Reguły są na razie wpisane na stałe; edytor w panelu jest w drodze.',
    ],
    all: [
      'Nowy produkt z MidOcean dostaje znakowania według technik nadruku podanych przez dostawcę.',
      'Znakowanie ma od razu wpisane miejsce i wymiary pola nadruku od dostawcy.',
      'Przy części technik znakowanie zależy od ceny produktu albo od powierzchni pola nadruku.',
      'Powtórzone znakowania (to samo znakowanie, miejsce i wymiary) dodają się tylko raz.',
      'Ceny znakowań nowego produktu liczą się od razu przy imporcie.',
      'Znakowania z kalkulacji MidOcean dodają się bez osobnej marży.',
    ],
  },
  {
    version: '1.4.5',
    date: '2025-06-24',
    title: 'Znakowania z API',
    highlight: ['Nic widocznego się nie zmienia: dalsze prace nad tym, żeby produkty z API dostawały znakowania same.'],
    all: [],
  },
  {
    version: '1.4.4',
    date: '2025-06-24',
    title: 'Znakowania z API',
    highlight: [
      'Początek prac nad tym, żeby produkty z API dostawały znakowania same: skaner MidOcean odczytuje już miejsca znakowania produktów (techniki, wymiary i powierzchnię pola nadruku). Na razie nic z tego nie widać – poza błędem, przez który aż do 1.5.1 nie działał import nowych produktów od pozostałych dostawców.',
    ],
    all: [],
  },
  {
    version: '1.4.3',
    date: '2025-06-24',
    title: 'Poprawka',
    highlight: [
      'Obrazek wybrany z biblioteki w kafelku strony głównej się nie wyświetlał – teraz już tak. Obrazki wpisane jako adres działają jak wcześniej.',
    ],
    all: [],
  },
  {
    version: '1.4.2',
    date: '2025-06-18',
    title: 'Tabela znakowań',
    highlight: [
      'Tabela znakowań w Kalkulacjach przewija się w swojej ramce, a przy przewijaniu **nagłówek z nakładami oraz kolumny kolejności i kodu zostają na miejscu** – w długiej tabeli od razu widać, do którego znakowania i nakładu należy komórka.',
    ],
    all: [
      'Tabela znakowań przewija się w swojej ramce i ma najwyżej 70% wysokości ekranu.',
      'Nagłówek tabeli zostaje na górze przy przewijaniu w dół.',
      'Kolumny kolejności i kodu zostają po lewej przy przewijaniu w bok.',
      'W trakcie zapisu nie ma przycisku „Anuluj”.',
    ],
  },
  {
    version: '1.4.1',
    date: '2025-06-18',
    title: 'Porządki',
    highlight: [
      'Nic widocznego się nie zmienia: porządki w plikach konfiguracyjnych i usunięty nieużywany kod skanera.',
    ],
    all: [],
  },
  {
    version: '1.4.0',
    date: '2025-06-18',
    title: 'Kalkulacje',
    highlight: [
      '**Kalkulacje mają karty**: „Marże i Widoki” (odgórne marże i widoki cen) oraz osobną kartę dla każdego dostawcy, zamiast jednej długiej strony ze wszystkimi tabelami. Wybrana karta jest zapamiętana w adresie strony, więc po odświeżeniu wraca się do tego samego dostawcy, a przy zmianie karty z niezapisanymi zmianami panel pyta, czy na pewno wyjść.',
      'W tabeli znakowań **wszystko zapisuje się dopiero przyciskiem Zapisz**: także usunięcie znakowania (wiersz blednie, a zamiennik wybiera się od razu) i zmiana domyślnego. Kolejność znakowań ustawia się, wpisując numer pozycji w nowej pierwszej kolumnie. Kolumny nakładów układają się rosnąco same w trakcie wpisywania, a nakład 1 („Ryczałt”) da się teraz edytować.',
    ],
    all: [
      {
        label: 'Układ',
        items: [
          'Kalkulacje mają karty: „Marże i Widoki” oraz osobną kartę dla każdego dostawcy.',
          'Wybrana karta jest zapamiętana w adresie strony.',
          'Przy przejściu na inną kartę albo stronę z niezapisanymi zmianami panel pyta, czy na pewno wyjść.',
          '„Jak wyliczane są ceny?” jest na pasku nad kartami.',
          'Zniknęła ramka „Zmiany na żywo”.',
          'Odgórne marże są ułożone w kolumnie, a widok cen ma nazwę i nakłady w jednym wierszu.',
        ],
      },
      {
        label: 'Tabela znakowań',
        items: [
          'Nowa kolumna „Kolejność”: znakowanie przesuwa się, wpisując numer jego pozycji.',
          'Usunięcie znakowania tylko je zaznacza (wiersz blednie) i wykonuje się przy zapisie; zamiennik wybiera się w okienku od razu.',
          'Zmiana znakowania domyślnego też zapisuje się dopiero przyciskiem Zapisz.',
          'Kolumny nakładów układają się rosnąco same w trakcie wpisywania; zniknęły strzałki do ich przesuwania i dodawanie kolumny w środku.',
          'Nakład 1 („Ryczałt”) można edytować: napis znika po najechaniu.',
          'Kliknięcie w nakład albo numer kolejności zaznacza całą wartość.',
        ],
      },
    ],
  },
  {
    version: '1.3.6',
    date: '2025-06-11',
    title: 'Konfiguracja',
    highlight: [
      'Nic widocznego: adresy serwerów ustawia się teraz w konfiguracji, a nie w kodzie, dzięki czemu można uruchomić osobną, testową kopię strony i panelu.',
    ],
    all: [],
  },
  {
    version: '1.3.5',
    date: '2025-06-11',
    title: 'Poprawka',
    highlight: ['Zdjęcia w kafelkach strony głównej znów się wyświetlają.'],
    all: [],
  },
  {
    version: '1.3.4',
    date: '2025-06-09',
    title: 'Dokumentacja',
    highlight: [
      'Czwarta poprawka dokumentacji z rzędu: uporządkowana instrukcja uruchamiania projektu. Strona i panel dalej te same.',
    ],
    all: [],
  },
  {
    version: '1.3.3',
    date: '2025-06-08',
    title: 'Dokumentacja',
    highlight: [
      'Dokumentacja techniczna ma nowy tytuł i nowe zrzuty ekranu; w panelu i na stronie nic się nie zmieniło.',
    ],
    all: [],
  },
  {
    version: '1.3.2',
    date: '2025-06-06',
    title: 'Dokumentacja',
    highlight: ['Poprawiony tytuł dokumentacji technicznej; panel i strona bez zmian.'],
    all: [],
  },
  {
    version: '1.3.1',
    date: '2025-06-06',
    title: 'Dokumentacja',
    highlight: [
      'W panelu i na stronie nic się nie zmieniło – rozbudowany został tylko opis projektu w dokumentacji technicznej.',
    ],
    all: [],
  },
  {
    version: '1.3.0',
    date: '2025-06-06',
    title: 'reed.kalisz.pl i dostawcy',
    highlight: [
      'Ta wersja zbiera **dwa lata pracy**, która toczyła się na serwerze i trafiła tu w jednym kawałku, więc daty pojedynczych zmian się nie zachowały. Strona działa pod głównym adresem **reed.kalisz.pl**, a stronę główną układa się z bloków (tytuły, kafelki, slidery kategorii, przerwy) prosto na stronie: zalogowany admin klika **„Edytuj układ”** w swoim pasku.',
      'Zakładka **API** obsługuje siedmiu dostawców: PAR, MidOcean, BlueCollection, Macma, EasyGifts, Promotionway i AXPOL. Skan sam aktualizuje ceny i stany produktów przypisanych do dostawcy i przelicza ich cenniki. **Uwaga:** produkt albo kolor, którego dostawca już nie ma, skan sam ukrywa i zeruje jego stan.',
      'Produkty mają nowe oznaczenia **Bestseller**, **Już wkrótce** i **Koniec nakładu** oraz pole **Notatki**, widoczne tylko w panelu.',
    ],
    all: [
      {
        label: 'Strona',
        items: [
          'Strona i panel działają pod adresem reed.kalisz.pl.',
          'Stronę główną układa się z bloków: tytuł, kafelki, slider kategorii i przerwa; przycisk „Edytuj układ” w pasku admina włącza edycję i zapisuje zmiany.',
          'Blok można dodać przed innym albo za nim, przesunąć strzałkami, ukryć i usunąć.',
          'Kafelki leżą w siatce czterech kolumn: każdy ma tytuł, podtytuł, przycisk z linkiem oraz zdjęcie, białe albo czerwone tło, a jego rozmiar zmienia się strzałkami.',
          'Wyjście ze strony głównej z niezapisanym układem pyta o potwierdzenie.',
          'Przycisk edycji w pasku admina podpisuje się „Edytuj produkt” albo „Edytuj kategorię”.',
          'Nowe znaczki Bestseller, Już wkrótce i Koniec nakładu na kafelkach i karcie produktu.',
          'Kategorie dzielą produkty na strony po 25, z numerami stron nad listą i pod nią.',
          'Promocyjna cena „od” na kafelku jest zielona, a zwykła stoi pod nią, mała i przekreślona.',
          'Dymek nad kolorem na kafelku podaje nazwę koloru i dostępność: liczbę sztuk, „BRAK” albo „ZAPYTAJ”.',
          'Menu boczne rozwija tylko gałąź wybranej kategorii.',
          'W kategorii kalendarzy na początku listy są dodatkowe kafelki z linkami, ustawiane we Fragmentach.',
          'Strona Kontakt ma mapę z linkiem „Pokaż dużą mapę”.',
          'Tło strony ma delikatny czerwony wzór poziomic, a nagłówek i stopka są białe.',
          'Ukryte produkty, kolory, zdjęcia i znakowania, które widzi zalogowany admin, są przykryte przekreślonym okiem.',
          'Pole wyszukiwarki nie ma już podpowiedzi.',
          'Strona zbiera anonimowe statystyki odwiedzin.',
          'Poprawka: strona wczytuje wszystkie kategorie i pozycje menu, a nie tylko pierwsze 100.',
        ],
      },
      {
        label: 'Karta produktu',
        items: [
          'Nad produktem jest przycisk „Wróć” i ścieżka kategorii, a na dole sekcja „Podobne produkty”.',
          'Kliknięcie zdjęcia w galerii otwiera je powiększone na cały ekran.',
          'Kolory znów pokazują „Dostępność”: liczbę sztuk, „BRAK” albo „ZAPYTAJ”.',
          'Kod koloru ma kropkę (PAR) albo myślnik (MidOcean) między kodem produktu a kodem koloru.',
          'Cennik ma wiersz „Cena /szt.”, a pole i miejsce znakowania mają ikonki i pogrubione wartości.',
          'Formularz zapytania wymaga zaznaczenia, że klient zapoznał się z obowiązkiem informacyjnym i polityką prywatności; do tego czasu „Wyślij” jest nieaktywny.',
          'Pole wiadomości nie jest już wypełnione gotowym tekstem.',
          'Poprawka: napis „WIELOKOLOROWY” ma poprawną pisownię.',
          'Poprawka: link do nieistniejącego produktu pokazuje stronę „Taka strona nie istnieje”.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'Produkt ma przełączniki Bestseller, Już wkrótce i Koniec nakładu.',
          'Nowe pole „Notatki”, widoczne tylko w panelu; jest żółte, gdy coś zawiera.',
          'Przełącznik API zniknął z edytora, a pole Producent jest zawsze widoczne.',
          'Lista znakowań do wyboru pokazuje tylko znakowania dostawcy produktu i REED.',
          'U dostawców z kosztami manipulacyjnymi (MidOcean, AXPOL) wybiera się je obok ceny; doliczają się do ceny jednostkowej.',
          'Usuwając kategorię, można wybrać zamiennik dla jej produktów; bez niego kategoria po prostu z nich znika.',
          'Lista produktów wraca do „Wszystkie”, gdy wybrana kategoria już nie istnieje.',
          'Poprawka: zmiana znakowania, marży albo widoku cen przelicza wszystkie produkty, a nie tylko pierwsze 100.',
        ],
      },
      {
        label: 'API',
        items: [
          'Do wyboru siedmiu dostawców: PAR, MidOcean, BlueCollection, Macma, EasyGifts, Promotionway i AXPOL.',
          'Skan aktualizuje ceny i stany produktów przypisanych do dostawcy, a potem przelicza ich cenniki; postęp widać w trzech krokach.',
          'Produkt albo kolor, którego dostawca już nie ma, skan ukrywa i zeruje jego stan.',
          'Lista z ostatniego skanu zostaje zapisana i wczytuje się od razu, bez ponownego skanowania.',
          'Rabat dostawcy wpisuje się w procentach obok daty ostatniego skanu, a skan wlicza go w ceny.',
          'Zamiast pola do odhaczania każdy produkt ma status: „Odrzucony”, „Ma zamiennik”, „Hmm”, „Do dodania”, „W budowie” albo „Gotowy”.',
          'Znaczki przy produktach: „Zaimportowany” (link do produktu), „Dostępny” (link do strony dostawcy), „Wycofany”, „Wycofane kolory” i „Niekompatybilny”.',
          'Nowe sortowanie „Najpierw wycofane”, domyślnie włączone; „Najpierw dodane” nazywa się „Najpierw zaimportowane”.',
          'Wyszukiwarka szuka też w nazwach i kodach kolorów.',
          'Import sam tworzy brakujące kolory, przypisane do dostawcy, a nowe kolory produktu dodaje jako ukryte.',
          'Import mówi, których zdjęć albo produktów nie udało się zaimportować.',
          'Na górze zakładki wisi ostrzeżenie BETA: „Porzućcie wszelką nadzieję, wy, którzy tu wchodzicie.”',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          'Przy dostawcach z kosztami manipulacyjnymi jest dopisek, że doliczają się one do cen jednostkowych.',
          'Znakowań nie przestawia się już strzałkami w tabeli.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Kolor ma pole „Firma”, a lista kolorów kolumnę z firmą.',
          'Zapytania są ułożone od najnowszych.',
          'Edytor pliku pokazuje link do pliku, właściwości, pobieranie i „Podmień plik” z dopiskiem, że link się nie zmieni.',
          'Fragment może mieć na górze edytora opis, a sekcja treści nazywa się „Zawartość” zamiast „Opis”.',
          'Długi tytuł w pasku edytora kończy się wielokropkiem.',
        ],
      },
    ],
  },
  {
    version: '1.2.1',
    date: '2023-04-14',
    title: 'Poprawki',
    highlight: [
      'Dwie poprawki na stronie: link do nieistniejącej kategorii pokazuje stronę 404 zamiast błędu, a pole znakowania w cenniku znów ma prawdziwą wysokość – od poprzedniej wersji pokazywało dwa razy szerokość.',
    ],
    all: [],
  },
  {
    version: '1.2.0',
    date: '2023-03-27',
    title: '404 i ceny „od”',
    highlight: [
      'Nieistniejący adres pokazuje teraz stronę **„Ups! Taka strona nie istnieje”** z linkiem do oferty, zamiast błędu. Kafelki produktów mają przed ceną dopisek **„od”**, a kategorie i wyniki wyszukiwania układają produkty od najtańszego.',
      'W panelu lista produktów ma filtr **„Bez kategorii”**, który pokazuje produkty nieprzypisane do żadnej kategorii – łatwo wyłapać te, których klienci nie znajdą w menu.',
    ],
    all: [
      {
        label: 'Strona',
        items: [
          'Nieistniejący adres pokazuje stronę „Ups! Taka strona nie istnieje” z linkiem „Zapraszamy do zapoznania się z ofertą!”.',
          'Kafelki produktów mają przed ceną szary dopisek „od”.',
          'Kategorie i wyniki wyszukiwania układają produkty od najniższej ceny.',
          'W cenniku wymiary i miejsce mają opisy „Pole znakowania:” i „Miejsce znakowania:”.',
          'Nagłówek znakowania w cenniku pokazuje kod i typ, bez nazwy dostawcy.',
          'Strona główna nazywa się w karcie przeglądarki „REED Kalisz”.',
          'Stopka leży tuż pod treścią, bez odstępu.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Filtr „Bez kategorii” na liście produktów pokazuje produkty, które nie są w żadnej kategorii.',
          'Przy wybranej kategorii jest już tylko przycisk „Dodaj w” z jej nazwą; zwykłe „Dodaj” zostaje przy „Wszystkie” i „Bez kategorii”.',
          'Wyszukiwarki internetowe nie indeksują panelu.',
          'Skan PAR pobiera produkty i stany magazynowe naraz, więc trwa krócej.',
          'Poprawka: serwer skanera znów się uruchamia, więc „Skanuj API” i odświeżanie list na żywo działają.',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2023-03-16',
    title: 'Miejsce znakowania',
    highlight: [
      'Pod polem znakowania jest nowe pole **Miejsce znakowania** (np. „korpus”) – w produkcie z własnymi cenami ze znakowaniem i przy każdym jego znakowaniu. Wpisane miejsce widać na karcie produktu przy cenniku. Przy okazji strona kategorii pokazuje już wszystkie produkty, a nie tylko pierwsze 100.',
    ],
    all: [
      'Pod polem znakowania jest nowe pole „Miejsce znakowania”: w produkcie z cenami ze znakowaniem i przy każdym znakowaniu.',
      'Miejsce znakowania widać na karcie produktu przy cenniku.',
      'Poprawka: strona kategorii pokazuje wszystkie produkty, a nie tylko pierwsze 100.',
      'Pole wyszukiwarki na stronie podpowiada „Czego potrzebujesz?”.',
      'Nagłówek strony jest biały, z granatową linią u dołu, a logo jest większe.',
      'Kafelki produktów mają większe odstępy między rzędami i nie zmieniają ramki po najechaniu.',
    ],
  },
  {
    version: '1.0.1',
    date: '2023-03-12',
    title: 'API w produkcie',
    highlight: [
      'Przełącznik **API** jest teraz na górze edytora produktu, obok „Widoczny” i „Nowość”, a pola związane z API pokazują się tylko w produktach z API. Osobne pole „Kod API” zniknęło – kod produktu z API jest po prostu jego kodem.',
    ],
    all: [
      'Przełącznik API jest na górze edytora produktu, obok „Widoczny” i „Nowość”; osobna sekcja API zniknęła.',
      'Producenta wybiera się obok kodu, tylko w produktach z włączonym API.',
      'Pole „Kod API” zniknęło; kod produktu z API jest po prostu jego kodem.',
      'Znaczek API przy cenie, ilości i kodzie koloru, a także pole ID API wariantu, są tylko w produktach z API.',
      'Poprawka: zakładka API rozpoznaje wszystkie zaimportowane produkty PAR, a nie tylko pierwsze 100.',
    ],
  },
  {
    version: '1.0.0',
    date: '2023-03-09',
    title: 'Start',
    highlight: [
      'Pierwsza publiczna wersja strony. Strona ma **nowy wygląd**: biały nagłówek z logo, menu górnym i wyszukiwarką z przyciskiem „SZUKAJ”, nową stopkę i własną czcionkę. Produkty przegląda się na **stronach kategorii** z menu bocznym, a strona główna na razie wita klientów komunikatem i po 5 sekundach sama przechodzi do gadżetów reklamowych.',
      'Doszły strony **Kontakt**, **Polityka prywatności** i **Obowiązek informacyjny**. Ich treść, tak jak teksty w stopce, zmienia się we **Fragmentach**, a trzy menu strony – górne, boczne i w stopce – w zakładce Menu.',
      'Karta produktu chwilowo nie pokazuje ilości na stanie przy kolorach, a formularz zapytania nie przyjmuje załączników. Za to każde zapytanie samo zaczyna się od kodu produktu.',
    ],
    all: [
      {
        label: 'Strona',
        items: [
          'Nowy nagłówek: logo, menu górne i wyszukiwarka z przyciskiem „SZUKAJ” na białym, półprzezroczystym tle.',
          'Aktywna pozycja menu górnego jest granatowa, a jej ponowne kliknięcie wraca na stronę główną.',
          'Menu górne nie rozwija już podkategorii; robi to menu boczne.',
          'Nowe strony kategorii z menu bocznym, które podświetla wybraną kategorię i rozwija jej podkategorie.',
          'Strona główna wita komunikatem „Witamy na naszej nowej stronie internetowej!” i po 5 sekundach przechodzi do kategorii gadżetów reklamowych.',
          'Wyszukiwarka szuka w nazwach i kodach produktów, a wyniki pokazuje obok menu bocznego.',
          'Nowa stopka z tekstem o firmie, danymi biura, menu stopki i prawami autorskimi.',
          'Nowe strony Kontakt, Polityka prywatności i Obowiązek informacyjny.',
          'Treść stopki i nowych stron zmienia się we Fragmentach.',
          'Strona ma własną czcionkę, inną niż panel.',
          'Kafelki produktów mają proste rogi, ostrzejsze zdjęcia i jasnoniebieskie tło po najechaniu.',
        ],
      },
      {
        label: 'Karta produktu',
        items: [
          'Nowy układ: galeria i kolory w szarej kolumnie po lewej, opis, cennik i formularz po prawej.',
          'Kolory stoją po dwa w rzędzie i nie pokazują już ilości na stanie.',
          'Galeria i kolory nie mają ramek ani zaokrąglonych rogów.',
          'Formularz nazywa się „Zapytaj” zamiast „Zapytaj / Zamów”, a pola ma w dwóch kolumnach.',
          'Zapytanie samo zaczyna się od kodu produktu, więc w Zapytaniach widać, o który produkt chodzi.',
          'Do zapytania chwilowo nie da się załączyć pliku.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Wszystkie trzy menu z zakładki Menu są na stronie: górne w nagłówku, boczne obok produktów i menu stopki.',
          'Usunięcie kategorii albo pozycji menu przesuwa następne w górę, więc w numeracji nie zostaje dziura.',
          'W edytorze pozycji menu link do produktu, kategorii, strony albo adresu otwiera się w nowej karcie.',
          'Po zapisie tabeli znakowań w Kalkulacjach strona sama się odświeża, żeby pokazać właściwą kolejność.',
        ],
      },
    ],
  },
  {
    version: '0.22.3',
    date: '2023-02-23',
    title: 'Przeciąganie',
    highlight: [
      'Poprawki w przeciąganiu kategorii i pozycji menu: przestawienie czegoś na najwyższym poziomie drzewa **zapisuje teraz kolejność całej listy**, a nie tylko przeciąganej pozycji. W Menu kolumna „Element” nazywa się „Prowadzi do”.',
    ],
    all: [
      'Poprawka: po przestawieniu kategorii lub pozycji menu na najwyższym poziomie kolejność pozostałych też się zapisuje i nie rozjeżdża się po odświeżeniu.',
      'Ostatnią pozycję w gałęzi można wysunąć poziom wyżej, upuszczając ją na strzałkę w lewo tuż pod nią samą.',
      'W Menu kolumna „Element” nazywa się „Prowadzi do”, a dymki ikon: „Prowadzi do: Produkt”, „Prowadzi do: Kategoria” i „Prowadzi do: Strona”.',
    ],
  },
  {
    version: '0.22.2',
    date: '2023-02-16',
    title: 'Serwer',
    highlight: [
      'Strona i panel działają na prawdziwym serwerze, pod adresem **new.reed.kalisz.pl**, a nie na serwerze testowym. Przy okazji poprawka zapisu daty skanu API.',
    ],
    all: [
      'Strona i panel są dostępne pod adresem new.reed.kalisz.pl.',
      'Poprawka: skan API uruchomiony między północą a pierwszą w nocy nie wisi już w nieskończoność na „Trwa pobieranie danych”.',
      'Data ostatniego skanu bierze się z zegara komputera, więc zgadza się także w czasie letnim.',
    ],
  },
  {
    version: '0.22.1',
    date: '2023-02-14',
    title: 'Nagłówek',
    highlight: [
      'Poprawka: **nagłówek strony z menu i wyszukiwarką zostaje na górze okna** przez całe przewijanie – wcześniej po przewinięciu mniej więcej o jeden ekran odjeżdżał razem z treścią.',
    ],
    all: [],
  },
  {
    version: '0.22.0',
    date: '2023-01-28',
    title: 'API',
    highlight: [
      'Nowa zakładka **API**: przycisk „Skanuj API” pobiera aktualną ofertę dostawcy PAR (na razie tylko jego) i pokazuje ją razem z produktami, które już są w bazie. Plusem zaznacza się cały produkt albo pojedyncze kolory, a „Dodaj” importuje je ze zdjęciami. **Zaimportowane produkty są ukryte i nie pokazują ceny**, dopóki ich nie sprawdzisz.',
      'Nowa sekcja **Informacje handlowe** to wspólne teksty, np. warunki dostawy, które dopina się na końcu opisu wielu produktów naraz. Produkt ma też rozmiar i materiały, widoczne na jego stronie.',
      '**Uwaga:** kolor, którego brakowało w bazie, tworzy się przy imporcie z białym odcieniem – trzeba mu potem ustawić właściwy w Kolorach.',
    ],
    all: [
      {
        label: 'API',
        items: [
          'Zakładka API pokazuje ofertę PAR: kod, nazwę i liczbę kolorów każdego produktu, z wyszukiwarką i stronami.',
          '„Skanuj API” pobiera aktualną ofertę, co może potrwać kilka minut; nad listą widać datę ostatniego skanu.',
          'Kolory produktu rozwija się przyciskiem z ich liczbą; każdy ma swój pełny kod i nazwy kolorów.',
          'Plus przy produkcie albo kolorze zaznacza go do importu, a „Dodaj” importuje zaznaczone razem ze zdjęciami.',
          'Kolory, których brakuje w bazie, tworzą się przy imporcie, na start z białym odcieniem.',
          'Zaimportowany produkt jest ukryty, nie pokazuje ceny i ma domyślny widok cen.',
          'Produkty i kolory, które już są w bazie, mają jasnoniebieskie tło, a wycofane przez dostawcę – różowe.',
          'Pole wyboru na początku wiersza odhacza przejrzane pozycje; widzą to wszyscy administratorzy.',
          'Krzyżyk przy produkcie lub kolorze z bazy usuwa go z bazy, po potwierdzeniu „OPERACJA NIEODWRACALNA!”.',
          'Link „Strona producenta” po najechaniu na wiersz otwiera produkt w wyszukiwarce PAR.',
          'Listę sortuje się po kodzie albo nazwie, a „Najpierw dodane” stawia na górze produkty z bazy.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'Pole „Informacje handlowe” obok opisu dopina wybrany tekst na końcu opisu, także w podglądzie.',
          'Ramka „Detale”: rozmiar w mm (trzy wymiary) i lista materiałów, np. „stal;plastik”.',
          'W ramce API producent i kod stoją obok siebie, pole „ID” zniknęło, a doszedł przełącznik „Włączone”.',
          'Kolor w wariancie ma pola „Kod API” i „ID API” zamiast „Kod koloru w API”.',
          'Lista produktów ma kolumnę API.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Sekcja Informacje handlowe: lista z wyszukiwarką i edytor z nazwą oraz treścią z podglądem.',
          'Menu boczne jest podzielone kreskami na grupy, a „Aktywność” nazywa się „Dashboard”.',
          'Karta przeglądarki pokazuje sekcję albo edytowany element, np. „Admin | Produkty | REED Kalisz”.',
          'Sekcja z treścią w edytorze strony nazywa się „Zawartość” zamiast „Opis”.',
          'Miniatury w bibliotece ładują się szybciej, bo są pomniejszone.',
          'Ikona API przy polu ma dymek „Ta wartość będzie aktualizowana przez API”.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Strona produktu pokazuje pod opisem informację handlową, rozmiar i materiały.',
          'Zdjęcia wyłączone w produkcie nie pokazują się na stronie: ani na kafelku, ani w galeriach.',
          'Zdjęcia kolorów trafiają do głównej galerii tylko z zaznaczoną opcją „Galeria”.',
          'Napis „Ze znakowaniem” na kafelku pojawia się tylko przy cenie.',
          'Tytuł karty produktu w przeglądarce zaczyna się od kodu produktu.',
        ],
      },
    ],
  },
  {
    version: '0.21.8',
    date: '2022-12-07',
    title: 'Kafelki',
    highlight: [
      'Zdjęcia na kafelkach produktów są zawsze kwadratowe, więc kafelki w jednym rzędzie mają równą wysokość.',
    ],
    all: [],
  },
  {
    version: '0.21.7',
    date: '2022-12-04',
    title: 'Transport',
    highlight: [
      '**Poprawka w cenach:** transport kosztował zawsze 20 zł, niezależnie od ustawień – teraz bierze się z kolumny T znakowania. Ceny produktów zmienią się po ich przeliczeniu, czyli po następnym zapisie znakowania w Kalkulacjach albo samego produktu.',
    ],
    all: [
      'Poprawka: koszt transportu bierze się z kolumny T znakowania, a nie ze stałych 20 zł.',
      'Próg transportu (TP) równy 0 oznacza darmowy transport, a puste pole – transport doliczany zawsze.',
      'Poprawka: pusta lub zerowa cena w środku tabeli znakowania nie przerywa szukania – liczy się najbliższy niższy nakład, który ma cenę.',
      'Schemat „Jak wyliczane są ceny?” jest zaktualizowany.',
    ],
  },
  {
    version: '0.21.6',
    date: '2022-12-03',
    title: 'Dymki',
    highlight: [
      'Ikony w nagłówkach list mają **dymki z wyjaśnieniem** – wystarczy najechać, żeby zobaczyć, co oznacza kolumna, np. „Widoczność”, „Źródło: Kontakt” albo „Zawiera załącznik”.',
    ],
    all: [
      'Ikony w nagłówkach list produktów, kategorii, kolorów, menu, stron i zapytań mają dymki z nazwą kolumny.',
      'Kolumny drzewa kategorii mają dymki „Dodawanie podkategorii” i „Hierarchia”.',
    ],
  },
  {
    version: '0.21.5',
    date: '2022-12-03',
    title: 'Nazewnictwo',
    highlight: [
      '„Globalne marże” w Kalkulacjach nazywają się teraz **„Odgórne marże”**, z częściami „Produkt” i „Całość”, a w edytorze produktu marża na produkt stoi przed marżą na całość – w tej samej kolejności co w Kalkulacjach.',
    ],
    all: [
      '„Globalne marże” to teraz „Odgórne marże”, a ich części nazywają się „Produkt” i „Całość”.',
      'W cenniku produktu marża „na produkt” jest przed marżą „na całość”.',
      'Przy opcji „Galeria” w zdjęciach wariantu jest dymek „Dołącza zdjęcie na końcu głównej galerii”.',
      'Na stronie produktu kolor ze stanem 0 pokazuje „Ilość: 0” zamiast „Na stanie”.',
      'Schemat „Jak wyliczane są ceny?” jest zaktualizowany.',
    ],
  },
  {
    version: '0.21.4',
    date: '2022-12-02',
    title: 'Kalkulacje',
    highlight: [
      'Marże i skróty w Kalkulacjach mają **te same kolory co na schemacie ceny**, więc łatwo dopasować pole do miejsca we wzorze. Każdy link zaczyna wczytywać stronę już po najechaniu, więc strony otwierają się szybciej.',
    ],
    all: [
      'Odgórna marża „Na produkt” stoi przed „Na całość”, a ich nagłówki są pomarańczowy i czerwony, jak na schemacie.',
      'Skróty M i MIN w tabeli znakowań są zielone, P niebieskie, a T i TP fioletowe.',
      'Każdy link na stronie i w panelu, nie tylko w menu, zaczyna wczytywać stronę już po najechaniu myszką.',
      'Schemat „Jak wyliczane są ceny?” jest zaktualizowany.',
    ],
  },
  {
    version: '0.21.3',
    date: '2022-12-02',
    title: 'Tabela znakowań',
    highlight: [
      'Kolumny tabeli znakowań w Kalkulacjach idą po kolei: najpierw Nazwa, Kod i Typ, potem marża, minimum, przygotowalnia i transport. **Skróty w nagłówkach mają dymki** z pełną nazwą.',
    ],
    all: [
      'Kolumny tabeli znakowań są w kolejności: Nazwa, Kod, Typ, M, MIN, P, T, TP.',
      'Skróty M, MIN, P, T i TP oraz gwiazdka („Domyślne dla producenta”) mają dymki z pełną nazwą.',
      'Przyciski pod tabelą znakowań pojawiają się bez animacji.',
      'Formularz zapytania na stronie produktu ma ramkę i lekko różowe tło.',
      'Schemat „Jak wyliczane są ceny?” jest zaktualizowany.',
    ],
  },
  {
    version: '0.21.2',
    date: '2022-12-01',
    title: 'Formularz',
    highlight: ['Przycisk „Wyślij” w formularzu zapytania na stronie produktu podświetla się po najechaniu.'],
    all: [],
  },
  {
    version: '0.21.1',
    date: '2022-12-01',
    title: 'Pole znakowania',
    highlight: [
      'Pole znakowania można podać także przy **własnych cenach produktu** z zaznaczonym „Ceny ze znakowaniem” – pokazuje się wtedy na stronie nad cennikiem. Ceny na stronie produktu mają dopisek „zł”.',
    ],
    all: [
      'Gdy własne ceny są „Ceny ze znakowaniem”, pod przełącznikiem jest pole znakowania w mm.',
      'Strona produktu pokazuje to pole nad tabelą własnych cen.',
      'Ceny w tabelach na stronie produktu mają dopisek „zł”.',
      'Pod tabelą cen każdego znakowania jest szary dopisek „Ceny ze znakowaniem”, tak jak przy własnych cenach.',
    ],
  },
  {
    version: '0.21.0',
    date: '2022-11-30',
    title: 'Wzór cen',
    highlight: [
      'W Kalkulacjach, nad marżami, jest przycisk **„Jak wyliczane są ceny?”**. Otwiera na cały ekran schemat, z którego widać, jak z ceny zakupu, znakowania, marż i transportu powstaje cena na stronie. Kliknięcie gdziekolwiek go zamyka.',
    ],
    all: [],
  },
  {
    version: '0.20.0',
    date: '2022-11-30',
    title: 'Karta produktu',
    highlight: [
      'Strona produktu jest już pełna: **galeria, kolory z dostępnością, opis i cennik** – osobna tabela dla każdego znakowania, z ceną promocyjną nad przekreśloną zwykłą i z polem znakowania w mm, które wpisuje się teraz przy znakowaniu w edytorze produktu.',
      'Pod cennikiem jest formularz **„Zapytaj / Zamów”**: e-mail, telefon, imię i nazwisko, wiadomość i załącznik. Wysłane zapytanie trafia do Zapytań w panelu. Kafelki i strona produktu mają znaczki „Nowość”, „Promocja” i, przy ukrytych produktach, „Tylko admin”.',
      '**P.S.** Ta wersja poszła razem z pracą inżynierską.',
    ],
    all: [
      {
        label: 'Strona produktu',
        items: [
          'Pod nazwą jest kod produktu i opis.',
          'Główna galeria zawiera też zdjęcia kolorów, a wyłączone zdjęcia są na miniaturach przygaszone.',
          'Sekcja Kolory: karta każdego koloru z kodem, nazwą koloru, ilością („Na stanie”, gdy pusta) i małą galerią.',
          'Cennik: tabela Ilość/Cena dla własnych cen i dla każdego włączonego znakowania, z jego nazwą, firmą, kodem i typem.',
          'Cena promocyjna jest zielona, nad przekreśloną zwykłą.',
          'Przy znakowaniu z podanym polem widać np. „Pole znakowania 40x20 mm”.',
          'Formularz „Zapytaj / Zamów”: e-mail i wiadomość są wymagane, a wiadomość ma gotowy początek z nazwą produktu.',
          'Po wysłaniu formularza pojawia się „Wiadomość została wysłana!”, a zapytanie trafia do Zapytań w panelu.',
          'Nad nazwą stoją znaczki „Nowość”, „Promocja” i „Tylko admin”.',
          'Karta przeglądarki pokazuje tytuł SEO i kod produktu.',
        ],
      },
      {
        label: 'Kafelki i strona główna',
        items: [
          'Kafelki mają znaczki „Nowość” i „Promocja”, a ukryte produkty „Tylko admin”.',
          'Cena na kafelku ma zawsze dwa miejsca po przecinku.',
          'Zdjęcie na kafelku jest wpasowane z białym marginesem, a nie przycięte.',
          'Dymek koloru pokazuje „Dostępność” (ilość albo „Na stanie”), a wielokolorowe warianty mają kolorową ikonę.',
          'Wyszukiwarka w nagłówku działa: pokazuje wyniki na stronie głównej.',
          'Kliknięcie pozycji w rozwiniętym menu albo logo zamyka menu.',
          'Na dole strony jest szara stopka, na razie pusta.',
          'Karta przeglądarki na stronie głównej nazywa się „Strona główna | REED Kalisz”.',
          '„Edytuj” i „Panel admina” na pasku admina otwierają panel w nowej karcie.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Przy każdym znakowaniu produktu jest pole znakowania w mm (szerokość x wysokość).',
          'Sekcja „Warianty” w edytorze produktu nazywa się „Kolory”.',
          'Karta przeglądarki w panelu nazywa się „Admin | REED Kalisz”.',
        ],
      },
    ],
  },
  {
    version: '0.19.3',
    date: '2022-11-29',
    title: 'Linki',
    highlight: [
      '„Link do strony” w edytorach produktu, kategorii i strony **otwiera stronę w nowej karcie**, więc panel zostaje otwarty. Zniknęło też próbne powiększanie zdjęcia w galerii produktu.',
    ],
    all: [],
  },
  {
    version: '0.19.2',
    date: '2022-11-29',
    title: 'Menu i galeria',
    highlight: [
      'Pozycja menu strony wskazująca kategorię **rozwija się w drzewo wszystkich jej podkategorii**, na każdym poziomie, a każda prowadzi do swojej kategorii. W galerii produktu duże zdjęcie zmienia się już po najechaniu na miniaturę.',
    ],
    all: [
      'Pozycja menu z kategorią pokazuje w rozwijanym menu wszystkie jej podkategorie, na każdym poziomie.',
      'Poprawka: linki działają w podpozycjach menu na każdym poziomie, a nie tylko na pierwszym.',
      'Rozwinięte menu łamie się na kilka rzędów, gdy pozycji jest dużo, a linki są podkreślone dopiero po najechaniu.',
      'Najechanie na miniaturę w galerii produktu zmienia duże zdjęcie, a miniatury są większe.',
      'Najechanie na duże zdjęcie próbnie powiększa je na cały ekran.',
      'Poprawka: po usunięciu koloru panel wraca do listy kolorów, a nie produktów.',
      'Lista kolorów bez wyszukiwania nie ma już paska stron, który i tak niczego nie zmieniał.',
    ],
  },
  {
    version: '0.19.1',
    date: '2022-11-29',
    title: 'Menu',
    highlight: [
      'Początek rozwijania kategorii z menu strony w listę podkategorii. W tej wersji jeszcze nie działało: pozycja menu wskazująca kategorię chwilowo **nie prowadziła nigdzie** – poprawione w 0.19.2.',
    ],
    all: [],
  },
  {
    version: '0.19.0',
    date: '2022-11-29',
    title: 'Strona publiczna',
    highlight: [
      'Powstaje pierwsza wersja **strony dla klientów** (jeszcze niepublicznej): czerwony nagłówek z logo, menu ustawionym w panelu i wyszukiwarką, strona główna „Gadżety reklamowe” z kategoriami do klikania i kafelkami produktów oraz zaczątek strony produktu z galerią.',
      'Zalogowany administrator ma na stronie, w lewym dolnym rogu, **przyciski „Edytuj”** (na stronie produktu otwiera go w panelu), „Panel admina” i „Wyloguj”. W panelu zakładka **Menu** wreszcie działa: pozycje otwierają się w edytorze, a w polu „Link” wystarczy wkleić adres strony, produktu lub kategorii – panel sam rozpozna, do czego prowadzi.',
    ],
    all: [
      {
        label: 'Strona',
        items: [
          'Nagłówek ma logo, pozycje menu ustawione w panelu i pole „Szukaj...” (wyszukiwanie zadziała od 0.20.0).',
          'Najechanie na pozycję menu z podpozycjami rozwija je pod nagłówkiem.',
          'Strona główna „Gadżety reklamowe” ma przyciski kategorii; kliknięcie pokazuje podkategorie i zawęża produkty, razem z podkategoriami.',
          'Kafelek produktu: zdjęcie, nazwa, kod, najniższa cena w zł (albo „Zapytaj o cenę”), „Ze znakowaniem” i kropki kolorów.',
          'Dymek kropki koloru pokazuje nazwę koloru i stan w magazynie.',
          'Ukryty produkt ma na kafelku napis „TYLKO ADMIN”.',
          'Strona produktu pokazuje na razie nazwę i galerię; kliknięcie miniatury zmienia duże zdjęcie.',
          'Zalogowany administrator ma w lewym dolnym rogu przyciski „Edytuj”, „Panel admina”, „Wyloguj” i swój awatar.',
          'Znaczek „WERSJA DEMO” jest wyłączony.',
        ],
      },
      {
        label: 'Menu',
        items: [
          'Nagłówek zakładki to „Menu” (wcześniej omyłkowo „Kategorie”), a kliknięcie pozycji otwiera jej edytor.',
          'Przyciski nad listą przełączają między menu strony.',
          '„+” przy pozycji dodaje w niej podpozycję.',
          'Kolumny pokazują folder, czy pozycja prowadzi do produktu, kategorii lub strony, i w kolumnie „Element” nazwę tego elementu.',
          'W polu „Link” wkleja się adres: panel rozpoznaje produkt, kategorię lub stronę, a inny adres zapisuje jako zewnętrzny link.',
          'Zły adres w polu „Link” pokazuje błąd „Niepoprawny link”.',
          'Ramka „Element” w edytorze pokazuje, do czego prowadzi pozycja: PRODUKT, KATEGORIA, STRONA albo ZEWNĘTRZNY LINK.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Awatar w menu bocznym pokazuje imię i nazwisko w dymku, zamiast karty po kliknięciu.',
          'Dzwonek powiadomień otwiera okienko „Cicho tu... zbyt cicho”.',
          'Pod wyborem „Kolor 1” i „Kolor 2” w wariancie widać próbkę wybranego koloru.',
        ],
      },
    ],
  },
  {
    version: '0.18.0',
    date: '2022-11-24',
    title: 'Menu',
    highlight: [
      'Zakładka **Menu** pokazuje pozycje menu strony w drzewie, z wyszukiwarką i przyciskiem „Dodaj”; przy każdej widać, czy prowadzi do produktu, kategorii, strony czy na zewnętrzny link. To pierwsza wersja i jeszcze nie działa jak trzeba: nagłówek omyłkowo mówi „Kategorie”, a kliknięcie pozycji nie otwiera jej edytora – poprawione w 0.19.0.',
    ],
    all: [],
  },
  {
    version: '0.17.0',
    date: '2022-11-24',
    title: 'Strony i Fragmenty',
    highlight: [
      'Dwie nowe sekcje z treściami strony. W **Stronach** są podstrony, np. regulaminy: tytuł, opis SEO i treść, którą pisze się po lewej, a po prawej od razu widać, jak będzie wyglądać. We **Fragmentach** są drobne teksty ze strony, np. dane kontaktowe – tekst i dane w formacie JSON, a błąd w danych blokuje zapis.',
      'Okno wyboru pliku ma przyciski **„Powrót”** i **„Wyczyść”**. Kalkulacje ostrzegają, żeby nie edytować ich w kilka osób naraz, i pytają przed wyjściem z niezapisanymi zmianami w znakowaniach.',
    ],
    all: [
      {
        label: 'Strony i Fragmenty',
        items: [
          'Strony: lista z wyszukiwarką i „Dodaj”, z kolumnami widoczności, nazwy i dat.',
          'Edytor strony: tytuł, SEO (tytuł i opis), „Usuń”, link do strony i treść z podglądem obok.',
          'Fragmenty: lista z wyszukiwarką; fragmentów nie dodaje się ani nie usuwa w panelu.',
          'Edytor fragmentu: treść z podglądem i pole „Dane” w JSON; błąd składni podświetla pole i nie pozwala zapisać.',
          'Oba edytory ostrzegają, gdy ktoś inny właśnie zapisał ten sam element.',
        ],
      },
      {
        label: 'Wybór pliku',
        items: [
          'Okno wyboru pliku ma przyciski „Powrót”, który je zamyka, i „Wyczyść”, który zdejmuje wybrany plik.',
          'Pole wgrywania jest pierwszym kafelkiem na liście plików, a pasek usuwania zaznaczonych plików ma ramkę.',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          'Na górze jest ramka „Zmiany na żywo”: zapisane zmiany od razu widzą inni, więc lepiej nie edytować naraz.',
          'Wyjście z niezapisanymi zmianami w znakowaniach pyta, czy na pewno opuścić stronę.',
        ],
      },
      {
        label: 'Panel',
        items: [
          'Daty w listach i edytorach mają format dzień.miesiąc.rok godzina:minuta, bez sekund.',
          'Wyniki wyszukiwania w Kategoriach są podzielone na strony.',
          'W liście zapytań kolumna Spam jest wąska i stoi przed ID.',
        ],
      },
    ],
  },
  {
    version: '0.16.0',
    date: '2022-11-23',
    title: 'Kolory i Zapytania',
    highlight: [
      'Dwie sekcje, które dotąd były puste, mają już listy i edytory. W **Kolorach** są wszystkie kolory produktów z próbką odcienia; w edytorze zmienia się nazwę, widoczność i odcień – wpisując kod HEX albo wybierając go z palety.',
      'W **Zapytaniach** widać, skąd przyszło zapytanie (kontakt, produkt), czy ma załącznik, szansę na spam i dane kontaktowe. Przyciskiem „Dodaj” można też zapisać zapytanie przyjęte np. przez telefon. Na stronie duży napis „WERSJA NIESTABILNA” zmienił się w mniejszy znaczek „WERSJA DEMO”.',
    ],
    all: [
      {
        label: 'Kolory',
        items: [
          'Lista kolorów z wyszukiwarką, przyciskiem „Dodaj” i kolumnami: widoczność, ID, nazwa, kolor z próbką i daty.',
          'Edytor koloru: „Widoczny”, nazwa, kod HEX z próbnikiem „Wybierz” i „Usuń”.',
          'Kolory są w menu bocznym zaraz pod Produktami.',
        ],
      },
      {
        label: 'Zapytania',
        items: [
          'Lista zapytań z wyszukiwarką i „Dodaj”: źródło (kontakt, produkt), załącznik, ID, szansa na spam, imię, e-mail i telefon.',
          'Edytor zapytania: imię i nazwisko, e-mail, telefon, treść i załącznik.',
          'Ramka z boku mówi, czy to zapytanie z formularza (Kontakt albo Produkt), z szansą na spam, czy wewnętrzne.',
          'Szansa na spam powyżej 80% jest czerwona.',
        ],
      },
      {
        label: 'Produkty',
        items: [
          'W edytorze produktu warianty są pod galerią, a pusta sekcja „Rekomendacje” zniknęła.',
          'Lista kolorów w wariancie pokazuje najpierw kod HEX, a ukryte kolory mają dopisek „[Ukryty]” zamiast „[Wyłączony]”.',
          'Lista produktów odświeża się sama także wtedy, gdy inny administrator doda nowy produkt.',
          'Poprawka: drzewo kategorii i listy wyboru, np. kolory w wariantach, odświeżają się od razu, gdy inny administrator coś w nich zmieni.',
          'Pliki usunięte z biblioteki znikają od razu także u pozostałych administratorów.',
        ],
      },
      'Na stronie czerwony napis „WERSJA NIESTABILNA – nie korzystaj z serwisu” zmienił się w pomarańczowy znaczek „WERSJA DEMO – Dokumentuj błędy!” w prawym górnym rogu.',
    ],
  },
  {
    version: '0.15.5',
    date: '2022-11-22',
    title: 'Poprawka',
    highlight: [
      'Edytory produktu i kategorii znów się otwierają – poprzednia wersja psuła tworzenie linków. Przy okazji edytor kategorii dostał te same nazwy pól co edytor produktu.',
    ],
    all: [
      'Poprawka: edytory produktu i kategorii znów się otwierają, a linki tworzą się poprawnie.',
      'W edytorze kategorii jest „Link do strony”, „Utworzenie” i „Aktualizacja”, a link nowej kategorii pokazuje się przed zapisem.',
      'Pole „Producent” w produkcie ma opcję „---”, więc produkt może nie mieć dostawcy.',
    ],
  },
  {
    version: '0.15.4',
    date: '2022-11-22',
    title: 'Nazewnictwo',
    highlight: [
      'Kolumny i pola dat nazywają się teraz wszędzie „Utworzenie” i „Aktualizacja”, a „Bezpośredni link” to „Link do strony”. **Uwaga:** w tej wersji edytory produktu i kategorii przestały się otwierać; naprawia to 0.15.5.',
    ],
    all: [
      'Kolumny „Dodano” i „Zaktualizowano” w listach produktów i kategorii nazywają się „Utworzenie” i „Aktualizacja”.',
      'W edytorze produktu te same pola też nazywają się „Utworzenie” i „Aktualizacja”.',
      '„Bezpośredni link” w edytorze produktu nazywa się „Link do strony”; przed pierwszym zapisem jest zwykłym tekstem.',
      'Nad edytorem produktu i kategorii zniknął nagłówek „Główne”, a z pola nazwy komunikat „Nazwa zarezerwowana”.',
      'Uwaga: edytory produktu i kategorii chwilowo się nie otwierają.',
    ],
  },
  {
    version: '0.15.3',
    date: '2022-11-22',
    title: 'Listy',
    highlight: [
      'Adres listy produktów zapamiętuje teraz liczbę pozycji na stronie, numer strony, wyszukiwanie i kategorię, a biblioteka liczbę pozycji i stronę. Lista pamięta też te ustawienia, gdy przejdziesz do innej sekcji i wrócisz.',
      'Na stronie i w panelu wisi duży napis **„WERSJA NIESTABILNA – Nie korzystaj z serwisu!”**. Strona rzeczywiście nie jest jeszcze gotowa.',
    ],
    all: [
      'Na górze strony i panelu jest napis „WERSJA NIESTABILNA” z dopiskiem „Nie korzystaj z serwisu!”.',
      'Adres listy produktów zapamiętuje liczbę pozycji na stronie, stronę, wyszukiwanie i kategorię.',
      'Adres biblioteki zapamiętuje liczbę pozycji na stronie i stronę.',
      'Po wyjściu do innej sekcji i powrocie lista wraca do tych samych ustawień.',
      'Gdy po zmianie liczby pozycji na stronie bieżąca strona przestaje istnieć, lista wraca na pierwszą.',
      'Link produktu i kategorii dostaje na końcu losowy dopisek i zmienia się tylko po zmianie nazwy lub kodu.',
      'Usuwanie produktu pyta „Na pewno chcesz usunąć ten element?”.',
      'Nad biblioteką zniknęły nieaktywne filtry.',
      'Uwaga: przycisk „Usuń” w edytorze kategorii chwilowo nie działa.',
    ],
  },
  {
    version: '0.15.2',
    date: '2022-11-18',
    title: 'Kolory',
    highlight: ['Początek prac nad edytorem kolorów; w panelu nic się jeszcze nie zmienia.'],
    all: [],
  },
  {
    version: '0.15.1',
    date: '2022-11-18',
    title: 'Hierarchia',
    highlight: [
      'Kategorie znów przestawia się w drzewie, tym razem **przeciągając je myszką**, i nowe miejsce od razu się zapisuje. Obok „Dodaj” w Produktach pojawia się „Dodaj w <kategoria>”, gdy wybrana jest kategoria, a dwa produkty nie mogą już mieć tego samego kodu.',
    ],
    all: [
      {
        label: 'Kategorie i produkty',
        items: [
          'Kategorię przeciąga się w drzewie na nowe miejsce, także pod inną kategorię, i zmiana od razu się zapisuje.',
          'Zniknął napis „Edycja hierarchii chwilowo niedostępna”.',
          '„Dodaj” tworzy produkt bez kategorii, a przy wybranej kategorii obok jest „Dodaj w <kategoria>”.',
          'Zapis produktu z kodem, który już istnieje, pokazuje pod polem „Kod musi być unikalny.”.',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          'Usunięcie kolumny nakładów pyta „Czy na pewno chcesz usunąć tą kolumnę?”.',
          'Zapis ostrzega, że kolumny bez wpisanej ilości zostaną usunięte.',
          'Zapis znakowań nie czeka już sekundy przy każdym znakowaniu.',
          'Pod tabelą znakowań zniknął roboczy podgląd zmian.',
          'Brak ceny znakowania dla danej ilości liczy się jako 0, zamiast psuć wyliczenie.',
        ],
      },
    ],
  },
  {
    version: '0.15.0',
    date: '2022-11-17',
    title: 'Nakłady',
    highlight: [
      'Kolumny nakładów w tabeli znakowań da się teraz układać dowolnie: po najechaniu na nagłówek kolumny pojawiają się strzałki, kosz i „+”, który wstawia nową kolumnę tuż za nią. Zapis ostrzega, gdy ta sama ilość jest wpisana dwa razy, i zostawia tylko pierwszą.',
      'Obok „Zapisz” widać listę znakowań, które się zmieniły. Zapis czeka na razie sekundę przy każdym zmienionym znakowaniu – to celowe, na czas testów.',
    ],
    all: [
      'Po najechaniu na nagłówek kolumny nakładów są strzałki w lewo i w prawo, kosz i „+” wstawiający kolumnę obok.',
      '„+” na końcu tabeli dodaje pustą kolumnę, w której ilość wpisuje się samemu.',
      'Zapis z powtórzoną ilością pyta, czy kontynuować, i zostawia tylko pierwsze wystąpienie.',
      'Obok „Zapisz” jest lista znakowań ze zmianami: kod, typ i nazwa.',
      '„Ryczałt” to pierwsza kolumna z ilością 1, niezależnie od jej miejsca.',
      'Kosz na końcu każdego wiersza zniknął; kolumny usuwa się z nagłówka.',
      'Zapis czeka na razie sekundę przy każdym zmienionym znakowaniu.',
    ],
  },
  {
    version: '0.14.0',
    date: '2022-11-17',
    title: 'Strona startowa panelu',
    highlight: [
      'Strona startowa panelu ma **kafelki do wszystkich sekcji**, w trzech grupach: Produkty, Zawartość i Inne.',
      'Tabelę znakowań w Kalkulacjach można wreszcie **zapisać**, a zapis sam przelicza ceny produktów, które z tych znakowań korzystają. Przeliczanie po zmianie marż odgórnych i widoków znów działa. Pierwsza kolumna nakładów to **„Ryczałt”** – stała opłata, której nie mnoży się przez ilość.',
      '**Uwaga:** strzałki przy kategoriach zniknęły, a przeciąganie, które je zastąpi, jeszcze się nie zapisuje. Do tego czasu kolejności kategorii nie da się zmienić.',
    ],
    all: [
      {
        label: 'Kalkulacje',
        items: [
          'Pod tabelą znakowań są „Anuluj” i „Zapisz”; „Anuluj” pyta „Jesteś pewny? Utracisz wszystkie postępy!”.',
          'Zapis znakowania przelicza ceny wszystkich produktów, które go używają.',
          'Usuwanie znakowania działa: produkty dostają zamiennik albo je tracą, a ich ceny się przeliczają.',
          'Strzałki przy znakowaniach od razu zapisują nową kolejność.',
          'Kolumna z ilością 1 to „Ryczałt”: stała opłata, nie mnożona przez ilość; pierwsze znakowanie firmy dostaje ją od razu.',
          'Przedziały bez wpisanej ceny są pomijane przy liczeniu ceny znakowania.',
          'Transport doliczany jest, gdy wartość produktów jest poniżej progu TP – na razie zawsze 20 zł.',
          '„Dodaj” pod tabelą ma podpis i chowa się, dopóki są niezapisane zmiany.',
          'Firmy są ułożone alfabetycznie, a firma bez znakowań nie pokazuje pustej tabeli.',
          'Pola marż odgórnych mają w środku jednostki % i zł.',
          'Ilości widoku układają się przy zapisie od najmniejszej.',
          'Poprawka: zapis marż odgórnych i widoków znów przelicza ceny produktów, także własne ceny.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Strona startowa ma kafelki do wszystkich sekcji w grupach Produkty, Zawartość i Inne.',
          'Strzałki przy kategoriach zniknęły; pod listą jest napis „Edycja hierarchii chwilowo niedostępna”.',
          'Z edytora produktu zniknął roboczy podgląd zmian i cen.',
        ],
      },
    ],
  },
  {
    version: '0.13.2',
    date: '2022-11-15',
    title: 'Prace nad znakowaniami',
    highlight: [
      'Nic widocznego się nie zmienia: to przygotowanie zapisu tabeli znakowań, którego przycisk pojawia się w 0.14.0.',
    ],
    all: [],
  },
  {
    version: '0.13.1',
    date: '2022-11-15',
    title: 'Porządki',
    highlight: ['Usunięty stary, nieużywany plik; w panelu i na stronie nic się nie zmienia.'],
    all: [],
  },
  {
    version: '0.13.0',
    date: '2022-11-15',
    title: 'Cennik produktu',
    highlight: [
      'Cennik w edytorze produktu jest przebudowany: na górze są **„Pokaż cenę”** i „Promocja”, a pod nimi „Widok”. Wyłączenie „Pokaż cenę” chowa cenę, marże i własne ceny, a wszystkie ceny produktu stają się niewidoczne.',
      'W Kalkulacjach widoki da się wreszcie **zapisać**: nazwę, ilości i nowe widoki. Wyjście z Kalkulacji z niezapisanymi marżami albo widokiem najpierw pyta o potwierdzenie. Przeliczanie produktów po zmianie ilości jeszcze nie działa – wraca w 0.14.0.',
    ],
    all: [
      {
        label: 'Cennik produktu',
        items: [
          '„Pokaż cenę” i „Promocja” są nad polem „Widok”.',
          'Wyłączone „Pokaż cenę” chowa cenę, marże i własne ceny, a ceny produktu przestają być widoczne.',
          'Własne ceny po zmianie widoku zachowują wpisane kwoty dla tych samych ilości, także po powrocie do poprzedniego.',
          'Pola cen i marż nie przyjmują wartości ujemnych.',
          'Pod cennikiem widać na razie roboczy podgląd cen.',
        ],
      },
      {
        label: 'Kalkulacje',
        items: [
          '„Zapisz” przy widoku zapisuje nazwę i ilości, a nowy widok trafia do bazy.',
          'Wyjście z niezapisanymi marżami pyta „Zmiany w marżach nie zostały zapisane. Czy na pewno chcesz opuścić stronę?”.',
          'Wyjście z niezapisanym widokiem też pyta o potwierdzenie, podając jego nazwę i ilości.',
          'Przycisk w oknie usuwania widoku pokazuje „Usuwanie...”.',
          'Pod widokami zniknął roboczy podgląd zmian.',
        ],
      },
      'Kolory, Menu, Strony, Fragmenty i Zapytania pokazują „🚧🚧🚧 W budowie 🚧🚧🚧” z Bobem Budowniczym.',
    ],
  },
  {
    version: '0.12.0',
    date: '2022-11-12',
    title: 'Znakowania',
    highlight: [
      'Znakowania każdej firmy są teraz w **tabeli w Kalkulacjach**: kod, typ, nazwa, przygotowalnia, transport, próg transportu, marża, minimum i ceny dla kolejnych ilości. Można dodawać znakowania i kolumny ilości oraz ustawić domyślne znakowanie, ale **zmian w tabeli nie da się jeszcze zapisać** – to przychodzi w 0.14.0.',
      'W edytorze produktu sekcja „Magazyn” nazywa się **„Warianty”**, a kategorie, warianty, ich zdjęcia, galerię i znakowania można przestawiać strzałkami.',
      '**Uwaga:** w tej wersji przeliczanie cen produktów chwilowo nie działa – zapis marż odgórnych nie zmienia cen, a usuwanie widoku się nie kończy.',
    ],
    all: [
      {
        label: 'Kalkulacje',
        items: [
          'Znakowania każdej firmy są w tabeli: Kod, Typ, Nazwa, P, T, TP, M, MIN i ceny dla ilości.',
          'Skróty P, T, TP, M i MIN mają znak 🛈, a po najechaniu pełną nazwę.',
          'Ilości w nagłówku edytuje się wprost; „+” dodaje kolumnę, a kosz w wierszu usuwa ostatnią.',
          'Przycisk pod tabelą od razu dodaje do bazy nowe znakowanie.',
          'Gwiazdka ustawia znakowanie domyślne i od razu to zapisuje; strzałki zmieniają kolejność bez zapisu.',
          'Kosz otwiera okno z „Znakowanie zastępcze” albo „Bez zamiennika”, ale samo usunięcie jeszcze się nie udaje.',
          'Zmian w tabeli nie da się jeszcze zapisać; pod nią widać roboczy podgląd zmian.',
          'Każdy widok ma własne „Anuluj” i „Zapisz”, ale zapis jeszcze nic nie robi.',
          'Gwiazdka przy widoku od razu zapisuje go jako domyślny.',
          'Usuwanie widoku pyta o „Widok zastępczy” i podpowiada domyślny; nowy, niezapisany widok znika bez pytania.',
          'Uwaga: zapis marż odgórnych nie przelicza cen produktów, a usuwanie widoku się nie kończy.',
        ],
      },
      {
        label: 'Edytor produktu',
        items: [
          'Sekcja „Magazyn” nazywa się „Warianty”.',
          'Kategorie przestawia się strzałkami w górę i w dół; pierwsza, główna, ma przerywaną ramkę.',
          'Warianty, zdjęcia wariantów, galerię i znakowania przestawia się strzałkami w lewo i w prawo.',
          'W wariancie ilość i kolory są nad zdjęciami, a pierwsze zdjęcie ma przerywaną ramkę.',
          '„W galerii” przy zdjęciu wariantu nazywa się „Galeria 🛈”; podpowiedź wyjaśnia, że zdjęcie trafi na koniec galerii.',
          'Kolory wariantu mają opcję „---”, czyli brak koloru.',
          'Przy polach „Cena” i „Ilość” jest ikona API z podpowiedzią „Ta wartość będzie aktualizowana przez API”.',
          'Ilości w „Wykluczeniach” promocji i w widokach są znacznikami, które usuwa się kliknięciem.',
          'Błędna lista ilości pokazuje, co jest nie tak, np. „Wartość nie może być zerem”.',
          'Znakowania na liście wyboru są ułożone według firm, a w firmie w kolejności z Kalkulacji.',
          'Nowa sekcja „Rekomendacje”: na razie tylko informacja, że powstają z kategorii.',
          'Przyciski usuwania w ramkach są samymi ikonami kosza.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Okna z pytaniami zamykają się też kliknięciem obok nich.',
          'Edytor kategorii nie pokazuje już ostrzeżenia o zmianach innego admina.',
        ],
      },
    ],
  },
  {
    version: '0.11.0',
    date: '2022-11-09',
    title: 'Widoki cen',
    highlight: [
      'Zapis **marż odgórnych** w Kalkulacjach sam przelicza ceny wszystkich produktów, które z nich korzystają. Usuwając widok cen, wybiera się w okienku **widok zastępczy** – produkty, które go używały, dostają nowy widok i przeliczone ceny.',
      'Pod zmienionymi widokami pojawiają się „Anuluj” i „Zapisz”, ale sam zapis widoków jeszcze nie działa. Zmiany innych adminów w Kalkulacjach i kategoriach widać od razu, bez odświeżania.',
    ],
    all: [
      'Zapis marż odgórnych przelicza ceny produktów, które ich używają; przycisk pokazuje „Zapisuję...”.',
      'Usuwanie widoku pyta „Jesteś pewny, że chcesz usunąć ten widok?” i pozwala wybrać widok zastępczy.',
      'Produkty z usuniętym widokiem dostają zastępczy, a ich ceny się przeliczają.',
      'Ostatniego widoku nie da się usunąć.',
      'Pod zmienionymi widokami są „Anuluj” i „Zapisz”, ale zapis jeszcze nie działa.',
      'Zmiany innych adminów w firmach, znakowaniach, widokach, marżach, kategoriach i kolorach widać bez odświeżania.',
      'Listy pokazują domyślnie 25 pozycji na stronę.',
      'Do edytora produktu wrócił roboczy podgląd zmian.',
    ],
  },
  {
    version: '0.10.1',
    date: '2022-11-08',
    title: 'Aktualizacje',
    highlight: [
      'Głównie aktualizacje pod spodem, plus dwie drobne poprawki: gwiazdka przy widoku cen działa, a pod pustą listą nie ma już zepsutego obrazka.',
    ],
    all: [
      'Poprawka: gwiazdka ustawia widok cen jako domyślny.',
      'Poprawka: pod napisem „Brak elementów o podanych parametrach” nie ma już zepsutego obrazka.',
      'Lista produktów wczytuje się przy otwarciu raz, a nie dwa razy.',
    ],
  },
  {
    version: '0.10.0',
    date: '2022-11-01',
    title: 'Kalkulacje',
    highlight: [
      'Kalkulacje mają z boku dwie nowe ramki. W **„Globalne marże”** ustawia się marże odgórne na całość i na produkt (marża i minimum) – „Zapisz” pojawia się po zmianie. Ceny produktów jeszcze się po tym nie przeliczają; zmiana trafia do produktu dopiero przy jego zapisie.',
      'W **„Widoki”** widać zestawy ilości, dla których liczone są ceny (np. 100;200), z nazwą, gwiazdką widoku domyślnego i koszem. Na razie można je tylko przeglądać i edytować bez zapisu.',
    ],
    all: [
      'W Kalkulacjach jest ramka „Globalne marże”: „Na całość” i „Na produkt”, każda z marżą i minimum.',
      'Po zmianie marż pojawiają się „Anuluj” i „Zapisz”; zapis nie przelicza jeszcze cen produktów.',
      'Ramka „Widoki” pokazuje widoki cen z nazwą i ilościami; domyślny ma przerywaną ramkę.',
      'Błędna lista ilości w widoku pokazuje „Nieprawidłowa lista”.',
      'Zmiany w widokach jeszcze się nie zapisują.',
      'Pusta lista pokazuje „Brak elementów o podanych parametrach”.',
      '„Anuluj” w edytorze pyta „Na pewno chcesz cofnąć zmiany?”.',
      'Z edytora produktu zniknął roboczy podgląd zmian.',
      'Poprawka: „Dodaj” przy wybranej kategorii znów wpisuje ją do nowego produktu.',
      'Poprawka: wyszukiwanie w kategoriach znajduje też podkategorie.',
      'Zmiana liczby pozycji na stronie w Produktach wraca na pierwszą stronę.',
    ],
  },
  {
    version: '0.9.0',
    date: '2022-10-28',
    title: 'Wyszukiwarka',
    highlight: [
      'Wyszukiwarka nad listą **Produktów** i **Kategorii** działa: wpisz tekst i naciśnij Enter albo lupę. **Ctrl+Q** przenosi od razu do pola wyszukiwania. Wyszukiwanie czyści się, gdy opróżnisz pole albo klikniesz strzałkę obok niego.',
    ],
    all: [
      'Produkty i kategorie wyszukuje się po tekście, np. nazwie lub kodzie, po Enterze albo kliknięciu lupy.',
      'Ctrl+Q przenosi do pola wyszukiwania i zaznacza jego treść; w pustym polu widać podpowiedź „Ctrl+Q”.',
      'Gdy wyszukiwanie jest aktywne, obok pola jest okrągła strzałka, która je czyści.',
      'Wyszukiwanie w kategoriach pokazuje płaską listę bez strzałek do przestawiania.',
      'Wyszukiwany tekst zapisuje się w adresie listy.',
      'Zmiana kategorii w Produktach wraca na pierwszą stronę.',
      'Strzałki stron są wyszarzone na pierwszej i ostatniej stronie.',
    ],
  },
  {
    version: '0.8.0',
    date: '2022-10-26',
    title: 'Stronicowanie',
    highlight: [
      'Lista produktów i biblioteka plików są **podzielone na strony**. Pod listą są numery stron i strzałki, a obok „Na stronie” wybiera się 1, 5, 25, 50 albo 100 pozycji. Numer strony zapisuje się w adresie. Nad listą produktów stoi już pole „Szukaj...”, ale jeszcze nic nie robi.',
    ],
    all: [
      'Pod listą produktów i biblioteką są numery stron, strzałki i wybór „Na stronie”: 1, 5, 25, 50 lub 100.',
      'Lista produktów pokazuje domyślnie 5 pozycji na stronę, biblioteka 25.',
      'Numer strony zapisuje się w adresie, więc odświeżenie nie gubi miejsca.',
      'Nad listą produktów jest pole „Szukaj...”, na razie bez działania.',
      'Wyłączone pola mają kursor zakazu.',
    ],
  },
  {
    version: '0.7.2',
    date: '2022-10-25',
    title: 'Poprawka',
    highlight: ['Produkt z wybranym widokiem cen nie przełącza się już przy otwarciu na widok domyślny.'],
    all: [],
  },
  {
    version: '0.7.1',
    date: '2022-10-24',
    title: 'Poprawka',
    highlight: [
      'Lista produktów nie gubi wybranej kategorii po odświeżeniu strony ani po zmianie zrobionej przez innego admina.',
    ],
    all: [],
  },
  {
    version: '0.7.0',
    date: '2022-10-24',
    title: 'Podkategorie',
    highlight: [
      'Przy każdej kategorii jest **„+”**, który otwiera nową podkategorię od razu w jej wnętrzu. Wszystkie strzałki przestawiania kategorii zapisują się teraz od razu, a kategorii z podkategoriami nie da się usunąć.',
      'Przycisk „Wstecz” w przeglądarce zamyka edytor i wraca do listy. Biblioteka odświeża się sama po wgraniu, podmianie i usunięciu pliku.',
    ],
    all: [
      {
        label: 'Kategorie',
        items: [
          '„+” przy kategorii otwiera nową podkategorię w niej i rozwija rodzica.',
          'Strzałki w prawo, w górę i w dół zapisują się od razu, tak jak w lewo.',
          'Przeniesienie kategorii w prawo, do poprzedniej, rozwija tę poprzednią.',
          'Kategorii z podkategoriami nie da się usunąć; edytor podpowiada, by najpierw je usunąć lub wysunąć.',
          '„Dodaj” tworzy kategorię na końcu najwyższego poziomu.',
          'Przestawienia kategorii widać u innych adminów bez odświeżania.',
        ],
      },
      {
        label: 'Inne',
        items: [
          'Przycisk „Wstecz” w przeglądarce zamyka edytor i wraca do listy.',
          'Wybrana kategoria w Produktach zapisuje się w adresie.',
          'Biblioteka odświeża się sama po wgraniu, podmianie lub usunięciu pliku.',
          'Po podmianie pliku jego podgląd i kafelek wczytują się na nowo.',
          'Uwaga: „Dodaj” przy wybranej kategorii chwilowo nie wpisuje jej do nowego produktu.',
        ],
      },
    ],
  },
  {
    version: '0.6.1',
    date: '2022-10-22',
    title: 'Poprawka',
    highlight: ['Wysunięcie kategorii na najwyższy poziom zapisuje też nową kolejność pozostałych kategorii.'],
    all: [],
  },
  {
    version: '0.6.0',
    date: '2022-10-20',
    title: 'Kolejność kategorii',
    highlight: [
      'Drzewo kategorii układa się według zapisanej kolejności, a **strzałka w lewo** – wysunięcie kategorii poziom wyżej – od razu zapisuje się w bazie. Pozostałe strzałki zapisują się od 0.7.0. Lista kategorii i drzewo przy produktach odświeżają się same, gdy ktoś zapisze lub usunie kategorię.',
    ],
    all: [
      'Kategorie w drzewie są ułożone według zapisanej kolejności.',
      'Strzałka w lewo od razu zapisuje nowe miejsce kategorii; pozostałe strzałki jeszcze nie.',
      'Lista kategorii i drzewo przy produktach odświeżają się po zapisie lub usunięciu kategorii.',
      'Poprawka: edytor kategorii znów ostrzega o zmianach innego admina.',
    ],
  },
  {
    version: '0.5.5',
    date: '2022-10-20',
    title: 'Na żywo',
    highlight: [
      'Lista produktów **odświeża się sama**, gdy inny admin zapisze albo usunie produkt, który na niej widać. Plik z biblioteki otwiera się w takim samym panelu nad listą jak produkty i kategorie.',
    ],
    all: [
      'Lista produktów odświeża się sama, gdy ktoś zapisze lub usunie widoczny na niej produkt.',
      'Plik otwiera się w panelu nad biblioteką; w tytule ma swój identyfikator.',
      'Ostrzeżenie o cudzych zmianach brzmi „Ktoś właśnie wprowadził tu zmiany! Zapisując nadpiszesz je.” i nie pokazuje się po własnym zapisie.',
      'Poprawka: powiadomienia o zmianach znów trafiają do innych adminów.',
    ],
  },
  {
    version: '0.5.4',
    date: '2022-10-18',
    title: 'Sekcje',
    highlight: [
      'Kolory, Menu, Strony, Fragmenty i Zapytania mają już swoje strony, na razie puste, a każda sekcja pokazuje w nagłówku swoją ikonę i nazwę. „Dodaj” w Kategoriach otwiera edytor nowej kategorii.',
    ],
    all: [
      'Kolory, Menu, Strony, Fragmenty i Zapytania otwierają swoje, na razie puste, strony.',
      'Nagłówek każdej sekcji, także Biblioteki, Kalkulacji i API, pokazuje jej ikonę i nazwę.',
      '„Dodaj” w Kategoriach otwiera edytor nowej kategorii zamiast dopisywać wiersz w tabeli.',
      'Na czas testów powiadomienie o zmianie wraca tylko do osoby, która zapisała, więc po zapisie pokazuje się ostrzeżenie o cudzych zmianach.',
    ],
  },
  {
    version: '0.5.3',
    date: '2022-10-18',
    title: 'Tabele',
    highlight: [
      'Kolumny tak/nie w tabelach, np. widoczny i nowość, pokazują ✓ i ✗ zamiast pól wyboru, a kliknięcie w nie otwiera pozycję zamiast przestawiać pole.',
    ],
    all: [
      'Kolumny tak/nie w tabelach pokazują ✓ i ✗ zamiast pól wyboru.',
      'Kliknięcie w taką kolumnę otwiera pozycję, zamiast przestawiać pole bez zapisu.',
      'Edytor nie pokazuje już na chwilę „Podano błędny kod produktu” w trakcie wczytywania.',
      'Pasek edytora zostaje na miejscu przy przewijaniu w bok.',
    ],
  },
  {
    version: '0.5.2',
    date: '2022-10-18',
    title: 'Kategorie',
    highlight: [
      'Kategoria otwiera się w **panelu nad listą kategorii**, tak samo jak produkt, a jej zapis wreszcie trafia tam, gdzie trzeba. Strona startowa panelu pokazuje na razie „Bardzo istotny wykres”.',
    ],
    all: [
      'Kategoria otwiera się w wysuwanym panelu nad listą kategorii.',
      'Poprawka: edytor kategorii znów się otwiera, a zapis zapisuje kategorię, a nie produkt.',
      'Poprawka: ostrzeżenie o zmianach innego admina znów działa w produkcie i kategorii.',
      'Produkt lub kategoria pod błędnym adresem pokazuje „Podano błędny kod produktu” albo „kategorii”.',
      'Nagłówek Dashboardu i Kategorii znów pokazuje ich nazwę, z ikoną.',
      'Strona startowa panelu pokazuje „Bardzo istotny wykres”.',
    ],
  },
  {
    version: '0.5.1',
    date: '2022-10-17',
    title: 'Pasek edytora',
    highlight: [
      'Panel edytora wysuwa się teraz z prawej i ma **własny pasek** z nazwą produktu: strzałka wraca do listy, a po zmianie pojawiają się krzyżyk cofający zmiany i „Zapisz”. Nagłówek panelu pokazuje już tylko ikonę i nazwę sekcji.',
    ],
    all: [
      'Edytor wysuwa się z prawej i zajmuje większość ekranu, a lista zostaje widoczna obok.',
      'Pasek edytora ma ikonę i nazwę produktu („Wczytywanie...” w trakcie wczytywania).',
      'Strzałka w pasku wraca do listy; po zmianie zastępuje ją krzyżyk cofający zmiany.',
      '„Zapisz” wysuwa się w pasku po zmianie i pokazuje „Zapisuję...” w trakcie zapisu.',
      'Nagłówek panelu nie ma już ścieżki ani przycisków; pokazuje ikonę i nazwę sekcji, na razie w Produktach.',
    ],
  },
  {
    version: '0.5.0',
    date: '2022-10-15',
    title: 'Nowy edytor',
    highlight: [
      'Produkt otwiera się teraz w **panelu nad listą produktów**, a nie na osobnej stronie. Lista zostaje pod spodem, przyciemniona, z tym samym przewinięciem i kategorią, a kliknięcie obok panelu zamyka edytor.',
    ],
    all: [
      'Produkt otwiera się w wysuwanym panelu nad listą, a lista zostaje pod spodem.',
      'Kliknięcie w przyciemnione tło obok panelu zamyka edytor.',
      'Otwarcie produktu nie przewija listy na górę.',
      'Gdy nie da się sprawdzić logowania, np. serwer nie odpowiada, panel pokazuje okno logowania.',
    ],
  },
  {
    version: '0.4.8',
    date: '2022-10-15',
    title: 'Ikony',
    highlight: ['Ikony w całym panelu wczytują się dużo szybciej. Poza tym nic się nie zmieniło.'],
    all: [],
  },
  {
    version: '0.4.7',
    date: '2022-10-14',
    title: 'Kategoria',
    highlight: [
      'Kategoria otwiera się teraz na **własnej stronie** w panelu, pod swoim adresem, tak jak produkt – zamiast rozwijać się pod wierszem tabeli.',
      '**Uwaga:** zapis w edytorze kategorii w tej wersji jeszcze nie działa, a przestawień strzałkami na liście kategorii znowu nie da się zapisać.',
    ],
    all: [
      'Kliknięcie kategorii w tabeli otwiera jej edytor pod osobnym adresem, zamiast edytora rozwijanego pod wierszem.',
      'W nagłówku edytora jest nazwa kategorii, a nad nią link „Kategorie” z powrotem do listy.',
      '„Usuń” pyta „Czy na pewno chcesz usunąć kategorię (nazwa)?” i po usunięciu wraca do listy.',
      'Na liście kategorii nie pojawia się już Zapisz, więc przestawień strzałkami na razie nie da się zapisać.',
      'Zapis w edytorze kategorii jeszcze nie działa.',
      'Poprawka: wyszarzone strzałki (np. w górę przy pierwszej kategorii) niczego już nie przestawiają.',
      'Poprawka: „Bezpośredni link” w edytorze kategorii prowadzi pod właściwy adres.',
    ],
  },
  {
    version: '0.4.6',
    date: '2022-10-11',
    title: 'Zapis kategorii',
    highlight: [
      'Na stronie Kategorie działa wreszcie **Zapisz**: zapisuje całe drzewo naraz, ale wysyła tylko te kategorie, które się zmieniły, a nowe dodaje do bazy. Kolejność kategorii na tym samym poziomie jeszcze się nie zapisuje.',
    ],
    all: [
      'Zapisz na stronie Kategorie zapisuje wszystkie zmienione kategorie jednym kliknięciem.',
      'Zapisywane są tylko kategorie, które się zmieniły; nowe, dodane przyciskiem „Dodaj”, trafiają do bazy.',
      'Przeniesienie kategorii strzałkami do innej kategorii nadrzędnej też się zapisuje.',
      'Kolejność kategorii na tym samym poziomie jeszcze się nie zapisuje.',
      'Pod tabelą kategorii widać na razie roboczy podgląd zmian.',
    ],
  },
  {
    version: '0.4.5',
    date: '2022-10-11',
    title: 'Usuwanie kategorii',
    highlight: [
      '„Usuń” w edytorze kategorii zaczyna działać: pyta o potwierdzenie, usuwa kategorię z bazy i od razu zabiera jej wiersz z tabeli. Zapis zmian w kategoriach wciąż jeszcze nie działa.',
    ],
    all: [
      '„Usuń” w edytorze kategorii pyta „Czy na pewno chcesz usunąć ten element?” i usuwa kategorię.',
      'Usunięta kategoria od razu znika z tabeli.',
      'Nową, jeszcze niezapisaną kategorię też można usunąć; po prostu znika z listy.',
      'Ostrzeżenie, że inny admin właśnie zapisał edytowany produkt, w tej wersji przestało się pojawiać.',
    ],
  },
  {
    version: '0.4.4',
    date: '2022-10-11',
    title: 'Zapis kategorii',
    highlight: [
      'Początek prac nad zapisywaniem drzewa kategorii; na razie nic widocznego się nie zmienia, a Zapisz na stronie Kategorie jeszcze nie działa.',
    ],
    all: [],
  },
  {
    version: '0.4.3',
    date: '2022-10-07',
    title: 'Kalkulacje',
    highlight: [
      'Sekcja „Kalkulatory” w menu nazywa się teraz **„Kalkulacje”** i ma już swoją stronę – na razie z samą listą znakowań każdego dostawcy. W Kategoriach działa przycisk „Dodaj”.',
    ],
    all: [
      'Sekcja „Kalkulatory” nazywa się teraz „Kalkulacje”.',
      'Strona Kalkulacje pokazuje znakowania pogrupowane według dostawców: nazwę, kod i typ.',
      '„Dodaj” na stronie Kategorie dopisuje nową, pustą kategorię na końcu drzewa (jeszcze bez zapisu).',
      'Po usunięciu produktu panel czeka, aż produkt naprawdę zniknie z bazy, i dopiero wtedy wraca do listy.',
    ],
  },
  {
    version: '0.4.2',
    date: '2022-10-06',
    title: 'Edycja kategorii',
    highlight: [
      'Kliknięcie kategorii na stronie Kategorie rozwija pod nią **edytor**: widoczność, nazwa, SEO, zdjęcie i opis z podglądem, tak jak w produkcie. Panel zauważa niezapisane zmiany, ale zapisać ich jeszcze się nie da.',
    ],
    all: [
      'Kliknięcie wiersza w tabeli kategorii rozwija pod nim edytor, a drugie kliknięcie go zwija.',
      'W edytorze kategorii są: Widoczny, Nazwa, SEO (Tytuł i Opis), zdjęcie z biblioteki i opis z podglądem obok.',
      'Edytor pokazuje bezpośredni link do kategorii oraz kto i kiedy ją dodał i zaktualizował.',
      'Panel wykrywa niezapisane zmiany w kategoriach, ale zapis jeszcze nie działa.',
      'Przycisk „Usuń” w edytorze kategorii jeszcze nie działa.',
    ],
  },
  {
    version: '0.4.1',
    date: '2022-10-06',
    title: 'Strzałki',
    highlight: [
      'Strzałki na stronie Kategorie działają: przestawiają kategorię w górę i w dół albo przenoszą ją poziom wyżej lub do kategorii nad nią. Zmianę widać tylko na ekranie – jeszcze się nie zapisuje.',
    ],
    all: [],
  },
  {
    version: '0.4.0',
    date: '2022-10-06',
    title: 'Kategorie',
    highlight: [
      'Lista produktów ma z lewej **drzewo kategorii**: kliknięcie kategorii pokazuje tylko jej produkty, a „Dodaj” tworzy nowy produkt od razu w wybranej kategorii. Kategorie z podkategoriami rozwija się strzałką, a ukryte są wyszarzone.',
      'Kategorie mają też własną stronę w menu, z całym drzewem w tabeli i numeracją (1, 1.1, 1.2…). Wszystkie ikony w panelu są nowe, w jednym stylu.',
      'Gdy wychodzisz z edytora z niezapisanymi zmianami, panel najpierw pyta, czy na pewno chcesz opuścić stronę.',
    ],
    all: [
      {
        label: 'Kategorie',
        items: [
          'Obok listy produktów jest drzewo kategorii; kliknięcie kategorii filtruje produkty, a „Wszystkie” pokazuje całość.',
          '„Dodaj” przy wybranej kategorii tworzy produkt, który już jest w tej kategorii.',
          'Nowa strona Kategorie z tabelą całego drzewa, numeracją (1, 1.1, 1.2…), rozwijaniem i datami zmian.',
          'Tabela kategorii ma kolumny strzałek do przestawiania, które jeszcze nie działają.',
          'W edytorze produktu lista kategorii pokazuje ich numerację w drzewie, np. „1.2 Długopisy”.',
        ],
      },
      {
        label: 'Edytor produktu',
        items: [
          'Przed wyjściem z niezapisanymi zmianami panel pyta „Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?”.',
          'Poprawka: po zapisie produkt wczytuje się na nowo, więc kolejny zapis nie dodaje drugi raz świeżo dodanych wariantów, zdjęć i znakowań.',
          'Pola marży mają jednostki (% i zł), a minimum marży odgórnej jest podpisane „min”.',
          'Przycisk „Usuń” produktu jest nad linkiem i datami zmian.',
        ],
      },
      {
        label: 'Wygląd panelu',
        items: [
          'Wszystkie ikony w panelu są nowe, w jednym spójnym stylu.',
          'W tabelach kolumny Dodano i Zaktualizowano pokazują awatar, imię i nazwisko oraz datę w jednej komórce.',
          'Za długi tekst w komórce tabeli rozwija się w całości po najechaniu myszką.',
          'Filtry w bibliotece są pogrupowane na Użycie i Rozszerzenie (JPG, PNG, WEBP, SVG, PDF), ale jeszcze nie filtrują.',
        ],
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2022-09-18',
    title: 'Biblioteka',
    highlight: [
      'Poprawki w bibliotece i cenniku: zaznaczone pliki mają teraz przyciski „Anuluj” i „Usuń”, a **ceny w kalkulacjach uwzględniają wreszcie odgórne marże** – wcześniej je pomijały.',
    ],
    all: [
      'Po zaznaczeniu plików w bibliotece pojawiają się „Anuluj”, który zdejmuje zaznaczenie, i czerwony „Usuń”.',
      'Nad plikami są filtry (Nieużywane, Produkt, Kategoria, Strona, Fragment, Menu), które jeszcze nie działają.',
      'Okno wyboru pliku zaznacza plik, który jest obecnie wybrany, także po zmianie wyboru.',
      'Strona pliku jest podzielona na dwa pola: dane pliku oraz „Usuń” i „Zamień plik”.',
      'Po zamianie pliku podgląd od razu pokazuje nowy plik.',
      'Poprawka: ceny w kalkulacjach uwzględniają odgórne marże na całość i na produkt.',
      'Poprawka: przy znakowaniu „Odgórna marża na znakowanie” pokazuje marżę i minimum tego znakowania.',
      'Okno błędu zamyka się też kliknięciem obok niego.',
      'Pole z linkiem i datami zmian w edytorze produktu nie jest już wyszarzone.',
    ],
  },
  {
    version: '0.3.0',
    date: '2022-09-15',
    title: 'Edytor produktu i Biblioteka',
    highlight: [
      'Kilka miesięcy pracy w jednej wersji. **Edytor produktu** ma już wszystko w jednym miejscu: nazwę, kod, kategorie, SEO, dane z API, opis z podglądem, **Cennik**, **Magazyn** z wariantami kolorów i **Galerię**. Gdy coś zmienisz, w nagłówku pojawia się zielony przycisk **Zapisz**, a strzałka powrotu zmienia się w krzyżyk, który cofa zmiany.',
      'Cennik liczy ceny sam: z ceny zakupu, marż i wybranych znakowań powstaje tabela cen dla ilości z wybranego widoku. Produkt bez znakowań może mieć własną tabelę cen.',
      'W menu jest nowa **Biblioteka plików**: pliki wgrywa się przeciągnięciem, a zdjęcia w edytorach wybiera się prosto z niej. Panel dostał też nowy, granatowy wygląd.',
    ],
    all: [
      {
        label: 'Edytor produktu',
        items: [
          'Produkt edytuje się w jednym oknie: Widoczny, Nowość, Nazwa, Kod, Kategorie, SEO i API (producent, kod, ID).',
          'Adres produktu tworzy się sam z kodu i nazwy; edytor pokazuje go jako „Bezpośredni link”.',
          'Opis pisze się w Markdownie, a obok widać, jak będzie wyglądał.',
          'Edytor pokazuje, kto i kiedy dodał produkt i kto go ostatnio zmienił.',
          'Po zmianach w nagłówku pojawia się Zapisz, a krzyżyk obok cofa wszystkie niezapisane zmiany.',
          'Nowy produkt dodaje się przyciskiem „Dodaj” pod listą produktów.',
          '„Usuń” pyta „Czy na pewno chcesz usunąć produkt?” i wraca do listy.',
          'Gdy inny admin zapisze produkt, który właśnie edytujesz, panel ostrzega, że możesz nadpisać jego zmiany.',
          'Obok pól widać na razie roboczy podgląd zmian.',
        ],
      },
      {
        label: 'Cennik',
        items: [
          'Widok określa, dla jakich ilości liczą się ceny; są też „Pokaż cenę” i „Promocja”.',
          'Produkt ze znakowaniami ma cenę zakupu, cenę promocyjną z wykluczeniami ilości i marże na całość i na produkt, odgórne albo własne.',
          'W Kalkulacjach dodaje się znakowania dostawców; każde ma własną, automatycznie liczoną tabelę cen i marżę.',
          'Powtórzone znakowanie dostaje czerwony napis DUPLIKAT.',
          'Produkt bez włączonych znakowań ma ręczną tabelę cen i opcję „Ceny ze znakowaniem”.',
        ],
      },
      {
        label: 'Magazyn i Galeria',
        items: [
          'Magazyn ma warianty: zdjęcia, ilość, kod koloru w API, dwa kolory i „Wielokolorowe”.',
          'Zdjęcia wariantu można wyłączać i decydować, czy są w galerii.',
          'Galeria to lista zdjęć z biblioteki; pierwsze jest główne i zawsze włączone.',
        ],
      },
      {
        label: 'Biblioteka',
        items: [
          'Nowa sekcja Biblioteka pokazuje 50 ostatnio wgranych plików z miniaturą, typem i rozmiarem.',
          'Pliki wgrywa się, przeciągając je na pole „Przeciągnij lub Wybierz”, albo wybiera z dysku.',
          'Strona pliku pokazuje jego dane i podgląd; można tam plik zamienić na inny albo usunąć.',
          'Ctrl i Shift zaznaczają kilka plików naraz, a „Usuń zaznaczone” usuwa je po potwierdzeniu.',
          'W edytorach zdjęcie wybiera się w oknie biblioteki.',
        ],
      },
      {
        label: 'Wygląd panelu',
        items: [
          'Panel ma nowe kolory: granatowe menu, białe pola z zaokrąglonymi rogami i niebiesko-szare tło kart.',
          'Po najechaniu na ikonę w menu obok kursora pojawia się nazwa sekcji.',
          'Okno błędu zbiera wszystkie nieoczekiwane błędy w panelu, jeden pod drugim.',
          'Okno logowania ma tytuł „Zaloguj się”.',
          'Strona API pokazuje na razie tylko napis „W budowie”.',
        ],
      },
    ],
  },
  {
    version: '0.2.2',
    date: '2022-05-20',
    title: 'Porządki',
    highlight: [
      'Lista produktów znowu pokazuje prawdziwe produkty, a nagłówek z nazwą sekcji jest wspólny dla całego panelu. Pod spodem Directus dostał aktualizację.',
    ],
    all: [
      'Lista produktów znowu pokazuje produkty z bazy, do 100 naraz, z autorami i datami zmian.',
      'Nagłówek zostaje na miejscu przy przechodzeniu między sekcjami, a zmienia się tylko tytuł; w trakcie wczytywania pokazuje „Wczytywanie...”.',
      'Strona API pokazuje ostrzeżenie „Jeśli nie wiesz co robisz, wycofaj się!” – to narzędzia dla programisty.',
      'Pole hasła przy logowaniu ma podpowiedź „Hasło” zamiast „Password”.',
      'Panel i strona używają czcionki Poppins.',
    ],
  },
  {
    version: '0.2.1',
    date: '2022-04-03',
    title: 'Tabela',
    highlight: [
      'Lista produktów przechodzi na wspólną tabelę, na której mają działać wszystkie listy w panelu. W trakcie tej przebudowy chwilowo nie pokazuje produktów.',
    ],
    all: [],
  },
  {
    version: '0.2.0',
    date: '2022-04-01',
    title: 'Pierwszy panel',
    highlight: [
      'Pierwsza wersja **panelu**: logowanie własnym e-mailem i hasłem, boczne menu ze wszystkimi przyszłymi sekcjami i pierwsza lista produktów. Większość sekcji to na razie same ikony w menu, a strona Aktywność melduje tylko: „Cicho tu. Zbyt cicho...”.',
      'Strona dla klientów ma logo, menu i przycisk do panelu; na próbę wyświetla kolory i produkty prosto z bazy.',
    ],
    all: [
      {
        label: 'Panel',
        items: [
          'Do panelu loguje się własnym e-mailem i hasłem.',
          'Boczne menu ma sekcje: Aktywność, Produkty, Kategorie, Kalkulatory, Kolory, Menu, Strony, Fragmenty, Zapytania i API.',
          'Na dole menu są powiadomienia, wylogowanie i awatar, który pokazuje imię i nazwisko.',
          'Lista produktów ma kolumny: widoczny, promocja, nowość, ID, kod, nazwa, daty dodania i edycji oraz autorów; na razie wczytuje tylko jeden produkt.',
          'Kliknięcie produktu otwiera jego stronę z nazwą i surowymi danymi.',
          'Nieoczekiwany błąd pokazuje się w okienku „Wystąpił nieoczekiwany błąd”.',
        ],
      },
      {
        label: 'Strona',
        items: [
          'Strona ma logo, menu (Strona główna, Produkty, Kolory, Slider) i przycisk „Admin panel”.',
          'Strona główna wyświetla listę kolorów z bazy, a Produkty – surowe dane produktów.',
          'Zalogowany admin widzi na stronie swoje imię i nazwisko oraz przycisk „Wyloguj”.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2022-02-27',
    title: 'Start',
    highlight: [
      'Powstaje projekt nowej strony REED i panelu do zarządzania nią. Na razie strona ma tylko nagłówek „Welcome to the jungle”, a panelu jeszcze nie ma.',
    ],
    all: [],
  },
];

export const version = changelog[0].version;

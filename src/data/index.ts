import type {
  Animal,
  ClinicService,
  EventItem,
  Fundraiser,
  Listing,
  Org,
  OrgType,
  Species,
} from "./types";

// ─── Фотографии: проверенные внешние источники ───
// Wikimedia Commons (Special:FilePath) — стабильные реальные фото по имени файла.
// cataas.com — всегда реальный кот; placedog.net — реальная собака по id.
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=640`;

const PHOTO_MAP: Record<string, string> = {
  // животные
  "german,shepherd": "German_Shepherd_Dog.jpg",
  "maine,coon": "Maine_Coon_cat_by_Tomitheos.JPG",
  "jack,russell": "Jack_Russell_Terrier_1.jpg",
  "british,cat": "Cat_November_2010-1a.jpg",
  kitten: "Kitten.jpg",
  "husky,dog": "Siberian-husky.jpg",
  "abyssinian,cat": "cataas",
  "spaniel,dog": "English_Cocker_Spaniel_2.jpg",
  "rabbit,cute": "Oryctolagus_cuniculus_Rcdo.jpg",
  doberman: "Dobermann.jpg",
  "sphynx,cat": "cataas",
  "alabai,dog": "Central_Asian_Shepherd_Dog.jpg",
  "siamese,cat": "Siamese_cat.jpg",
  pug: "Puppy.jpg",
  "guinea,pig": "Cavia_porcellus.jpg",
  // организации
  "shelter,dog": "Golde33443.jpg",
  "cat,shelter": "Cute_grey_kitten.jpg",
  "veterinary,clinic": "Puppy.jpg",
  "veterinary,dog": "placedog",
  "lion,zoo": "Lion.jpg",
  "polar,bear": "Polar_bear.jpg",
  "cat,cute": "cataas",
  // сборы
  "dog,food": "Puppy.jpg",
  "cat,injury": "Kitten.jpg",
  "cat,window": "Six_weeks_old_cat_(aka).jpg",
  "veterinary,surgery": "Felis_catus-cat_on_snow.jpg",
  // события
  "lion,safari": "Lion.jpg",
  "owl,night": "Bubo_bubo.jpg",
  "shelter,people": "Golde33443.jpg",
  "cat,cafe": "Cat_November_2010-1a.jpg",
  "elephant,zoo": "African_Bush_Elephant.jpg",
  // объявления
  "ginger,cat": "cataas",
  "yorkshire,terrier": "Yorkshire_Terrier.jpg",
  "grooming,dog": "placedog",
  kittens: "Kitten.jpg",
};

const photo = (keywords: string, lock: number, w = 640, h = 480) => {
  const mapped = PHOTO_MAP[keywords];
  if (mapped === "cataas") return `https://cataas.com/cat?width=${w}&height=${h}`;
  if (mapped === "placedog") return `https://placedog.net/${w}/${h}?id=${lock % 20}`;
  if (mapped) return commons(mapped);
  return `https://cataas.com/cat?width=${w}&height=${h}`;
};

// ─── Организации ───
export const orgs: Org[] = [
  {
    id: "priut-lapa",
    name: "Приют «Лапа»",
    type: "shelter",
    city: "Москва",
    address: "ул. Полевая, 12",
    description:
      "Приют для собак и кошек с 12-летней историей. Более 400 найденных домашних животных обрели здесь новую семью. Мы верим: у каждого хвостика есть свой человек.",
    phone: "+7 (495) 123-45-67",
    email: "hello@lapa.demo",
    rating: 4.9,
    reviewsCount: 214,
    image: photo("shelter,dog", 11),
    needs: ["Корм", "Одеяла", "Волонтёры", "Лекарства"],
  },
  {
    id: "priut-nadezhda",
    name: "Приют «Надежда»",
    type: "shelter",
    city: "Санкт-Петербург",
    address: "Дорога на Тюрьвину, 7",
    description:
      "Некоммерческий приют для животных, пострадавших от жестокого обращения. Реабилитация, лечение и поиск дома для самых трогательных историй.",
    phone: "+7 (812) 987-65-43",
    email: "info@nadezhda.demo",
    rating: 4.7,
    reviewsCount: 156,
    image: photo("cat,shelter", 12),
    needs: ["Перевязочные материалы", "Корм", "Строительные материалы"],
  },
  {
    id: "clinika-zdorovie",
    name: "Ветклиника «Здоровье»",
    type: "clinic",
    city: "Москва",
    address: "Ленинский проспект, 45",
    description:
      "Круглосуточная ветеринарная клиника с операционной, рентгеном и своей лабораторией. Приём 24/7, вызов врача на дом.",
    phone: "+7 (495) 555-00-11",
    email: "24@zdorovie-vet.demo",
    rating: 4.8,
    reviewsCount: 489,
    image: photo("veterinary,clinic", 13),
    needs: [],
  },
  {
    id: "clinika-barbos",
    name: "Клиника «Барбос»",
    type: "clinic",
    city: "Санкт-Петербург",
    address: "Невский проспект, 88",
    description:
      "Уютная клиника для собак, кошек и экзотических питомцев. Груминг, вакцинация, стоматология и деликатный подход к каждому пациенту.",
    phone: "+7 (812) 222-33-44",
    email: "care@barbos.demo",
    rating: 4.6,
    reviewsCount: 302,
    image: photo("veterinary,dog", 14),
    needs: [],
  },
  {
    id: "zoopark-safari",
    name: "Зоопарк «Сафари»",
    type: "zoo",
    city: "Казань",
    address: "ул. Хади Такташа, 112",
    description:
      "Современный зоопарк с 120 видами животных и ежедневными экскурсиями. Программа разведения редких видов и живой уголок для детей.",
    phone: "+7 (843) 777-88-99",
    email: "visit@safari-zoo.demo",
    rating: 4.8,
    reviewsCount: 1021,
    image: photo("lion,zoo", 15),
    needs: ["Спонсоры экскурсий", "Оборудование"],
  },
  {
    id: "zoopark-severny",
    name: "Зоопарк «Северный»",
    type: "zoo",
    city: "Екатеринбург",
    address: "ул. Малахитовая, 4",
    description:
      "Зоопарк с крупнейшей на Урале коллекцией северных животных: белые медведи, совы, песцы. Ночные экскурсии и зимние программы.",
    phone: "+7 (343) 310-20-30",
    email: "tickets@severny.demo",
    rating: 4.5,
    reviewsCount: 673,
    image: photo("polar,bear", 16),
    needs: ["Холодильное оборудование", "Волонтёры"],
  },
  {
    id: "priut-kotofey",
    name: "Котофей",
    type: "shelter",
    city: "Новосибирск",
    address: "ул. Кошурникова, 29",
    description:
      "Кошачий приют-кафе: здесь можно за чашкой чая познакомиться с 30 котиками, которые ищут дом. Все котики привиты и стерилизованы.",
    phone: "+7 (383) 404-40-40",
    email: "meow@kotofey.demo",
    rating: 5.0,
    reviewsCount: 188,
    image: photo("cat,cute", 17),
    needs: ["Наполнитель", "Корм", "Игрушки"],
  },
];

// ─── Животные ───
export const animals: Animal[] = [
  {
    id: "a1",
    name: "Барон",
    species: "dog",
    breed: "Немецкая овчарка",
    age: 3,
    sex: "male",
    city: "Москва",
    orgId: "priut-lapa",
    description:
      "Верный и умный пёс, обожает играть с мячом и гулять подолгу. Знает базовые команды, отлично ладит с детьми. Идеальный компаньон для активной семьи.",
    image: photo("german,shepherd", 21),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a2",
    name: "Муся",
    species: "cat",
    breed: "Мейн-кун",
    age: 2,
    sex: "female",
    city: "Москва",
    orgId: "priut-lapa",
    description:
      "Большая мягкая кошка с царским характером. Любит сидеть на руках и смотреть в окно. Приучена к лотку и когтеточке.",
    image: photo("maine,coon", 22),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a3",
    name: "Рекс",
    species: "dog",
    breed: "Джек-рассел-терьер",
    age: 1,
    sex: "male",
    city: "Санкт-Петербург",
    orgId: "priut-nadezhda",
    description:
      "Вечный двигатель! Малыш, который превратит вашу жизнь в приключение. Нуждается в активном хозяине и позитивном обучении.",
    image: photo("jack,russell", 23),
    vaccinated: true,
    sterilized: false,
    status: "available",
  },
  {
    id: "a4",
    name: "Соня",
    species: "cat",
    breed: "Британская короткошёрстная",
    age: 4,
    sex: "female",
    city: "Новосибирск",
    orgId: "priut-kotofey",
    description:
      "Тихая и независимая кошка. Сначала присматривается, потом становится лучшим другом. Обожает спать на подоконнике.",
    image: photo("british,cat", 24),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a5",
    name: "Тишка",
    species: "cat",
    breed: "Дворовый котик",
    age: 0.5,
    sex: "male",
    city: "Новосибирск",
    orgId: "priut-kotofey",
    description:
      "Самый маленький и самый храбрый. Спасён с улицы, выкормлен, теперь мурчит круглосуточно. Подходит для семьи с детьми.",
    image: photo("kitten", 25),
    vaccinated: true,
    sterilized: false,
    status: "reserved",
  },
  {
    id: "a6",
    name: "Лайма",
    species: "dog",
    breed: "Лайка",
    age: 5,
    sex: "female",
    city: "Екатеринбург",
    orgId: "priut-lapa",
    description:
      "Рабочая душа: готова гулять подолгу — пешком, на велосипеде, в лесу. Умница, спокойно остаётся одна, знает дом и двор.",
    image: photo("husky,dog", 26),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a7",
    name: "Персик",
    species: "cat",
    breed: "Абиссинская",
    age: 3,
    sex: "male",
    city: "Санкт-Петербург",
    orgId: "priut-nadezhda",
    description:
      "Рыжий непоседа огненного окраса. Разговаривает со всеми, кто готов слушать, и открывает двери. Интеллигент и эрудит.",
    image: photo("abyssinian,cat", 27),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a8",
    name: "Марта",
    species: "dog",
    breed: "Кокер-спаниель",
    age: 2,
    sex: "female",
    city: "Москва",
    orgId: "priut-lapa",
    description:
      "Мягкие уши и мягкое сердце. Очень любит людей, идеально для тех, кто ищет «диванного» друга с умеренной активностью.",
    image: photo("spaniel,dog", 28),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a9",
    name: "Кузя",
    species: "other",
    breed: "Кролик декоративный",
    age: 1,
    sex: "male",
    city: "Новосибирск",
    orgId: "priut-kotofey",
    description:
      "Пухлый ушастик, который ест морковку с достоинством императора. Живёт в вольере, приучен к лотку.",
    image: photo("rabbit,cute", 29),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a10",
    name: "Гроза",
    species: "dog",
    breed: "Доберман",
    age: 4,
    sex: "male",
    city: "Санкт-Петербург",
    orgId: "priut-nadezhda",
    description:
      "Солидный, преданный, отлично дрессируется. Ищет уверенного хозяина, который ценит благородство и дисциплину.",
    image: photo("doberman", 30),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a11",
    name: "Луна",
    species: "cat",
    breed: "Сфинкс",
    age: 2,
    sex: "female",
    city: "Екатеринбург",
    orgId: "priut-kotofey",
    description:
      "Тёплая, как батарея, и нежная, как бархат. Гипоаллергенная порода, обожает тепло и объятия.",
    image: photo("sphynx,cat", 31),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a12",
    name: "Тор",
    species: "dog",
    breed: "Алабай",
    age: 6,
    sex: "male",
    city: "Казань",
    orgId: "priut-lapa",
    description:
      "Спокойный и величественный охранник. Не конфликтный, знает свою территорию. Для частного дома с опытом содержания.",
    image: photo("alabai,dog", 32),
    vaccinated: true,
    sterilized: true,
    status: "reserved",
  },
  {
    id: "a13",
    name: "Искра",
    species: "cat",
    breed: "Сиамская",
    age: 1,
    sex: "female",
    city: "Москва",
    orgId: "priut-lapa",
    description:
      "Голубые глаза и бездонный запас энергии. Игривая, контактная, с её точно не будет скучно.",
    image: photo("siamese,cat", 33),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a14",
    name: "Фунтик",
    species: "dog",
    breed: "Мопс",
    age: 5,
    sex: "male",
    city: "Казань",
    orgId: "priut-lapa",
    description:
      "Хрюкающий философ. Ничего не требует, кроме любви и вечерних прогулок. Маст-хэв для ценителей комедии.",
    image: photo("pug", 34),
    vaccinated: true,
    sterilized: true,
    status: "available",
  },
  {
    id: "a15",
    name: "Буся",
    species: "other",
    breed: "Морская свинка",
    age: 1,
    sex: "female",
    city: "Новосибирск",
    orgId: "priut-kotofey",
    description:
      "Пищит от радости, когда слышит шуршание пакета с овощами. Первый питомец для ребёнка — идеальный вариант.",
    image: photo("guinea,pig", 35),
    vaccinated: false,
    sterilized: false,
    status: "available",
  },
];

// ─── Услуги клиник ───
export const clinicServices: ClinicService[] = [
  { id: "s1", orgId: "clinika-zdorovie", name: "Первичный осмотр", price: 900, description: "Терапевт, общий осмотр, консультация" },
  { id: "s2", orgId: "clinika-zdorovie", name: "Вакцинация комплексная", price: 1800, description: "Импортные вакцины, паспорт животного" },
  { id: "s3", orgId: "clinika-zdorovie", name: "Стерилизация (кошки)", price: 5500, description: "Операция с наркозом и послеоперационным уходом" },
  { id: "s4", orgId: "clinika-zdorovie", name: "УЗИ брюшной полости", price: 2100, description: "Экспертный класс оборудования" },
  { id: "s5", orgId: "clinika-zdorovie", name: "Вызов врача на дом", price: 3000, description: "По Москве в пределах МКАД" },
  { id: "s6", orgId: "clinika-barbos", name: "Груминг (собаки до 10 кг)", price: 2500, description: "Стрижка, когти, уши, купание" },
  { id: "s7", orgId: "clinika-barbos", name: "Чистка зубов ультразвуком", price: 3200, description: "Без наркоза, мягкая фиксация" },
  { id: "s8", orgId: "clinika-barbos", name: "Рентген", price: 1900, description: "Цифровой снимок с расшифровкой" },
  { id: "s9", orgId: "clinika-barbos", name: "Стоматология (удаление зуба)", price: 1700, description: "Под седацией, безболезненно" },
];

// ─── Сборы ───
export const fundraisers: Fundraiser[] = [
  {
    id: "f1",
    orgId: "priut-lapa",
    title: "Зимний корм для 120 собак",
    description:
      "Зима близко: нужно закупить корм на 3 месяца для всех подопечных приюта. Каждая тысяча рублей — это 8 сытных мисок.",
    goal: 300000,
    raised: 187500,
    deadline: "2026-12-01",
    image: photo("dog,food", 41),
  },
  {
    id: "f2",
    orgId: "priut-nadezhda",
    title: "Операция для кота Марсика",
    description:
      "Марсик попал под машину, нужна срочная операция на заднюю лапку. Врачи дают хорошие прогнозы, но счёт большой.",
    goal: 85000,
    raised: 61200,
    deadline: "2026-11-25",
    image: photo("cat,injury", 42),
  },
  {
    id: "f3",
    orgId: "priut-kotofey",
    title: "Новое окно в приют-кафе",
    description:
      "Ремонт панорамного окна: котики просят больше света для важных дел (спать на подоконнике).",
    goal: 120000,
    raised: 42000,
    deadline: "2026-12-15",
    image: photo("cat,window", 43),
  },
  {
    id: "f4",
    orgId: "clinika-zdorovie",
    title: "Бесплатная стерилизация: 50 кошек",
    description:
      "Совместная программа с приютами: стерилизуем 50 кошек из приютов бесплатно. Помогите закрыть счёт за расходные материалы.",
    goal: 250000,
    raised: 230000,
    deadline: "2026-11-30",
    image: photo("veterinary,surgery", 44),
  },
];

// ─── События ───
export const events: EventItem[] = [
  {
    id: "e1",
    orgId: "zoopark-safari",
    title: "Экскурсия «Хищники Африки»",
    date: "2026-11-21",
    city: "Казань",
    description:
      "Полтора часа со смотрителем львов и гиен. Услышите рык в трёх метрах (за стеклом) и узнаете, кто на самом деле глава прайда.",
    price: 700,
    image: photo("lion,safari", 51),
  },
  {
    id: "e2",
    orgId: "zoopark-severny",
    title: "Ночной зоопарк: экскурсия при луне",
    date: "2026-11-28",
    city: "Екатеринбург",
    description:
      "Зоопарк по ночам — совсем другой мир. Фонарики, термос с чаем и совы, которые просыпаются как раз к вашему приходу.",
    price: 1200,
    image: photo("owl,night", 52),
  },
  {
    id: "e3",
    orgId: "priut-lapa",
    title: "День открытых дверей",
    date: "2026-11-22",
    city: "Москва",
    description:
      "Приходите знакомиться с собаками и кошками приюта! Экскурсия, чай с пирогами и, возможно, знакомство, которое изменит вашу жизнь.",
    price: null,
    image: photo("shelter,people", 53),
  },
  {
    id: "e4",
    orgId: "priut-kotofey",
    title: "Котокафе: утро с котятами",
    date: "2026-11-23",
    city: "Новосибирск",
    description:
      "Субботнее утро, круассаны и десять котят, которые решат, что ваш капучино — их территория.",
    price: 500,
    image: photo("cat,cafe", 54),
  },
  {
    id: "e5",
    orgId: "zoopark-safari",
    title: "Мастер-класс «Кто что ест»",
    date: "2026-11-29",
    city: "Казань",
    description:
      "Детский мастер-класс о рационах животных: соберём обед для слона, попугая и черепахи. Для детей от 5 лет.",
    price: 400,
    image: photo("elephant,zoo", 55),
  },
];

// ─── Частные объявления ───
export const listings: Listing[] = [
  {
    id: "l1",
    kind: "rehoming",
    title: "Ищет дом: ласковый кот Рыжик",
    description:
      "Переезжаю за границу, не могу взять с собой. Рыжик — 2 года, кастрирован, приучен к лотку, очень ласковый. Отдаю с переноской и кормом.",
    city: "Москва",
    phone: "+7 (916) 111-22-33",
    date: "2026-11-10",
    image: photo("ginger,cat", 61),
  },
  {
    id: "l2",
    kind: "lost",
    title: "Пропала собака Джек (йоркширский терьер)",
    description:
      "Пропал 9 ноября в районе парка Сокольники. Маленький, в синей жилетке, откликается на «Джек». Вознаграждение гарантируем!",
    city: "Москва",
    phone: "+7 (916) 444-55-66",
    date: "2026-11-09",
    image: photo("yorkshire,terrier", 62),
  },
  {
    id: "l3",
    kind: "found",
    title: "Найдена кошка, сиамского окраса",
    description:
      "Нашли во дворе дома на Профсоюзной, очень худая и испуганная. Отдали в клинику, ищем хозяев. Возможно, кто-то её ищет.",
    city: "Москва",
    phone: "+7 (926) 777-88-99",
    date: "2026-11-11",
  },
  {
    id: "l4",
    kind: "service",
    title: "Выгул собак, район Арбат",
    description:
      "Опытный выгульщик, кинологические курсы. Утро и вечер, отчёт с фото после каждой прогулки. Первая прогулка — бесплатно.",
    city: "Москва",
    phone: "+7 (903) 123-00-11",
    date: "2026-11-08",
  },
  {
    id: "l5",
    kind: "service",
    title: "Груминг на дому (котопес)",
    description:
      "Мобильный груминг-стол, работаю по всему СПб. Стрижка, когти, уши, антистатик. Цены от 1500 ₽.",
    city: "Санкт-Петербург",
    phone: "+7 (921) 555-11-22",
    date: "2026-11-07",
    image: photo("grooming,dog", 63),
  },
  {
    id: "l6",
    kind: "rehoming",
    title: "Передаются 3 котёнка (Москва, октябрь р-н)",
    description:
      "Трое котят 2,5 месяца: два рыжих и одна черепашка. Кушают сами, приучены к лотку. Отдаём в добрые руки с договором.",
    city: "Санкт-Петербург",
    phone: "+7 (911) 909-09-09",
    date: "2026-11-06",
    image: photo("kittens", 64),
  },
];

// ─── Справочники ───
export const cities = Array.from(
  new Set([...orgs.map((o) => o.city), ...animals.map((a) => a.city)])
).sort((a, b) => a.localeCompare(b, "ru"));

export const orgTypeLabels: Record<OrgType, string> = {
  shelter: "Приют",
  zoo: "Зоопарк",
  clinic: "Ветклиника",
};

export const speciesLabels: Record<Species, string> = {
  dog: "Собака",
  cat: "Кошка",
  other: "Другое",
};

export const speciesEmoji: Record<Species, string> = {
  dog: "🐕",
  cat: "🐈",
  other: "🐾",
};

export const statusLabels: Record<Animal["status"], string> = {
  available: "Ищет дом",
  reserved: "Бронь",
  adopted: "Нашёл дом",
};

export const listingKindLabels: Record<Listing["kind"], string> = {
  rehoming: "Ищет дом",
  lost: "Потеряшки",
  found: "Найдены",
  service: "Услуги",
};

export const sexLabels: Record<Animal["sex"], string> = {
  male: "Мальчик",
  female: "Девочка",
};

export const ageLabel = (age: number) => {
  if (age < 1) return "До 1 года";
  const whole = Math.floor(age);
  const last = whole % 10;
  if (whole >= 11 && whole <= 14) return `${whole} лет`;
  if (last === 1) return `${whole} год`;
  if (last >= 2 && last <= 4) return `${whole} года`;
  return `${whole} лет`;
};

// ─── Хелперы ───
export const getOrg = (id: string) => orgs.find((o) => o.id === id);
export const getAnimal = (id: string) => animals.find((a) => a.id === id);
export const getOrgAnimals = (orgId: string) =>
  animals.filter((a) => a.orgId === orgId);
export const getOrgFundraisers = (orgId: string) =>
  fundraisers.filter((f) => f.orgId === orgId);
export const getOrgEvents = (orgId: string) =>
  events.filter((e) => e.orgId === orgId);
export const getOrgServices = (orgId: string) =>
  clinicServices.filter((s) => s.orgId === orgId);

export const byId = <T extends { id: string }>(arr: T[], id: string) =>
  arr.find((x) => x.id === id);

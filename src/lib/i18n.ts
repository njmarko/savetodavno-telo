export type Lang = "sr" | "en";

export type Copy = {
  subtitle: string;
  madeBy: string;
  author: string;
  langToggle: string;
  names: string;
  namesHint: string;
  howMany: string;
  howManyHint: string;
  speed: string;
  speedHint: string;
  mixTime: string;
  mixHint: string;
  physics: string;
  options: string;
  sectionCamera: string;
  sectionSound: string;
  sectionSize: string;
  sectionRods: string;
  sectionWind: string;
  sectionPhysics: string;
  clearAsk: string;
  clearAskHint: string;
  cancel: string;
  cleared: string;
  undo: string;
  ballSize: string;
  ballSizeHint: string;
  machineSize: string;
  machineSizeHint: string;
  cameraHint: string;
  cameraHintTouch: string;
  resetCamera: string;
  rods: string;
  rodsHint: string;
  rodCount: string;
  rodCountHint: string;
  rodSpeed: string;
  rodSpeedHint: string;
  wind: string;
  windHint: string;
  windStrength: string;
  windStrengthHint: string;
  windWidth: string;
  windWidthHint: string;
  windHeight: string;
  windHeightHint: string;
  suction: string;
  suctionHint: string;
  sound: string;
  soundHint: string;
  music: string;
  musicDraw: string;
  musicDrawHint: string;
  musicAlways: string;
  musicAlwaysHint: string;
  musicOff: string;
  musicOffHint: string;
  musicVolume: string;
  musicVolumeHint: string;
  gravity: string;
  gravityHint: string;
  agitation: string;
  agitationHint: string;
  bounce: string;
  bounceHint: string;
  drag: string;
  dragHint: string;
  start: string;
  restart: string;
  clear: string;
  record: string;
  recording: string;
  recordHint: string;
  recordReplayHint: string;
  download: string;
  drawnTitle: string;
  drawnEmpty: string;
  sample: string;
  statusReady: string;
  statusMixing: string;
  statusOpening: string;
  statusExtracting: string;
  statusPresenting: string;
  statusFinale: string;
  statusDone: string;
  unsupported: string;
  exportFailed: string;
  exportSaved: string;
  noWebgl: string;
  tooMany: string;
  drawnWord: string;
  resultTitle: string;
  of: string;
  inDrum: string;
};

const sr: Copy = {
  subtitle: "Извлачење имена из бубња",
  madeBy: "Направио",
  author: "Марко Његомир",
  langToggle: "English",
  names: "Имена",
  namesHint: "Налепите једно име у сваки ред.",
  howMany: "Колико извући",
  howManyHint: "Број имена која ће бити извучена.",
  speed: "Брзина симулације",
  speedHint: "Убрзава или успорава целу симулацију.",
  mixTime: "Мешање пре отварања",
  mixHint: "Секунде док су све лоптице у кугли. Отвор се тек онда отвара и једна испада.",
  physics: "Физика",
  options: "Опције",
  sectionCamera: "Камера",
  sectionSound: "Звук",
  sectionSize: "Величина",
  sectionRods: "Шипке",
  sectionWind: "Ветар",
  sectionPhysics: "Физика",
  clearAsk: "Обрисати списак?",
  clearAskHint: "Имена можеш да вратиш ако је то била грешка.",
  cancel: "Откажи",
  cleared: "Списак је обрисан.",
  undo: "Поништи",
  ballSize: "Величина лоптица",
  ballSizeHint: "Пречник лоптица у кугли.",
  machineSize: "Величина апаратуре",
  machineSizeHint: "Величина кугле, постоља и даске.",
  cameraHint: "Превлачење окреће камеру, точкић зумира, десни тастер или WASD помера.",
  cameraHintTouch: "Један прст окреће бубањ, два прста зумирају.",
  resetCamera: "Ресетуј камеру",
  rods: "Шипке",
  rodsHint: "Шипке се окрећу и ударају лоптице.",
  rodCount: "Број шипки",
  rodCountHint: "Колико шипки стоји на осовини, равномерно распоређених.",
  rodSpeed: "Брзина шипки",
  rodSpeedHint: "Брзина окретања шипки.",
  wind: "Ветар одоздо",
  windHint: "Дува навише кроз решетку и разноси лоптице по кугли.",
  windStrength: "Јачина ветра",
  windStrengthHint: "Колико снажно ваздух диже лоптице.",
  windWidth: "Ширина ветра",
  windWidthHint: "Ширина млаза који излази из решетке.",
  windHeight: "Висина ветра",
  windHeightHint: "До које висине у кугли ветар допире.",
  suction: "Јачина усисавања",
  suctionHint: "Колико јако отвор привлачи прву лоптицу која стигне.",
  sound: "Јачина звука лоптица",
  soundHint: "Јачина удараца. Нула гаси звук.",
  music: "Музика",
  musicDraw: "Само током извлачења",
  musicDrawHint: "Свира само док траје извлачење.",
  musicAlways: "Стално у позадини",
  musicAlwaysHint: "Свира непрекидно, у круг.",
  musicOff: "Искључено",
  musicOffHint: "Музика је искључена.",
  musicVolume: "Јачина музике",
  musicVolumeHint: "Јачина музике, одвојено од звука лоптица.",
  gravity: "Гравитација",
  gravityHint: "Колико снажно лоптице падају.",
  agitation: "Снага мешања",
  agitationHint: "Додатна сила која меша лоптице у кугли.",
  bounce: "Одскок",
  bounceHint: "Колико се одбијају од кугле и једна од друге.",
  drag: "Отпор",
  dragHint: "Отпор ваздуха. Већи број их брже успорава.",
  start: "Почни извлачење",
  restart: "Понови извлачење",
  clear: "Обриши списак",
  record: "Извези MP4",
  recording: "Снимање…",
  recordHint: "Снима цело извлачење, коначан списак и звук према подешавањима, па преузима MP4.",
  recordReplayHint: "Поново пушта последње извлачење, истим редом.",
  download: "Преузми MP4",
  drawnTitle: "Извучена имена",
  drawnEmpty: "Још нико није извучен.",
  sample: "Учитај пример",
  statusReady: "Спремно",
  statusMixing: "Мешање у кугли",
  statusOpening: "Отвор усисава",
  statusExtracting: "Лоптица испада",
  statusPresenting: "Извучено",
  statusFinale: "Резултат",
  statusDone: "Завршено",
  unsupported: "Овај прегледач не уме да сними MP4. Отворите страницу у Chrome-у или Edge-у.",
  exportFailed: "Снимање није успело. Покушајте поново.",
  exportSaved: "Видео је сачуван.",
  noWebgl: "Прегледач није покренуо 3Д приказ.",
  tooMany: "Уписано је само првих 500 имена.",
  drawnWord: "ИЗВУЧЕНО",
  resultTitle: "Извучена имена",
  of: "од",
  inDrum: "У бубњу",
};

const en: Copy = {
  subtitle: "Drawing names from the drum",
  madeBy: "Made by",
  author: "Marko Njegomir",
  langToggle: "Српски",
  names: "Names",
  namesHint: "Paste one name per line.",
  howMany: "How many to draw",
  howManyHint: "How many names will be drawn.",
  speed: "Simulation speed",
  speedHint: "Speeds up or slows down the whole simulation.",
  mixTime: "Spin before opening",
  mixHint: "Seconds all balls stay in the sphere. The hatch then opens and one ball drops out.",
  physics: "Physics",
  options: "Options",
  sectionCamera: "Camera",
  sectionSound: "Sound",
  sectionSize: "Size",
  sectionRods: "Beater bars",
  sectionWind: "Wind",
  sectionPhysics: "Physics",
  clearAsk: "Clear the list?",
  clearAskHint: "You can undo this if it was a mistake.",
  cancel: "Cancel",
  cleared: "List cleared.",
  undo: "Undo",
  ballSize: "Ball size",
  ballSizeHint: "Diameter of the balls in the sphere.",
  machineSize: "Machine size",
  machineSizeHint: "Size of the sphere, pedestal and tray.",
  cameraHint: "Drag orbits the camera, scroll zooms, right-drag or WASD pans.",
  cameraHintTouch: "One finger orbits the drum, two fingers zoom.",
  resetCamera: "Reset camera",
  rods: "Beater bars",
  rodsHint: "The bars spin and strike the balls.",
  rodCount: "Number of bars",
  rodCountHint: "How many bars sit on the axle, spaced evenly.",
  rodSpeed: "Bar speed",
  rodSpeedHint: "How fast the bars rotate.",
  wind: "Wind from below",
  windHint: "Blows up through the grate and carries the balls around the sphere.",
  windStrength: "Wind strength",
  windStrengthHint: "How hard the air lifts the balls.",
  windWidth: "Wind width",
  windWidthHint: "How wide the jet from the grate is.",
  windHeight: "Wind height",
  windHeightHint: "How high in the sphere the wind reaches.",
  suction: "Suction strength",
  suctionHint: "How hard the hatch pulls in the first ball that reaches it.",
  sound: "Ball sound volume",
  soundHint: "Volume of the ball knocks. Zero turns them off.",
  music: "Music",
  musicDraw: "Only while drawing",
  musicDrawHint: "Plays only while a draw is running.",
  musicAlways: "Always in the background",
  musicAlwaysHint: "Plays continuously, looping.",
  musicOff: "Off",
  musicOffHint: "Music is off.",
  musicVolume: "Music volume",
  musicVolumeHint: "Music loudness, separate from the ball sounds.",
  gravity: "Gravity",
  gravityHint: "How hard the balls fall.",
  agitation: "Mixing force",
  agitationHint: "Extra force that stirs the balls in the sphere.",
  bounce: "Bounce",
  bounceHint: "How much they rebound off the cage and each other.",
  drag: "Drag",
  dragHint: "Air resistance. Higher values slow them sooner.",
  start: "Start draw",
  restart: "Restart draw",
  clear: "Clear list",
  record: "Export MP4",
  recording: "Recording…",
  recordHint: "Records the full draw, the final list, and audio according to the sound settings, then downloads an MP4.",
  recordReplayHint: "Replays the last draw in the same order.",
  download: "Download MP4",
  drawnTitle: "Drawn names",
  drawnEmpty: "No one has been drawn yet.",
  sample: "Load sample",
  statusReady: "Ready",
  statusMixing: "Mixing in the sphere",
  statusOpening: "Hatch drawing in",
  statusExtracting: "Ball dropping",
  statusPresenting: "Drawn",
  statusFinale: "Result",
  statusDone: "Finished",
  unsupported: "This browser can't export MP4. Open the page in Chrome or Edge.",
  exportFailed: "Recording failed. Try again.",
  exportSaved: "Video saved.",
  noWebgl: "This browser couldn't start the 3D view.",
  tooMany: "Only the first 500 names were used.",
  drawnWord: "DRAWN",
  resultTitle: "Drawn names",
  of: "of",
  inDrum: "In the drum",
};

export const COPY: Record<Lang, Copy> = { sr, en };

export type HudCopy = {
  kicker: string;
  resultTitle: string;
  of: string;
};

export function hudCopy(lang: Lang): HudCopy {
  const t = COPY[lang];
  return {
    kicker: t.drawnWord,
    resultTitle: t.resultTitle,
    of: t.of,
  };
}

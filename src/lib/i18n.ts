export type Lang = "sr" | "en";

export type Copy = {
  subtitle: string;
  madeBy: string;
  author: string;
  langToggle: string;
  names: string;
  namesHint: string;
  howMany: string;
  speed: string;
  mixTime: string;
  mixHint: string;
  physics: string;
  ballSize: string;
  machineSize: string;
  cameraHint: string;
  resetCamera: string;
  rods: string;
  rodCount: string;
  rodSpeed: string;
  wind: string;
  windStrength: string;
  windWidth: string;
  windHeight: string;
  windHint: string;
  suction: string;
  sound: string;
  gravity: string;
  agitation: string;
  bounce: string;
  drag: string;
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
  speed: "Брзина симулације",
  mixTime: "Мешање пре отварања",
  mixHint: "Секунде док су све лоптице у кугли. Отвор се тек онда отвара и једна испада.",
  physics: "Физика",
  ballSize: "Величина лоптица",
  machineSize: "Величина апаратуре",
  cameraHint: "Превлачење окреће камеру, точкић зумира, десни тастер или WASD помера.",
  resetCamera: "Ресетуј камеру",
  rods: "Шипке",
  rodCount: "Број шипки",
  rodSpeed: "Брзина шипки",
  wind: "Ветар одоздо",
  windStrength: "Јачина ветра",
  windWidth: "Ширина ветра",
  windHeight: "Висина ветра",
  windHint: "Дува навише кроз решетку. Ширина и висина одређују докле стиже.",
  suction: "Јачина усисавања",
  sound: "Јачина звука лоптица",
  gravity: "Гравитација",
  agitation: "Снага мешања",
  bounce: "Одскок",
  drag: "Отпор",
  start: "Почни извлачење",
  restart: "Понови извлачење",
  clear: "Обриши списак",
  record: "Извези MP4",
  recording: "Снимање…",
  recordHint: "Снима цело извлачење и коначан списак, па преузима MP4.",
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
  speed: "Simulation speed",
  mixTime: "Spin before opening",
  mixHint: "Seconds all balls stay in the sphere. The hatch then opens and one ball drops out.",
  physics: "Physics",
  ballSize: "Ball size",
  machineSize: "Machine size",
  cameraHint: "Drag orbits the camera, scroll zooms, right-drag or WASD pans.",
  resetCamera: "Reset camera",
  rods: "Beater bars",
  rodCount: "Number of bars",
  rodSpeed: "Bar speed",
  wind: "Wind from below",
  windStrength: "Wind strength",
  windWidth: "Wind width",
  windHeight: "Wind height",
  windHint: "Blows up through the grate. Width and height set how far it reaches.",
  suction: "Suction strength",
  sound: "Ball sound volume",
  gravity: "Gravity",
  agitation: "Mixing force",
  bounce: "Bounce",
  drag: "Drag",
  start: "Start draw",
  restart: "Restart draw",
  clear: "Clear list",
  record: "Export MP4",
  recording: "Recording…",
  recordHint: "Records the full draw and the final list, then downloads an MP4.",
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

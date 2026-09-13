import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#universe');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030611);
scene.fog = new THREE.FogExp2(0x030611, 0.0036);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.05, 1600);
camera.position.set(0, 20, 39);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 90;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.22;
controls.target.set(0, 0, 0);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const worldPos = new THREE.Vector3();

const dom = {
  hero: document.querySelector('#hero'),
  solarTitle: document.querySelector('#solar-title'),
  sceneEyebrow: document.querySelector('#scene-eyebrow'),
  sceneHeading: document.querySelector('#scene-heading'),
  sceneCopy: document.querySelector('#scene-copy'),
  breadcrumb: document.querySelector('#breadcrumb'),
  infoPanel: document.querySelector('#info-panel'),
  infoName: document.querySelector('#info-name'),
  infoType: document.querySelector('#info-type'),
  infoSubtitle: document.querySelector('#info-subtitle'),
  infoDiameter: document.querySelector('#info-diameter'),
  infoYear: document.querySelector('#info-year'),
  infoFact: document.querySelector('#info-fact'),
  infoDescription: document.querySelector('#info-description'),
  infoDot: document.querySelector('#info-dot'),
  infoSizeLabel: document.querySelector('#info-size-label'),
  infoCycleLabel: document.querySelector('#info-cycle-label'),
  dock: document.querySelector('#planet-dock'),
  planetButtons: document.querySelector('#planet-buttons'),
  galaxyDock: document.querySelector('#galaxy-dock'),
  galaxyButtons: document.querySelector('#galaxy-buttons'),
  labels: document.querySelector('#labels'),
  scaleNote: document.querySelector('#scale-note'),
  hint: document.querySelector('#hint'),
  tourCard: document.querySelector('#tour-card'),
  tourStep: document.querySelector('#tour-step'),
  tourText: document.querySelector('#tour-text'),
  toast: document.querySelector('#toast'),
  searchForm: document.querySelector('#search-form'),
  searchInput: document.querySelector('#search-input'),
  helpDialog: document.querySelector('#help-dialog'),
  narrationBtn: document.querySelector('#narration-btn'),
};

const PLANETS = [
  { id: 'mercury', name: '水星', en: 'Mercury', type: '岩石行星', color: '#a6a29c', radius: 0.22, distance: 3.1, speed: 0.78, diameter: '4,879 km', year: '88 天', fact: '离太阳最近', subtitle: '离太阳最近的小小行星', description: '水星白天非常热，夜晚又会变得非常冷。它绕太阳跑一圈，只需要 88 个地球日。' },
  { id: 'venus', name: '金星', en: 'Venus', type: '岩石行星', color: '#e5b66f', radius: 0.34, distance: 4.35, speed: 0.61, diameter: '12,104 km', year: '225 天', fact: '太阳系最热', subtitle: '被厚厚云层包围的世界', description: '金星和地球差不多大，但它有非常浓厚的大气层，是太阳系中表面最热的行星。' },
  { id: 'earth', name: '地球', en: 'Earth', type: '岩石行星', color: '#4c9dff', radius: 0.38, distance: 5.75, speed: 0.5, diameter: '12,742 km', year: '365 天', fact: '71% 是海洋', subtitle: '我们的蓝色家园', description: '地球是我们生活的家，也是目前唯一确认存在生命的星球。它有一颗天然卫星——月球。' },
  { id: 'mars', name: '火星', en: 'Mars', type: '岩石行星', color: '#c65f43', radius: 0.29, distance: 7.25, speed: 0.41, diameter: '6,779 km', year: '687 天', fact: '有最高的火山', subtitle: '红色的沙漠世界', description: '火星表面有很多含铁的岩石，所以看起来红红的。那里还有太阳系最高的火山——奥林匹斯山。' },
  { id: 'jupiter', name: '木星', en: 'Jupiter', type: '气态巨行星', color: '#d8aa7d', radius: 0.82, distance: 9.7, speed: 0.24, diameter: '139,820 km', year: '11.86 年', fact: '最大的行星', subtitle: '太阳系里的超级大块头', description: '木星是太阳系最大的行星。它的大红斑是一场已经持续很久、比地球还大的巨大风暴。' },
  { id: 'saturn', name: '土星', en: 'Saturn', type: '气态巨行星', color: '#e4cc8c', radius: 0.7, distance: 12.4, speed: 0.18, diameter: '116,460 km', year: '29.5 年', fact: '拥有漂亮光环', subtitle: '戴着冰晶光环的行星', description: '土星最醒目的就是它的光环。这些光环不是一整块，而是由无数冰块、岩石和尘埃组成。' },
  { id: 'uranus', name: '天王星', en: 'Uranus', type: '冰巨行星', color: '#87d6df', radius: 0.51, distance: 15.35, speed: 0.125, diameter: '50,724 km', year: '84 年', fact: '几乎躺着自转', subtitle: '侧着身子旋转的冰巨星', description: '天王星的自转轴倾斜得非常厉害，看起来就像躺在轨道上滚着向前。' },
  { id: 'neptune', name: '海王星', en: 'Neptune', type: '冰巨行星', color: '#4569e8', radius: 0.49, distance: 18.25, speed: 0.1, diameter: '49,244 km', year: '164.8 年', fact: '风速非常惊人', subtitle: '遥远而深蓝的世界', description: '海王星是八大行星中离太阳最远的一颗，那里有太阳系里非常猛烈的风。' },
];

const GALAXIES = [
  {
    id: 'milky-way', name: '银河系', en: 'Milky Way', type: '棒旋星系', color: '#8fb6ff',
    diameter: '约 10 万光年', distance: '我们就在其中', fact: '太阳只是其中一颗恒星', subtitle: '我们的银河家园',
    description: '银河系是一座巨大的恒星城市。太阳系位于银河系的一条较小旋臂附近，而银河系中心藏着超大质量黑洞人马座 A*。',
    narration: '这里是银河系，我们的银河家园。它的直径大约十万光年。太阳只是银河系众多恒星中的一颗，我们的太阳系位于银河系盘面的一处旋臂附近。银河系中心还有一个超大质量黑洞，名字叫做人马座 A 星。',
    style: 'spiral', branches: 5, spin: 0.34, scale: 1, localPos: [-8.2, 1.2, 1.5], localScale: 0.36,
  },
  {
    id: 'andromeda', name: '仙女座星系', en: 'Andromeda', type: '旋涡星系', color: '#c5d5ff',
    diameter: '约 22 万光年', distance: '约 250 万光年', fact: '本星系群最大的成员之一', subtitle: '银河系的大邻居',
    description: '仙女座星系也叫 M31，是离银河系很近的大型旋涡星系。它正在朝银河系方向运动，在非常遥远的未来，两者会发生相互作用。',
    narration: '这是仙女座星系，也叫 M 三十一。它距离我们大约二百五十万光年，是银河系附近非常巨大的旋涡星系。它正在慢慢朝银河系方向运动，不过这种变化要用数十亿年的时间来观察。',
    style: 'spiral', branches: 3, spin: 0.24, scale: 1.22, localPos: [7.6, 2.6, -3.5], localScale: 0.46,
  },
  {
    id: 'triangulum', name: '三角座星系', en: 'Triangulum', type: '旋涡星系', color: '#9bd8ff',
    diameter: '约 6 万光年', distance: '约 270 万光年', fact: '编号 M33', subtitle: '漂亮而较小的旋涡星系',
    description: '三角座星系也叫 M33，是本星系群第三大的主要成员。它比银河系和仙女座星系小，但依然拥有大量恒星和活跃的恒星形成区域。',
    narration: '这是三角座星系，也叫 M 三十三。它距离我们大约二百七十万光年，比银河系和仙女座星系小一些。它里面有很多正在诞生新恒星的区域。',
    style: 'spiral', branches: 3, spin: 0.29, scale: 0.72, localPos: [12.8, -2.1, -7.2], localScale: 0.28,
  },
  {
    id: 'lmc', name: '大麦哲伦云', en: 'Large Magellanic Cloud', type: '矮不规则星系', color: '#d8b7ff',
    diameter: '约 1.4 万光年', distance: '约 16.3 万光年', fact: '南半球肉眼可见', subtitle: '银河系身边的一团星光',
    description: '大麦哲伦云是银河系附近的矮星系，形状不像典型旋涡星系那么整齐。著名的蜘蛛星云就位于这里。',
    narration: '这是大麦哲伦云。它距离银河系很近，大约十六万三千光年。它的形状比较不规则，里面有一个很有名的恒星诞生区域，叫蜘蛛星云。',
    style: 'irregular', scale: 0.42, localPos: [-3.5, -6.3, 2.2], localScale: 0.23,
  },
  {
    id: 'smc', name: '小麦哲伦云', en: 'Small Magellanic Cloud', type: '矮不规则星系', color: '#f0c6ff',
    diameter: '约 7 千光年', distance: '约 20 万光年', fact: '银河系的近邻之一', subtitle: '更小的银河系邻居',
    description: '小麦哲伦云也是银河系附近的矮不规则星系。它和大麦哲伦云彼此接近，并受到银河系引力影响。',
    narration: '这是小麦哲伦云。它距离我们大约二十万光年，是银河系附近一个更小的矮星系。它和大麦哲伦云互相靠近，也会受到银河系巨大引力的影响。',
    style: 'irregular', scale: 0.28, localPos: [-8.3, -7.5, -1.5], localScale: 0.18,
  },
];

const STELLAR_SYSTEMS = [
  {
    id: 'sun-system', name: '太阳', en: 'Sun', type: 'G型主序星', color: '#ffd76f',
    distance: '0 光年', diameter: '约 139 万 km', fact: '我们的恒星', subtitle: '太阳系的中心恒星',
    description: '太阳是一颗典型的黄矮星，八大行星都围绕它运行。它是离我们最近、也最重要的一颗恒星。',
    narration: '这是太阳，我们太阳系的中心恒星。它是一颗黄色的恒星，地球上的阳光和温暖都来自它。',
    galaxyPos: [10.7, 0.2, -8.2], systemType: 'solar',
  },
  {
    id: 'alpha-centauri', name: '半人马座 α', en: 'Alpha Centauri', type: '三星系统', color: '#ffe8c6',
    distance: '约 4.37 光年', diameter: '含 A、B 与比邻星', fact: '离太阳最近的恒星系统', subtitle: '我们最近的恒星邻居',
    description: '半人马座 α 由三颗恒星组成：A、B 两颗主星互相绕圈，更远处的比邻星是离太阳最近的恒星。',
    narration: '这是半人马座阿尔法系统，距离我们大约四点四光年，是离太阳最近的恒星系统。它不是一颗星，而是三颗恒星组成的家族，其中的比邻星离我们最近。',
    galaxyPos: [15.8, 0.15, -1.2], systemType: 'triple',
  },
  {
    id: 'sirius', name: '天狼星', en: 'Sirius', type: '双星系统', color: '#d8ecff',
    distance: '约 8.6 光年', diameter: '主星约为太阳的 1.7 倍', fact: '夜空中最亮的恒星', subtitle: '著名的双星系统',
    description: '天狼星由明亮的天狼星 A 和白矮星天狼星 B 组成。我们肉眼看到的亮星旁边，其实藏着一个小个子伙伴。',
    narration: '这是天狼星系统，距离我们大约八点六光年。它是夜空中最亮的恒星，旁边还藏着一颗白矮星伙伴，所以它是一个双星系统。',
    galaxyPos: [9.6, 0.35, -17.6], systemType: 'binary',
  },
  {
    id: 'epsilon-eridani', name: '波江座 ε', en: 'Epsilon Eridani', type: '年轻行星系统', color: '#ffd0a0',
    distance: '约 10.5 光年', diameter: '约为太阳的 0.7 倍', fact: '年轻的橙色矮星', subtitle: '还在成长中的行星系统',
    description: '波江座 ε 是一颗年轻的橙色矮星。它周围有尘埃盘，也发现了一颗巨型行星，很像还在成长中的太阳系。',
    narration: '这是波江座艾普西隆星，距离我们大约十点五光年。它比太阳年轻很多，周围有尘埃盘和一颗巨大的行星，很像一个还在成长中的太阳系。',
    galaxyPos: [3.4, -0.2, -9.8], systemType: 'young',
  },
  {
    id: 'vega', name: '织女星', en: 'Vega', type: 'A型主序星', color: '#bfe0ff',
    distance: '约 25 光年', diameter: '约为太阳的 2.3 倍', fact: '夏季大三角成员', subtitle: '蓝白色的明亮恒星',
    description: '织女星是一颗明亮的蓝白色恒星，也是夏季大三角的重要成员。它自转得非常快，周围还有尘埃碎屑盘。',
    narration: '这是织女星，距离我们大约二十五光年。它是一颗明亮的蓝白色恒星，也是夏季大三角的一角。',
    galaxyPos: [17.6, 0.25, -12.4], systemType: 'single',
  },
  {
    id: 'trappist-1', name: 'TRAPPIST-1', en: 'TRAPPIST-1', type: '红矮星行星系统', color: '#ff8e7d',
    distance: '约 41 光年', diameter: '恒星只比木星大一点', fact: '拥有 7 颗岩石行星', subtitle: '非常适合宝宝探索的多行星系统',
    description: 'TRAPPIST-1 是一颗很小的超冷红矮星，周围紧紧排列着 7 颗大小接近地球的岩石行星。',
    narration: '这是 TRAPPIST 一号系统，距离我们大约四十一光年。它是一颗很小的红矮星，最特别的是周围有七颗大小接近地球的岩石行星。',
    galaxyPos: [7.2, -0.1, -4.2], systemType: 'trappist',
  },
  {
    id: 'betelgeuse', name: '参宿四', en: 'Betelgeuse', type: '红超巨星', color: '#ff956f',
    distance: '约 640 光年', diameter: '半径约为太阳的 700 倍', fact: '未来会变成超新星', subtitle: '猎户座的红色巨星',
    description: '参宿四位于猎户座的肩膀上，是一颗巨大的红超巨星，体积远远大于太阳，已经进入恒星生命的晚期。',
    narration: '这是参宿四，猎户座肩膀上的红色亮星。它是一颗红超巨星，体积远远超过太阳。它已经进入恒星生命的晚期，未来会以超新星爆发结束一生。',
    galaxyPos: [16.4, 0.55, -16.8], systemType: 'supergiant',
  },
  {
    id: 'kepler-186', name: 'Kepler-186', en: 'Kepler-186', type: '红矮星行星系统', color: '#ff9b78',
    distance: '约 580 光年', diameter: '恒星较小', fact: '拥有宜居带的 Kepler-186f', subtitle: '有宜居带行星的红矮星',
    description: 'Kepler-186 是一颗红矮星，周围发现了五颗行星。其中 Kepler-186f 大小接近地球，还运行在恒星的宜居带附近。',
    narration: '这是开普勒一八六系统，距离我们大约五百八十光年。它的行星开普勒一八六 f 很有名，因为它大小接近地球，还运行在恒星的宜居带附近。',
    galaxyPos: [6.4, 0.4, -12.8], systemType: 'kepler',
  },
];

const STELLAR_BODIES = new Map([
  { id: 'sirius-a', name: '天狼星 A', type: 'A型主序星', color: '#dfeeff', diameter: '约为太阳的 1.7 倍', year: '自转约 5 天', fact: '夜空中最亮的恒星', subtitle: '双星里的明亮主星', description: '天狼星 A 比太阳更大、更热，发出蓝白色的光。我们夜里看到的那颗最亮的星就是它。', narration: '这是天狼星 A，夜空中最亮的恒星。它比太阳更大、更热，发出蓝白色的光芒。' },
  { id: 'sirius-b', name: '天狼星 B', type: '白矮星', color: '#f4f8ff', diameter: '约和地球差不多大', year: '约 1.2 亿岁', fact: '密度非常高的星星', subtitle: '藏在主星旁的小个子', description: '天狼星 B 是一颗白矮星，体积和地球差不多，密度却非常高。它是恒星燃烧完以后留下的核心。', narration: '这是天狼星 B，一颗白矮星。它看起来很小，却特别重，是恒星燃烧完以后留下的核心。' },
  { id: 'alpha-a', name: '半人马座 α A', type: 'G型主序星', color: '#ffe2b1', diameter: '约为太阳的 1.1 倍', year: '和太阳差不多老', fact: '和太阳很像的恒星', subtitle: '三星家族里的大哥', description: '半人马座 α A 是这个三星家族里最大、最亮的一颗，和太阳非常相似。', narration: '这是半人马座阿尔法 A，三星家族里最大最亮的一颗，和太阳很像。' },
  { id: 'alpha-b', name: '半人马座 α B', type: 'K型橙矮星', color: '#ffd2a3', diameter: '约为太阳的 0.9 倍', year: '和太阳差不多老', fact: '橙色的伴星', subtitle: '和大哥互相绕圈', description: '半人马座 α B 是一颗橙色恒星，它和 A 互相绕圈，转一圈要八十多年。', narration: '这是半人马座阿尔法 B，一颗橙色的恒星，它和大哥 A 互相绕圈，转一圈要八十多年。' },
  { id: 'proxima', name: '比邻星', type: '红矮星', color: '#ff8d72', diameter: '约为太阳的 0.14 倍', year: '环绕 A、B 一圈约 55 万年', fact: '离太阳最近的恒星', subtitle: '我们最近的恒星邻居', description: '比邻星是离太阳最近的恒星。它身边有一颗叫比邻星 b 的行星，就位于宜居带附近。', narration: '这是比邻星，离太阳最近的恒星。它旁边还有一颗叫比邻星 b 的行星，就在宜居带附近。' },
  { id: 'epsilon-star', name: '波江座 ε', type: '橙色矮星', color: '#ffc98a', diameter: '约为太阳的 0.7 倍', year: '只有约 8 亿岁', fact: '年轻的橙色矮星', subtitle: '还在成长中的恒星', description: '波江座 ε 比太阳年轻很多，周围还留着一个由尘埃和碎块组成的圆盘，就像小时候的太阳系。', narration: '这是波江座艾普西隆星。它比太阳年轻很多，周围还有尘埃盘，就像小时候的太阳系。' },
  { id: 'epsilon-b', name: '波江座 ε b', type: '巨气态行星', color: '#d8a86f', diameter: '比木星稍大', year: '公转约 6.9 年', fact: '年轻的巨型行星', subtitle: '尘埃盘里的大块头', description: '波江座 ε b 是一颗巨大的气态行星，比木星还要大一点，它就住在恒星周围的尘埃盘里。', narration: '这是波江座艾普西隆 b，一颗巨大的气态行星，比木星还要大一点。' },
  { id: 'vega-star', name: '织女星', type: 'A型主序星', color: '#bfe0ff', diameter: '约为太阳的 2.3 倍', year: '自转约 12.5 小时', fact: '转得飞快的蓝白恒星', subtitle: '夏季大三角成员', description: '织女星比太阳大得多，自转速度非常快，快到把自己变成了一颗扁扁的球。', narration: '这是织女星。它转得非常快，快到把自己变成了一颗扁扁的球。' },
  { id: 'trappist-star', name: 'TRAPPIST-1', type: '超冷红矮星', color: '#ff7d63', diameter: '只比木星大一点', year: '约 76 亿岁', fact: '拥有 7 颗岩石行星', subtitle: '很小的红色恒星', description: 'TRAPPIST-1 是一颗很小的超冷红矮星，虽然个子小，却带着七颗行星。', narration: '这是 TRAPPIST 一号，一颗很小的红色恒星。它虽然个子小，却带着七颗行星。' },
  { id: 'trappist-b', name: 'TRAPPIST-1b', type: '岩石行星', color: '#caa27d', diameter: '约 1.1 倍地球直径', year: '公转约 1.5 地球日', fact: '离恒星最近、最热', subtitle: '一年只有一天半', description: 'TRAPPIST-1b 离恒星最近，转得也最快，它的一年只有一天半。', narration: '这是 TRAPPIST 一号 b，离恒星最近的一颗行星，它的一年只有一天半。' },
  { id: 'trappist-c', name: 'TRAPPIST-1c', type: '岩石行星', color: '#b78a68', diameter: '约 1.1 倍地球直径', year: '公转约 2.4 地球日', fact: '一年只有两天多', subtitle: '第二靠近恒星的行星', description: 'TRAPPIST-1c 是第二靠近恒星的行星，同样热得像烤炉。', narration: '这是 TRAPPIST 一号 c，第二靠近恒星的行星，表面非常热。' },
  { id: 'trappist-d', name: 'TRAPPIST-1d', type: '岩石行星', color: '#9fa8c9', diameter: '约 0.8 倍地球直径', year: '公转约 4 地球日', fact: '家族里的小个子', subtitle: '最小的兄弟姐妹', description: 'TRAPPIST-1d 是七颗行星里最小的之一，但离恒星更近了一步。', narration: '这是 TRAPPIST 一号 d，家族里的小个子。' },
  { id: 'trappist-e', name: 'TRAPPIST-1e', type: '岩石行星', color: '#7fb7ff', diameter: '约 0.9 倍地球直径', year: '公转约 6.1 地球日', fact: '位于宜居带边缘', subtitle: '可能有大片海洋', description: 'TRAPPIST-1e 的大小和地球很接近，还位于宜居带边缘，科学家觉得它可能有大片海洋。', narration: '这是 TRAPPIST 一号 e，它和地球差不多大，还在宜居带边缘，可能有大海。' },
  { id: 'trappist-f', name: 'TRAPPIST-1f', type: '岩石行星', color: '#8fd0b0', diameter: '约 1.0 倍地球直径', year: '公转约 9.2 地球日', fact: '位于宜居带', subtitle: '温度刚刚好的行星', description: 'TRAPPIST-1f 运行在宜居带里，这里的温度不冷不热，理论上可以留住液态水。', narration: '这是 TRAPPIST 一号 f，它住在宜居带里，温度不冷不热，也许能有液态水。' },
  { id: 'trappist-g', name: 'TRAPPIST-1g', type: '岩石行星', color: '#caa27d', diameter: '约 1.1 倍地球直径', year: '公转约 12.4 地球日', fact: '也位于宜居带', subtitle: '宜居带里的大个子', description: 'TRAPPIST-1g 是七颗行星里比较大的一个，同样位于宜居带中。', narration: '这是 TRAPPIST 一号 g，家族里的大个子，也住在宜居带里。' },
  { id: 'trappist-h', name: 'TRAPPIST-1h', type: '岩石行星', color: '#9fa8c9', diameter: '约 0.8 倍地球直径', year: '公转约 18.4 地球日', fact: '离恒星最远', subtitle: '最外面的小行星', description: 'TRAPPIST-1h 离恒星最远，也是七颗行星里最冷的一个。', narration: '这是 TRAPPIST 一号 h，离恒星最远，也是最冷的一个。' },
  { id: 'betelgeuse-star', name: '参宿四', type: '红超巨星', color: '#ff956f', diameter: '半径约为太阳的 700 倍', year: '已进入恒星晚年', fact: '未来会变成超新星', subtitle: '猎户座的红色巨星', description: '参宿四大到如果放在太阳的位置，表面可能延伸到木星轨道附近。它最终会以超新星爆发结束一生。', narration: '这是参宿四。它非常大，如果放到太阳的位置，可能会延伸到木星轨道附近。未来它会变成一颗超新星。' },
  { id: 'kepler-star', name: 'Kepler-186', type: '红矮星', color: '#ff9b78', diameter: '约为太阳的一半', year: '约 40 亿岁', fact: '带着五颗行星', subtitle: '安静的红色恒星', description: 'Kepler-186 是一颗安静的红矮星，周围带着五颗行星。', narration: '这是开普勒一八六，一颗安静的红矮星，周围带着五颗行星。' },
  { id: 'kepler-b', name: 'Kepler-186b', type: '岩石行星', color: '#caa27d', diameter: '约 1.1 倍地球直径', year: '公转约 3.9 地球日', fact: '离恒星最近', subtitle: '最内侧的行星', description: 'Kepler-186b 是最靠近恒星的行星，一年不到四天。', narration: '这是开普勒一八六 b，最靠近恒星的行星。' },
  { id: 'kepler-c', name: 'Kepler-186c', type: '岩石行星', color: '#b78a68', diameter: '约 1.2 倍地球直径', year: '公转约 7.3 地球日', fact: '转得很快', subtitle: '第二颗行星', description: 'Kepler-186c 绕恒星一圈只要七天多。', narration: '这是开普勒一八六 c，它的一年只有七天多。' },
  { id: 'kepler-d', name: 'Kepler-186d', type: '岩石行星', color: '#9fa8c9', diameter: '约 1.4 倍地球直径', year: '公转约 13 地球日', fact: '家族里的大个子', subtitle: '第三颗行星', description: 'Kepler-186d 是这个家族里比较大的一颗行星。', narration: '这是开普勒一八六 d，家族里比较大的一颗。' },
  { id: 'kepler-e', name: 'Kepler-186e', type: '岩石行星', color: '#b78a68', diameter: '约 1.3 倍地球直径', year: '公转约 22.4 地球日', fact: '接近宜居带边缘', subtitle: '第四颗行星', description: 'Kepler-186e 的轨道已经接近宜居带的边缘。', narration: '这是开普勒一八六 e，它的轨道接近宜居带边缘。' },
  { id: 'kepler-f', name: 'Kepler-186f', type: '岩石行星', color: '#8fd0b0', diameter: '约 1.2 倍地球直径', year: '公转约 130 地球日', fact: '著名的宜居带行星', subtitle: '大小接近地球的宜居带行星', description: 'Kepler-186f 是最早发现的大小接近地球、又位于宜居带的系外行星之一，非常有名。', narration: '这是开普勒一八六 f，它非常有名，因为它大小接近地球，还运行在恒星的宜居带里。' },
].map((b) => [b.id, b]));

const INFO = {
  sun: { id: 'sun', name: '太阳', type: '恒星', color: '#ffd76f', diameter: '139 万 km', year: '约 2.25 亿年绕银河一圈', fact: '太阳系的能量来源', subtitle: '我们的恒星', description: '太阳是一颗恒星。它占了太阳系绝大部分质量，八大行星都在引力作用下围绕它运行。' },
  moon: { id: 'moon', name: '月球', type: '天然卫星', color: '#cfd6df', diameter: '3,475 km', year: '27.3 天绕地球一圈', fact: '距离约 38 万 km', subtitle: '地球唯一的天然卫星', description: '月球陪伴着地球，也会影响地球上的潮汐。人类已经真的登上过月球。' },
  blackhole: { id: 'blackhole', name: '人马座 A*', type: '超大质量黑洞', color: '#bd91ff', diameter: '事件视界约 2,400 万 km', year: '位于银河系中心', fact: '约 400 万个太阳质量', subtitle: '藏在银河系中心的黑洞', description: '人马座 A* 位于银河系中心。黑洞本身不会发光，我们通常通过周围高速运动、被加热的物质来发现它。', narration: '这是人马座 A 星，位于银河系中心。它是一个超大质量黑洞，质量大约相当于四百万个太阳。黑洞本身不发光，科学家会观察周围高速运动的恒星和炽热物质，来研究它。' },
};

const state = {
  level: 'local-group',
  selectedGalaxy: null,
  selected: null,
  currentInfo: null,
  currentStellarId: null,
  tweenToken: 0,
  touring: false,
  sound: false,
  speaking: false,
};

function randomNormalish() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

function makeSimpleGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.08, 'rgba(177,219,255,.95)');
  g.addColorStop(0.28, 'rgba(99,139,255,.42)');
  g.addColorStop(1, 'rgba(54,61,180,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const glowTexture = makeSimpleGlowTexture();

function addBackgroundStars() {
  const count = 4200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = 180 + Math.random() * 620;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    c.set(Math.random() > 0.86 ? 0xa9c8ff : Math.random() > 0.88 ? 0xffe0bb : 0xffffff);
    const intensity = 0.45 + Math.random() * 0.55;
    colors[i * 3] = c.r * intensity;
    colors[i * 3 + 1] = c.g * intensity;
    colors[i * 3 + 2] = c.b * intensity;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.38, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false })));
}
addBackgroundStars();

function makeGalaxyPoints(data, count = 12000, radius = 22) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  const center = new THREE.Color('#fff0ca');
  const arm = new THREE.Color(data.color || '#8fb6ff');
  const edge = new THREE.Color('#765ab7');

  for (let i = 0; i < count; i++) {
    if (data.style === 'irregular') {
      const r = Math.pow(Math.random(), 0.7) * radius;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r * (0.85 + Math.random() * 0.5) + randomNormalish() * radius * 0.18;
      positions[i * 3 + 1] = randomNormalish() * radius * 0.18;
      positions[i * 3 + 2] = Math.sin(a) * r * 0.64 + randomNormalish() * radius * 0.18;
      color.copy(arm).lerp(center, Math.max(0, 1 - r / radius) * 0.5);
    } else {
      const normalized = Math.pow(Math.random(), 0.62);
      const r = normalized * radius;
      const branch = i % (data.branches || 4);
      const branchAngle = (branch / (data.branches || 4)) * Math.PI * 2;
      const spin = r * (data.spin || 0.3);
      const scatter = (0.28 + r * 0.035) * randomNormalish();
      const angle = branchAngle + spin + scatter;
      const coreBias = Math.random() < 0.18 ? Math.pow(Math.random(), 2) * radius * 0.25 : r;
      const rr = Math.random() < 0.18 ? coreBias : r;
      positions[i * 3] = Math.cos(angle) * rr + randomNormalish() * (0.18 + rr * 0.02);
      positions[i * 3 + 1] = randomNormalish() * (1.05 - Math.min(rr / (radius * 1.15), 0.86)) * 0.9;
      positions[i * 3 + 2] = Math.sin(angle) * rr + randomNormalish() * (0.18 + rr * 0.02);
      if (rr < radius * 0.2) color.copy(center).lerp(arm, rr / (radius * 0.24));
      else color.copy(arm).lerp(edge, Math.max(0, (rr - radius * 0.35) / radius));
    }
    const flicker = 0.62 + Math.random() * 0.5;
    colors[i * 3] = color.r * flicker;
    colors[i * 3 + 1] = color.g * flicker;
    colors[i * 3 + 2] = color.b * flicker;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.13, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.94, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function buildGalaxyVisual(data, { count = 12000, radius = 22 } = {}) {
  const group = new THREE.Group();
  const stars = makeGalaxyPoints(data, count, radius);
  group.add(stars);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: data.color, transparent: true, opacity: 0.68, depthWrite: false, blending: THREE.AdditiveBlending }));
  core.scale.set(radius * 0.34, radius * 0.28, 1);
  group.add(core);
  if (data.style !== 'irregular') {
    const haze = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: data.color, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending }));
    haze.scale.set(radius * 1.35, radius * 0.9, 1);
    group.add(haze);
  }
  return group;
}

const localGroup = new THREE.Group();
scene.add(localGroup);
const localGalaxyTargets = [];
const localGalaxyObjects = new Map();

GALAXIES.forEach((data) => {
  const wrapper = new THREE.Group();
  const visual = buildGalaxyVisual(data, { count: data.style === 'irregular' ? 1900 : 3400, radius: 10 });
  visual.scale.setScalar(data.localScale);
  visual.rotation.x = data.id === 'andromeda' ? -0.9 : -0.52;
  visual.rotation.z = data.id === 'triangulum' ? 0.4 : data.id === 'andromeda' ? -0.25 : 0.12;
  wrapper.add(visual);
  wrapper.position.set(...data.localPos);
  const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(1.25, data.localScale * 10), 20, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hit.userData.kind = 'local-galaxy';
  hit.userData.id = data.id;
  wrapper.add(hit);
  localGroup.add(wrapper);
  localGalaxyTargets.push(hit);
  localGalaxyObjects.set(data.id, { wrapper, visual, hit, data });
});

const galaxyGroup = new THREE.Group();
galaxyGroup.rotation.x = -0.34;
galaxyGroup.rotation.z = 0.08;
galaxyGroup.visible = false;
scene.add(galaxyGroup);
const milkyData = GALAXIES[0];
galaxyGroup.add(makeGalaxyPoints(milkyData, 22000, 27));
const milkyCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd5a0, transparent: true, opacity: 0.76, depthWrite: false, blending: THREE.AdditiveBlending }));
milkyCore.scale.set(8.5, 8.5, 1);
galaxyGroup.add(milkyCore);
const milkyHaze = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x6b70ff, transparent: true, opacity: 0.23, depthWrite: false, blending: THREE.AdditiveBlending }));
milkyHaze.scale.set(31, 21, 1);
galaxyGroup.add(milkyHaze);

const stellarMarkers = new Map();
const galaxyClickable = [];

function createGalaxySystemMarkers() {
  STELLAR_SYSTEMS.forEach((item, index) => {
    const group = new THREE.Group();
    group.position.set(...item.galaxyPos);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(item.id === 'sun-system' ? 0.34 : 0.24, 20, 16),
      new THREE.MeshBasicMaterial({ color: item.color })
    );
    dot.userData = { kind: 'stellar-entry', id: item.id };
    group.add(dot);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: item.color, transparent: true, opacity: 0.78, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(1.9, 1.9, 1);
    glow.userData = dot.userData;
    dot.add(glow);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(item.id === 'sun-system' ? 0.62 : 0.46, item.id === 'sun-system' ? 0.69 : 0.53, 48),
      new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    galaxyGroup.add(group);
    galaxyClickable.push(dot, glow);
    stellarMarkers.set(item.id, { group, dot, ring, glow, data: item, phase: index * 0.7, baseGlow: 0.72 });
  });
}

const blackHoleGroup = new THREE.Group();
const blackSphere = new THREE.Mesh(new THREE.SphereGeometry(0.56, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
blackSphere.userData.kind = 'blackhole';
blackHoleGroup.add(blackSphere);
const disk = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.75, 96), new THREE.MeshBasicMaterial({ color: 0xb681ff, side: THREE.DoubleSide, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }));
disk.rotation.x = Math.PI / 2.35;
blackHoleGroup.add(disk);
blackHoleGroup.scale.setScalar(0.42);
galaxyGroup.add(blackHoleGroup);
galaxyClickable.push(blackSphere);

const otherGalaxyGroup = new THREE.Group();
otherGalaxyGroup.visible = false;
scene.add(otherGalaxyGroup);
let otherGalaxyVisual = null;

function loadOtherGalaxy(data) {
  otherGalaxyGroup.clear();
  otherGalaxyVisual = buildGalaxyVisual(data, { count: data.style === 'irregular' ? 9000 : 18000, radius: 25 * data.scale });
  otherGalaxyVisual.rotation.x = data.id === 'andromeda' ? -0.86 : -0.42;
  otherGalaxyVisual.rotation.z = data.id === 'triangulum' ? 0.3 : 0.08;
  otherGalaxyGroup.add(otherGalaxyVisual);
}

const solarGroup = new THREE.Group();
solarGroup.visible = false;
scene.add(solarGroup);
scene.add(new THREE.AmbientLight(0x5271a9, 0.36));

const stellarSystemGroup = new THREE.Group();
stellarSystemGroup.visible = false;
scene.add(stellarSystemGroup);
const stellarLight = new THREE.PointLight(0xffe2c4, 30, 90, 1.5);
const stellarBodiesClickable = [];
const stellarBodyObjects = new Map();
const stellarGlowSprites = [];
const sunLight = new THREE.PointLight(0xffe4af, 34, 80, 1.5);
solarGroup.add(sunLight);
const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1.55, 64, 48), new THREE.MeshBasicMaterial({ color: 0xffb43f }));
sunMesh.userData.kind = 'sun';
solarGroup.add(sunMesh);
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffb347, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
sunGlow.scale.set(6.4, 6.4, 1);
sunMesh.add(sunGlow);

const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x5e719e, transparent: true, opacity: 0.18 });
const planetObjects = new Map();
const clickable = [sunMesh];
let moonMesh = null;

function createOrbit(radius) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  solarGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial.clone()));
}

function createSolarSystem() {
  PLANETS.forEach((data, index) => {
    createOrbit(data.distance);
    const group = new THREE.Group();
    group.userData.angle = index * 0.83 + 0.6;
    group.userData.speed = data.speed;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 42, 28), new THREE.MeshStandardMaterial({ color: data.color, roughness: data.id === 'earth' ? 0.64 : 0.8, metalness: 0.02 }));
    mesh.userData.kind = 'planet';
    mesh.userData.id = data.id;
    group.add(mesh);
    if (data.id === 'earth') {
      const oceanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x5eafff, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
      oceanGlow.scale.set(1.35, 1.35, 1);
      mesh.add(oceanGlow);
      const moonPivot = new THREE.Group();
      group.add(moonPivot);
      moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 16), new THREE.MeshStandardMaterial({ color: 0xcbd0d8, roughness: 1 }));
      moonMesh.position.set(0.9, 0, 0);
      moonMesh.userData.kind = 'moon';
      moonPivot.add(moonMesh);
      group.userData.moonPivot = moonPivot;
      clickable.push(moonMesh);
    }
    if (data.id === 'saturn') {
      const ring = new THREE.Mesh(new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.05, 72), new THREE.MeshStandardMaterial({ color: 0xcdbf99, side: THREE.DoubleSide, transparent: true, opacity: 0.68, roughness: 0.9 }));
      ring.rotation.x = Math.PI / 2.28;
      mesh.add(ring);
    }
    group.position.set(Math.cos(group.userData.angle) * data.distance, 0, Math.sin(group.userData.angle) * data.distance);
    solarGroup.add(group);
    planetObjects.set(data.id, { data, group, mesh });
    clickable.push(mesh);
  });
}
createSolarSystem();

const labelEntries = [];
function createLabel(text, anchor, scope, className = '') {
  const el = document.createElement('div');
  el.className = `space-label ${className}`;
  el.textContent = text;
  dom.labels.appendChild(el);
  labelEntries.push({ el, anchor, scope });
}
GALAXIES.forEach((g) => createLabel(g.name, localGalaxyObjects.get(g.id).hit, 'local', g.id === 'milky-way' ? 'earth-label' : ''));
createGalaxySystemMarkers();
STELLAR_SYSTEMS.forEach((item) => {
  const marker = stellarMarkers.get(item.id);
  createLabel(item.id === 'sun-system' ? '太阳 · 我们在这里' : item.name, marker.dot, 'milky', item.id === 'sun-system' ? 'sun-label' : 'stellar-label');
});
createLabel('人马座 A*', blackSphere, 'milky', 'blackhole-label');
PLANETS.forEach((p) => createLabel(p.name, planetObjects.get(p.id).mesh, 'solar', p.id === 'earth' ? 'earth-label' : ''));
createLabel('太阳', sunMesh, 'solar', 'sun-label');
createLabel('月球', moonMesh, 'solar');

function updateLabels() {
  labelEntries.forEach((entry) => {
    const visible = (state.level === 'local-group' && entry.scope === 'local') ||
      (state.level === 'galaxy' && state.selectedGalaxy === 'milky-way' && entry.scope === 'milky') ||
      (state.level === 'stellar' && entry.scope === 'stellar-scene') ||
      ((state.level === 'solar' || state.level === 'planet') && entry.scope === 'solar');
    if (!visible || !entry.anchor.visible) { entry.el.style.display = 'none'; return; }
    entry.anchor.getWorldPosition(worldPos);
    worldPos.project(camera);
    if (worldPos.z > 1 || Math.abs(worldPos.x) > 1.2 || Math.abs(worldPos.y) > 1.2) { entry.el.style.display = 'none'; return; }
    entry.el.style.display = 'block';
    entry.el.style.left = `${(worldPos.x * 0.5 + 0.5) * window.innerWidth}px`;
    entry.el.style.top = `${(-worldPos.y * 0.5 + 0.5) * window.innerHeight - 18}px`;
    entry.el.style.opacity = Math.max(0.28, Math.min(0.95, 1 - Math.max(0, worldPos.z) * 0.45));
  });
}

function buildPlanetDock() {
  PLANETS.forEach((planet) => {
    const button = document.createElement('button');
    button.className = 'planet-btn';
    button.dataset.id = planet.id;
    button.innerHTML = `<span style="background:${planet.color}"></span><small>${planet.name}</small>`;
    button.addEventListener('click', () => flyToPlanet(planet.id));
    dom.planetButtons.appendChild(button);
  });
}
function buildGalaxyDock() {
  GALAXIES.forEach((galaxy) => {
    const button = document.createElement('button');
    button.className = 'planet-btn';
    button.dataset.id = galaxy.id;
    button.innerHTML = `<span style="background:${galaxy.color}"></span><small>${galaxy.name}</small>`;
    button.addEventListener('click', () => enterGalaxy(galaxy.id));
    dom.galaxyButtons.appendChild(button);
  });
}
buildPlanetDock();
buildGalaxyDock();

function setBreadcrumb(level, selectedName = '星球') {
  const buttons = [...dom.breadcrumb.querySelectorAll('button')];
  buttons.forEach((b) => { b.disabled = true; b.classList.remove('active'); });
  buttons[0].disabled = false;
  if (level === 'local-group') { buttons[0].classList.add('active'); return; }
  buttons[1].disabled = false;
  buttons[1].textContent = level === 'galaxy' ? (GALAXIES.find((g) => g.id === state.selectedGalaxy)?.name || '银河系') : '银河系';
  if (level === 'galaxy') { buttons[1].classList.add('active'); return; }
  buttons[2].disabled = false;
  buttons[2].textContent = level === 'stellar' ? (selectedName || '恒星系统') : '太阳';
  if (level === 'stellar') { buttons[2].classList.add('active'); return; }
  buttons[3].disabled = false;
  if (level === 'solar') { buttons[3].classList.add('active'); return; }
  buttons[4].disabled = false;
  buttons[4].textContent = selectedName;
  buttons[4].classList.add('active');
}

function setSceneTitle(eyebrow, heading, copy) {
  dom.sceneEyebrow.textContent = eyebrow;
  dom.sceneHeading.textContent = heading;
  dom.sceneCopy.textContent = copy;
}

function setLevel(level, selectedName) {
  state.level = level;
  setBreadcrumb(level, selectedName);
  const inLocal = level === 'local-group';
  const inGalaxy = level === 'galaxy';
  const inMilky = inGalaxy && state.selectedGalaxy === 'milky-way';
  localGroup.visible = inLocal;
  galaxyGroup.visible = inMilky;
  otherGalaxyGroup.visible = inGalaxy && !inMilky;
  stellarSystemGroup.visible = level === 'stellar';
  solarGroup.visible = level === 'solar' || level === 'planet';
  dom.hero.classList.toggle('hidden-state', !inLocal);
  dom.galaxyDock.classList.toggle('hidden', !(inLocal || inGalaxy));
  dom.dock.classList.toggle('hidden', !(level === 'solar' || level === 'planet'));
  dom.solarTitle.classList.toggle('hidden', !(inGalaxy || level === 'solar' || level === 'stellar'));
  if (inGalaxy) {
    const g = GALAXIES.find((item) => item.id === state.selectedGalaxy);
    setSceneTitle('NOW EXPLORING', g.name, g.id === 'milky-way' ? '继续寻找太阳，或者先看看银河系中心的黑洞。' : '拖动观察它的整体结构，点击“听讲解”认识这个银河邻居。');
  } else if (level === 'solar') {
    setSceneTitle('WELCOME TO', '太阳系', '八颗行星围绕太阳运行，点一点你最喜欢的星球。');
  } else if (level === 'stellar') {
    setSceneTitle('WELCOME TO', selectedName || '恒星系统', '这是银河系里另一处恒星家园，点一点里面的恒星和行星。');
  }
  dom.hint.style.opacity = inLocal || inGalaxy ? '1' : '.65';
  controls.minDistance = inLocal ? 6 : inGalaxy ? 3 : level === 'stellar' ? 1.3 : 1.15;
  controls.maxDistance = inLocal ? 95 : inGalaxy ? 88 : level === 'stellar' ? 42 : 46;
}

function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function tweenCamera(position, target, duration = 1300) {
  const token = ++state.tweenToken;
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const start = performance.now();
  controls.enabled = false;
  controls.autoRotate = false;
  return new Promise((resolve) => {
    function frame(now) {
      if (token !== state.tweenToken) { controls.enabled = true; resolve(false); return; }
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);
      camera.position.lerpVectors(fromPos, position, e);
      controls.target.lerpVectors(fromTarget, target, e);
      camera.lookAt(controls.target);
      if (t < 1) requestAnimationFrame(frame);
      else { controls.enabled = true; resolve(true); }
    }
    requestAnimationFrame(frame);
  });
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => dom.toast.classList.remove('visible'), 2400);
}
function ping(frequency = 520) {
  if (!state.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = ping.ctx || (ping.ctx = new AudioContext());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.34);
  } catch { /* optional */ }
}

function stopNarration() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  state.speaking = false;
  if (dom.narrationBtn) dom.narrationBtn.textContent = '🔊 听讲解';
}
function narrationText(item) {
  if (item.narration) return item.narration;
  if (GALAXIES.some((g) => g.id === item.id)) return `${item.name}。${item.subtitle}。${item.description} 它的直径是${item.diameter}，距离信息是${item.distance || item.year}。`;
  return `${item.name}。${item.subtitle}。${item.description} 直径是${item.diameter}。${item.fact}。`;
}
function speakCurrent() {
  const item = state.currentInfo;
  if (!item) return;
  if (!('speechSynthesis' in window)) { showToast('当前浏览器不支持语音讲解'); return; }
  if (state.speaking) { stopNarration(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(narrationText(item));
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => /^zh(-|_)/i.test(v.lang)) || voices.find((v) => v.lang?.toLowerCase().includes('zh'));
  if (zhVoice) utterance.voice = zhVoice;
  utterance.lang = zhVoice?.lang || 'zh-CN';
  utterance.rate = 0.9;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  utterance.onend = utterance.onerror = () => stopNarration();
  state.speaking = true;
  dom.narrationBtn.textContent = '■ 停止讲解';
  window.speechSynthesis.speak(utterance);
}

function closeInfo() {
  stopNarration();
  dom.infoPanel.classList.remove('visible');
  dom.infoPanel.setAttribute('aria-hidden', 'true');
  state.selected = null;
  state.currentInfo = null;
  document.querySelectorAll('.planet-btn').forEach((b) => b.classList.remove('active'));
}

function openInfo(item) {
  stopNarration();
  state.selected = item.id;
  state.currentInfo = item;
  const isGalaxy = GALAXIES.some((g) => g.id === item.id);
  const isStellarSystem = STELLAR_SYSTEMS.some((s) => s.id === item.id);
  const isStellarBody = STELLAR_BODIES.has(item.id);
  const isBlackHole = item.id === 'blackhole';
  dom.infoName.textContent = item.name;
  dom.infoType.textContent = item.type;
  dom.infoSubtitle.textContent = item.subtitle;
  dom.infoDiameter.textContent = item.diameter;
  dom.infoYear.textContent = isGalaxy || isStellarSystem ? item.distance : item.year;
  dom.infoFact.textContent = item.fact;
  dom.infoDescription.textContent = item.description;
  dom.infoDot.style.background = item.color;
  dom.infoDot.style.color = item.color;
  dom.infoSizeLabel.textContent = '直径';
  dom.infoCycleLabel.textContent = isGalaxy || isStellarSystem ? '距离我们' : isStellarBody ? '周期' : isBlackHole ? '位置' : '一年';
  dom.infoPanel.classList.add('visible');
  dom.infoPanel.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.planet-btn').forEach((b) => b.classList.toggle('active', b.dataset.id === item.id));
  ping(610);
}

async function goLocalGroup() {
  closeInfo();
  state.selectedGalaxy = null;
  setLevel('local-group');
  camera.position.set(0, 20, 39);
  controls.target.set(0, -0.5, -1);
  await tweenCamera(new THREE.Vector3(0, 20, 39), new THREE.Vector3(0, -0.5, -1), 950);
  controls.autoRotate = true;
}

async function enterGalaxy(id, { openCard = true } = {}) {
  const data = GALAXIES.find((g) => g.id === id);
  if (!data) return;
  closeInfo();
  if (state.level === 'local-group') {
    const source = localGalaxyObjects.get(id).wrapper;
    source.getWorldPosition(worldPos);
    await tweenCamera(worldPos.clone().add(new THREE.Vector3(4, 3, 5)), worldPos.clone(), 900);
  }
  state.selectedGalaxy = id;
  if (id !== 'milky-way') loadOtherGalaxy(data);
  setLevel('galaxy');
  camera.position.set(0, 20, 38);
  controls.target.set(0, 0, 0);
  await tweenCamera(new THREE.Vector3(0, id === 'andromeda' ? 24 : 20, id === 'andromeda' ? 44 : 38), new THREE.Vector3(0, 0, 0), 1000);
  if (openCard) openInfo(data);
}

async function enterSolarSystem({ focusEarth = false } = {}) {
  if (state.level === 'local-group') await enterGalaxy('milky-way', { openCard: false });
  if (state.level === 'galaxy' && state.selectedGalaxy !== 'milky-way') await enterGalaxy('milky-way', { openCard: false });
  closeInfo();
  if (state.level === 'galaxy') {
    stellarMarkers.get('sun-system').dot.getWorldPosition(worldPos);
    await tweenCamera(worldPos.clone().add(new THREE.Vector3(4.5, 3.5, 5.5)), worldPos.clone(), 950);
    setLevel('solar');
    camera.position.set(0, 13.5, 30); controls.target.set(0, 0, 0);
    await tweenCamera(new THREE.Vector3(0, 11.5, 27), new THREE.Vector3(0, 0, 0), 800);
  } else if (state.level === 'planet' || state.level === 'stellar') {
    setLevel('solar');
    await tweenCamera(new THREE.Vector3(0, 11.5, 27), new THREE.Vector3(0, 0, 0), 800);
  }
  if (focusEarth) await flyToPlanet('earth');
}

function registerStellarBody(mesh, id, kind = 'stellar-body') {
  mesh.userData = { kind, id };
  stellarBodiesClickable.push(mesh);
  stellarBodyObjects.set(id, mesh);
}

function addStarGlow(mesh, color, scale, opacity = 0.78) {
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(scale, scale, 1);
  glow.userData = mesh.userData;
  mesh.add(glow);
  stellarGlowSprites.push({ sprite: glow, base: opacity, phase: Math.random() * Math.PI * 2, speed: 1.4 + Math.random() * 1.2 });
}

function createStellarOrbit(radius, opacity = 0.2) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  stellarSystemGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x6e84af, transparent: true, opacity })));
}

function addStellarOrbitPivot(radius, speed, angle) {
  const pivot = new THREE.Group();
  pivot.userData = { orbitRadius: radius, speed, angle };
  stellarSystemGroup.add(pivot);
  return pivot;
}

function addStellarLabel(text, anchor) {
  createLabel(text, anchor, 'stellar-scene');
}

function createSingleStarSystem(data) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 32), new THREE.MeshBasicMaterial({ color: data.color }));
  registerStellarBody(star, `${data.id}-star`);
  addStarGlow(star, data.color, 7.5);
  addStellarLabel(data.name, star);
  stellarSystemGroup.add(star);
}

function createBinarySystem(data) {
  const pivot = new THREE.Group();
  pivot.userData.animate = 'binary';
  stellarSystemGroup.add(pivot);

  const orbit = new THREE.Mesh(new THREE.RingGeometry(1.66, 1.7, 72), new THREE.MeshBasicMaterial({ color: 0x9eb8e9, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  orbit.rotation.x = Math.PI / 2;
  pivot.add(orbit);

  const starA = new THREE.Mesh(new THREE.SphereGeometry(1.25, 42, 28), new THREE.MeshBasicMaterial({ color: '#dfeeff' }));
  starA.position.x = -1.7;
  pivot.add(starA);
  const starB = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), new THREE.MeshBasicMaterial({ color: '#f8fbff' }));
  starB.position.x = 1.7;
  pivot.add(starB);

  registerStellarBody(starA, 'sirius-a');
  registerStellarBody(starB, 'sirius-b');
  addStarGlow(starA, '#bcd8ff', 6);
  addStarGlow(starB, '#e8f2ff', 2.6, 0.6);
  addStellarLabel('天狼星 A', starA);
  addStellarLabel('天狼星 B', starB);
}

function createTripleSystem(data) {
  const core = new THREE.Group();
  core.userData.animate = 'triple';
  stellarSystemGroup.add(core);

  const orbit = new THREE.Mesh(new THREE.RingGeometry(1.36, 1.4, 72), new THREE.MeshBasicMaterial({ color: 0x9eb8e9, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  orbit.rotation.x = Math.PI / 2;
  core.add(orbit);

  const starA = new THREE.Mesh(new THREE.SphereGeometry(1.05, 40, 26), new THREE.MeshBasicMaterial({ color: '#ffe2b1' }));
  starA.position.x = -1.4;
  core.add(starA);
  const starB = new THREE.Mesh(new THREE.SphereGeometry(0.85, 36, 24), new THREE.MeshBasicMaterial({ color: '#ffd2a3' }));
  starB.position.x = 1.4;
  core.add(starB);

  registerStellarBody(starA, 'alpha-a');
  registerStellarBody(starB, 'alpha-b');
  addStarGlow(starA, '#ffdca6', 5.4);
  addStarGlow(starB, '#ffd2a3', 4.2);
  addStellarLabel('半人马座 α A', starA);
  addStellarLabel('半人马座 α B', starB);

  createStellarOrbit(5.4, 0.16);
  const proximaPivot = addStellarOrbitPivot(5.4, 0.12, 0.6);
  const proxima = new THREE.Mesh(new THREE.SphereGeometry(0.45, 28, 20), new THREE.MeshBasicMaterial({ color: '#ff8d72' }));
  registerStellarBody(proxima, 'proxima');
  addStarGlow(proxima, '#ff8d72', 2.4, 0.62);
  addStellarLabel('比邻星', proxima);
  proximaPivot.add(proxima);
}

function createTrappistSystem(data) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.95, 40, 28), new THREE.MeshBasicMaterial({ color: '#ff7d63' }));
  registerStellarBody(star, 'trappist-star');
  addStarGlow(star, '#ff8a6b', 5);
  addStellarLabel('TRAPPIST-1', star);
  stellarSystemGroup.add(star);

  const letters = ['b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const radii = [1.8, 2.2, 2.7, 3.2, 3.8, 4.4, 5.1];
  const palette = ['#caa27d', '#b78a68', '#9fa8c9', '#7fb7ff', '#8fd0b0', '#caa27d', '#9fa8c9'];
  radii.forEach((r, i) => {
    createStellarOrbit(r, 0.18);
    const pivot = addStellarOrbitPivot(r, 0.42 + i * 0.05, i * 0.83);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.16 + (i % 3) * 0.015, 20, 16), new THREE.MeshStandardMaterial({ color: palette[i], roughness: 0.85 }));
    registerStellarBody(planet, `trappist-${letters[i]}`, 'stellar-planet');
    pivot.add(planet);
  });
}

function createKeplerSystem(data) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 28), new THREE.MeshBasicMaterial({ color: '#ff9b78' }));
  registerStellarBody(star, 'kepler-star');
  addStarGlow(star, '#ff9b78', 4.6);
  addStellarLabel('Kepler-186', star);
  stellarSystemGroup.add(star);

  const letters = ['b', 'c', 'd', 'e', 'f'];
  const radii = [1.9, 2.4, 3.0, 3.6, 4.3];
  const palette = ['#caa27d', '#b78a68', '#9fa8c9', '#b78a68', '#8fd0b0'];
  radii.forEach((r, i) => {
    createStellarOrbit(r, 0.18);
    const pivot = addStellarOrbitPivot(r, 0.4 + i * 0.04, i * 1.1);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(i === 4 ? 0.22 : 0.17 + (i % 2) * 0.02, 20, 16), new THREE.MeshStandardMaterial({ color: palette[i], roughness: 0.85 }));
    registerStellarBody(planet, `kepler-${letters[i]}`, 'stellar-planet');
    pivot.add(planet);
  });
}

function createYoungSystem(data) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(1.15, 44, 30), new THREE.MeshBasicMaterial({ color: '#ffc98a' }));
  registerStellarBody(star, 'epsilon-star');
  addStarGlow(star, '#ffcf96', 6);
  addStellarLabel('波江座 ε', star);
  stellarSystemGroup.add(star);

  const debris = new THREE.Mesh(new THREE.RingGeometry(4.8, 6.1, 96), new THREE.MeshBasicMaterial({ color: 0xd9b98c, transparent: true, opacity: 0.14, side: THREE.DoubleSide }));
  debris.rotation.x = Math.PI / 2.15;
  stellarSystemGroup.add(debris);

  createStellarOrbit(3.4, 0.18);
  const pivot = addStellarOrbitPivot(3.4, 0.22, 1.9);
  const planet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 18), new THREE.MeshStandardMaterial({ color: '#d8a86f', roughness: 0.8 }));
  registerStellarBody(planet, 'epsilon-b', 'stellar-planet');
  pivot.add(planet);
}

function createSupergiantSystem(data) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(2.6, 56, 36), new THREE.MeshBasicMaterial({ color: '#ff8a66' }));
  registerStellarBody(star, 'betelgeuse-star');
  star.userData.animate = 'supergiant';
  addStarGlow(star, '#ff7d55', 11, 0.6);
  addStellarLabel('参宿四', star);
  stellarSystemGroup.add(star);
}

function clearStellarScene() {
  while (stellarSystemGroup.children.length) stellarSystemGroup.remove(stellarSystemGroup.children[0]);
  stellarBodiesClickable.length = 0;
  stellarBodyObjects.clear();
  stellarGlowSprites.length = 0;
  for (let i = labelEntries.length - 1; i >= 0; i--) {
    if (labelEntries[i].scope === 'stellar-scene') {
      labelEntries[i].el.remove();
      labelEntries.splice(i, 1);
    }
  }
}

async function openStellarScene(id, open = true) {
  const data = STELLAR_SYSTEMS.find((x) => x.id === id);
  if (!data) return;
  clearStellarScene();
  state.currentStellarId = id;
  setLevel('stellar', data.name);
  stellarSystemGroup.add(stellarLight);

  if (data.systemType === 'single') createSingleStarSystem(data);
  else if (data.systemType === 'binary') createBinarySystem(data);
  else if (data.systemType === 'triple') createTripleSystem(data);
  else if (data.systemType === 'trappist') createTrappistSystem(data);
  else if (data.systemType === 'kepler') createKeplerSystem(data);
  else if (data.systemType === 'young') createYoungSystem(data);
  else if (data.systemType === 'supergiant') createSupergiantSystem(data);

  camera.position.set(0, 9.5, 20);
  controls.target.set(0, 0, 0);
  await tweenCamera(new THREE.Vector3(0, 4.8, 11.5), new THREE.Vector3(0, 0, 0), 850);
  if (open) openInfo(data);
}

async function enterStellarSystem(id, open = true) {
  const marker = stellarMarkers.get(id);
  if (!marker) return;
  if (state.level !== 'galaxy' || state.selectedGalaxy !== 'milky-way') await goMilkyWay();
  closeInfo();
  if (id === 'sun-system') {
    await enterSolarSystem();
    if (open) openInfo(INFO.sun);
    return;
  }
  marker.dot.getWorldPosition(worldPos);
  await tweenCamera(worldPos.clone().add(new THREE.Vector3(2.6, 1.8, 3.4)), worldPos.clone(), 1100);
  await openStellarScene(id, open);
}

async function goMilkyWay() { await enterGalaxy('milky-way', { openCard: false }); }

async function flyToPlanet(id, open = true) {
  if (state.level !== 'solar' && state.level !== 'planet') await enterSolarSystem();
  const obj = planetObjects.get(id); if (!obj) return;
  obj.mesh.getWorldPosition(worldPos);
  const r = obj.data.radius;
  setLevel('planet', obj.data.name);
  await tweenCamera(worldPos.clone().add(new THREE.Vector3(r * 4.6 + 1.3, r * 2.4 + 0.85, r * 5.5 + 2.1)), worldPos.clone(), 900);
  controls.minDistance = Math.max(0.72, r * 2.2); controls.maxDistance = 15;
  if (open) openInfo(obj.data);
}
async function flyToMoon() {
  if (state.level !== 'solar' && state.level !== 'planet') await enterSolarSystem();
  moonMesh.getWorldPosition(worldPos); setLevel('planet', '月球');
  await tweenCamera(worldPos.clone().add(new THREE.Vector3(0.75, 0.45, 1.4)), worldPos.clone(), 850); openInfo(INFO.moon);
}
async function flyToSun() {
  if (state.level !== 'solar' && state.level !== 'planet') await enterSolarSystem();
  setLevel('planet', '太阳'); await tweenCamera(new THREE.Vector3(4.7, 2.3, 5.2), new THREE.Vector3(0, 0, 0), 900); openInfo(INFO.sun);
}
async function visitBlackHole() {
  if (state.level !== 'galaxy' || state.selectedGalaxy !== 'milky-way') await enterGalaxy('milky-way', { openCard: false });
  closeInfo();
  await tweenCamera(new THREE.Vector3(3.2, 2.0, 3.5), new THREE.Vector3(0, 0, 0), 1200);
  controls.minDistance = 2.5; openInfo(INFO.blackhole);
}

async function flyCloser() {
  const id = state.selected; if (!id) return;
  if (GALAXIES.some((g) => g.id === id)) {
    await tweenCamera(camera.position.clone().multiplyScalar(0.72), new THREE.Vector3(0, 0, 0), 650); return;
  }
  if (id === 'blackhole') { await tweenCamera(new THREE.Vector3(1.75, 1.05, 1.9), new THREE.Vector3(0, 0, 0), 650); return; }
  if (id === 'sun') { await tweenCamera(new THREE.Vector3(3.3, 1.5, 3.7), new THREE.Vector3(0, 0, 0), 650); return; }
  if (STELLAR_SYSTEMS.some((s) => s.id === id)) {
    if (state.level === 'galaxy') { await enterStellarSystem(id); return; }
    if (state.level === 'stellar') { await tweenCamera(new THREE.Vector3(2.4, 1.5, 3), new THREE.Vector3(0, 0, 0), 650); return; }
  }
  if (STELLAR_BODIES.has(id)) {
    const anchor = stellarBodyObjects.get(id); if (!anchor) return;
    anchor.getWorldPosition(worldPos);
    await tweenCamera(worldPos.clone().add(new THREE.Vector3(1.3, 0.85, 1.75)), worldPos.clone(), 650); return;
  }
  const anchor = id === 'moon' ? moonMesh : planetObjects.get(id)?.mesh; if (!anchor) return;
  anchor.getWorldPosition(worldPos);
  const radius = id === 'moon' ? 0.105 : planetObjects.get(id).data.radius;
  await tweenCamera(worldPos.clone().add(new THREE.Vector3(radius * 2.7 + .35, radius * 1.25 + .18, radius * 3.2 + .48)), worldPos.clone(), 650);
}

async function whereAreWe() {
  if (state.touring) return;
  state.touring = true; closeInfo(); dom.tourCard.classList.remove('hidden');
  dom.tourStep.textContent = '01'; dom.tourText.textContent = '这里是地球，我们的家'; await flyToPlanet('earth', false); await delay(700);
  dom.tourStep.textContent = '02'; dom.tourText.textContent = '地球围绕太阳运行'; setLevel('solar'); await tweenCamera(new THREE.Vector3(0, 12, 28), new THREE.Vector3(0, 0, 0), 1000); await delay(650);
  dom.tourStep.textContent = '03'; dom.tourText.textContent = '太阳位于银河系里'; state.selectedGalaxy = 'milky-way'; setLevel('galaxy'); camera.position.set(12, 8, 16); controls.target.copy(stellarMarkers.get('sun-system').group.position); await tweenCamera(new THREE.Vector3(0, 29, 54), new THREE.Vector3(0, 0, 0), 1200); await delay(650);
  dom.tourStep.textContent = '04'; dom.tourText.textContent = '银河系又住在本星系群里'; setLevel('local-group'); camera.position.set(5, 11, 22); controls.target.set(-8, 1, 1); await tweenCamera(new THREE.Vector3(0, 20, 39), new THREE.Vector3(0, -0.5, -1), 1200); await delay(800);
  dom.tourStep.textContent = '05'; dom.tourText.textContent = '这里还有仙女座、三角座和麦哲伦云 ✨'; await delay(1200);
  dom.tourCard.classList.add('hidden'); state.touring = false; controls.autoRotate = true;
}

function searchTarget(value) {
  const query = value.trim().toLowerCase(); if (!query) return;
  const galaxy = GALAXIES.find((g) => g.name.includes(query) || g.en.toLowerCase().includes(query));
  if (galaxy) { enterGalaxy(galaxy.id); return; }
  if (['本星系群', 'local group'].some((x) => query.includes(x))) { goLocalGroup(); return; }
  const stellar = STELLAR_SYSTEMS.find((s) => s.name.toLowerCase().includes(query) || s.en.toLowerCase().includes(query));
  if (stellar) { enterStellarSystem(stellar.id); return; }
  const planet = PLANETS.find((p) => p.name.includes(query) || p.en.toLowerCase().includes(query));
  if (planet) { flyToPlanet(planet.id); return; }
  if (['月球', '月亮', 'moon'].some((x) => query.includes(x))) { flyToMoon(); return; }
  if (['黑洞', '人马座', 'sagittarius', 'black hole'].some((x) => query.includes(x))) { visitBlackHole(); return; }
  showToast('还没有收录这个目标，试试“天狼星”或“TRAPPIST-1”');
}

function onPointerUp(event) {
  if (state.touring) return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let targets = clickable;
  if (state.level === 'local-group') targets = localGalaxyTargets;
  else if (state.level === 'galaxy' && state.selectedGalaxy === 'milky-way') targets = galaxyClickable;
  else if (state.level === 'galaxy') targets = [];
  else if (state.level === 'stellar') targets = stellarBodiesClickable;
  const hits = raycaster.intersectObjects(targets, true); if (!hits.length) return;
  const hit = hits[0].object;
  const kind = hit.userData.kind || hit.parent?.userData.kind;
  const hitId = hit.userData.id || hit.parent?.userData.id;
  if (kind === 'local-galaxy') enterGalaxy(hit.userData.id);
  else if (kind === 'stellar-entry') enterStellarSystem(hitId);
  else if (kind === 'blackhole') visitBlackHole();
  else if (kind === 'sun') flyToSun();
  else if (kind === 'moon') flyToMoon();
  else if (kind === 'planet') flyToPlanet(hit.userData.id);
  else if (kind === 'stellar-body' || kind === 'stellar-planet') {
    const info = STELLAR_BODIES.get(hitId);
    if (info) openInfo(info);
  }
}

let pointerDown = null;
canvas.addEventListener('pointerdown', (e) => { pointerDown = { x: e.clientX, y: e.clientY }; controls.autoRotate = false; });
canvas.addEventListener('pointerup', (e) => { if (!pointerDown) return; const moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y); pointerDown = null; if (moved < 6) onPointerUp(e); });
canvas.addEventListener('wheel', () => { controls.autoRotate = false; }, { passive: true });

document.querySelector('#explore-andromeda').addEventListener('click', () => enterGalaxy('andromeda'));
document.querySelector('#enter-milky-way').addEventListener('click', () => enterGalaxy('milky-way', { openCard: true }));
document.querySelector('#visit-blackhole').addEventListener('click', visitBlackHole);
document.querySelector('#close-info').addEventListener('click', closeInfo);
document.querySelector('#closer-btn').addEventListener('click', flyCloser);
document.querySelector('#location-btn').addEventListener('click', whereAreWe);
dom.narrationBtn.addEventListener('click', speakCurrent);

dom.breadcrumb.querySelector('[data-level="local-group"]').addEventListener('click', goLocalGroup);
dom.breadcrumb.querySelector('[data-level="galaxy"]').addEventListener('click', goMilkyWay);
dom.breadcrumb.querySelector('[data-level="stellar"]').addEventListener('click', () => {
  if (state.level === 'solar' || state.level === 'planet') { flyToSun(); return; }
  if (state.currentStellarId && state.currentStellarId !== 'sun-system') openStellarScene(state.currentStellarId);
});
dom.breadcrumb.querySelector('[data-level="solar"]').addEventListener('click', () => enterSolarSystem());
dom.searchForm.addEventListener('submit', (event) => { event.preventDefault(); searchTarget(dom.searchInput.value); });

document.querySelector('#sound-btn').addEventListener('click', (event) => {
  state.sound = !state.sound;
  event.currentTarget.textContent = state.sound ? '♪' : '♫';
  event.currentTarget.style.color = state.sound ? '#8de6ff' : '';
  if (state.sound) { ping(660); showToast('轻音效已开启'); } else showToast('音效已关闭');
});
document.querySelector('#help-btn').addEventListener('click', () => dom.helpDialog.showModal());
document.querySelector('#help-close').addEventListener('click', () => dom.helpDialog.close());
dom.helpDialog.addEventListener('click', (event) => { if (event.target === dom.helpDialog) dom.helpDialog.close(); });

function updateSolarSystem(elapsed, delta) {
  if (!solarGroup.visible) return;
  sunMesh.rotation.y += delta * 0.08;
  PLANETS.forEach((p) => {
    const obj = planetObjects.get(p.id);
    obj.group.userData.angle += delta * p.speed * 0.17;
    const a = obj.group.userData.angle;
    obj.group.position.set(Math.cos(a) * p.distance, 0, Math.sin(a) * p.distance);
    obj.mesh.rotation.y += delta * (0.18 + p.speed * 0.14);
    if (obj.group.userData.moonPivot) obj.group.userData.moonPivot.rotation.y += delta * 0.48;
  });
  sunGlow.material.opacity = 0.62 + Math.sin(elapsed * 1.6) * 0.08;
}
function updateGalaxies(elapsed, delta) {
  if (localGroup.visible) localGroup.rotation.y += delta * 0.003;
  if (galaxyGroup.visible) {
    galaxyGroup.rotation.y += delta * 0.008;
    disk.rotation.z += delta * 0.14;
    stellarMarkers.forEach((marker) => {
      marker.ring.rotation.z += delta * 0.3;
      marker.glow.material.opacity = marker.baseGlow + Math.sin(elapsed * 2.4 + marker.phase) * 0.13;
    });
  }
  if (otherGalaxyGroup.visible && otherGalaxyVisual) otherGalaxyVisual.rotation.y += delta * 0.006;
}
function updateStellarSystems(elapsed, delta) {
  if (!stellarSystemGroup.visible) return;
  stellarSystemGroup.traverse((obj) => {
    if (obj.userData.animate === 'binary') obj.rotation.y += delta * 0.4;
    if (obj.userData.animate === 'triple') obj.rotation.y += delta * 0.26;
    if (obj.userData.animate === 'supergiant') obj.scale.setScalar(1 + Math.sin(elapsed * 0.9) * 0.045);
  });
  stellarSystemGroup.children.forEach((child) => {
    if (child.userData.orbitRadius) {
      child.userData.angle += delta * child.userData.speed * 0.4;
      const a = child.userData.angle;
      child.position.set(Math.cos(a) * child.userData.orbitRadius, 0, Math.sin(a) * child.userData.orbitRadius);
    }
  });
  stellarGlowSprites.forEach((g) => { g.sprite.material.opacity = g.base + Math.sin(elapsed * g.speed + g.phase) * 0.09; });
}
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  controls.update(); updateGalaxies(elapsed, delta); updateStellarSystems(elapsed, delta); updateSolarSystem(elapsed, delta); updateLabels(); renderer.render(scene, camera);
}
animate();

function resize() {
  const width = window.innerWidth; const height = window.innerHeight;
  camera.aspect = width / height; camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(width, height, false);
}
window.addEventListener('resize', resize);
window.addEventListener('beforeunload', stopNarration);

setLevel('local-group');
setTimeout(() => showToast('提示：点一个星系，就能飞过去看看'), 1500);

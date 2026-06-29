import heroVideoUrl from '../../docs/media/hero.mp4'
import heroPosterUrl from '../../docs/media/shot-lens.png'
import shadowShotUrl from '../../docs/media/shot-shadow.png'
import colorShotUrl from '../../docs/media/shot-color.png'
import lensShotUrl from '../../docs/media/shot-lens.png'

const demoHref = import.meta.env.BASE_URL
const githubHref = 'https://github.com/oukeming64-tech/direct-light'
const supportHref = 'https://github.com/oukeming64-tech/direct-light/issues'
const releaseHref = 'https://github.com/oukeming64-tech/direct-light/releases/latest'

const globalNavItems = [
  ['白棚', '#overview'],
  ['灯光', '#highlights'],
  ['镜头', '#lens'],
  ['对比', '#workflow'],
  ['下载', releaseHref],
  ['支持', supportHref],
]

const highlightTabs = [
  '布光预演',
  '灯具与附件',
  '镜头视角',
  'A/B 对比',
]

const highlightCards = [
  {
    eyebrow: '颜色与光影',
    title: '白光、彩光、柔光和硬光，放进同一个白棚里看。',
    image: colorShotUrl,
    alt: '绿色彩光照亮人物并染色白棚',
  },
  {
    eyebrow: '阴影方向',
    title: '低灯位拉长投影，高灯位让影子收短。',
    image: shadowShotUrl,
    alt: '低灯位形成更长的白棚地面投影',
  },
]

const detailCards = [
  {
    title: '摆灯',
    text: '拖动灯位，调整高度、距离、颜色、柔硬和附件。',
  },
  {
    title: '看镜头',
    text: '从自由视角切到摄影机视角，确认画面里的空间关系。',
  },
  {
    title: '带走方案',
    text: '保存预设，冻结 A/B，对比差异，再导出预览图。',
  },
]

export function ShowcasePage() {
  return (
    <main className="showcase-page">
      <header className="global-nav" aria-label="Site navigation">
        <a className="global-brand" href={demoHref} aria-label="Open Direct Light demo">
          <span className="brand-flash" />
        </a>
        <nav className="global-links" aria-label="Direct Light sections">
          {globalNavItems.map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
        </nav>
        <a className="global-icon" href={githubHref} aria-label="Open GitHub">
          <span className="search-glyph" aria-hidden="true" />
        </a>
      </header>

      <header className="product-nav" aria-label="Product navigation">
        <a className="product-name" href={demoHref}>
          Direct Light
        </a>
        <nav className="product-links" aria-label="Product links">
          <a href="#overview">概览</a>
          <a href="#highlights">先刷重点</a>
          <a href={githubHref}>GitHub</a>
          <a className="product-buy" href={demoHref}>
            打开
          </a>
        </nav>
      </header>

      <div className="promo-strip">
        在线版免安装，桌面版可下载。用 Direct Light 先把光摆出来。
        <a href={demoHref}>打开 demo ›</a>
      </div>

      <section className="hero-section" id="overview" aria-labelledby="hero-title">
        <p className="hero-product">Direct Light</p>
        <h1 id="hero-title">先把光摆出来。</h1>
        <a className="hero-button" href={demoHref}>
          打开
        </a>
        <p className="hero-price">在线版免费使用。macOS 桌面版可下载。</p>

        <div className="macbook-stage" aria-label="Direct Light app preview">
          <div className="macbook-lid">
            <div className="macbook-camera" />
            <video className="macbook-screen" autoPlay muted loop playsInline poster={heroPosterUrl}>
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          </div>
          <div className="macbook-base" />
        </div>
      </section>

      <section className="highlights-section" id="highlights" aria-labelledby="highlights-title">
        <div className="section-shell">
          <h2 id="highlights-title">先刷重点</h2>
          <div className="highlight-tabs" aria-label="Direct Light highlights">
            {highlightTabs.map((tab, index) => (
              <button className={index === 0 ? 'selected' : undefined} key={tab} type="button">
                {tab}
              </button>
            ))}
          </div>
          <div className="highlight-grid">
            {highlightCards.map((card) => (
              <article className="highlight-card" key={card.title}>
                <div>
                  <p>{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                </div>
                <img src={card.image} alt={card.alt} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="meet-section" aria-labelledby="meet-title">
        <div className="meet-copy">
          <h2 id="meet-title">新白棚见面，好动心。</h2>
          <p>
            不用搭完整 3D 场景，也不用等离线渲染。打开默认棚，移动人物和灯，
            画面里的方向、阴影和颜色会立刻回应。
          </p>
        </div>
        <div className="floating-device">
          <img src={lensShotUrl} alt="Direct Light 摄影机镜头视角中的人物和光影" />
        </div>
      </section>

      <section className="closer-section" id="lens" aria-labelledby="closer-title">
        <div className="section-shell">
          <h2 id="closer-title">定睛细看</h2>
          <div className="viewer-card">
            <img src={lensShotUrl} alt="Direct Light 应用界面预览" />
          </div>
        </div>
      </section>

      <section className="flow-section" id="workflow" aria-labelledby="flow-title">
        <div className="section-shell flow-shell">
          <div>
            <p className="section-eyebrow">Workflow</p>
            <h2 id="flow-title">从想法到预览图，几步就够。</h2>
          </div>
          <div className="detail-grid">
            {detailCards.map((card) => (
              <article className="detail-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-section" aria-label="Open Direct Light">
        <p>Direct Light</p>
        <h2>把光放进白棚里，先看一眼。</h2>
        <div className="final-actions">
          <a className="final-primary" href={demoHref}>
            进入在线版
          </a>
          <a className="final-secondary" href={releaseHref}>
            下载 macOS 版
          </a>
        </div>
      </section>
    </main>
  )
}

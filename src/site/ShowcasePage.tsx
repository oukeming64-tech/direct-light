import heroVideoUrl from '../../docs/media/hero.mp4'
import heroPosterUrl from '../../docs/media/shot-lens.png'
import shadowShotUrl from '../../docs/media/shot-shadow.png'
import colorShotUrl from '../../docs/media/shot-color.png'
import lensShotUrl from '../../docs/media/shot-lens.png'

const demoHref = import.meta.env.BASE_URL
const githubHref = 'https://github.com/oukeming64-tech/direct-light'
const releaseHref = 'https://github.com/oukeming64-tech/direct-light/releases/latest'

const featureBlocks = [
  {
    title: '实时看光',
    text: '拖动灯位、换高度、改颜色，人物和白棚里的阴影会马上更新。',
  },
  {
    title: '用镜头判断',
    text: '在自由视角布置现场，再切到摄影机视角看更接近拍摄沟通的画面。',
  },
  {
    title: '带着方案沟通',
    text: '保存、A/B 对比、导出预览图，让前期讨论不只停在口头描述。',
  },
]

const productNotes = [
  '6 lights',
  '3 languages',
  'Web + macOS',
]

export function ShowcasePage() {
  return (
    <main className="showcase-page">
      <header className="site-nav" aria-label="Showcase navigation">
        <a className="brand-mark" href={demoHref} aria-label="Open Direct Light demo">
          <span className="brand-flash" />
          <span>Direct Light</span>
        </a>
        <nav className="nav-links" aria-label="Project links">
          <a href="#overview">Overview</a>
          <a href={demoHref}>Demo</a>
          <a href={githubHref}>GitHub</a>
          <a href={releaseHref}>Download</a>
        </nav>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <p className="product-kicker">White-studio lighting previz</p>
        <h1 id="hero-title">Direct Light</h1>
        <p className="hero-lede">
          把白棚里的光，先摆清楚。
        </p>
        <p className="hero-subcopy">
          给导演、摄影指导和灯光师的轻量预演沙盘。摆人物、调灯、切镜头视角，
          用一张可讨论的画面进入拍摄前沟通。
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="text-link" href={demoHref}>
            打开在线 demo
            <span aria-hidden="true">›</span>
          </a>
          <a className="text-link" href={githubHref}>
            查看 GitHub
            <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="hero-device" aria-label="Direct Light app preview">
          <div className="device-topbar">
            <span />
            <span />
            <span />
          </div>
          <video className="hero-media" autoPlay muted loop playsInline poster={heroPosterUrl}>
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        </div>

        <div className="product-notes" aria-label="Project quick facts">
          {productNotes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      </section>

      <section className="statement-section" id="overview" aria-labelledby="statement-title">
        <div className="section-inner">
          <p className="section-kicker">Built for the early conversation</p>
          <h2 id="statement-title">
            不替代复杂 3D 软件。
            <br />
            只把前期最常问的光影问题，变成可见的画面。
          </h2>
        </div>
      </section>

      <section className="cinema-section" aria-labelledby="cinema-title">
        <div className="section-inner">
          <div className="cinema-copy">
            <p className="section-kicker">Through the lens</p>
            <h2 id="cinema-title">从灯位图，切到镜头画面。</h2>
            <p>
              同一个场景可以在自由视角、俯视图、侧视图和摄影机视角之间切换。
              布光时看空间关系，讨论时看镜头里的结果。
            </p>
          </div>
          <figure className="wide-shot">
            <img src={lensShotUrl} alt="Direct Light 摄影机镜头视角中的人物和光影" />
          </figure>
        </div>
      </section>

      <section className="feature-section" aria-labelledby="feature-title">
        <div className="section-inner">
          <p className="section-kicker">What changes</p>
          <h2 id="feature-title">灯一动，画面就跟着动。</h2>
          <div className="feature-grid">
            {featureBlocks.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-section" aria-label="Direct Light lighting examples">
        <div className="gallery-grid">
          <figure className="gallery-panel">
            <img src={shadowShotUrl} alt="低灯位形成更长的白棚地面投影" />
            <figcaption>
              <strong>低灯位。</strong>
              <span>更长的地面投影，更明确的方向感。</span>
            </figcaption>
          </figure>
          <figure className="gallery-panel gallery-panel-dark">
            <img src={colorShotUrl} alt="绿色彩光照亮人物并染色白棚" />
            <figcaption>
              <strong>彩色光。</strong>
              <span>人物、墙面和白棚表面一起被染色。</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="limit-section" aria-labelledby="limit-title">
        <div className="section-inner limit-grid">
          <div>
            <p className="section-kicker">Designed with a boundary</p>
            <h2 id="limit-title">轻量，是它的取舍。</h2>
          </div>
          <p>
            Direct Light 是纯前端 Web 应用，也可以下载 macOS 桌面版。它强调实时、稳定和可读，
            不宣称做物理级精确渲染；更适合分镜讨论、场勘前预演和小团队快速试光。
          </p>
        </div>
      </section>

      <section className="final-section" aria-label="Open Direct Light">
        <p className="product-kicker">Direct Light</p>
        <h2>打开一个白棚，先把光摆出来。</h2>
        <div className="final-actions">
          <a className="button button-primary" href={demoHref}>
            进入在线版
          </a>
          <a className="button button-secondary" href={releaseHref}>
            下载 macOS 版
          </a>
        </div>
      </section>
    </main>
  )
}

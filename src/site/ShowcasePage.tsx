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
    kicker: 'Blocking',
    title: '先看人、灯和影子的关系',
    text: '人物、灯位、道具、摄影机都能在同一个白棚里调整。低灯位会拉长地面投影，换角度时画面即时反馈。',
  },
  {
    kicker: 'Fixtures',
    title: '用灯具语义沟通，而不是只看数字',
    text: '硬光、柔光、面光、RGB 管、柔光箱、蜂巢、黑旗、反光板都用导演能读懂的方式表达光质变化。',
  },
  {
    kicker: 'Workflow',
    title: '方案可以保存、对比、导出',
    text: 'A/B 冻结对比和预览图导出适合前期讨论：不用等渲染，也不用把团队拉进复杂 3D 软件。',
  },
]

const statBlocks = [
  ['6', 'lights'],
  ['3', 'languages'],
  ['0', 'backend'],
]

export function ShowcasePage() {
  return (
    <main className="showcase-page">
      <section className="hero-section" aria-label="Direct Light project introduction">
        <video className="hero-media" autoPlay muted loop playsInline poster={heroPosterUrl}>
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
        <div className="hero-shade" />

        <header className="site-nav" aria-label="Showcase navigation">
          <a className="brand-mark" href={demoHref} aria-label="Open Direct Light demo">
            <span className="brand-flash" />
            <span>Direct Light</span>
          </a>
          <nav className="nav-links" aria-label="Project links">
            <a href={demoHref}>Demo</a>
            <a href={githubHref}>GitHub</a>
            <a href={releaseHref}>Download</a>
          </nav>
        </header>

        <div className="hero-copy">
          <p className="eyebrow">White-studio lighting previz</p>
          <h1>Direct Light</h1>
          <p className="hero-lede">
            给导演、摄影指导和灯光师的白棚灯光预演沙盘。先把人、灯、镜头和影子摆清楚，
            再带着更具体的画面去沟通。
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href={demoHref}>
              打开在线 demo
            </a>
            <a className="button button-secondary" href={githubHref}>
              查看 GitHub
            </a>
          </div>
        </div>

        <div className="hero-stats" aria-label="Project quick facts">
          {statBlocks.map(([value, label]) => (
            <div className="hero-stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="intro-band" aria-labelledby="intro-title">
        <div className="section-inner intro-grid">
          <div>
            <p className="section-kicker">What it is</p>
            <h2 id="intro-title">一个轻量、实时、偏沟通的布光预演工具。</h2>
          </div>
          <p>
            Direct Light 不试图替代电影级渲染或完整虚拟制片系统。它更像一张可以直接拖动的灯位草图：
            放低主光、切换柔光箱、加一盏彩色背光、换到镜头视角，画面和阴影马上跟着变。
          </p>
        </div>
      </section>

      <section className="image-band image-band-dark" aria-label="Lighting preview screenshots">
        <div className="section-inner visual-grid">
          <figure className="feature-image feature-image-large">
            <img src={shadowShotUrl} alt="低灯位形成更长的白棚地面投影" />
            <figcaption>低灯位会把地面投影拉长，适合快速判断影子方向和压迫感。</figcaption>
          </figure>
          <div className="visual-stack">
            <figure className="feature-image">
              <img src={colorShotUrl} alt="绿色彩光照亮人物并染色白棚" />
              <figcaption>彩色光会染到人物、墙面和地面，而不是只改一块色片。</figcaption>
            </figure>
            <figure className="feature-image">
              <img src={lensShotUrl} alt="摄影机镜头视角中的人物与灯光画面" />
              <figcaption>切到镜头视角后，可以用接近拍摄沟通的画面看结果。</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="feature-band" aria-labelledby="feature-title">
        <div className="section-inner">
          <div className="section-heading">
            <p className="section-kicker">Why it helps</p>
            <h2 id="feature-title">把“差不多这样打”变成一张可讨论的画面。</h2>
          </div>
          <div className="feature-grid">
            {featureBlocks.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <p>{feature.kicker}</p>
                <h3>{feature.title}</h3>
                <span>{feature.text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="workflow-band" aria-labelledby="workflow-title">
        <div className="section-inner workflow-grid">
          <div className="workflow-copy">
            <p className="section-kicker">Built for the early conversation</p>
            <h2 id="workflow-title">开场就能用，也承认自己的边界。</h2>
            <p>
              它是纯前端 Web 应用，也有 macOS 桌面版。渲染目标是稳定、可读、实时，
              不是精确复刻真实光度数据。这个取舍让它更适合分镜、场勘前沟通和小团队快速试光。
            </p>
          </div>
          <div className="workflow-steps" aria-label="Typical workflow">
            <div>
              <span>01</span>
              <p>摆人物、道具和白棚尺寸</p>
            </div>
            <div>
              <span>02</span>
              <p>调灯位、高度、颜色和附件</p>
            </div>
            <div>
              <span>03</span>
              <p>切镜头视角，保存 A/B，再导出预览图</p>
            </div>
          </div>
        </div>
      </section>

      <section className="final-band" aria-label="Open Direct Light">
        <div className="section-inner final-inner">
          <h2>打开一个白棚，先把光摆出来。</h2>
          <div className="final-actions">
            <a className="button button-primary" href={demoHref}>
              进入在线版
            </a>
            <a className="button button-secondary" href={releaseHref}>
              下载 macOS 版
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

import { useStore } from '../state/store'
import { useT } from '../i18n/useT'
import { ColorField, PanelSection, Slider, Toggle } from './controls'
import { Header } from './PanelHeader'

export function StudioPanel() {
  const studio = useStore((s) => s.scene.studio)
  const updateStudio = useStore((s) => s.updateStudio)
  const t = useT()
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title={t('studioPanel.title')} subtitle={t('studioPanel.subtitle')} />
      <PanelSection title={t('studioPanel.section.size')}>
        <Slider label={t('studioPanel.width')} min={4} max={14} step={0.5} unit="m" value={studio.width} onChange={(v) => updateStudio({ width: v })} />
        <Slider label={t('studioPanel.depth')} min={4} max={16} step={0.5} unit="m" value={studio.depth} onChange={(v) => updateStudio({ depth: v })} />
        <Slider label={t('studioPanel.height')} min={3} max={8} step={0.5} unit="m" value={studio.height} onChange={(v) => updateStudio({ height: v })} />
      </PanelSection>
      <PanelSection title={t('studioPanel.section.reflect')}>
        <Slider label={t('studioPanel.wallReflectance')} min={0} max={1} step={0.01} value={studio.wallReflectance} onChange={(v) => updateStudio({ wallReflectance: v })} />
        <Slider label={t('studioPanel.floorReflectance')} min={0} max={1} step={0.01} value={studio.floorReflectance} onChange={(v) => updateStudio({ floorReflectance: v })} />
        <Slider label={t('studioPanel.ambientLevel')} min={0} max={1} step={0.01} value={studio.ambientLevel} onChange={(v) => updateStudio({ ambientLevel: v })} />
      </PanelSection>
      <PanelSection title={t('studioPanel.section.rendering')}>
        <Toggle
          label={t('studioPanel.softShadows')}
          checked={(studio.shadowMode ?? 'variance') === 'soft'}
          onChange={(v) => updateStudio({ shadowMode: v ? 'soft' : 'variance' })}
        />
      </PanelSection>
      <PanelSection title={t('studioPanel.section.structure')}>
        <Toggle label={t('studioPanel.cyclorama')} checked={studio.hasCyclorama} onChange={(v) => updateStudio({ hasCyclorama: v })} />
        <Toggle label={t('studioPanel.sideWalls')} checked={studio.showSideWalls} onChange={(v) => updateStudio({ showSideWalls: v })} />
        <Toggle label={t('studioPanel.ceiling')} checked={studio.showCeiling} onChange={(v) => updateStudio({ showCeiling: v })} />
        <ColorField label={t('studioPanel.wallColor')} value={studio.wallColor} onChange={(v) => updateStudio({ wallColor: v })} />
        <ColorField label={t('studioPanel.floorColor')} value={studio.floorColor} onChange={(v) => updateStudio({ floorColor: v })} />
      </PanelSection>
    </div>
  )
}

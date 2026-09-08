import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'

const layout = new Layout({ fit: Fit.Contain, alignment: Alignment.Center })

export default function MeeRiveRenderer() {
  const { RiveComponent } = useRive({
    src: '/assets/mee/mee-cat-rig-v1.riv',
    stateMachines: 'MeeCatController',
    autoplay: true,
    layout,
  })

  return <RiveComponent className="h-full w-full" />
}

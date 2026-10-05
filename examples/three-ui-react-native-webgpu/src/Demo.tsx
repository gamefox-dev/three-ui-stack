import { useMemo, useState } from 'react'
import { DataTexture } from 'three/webgpu'
import { TextureRegion, configureTexture } from 'three-2d'
import { Image, ScrollView, Text, View } from 'three-ui-react'

function gradientImage(): TextureRegion {
  const size = 64
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      data[i] = 80 + (x / size) * 175
      data[i + 1] = 60 + (y / size) * 150
      data[i + 2] = 255 - (x / size) * 120
      data[i + 3] = 255
    }
  }
  return new TextureRegion(configureTexture(new DataTexture(data, size, size)))
}

/** The same Yoga/React UI as the web examples: `style` objects only (Tailwind arrives with the Metro adapter). */
export function Demo() {
  const [taps, setTaps] = useState(0)
  const image = useMemo(gradientImage, [])
  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 60, gap: 14 }}>
      <Text style={{ fontSize: 28, fontWeight: 700 }}>three-ui on React Native</Text>
      <Text style={{ fontSize: 13, color: '#a1a1aa' }}>WebGPU · Yoga asm.js · react-reconciler · bitmap font baked on device</Text>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Image source={image} style={{ width: 64, height: 64, borderRadius: 14 }} />
        <View
          onClick={() => setTaps(taps + 1)}
          style={{ backgroundColor: '#6d5dfc', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ fontWeight: 700, color: '#fff' }}>{`Tap me · ${taps}`}</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#18181b', borderRadius: 16, padding: 12, gap: 8 }}>
        {Array.from({ length: 60 }, (_, i) => (
          <View key={i} style={{ backgroundColor: '#27272a', borderRadius: 10, padding: 12 }}>
            <Text>{`Row ${i + 1} — drag to scroll`}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

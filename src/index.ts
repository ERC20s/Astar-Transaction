import {
  engine,
  GltfContainer,
  InputAction,
  inputSystem,
  Material,
  MeshCollider,
  pointerEventsSystem,
  Transform
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { RequestManager } from 'eth-connect'
import { createEthereumProvider } from '@dcl/sdk/ethereum-provider'
import { getUserData } from '~system/UserIdentity'

import { bounceScalingSystem, circularSystem } from './systems'

import { setupUi } from './ui'
import { BounceScaling, Spinner } from './components'
import { createCube } from './factory'
// Defining behavior. See `src/systems.ts` file.
engine.addSystem(circularSystem)
engine.addSystem(bounceScalingSystem)

const provider = createEthereumProvider()
const requestManager = new RequestManager(provider)

export function main() {
  // draw UI
  setupUi()

  // fetch cube from Inspector
  const cube = engine.getEntityOrNullByName('Magic Cube')
  if (cube) {
    // Give the cube a color
    Material.setPbrMaterial(cube, { albedoColor: Color4.Blue() })

    // Make the cube spin, with the circularSystem
    Spinner.create(cube, { speed: 10 })

    // Give the cube a collider, to make it clickable
    MeshCollider.setBox(cube)

    // Add a click behavior to the cube, spawning new cubes in random places, and adding a bouncy effect for feedback
    pointerEventsSystem.onPointerDown(
      { entity: cube, opts: { button: InputAction.IA_POINTER, hoverText: 'spawn' } },
      () => {
        createCube(1 + Math.random() * 8, Math.random() * 8, 1 + Math.random() * 8, false)
        BounceScaling.createOrReplace(cube)
      }
    )
  }
  let avocado = engine.addEntity()

  GltfContainer.create(avocado, {
    src: 'models/avocado.glb'
  })

  Transform.create(avocado, {
    position: Vector3.create(3, 1, 3)
  })

  pointerEventsSystem.onPointerDown(
    {
      entity: avocado,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Collect' }
    },
    function () {
      console.log('CLICKED AVOCADO')
      requestManager.eth_blockNumber().then((blockNumber) => {
        console.log({ blockNumber })
      })
      let fromAddress
      getUserData({}).then((userData) => {
        if (userData.data?.hasConnectedWeb3) {
          fromAddress = userData.data?.publicKey

          console.log('fromAddress: ', fromAddress)
          const toAddress = '0x6693ee891404284AA895340e5f68cade57533B47'
          if (fromAddress) {
            requestManager
              .eth_sendTransaction({
                to: toAddress,
                from: fromAddress,
                value: '0x2386F26FC10000', // 0.001 Astr
                data: '0x'
              })
              .then((res) => {
                console.log(res)
              })
          }
        }
      })
    }
  )
}

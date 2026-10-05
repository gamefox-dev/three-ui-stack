import { OrthographicCamera } from 'three'

/**
 * Create an orthographic camera in three-2d's coordinate convention:
 * origin top-left, +x right, +y down (pass `yDown: false` for a classic y-up camera).
 * The camera is positioned so that world (0,0) is the top-left corner of the view.
 */
export function createOrthographicCamera(width: number, height: number, yDown = true): OrthographicCamera {
  const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000)
  camera.position.z = 10
  updateOrthographicCamera(camera, width, height, yDown, true)
  return camera
}

/**
 * Resize an orthographic camera to show `width × height` world units.
 * `center` moves the camera so world (0,0) is the top-left (y-down) / bottom-left (y-up) corner.
 */
export function updateOrthographicCamera(
  camera: OrthographicCamera,
  width: number,
  height: number,
  yDown = true,
  center = false,
): OrthographicCamera {
  camera.left = -width / 2
  camera.right = width / 2
  camera.top = yDown ? -height / 2 : height / 2
  camera.bottom = yDown ? height / 2 : -height / 2
  if (center) camera.position.set(width / 2, height / 2, camera.position.z)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld(true)
  return camera
}

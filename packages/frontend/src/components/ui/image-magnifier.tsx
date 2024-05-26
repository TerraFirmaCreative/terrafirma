"use client"
import React, { MouseEvent, useEffect, useState } from 'react'
import Image, { ImageProps } from 'next/image'
import Responsive from './util/responsive'

const MAGNIFIER_SIZE = 300
const ZOOM_LEVEL = 2.5

const ImageMagnifier = (props: ImageProps) => {
  const [zoomable, setZoomable] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [position, setPosition] = useState({ x: 100, y: 100, mouseX: 0, mouseY: 0 })
  const [loading, setLoading] = useState(true)

  const handleMouseEnter = (e: MouseEvent) => {
    let element = e.currentTarget
    let { width, height } = element.getBoundingClientRect()
    setImageSize({ width, height })
    setZoomable(true)
    updatePosition(e)
  }

  const handleMouseLeave = (e: MouseEvent) => {
    setZoomable(false)
    updatePosition(e)
  }

  const handleMouseMove = (e: MouseEvent) => {
    updatePosition(e)
  }

  const updatePosition = (e: MouseEvent) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    let x = e.clientX - left
    let y = e.clientY - top
    setPosition({
      x: -x * ZOOM_LEVEL + (MAGNIFIER_SIZE / 2),
      y: -y * ZOOM_LEVEL + (MAGNIFIER_SIZE / 2),
      mouseX: x - (MAGNIFIER_SIZE / 2),
      mouseY: y - (MAGNIFIER_SIZE / 2),
    })
  }

  return (
    <div className='relative w-full h-full flex justify-center items-center'
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}>
      <Image {...props} />
      <Responsive
        desktop={
          <div
            style={{
              backgroundPosition: `${Math.max(Math.min(0, position.x), -imageSize.width * ZOOM_LEVEL + MAGNIFIER_SIZE)}px ${Math.max(Math.min(0, position.y), -imageSize.height * ZOOM_LEVEL + MAGNIFIER_SIZE)}px`,
              backgroundImage: `url("${props.src}")`,
              backgroundSize: `${imageSize.width * ZOOM_LEVEL}px ${imageSize.height * ZOOM_LEVEL}px`,
              backgroundRepeat: 'no-repeat',
              display: zoomable ? 'block' : 'none',
              top: `${position.mouseY}px`,
              left: `${position.mouseX}px`,
              width: `${MAGNIFIER_SIZE}px`,
              height: `${MAGNIFIER_SIZE}px`,
            }}
            className={`z-50 border rounded-full pointer-events-none fixed overflow-clip border-gray-500`}
          />
        }
      />
    </div>
  )
}

export default ImageMagnifier
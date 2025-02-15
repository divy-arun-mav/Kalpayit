import { RightSidebarProps } from '@/types/type'
import Color from './settings/Color'
import Dimensions from './settings/Dimensions'
import Export from './settings/Export'
import Text from './settings/Text'
import React, { useRef } from 'react'
import { modifyShape } from '@/lib/shapes'

const RightSideBar = ({ elementAttributes, setElementAttributes, fabricRef, isEditingRef, activeObjectRef, syncShapeInStorage }: RightSidebarProps) => {

  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) {
      isEditingRef.current = true;
    }

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    })
  }

  return (
    <section className="flex flex-col border-t-2 border-gray-900 bg-black text-gray-200 min-w-[227px] sticky right-0 h-full max-sm:hidden select-none overflow-y-auto pb-20 w-max">
      <h3 className="px-5 py-4 text-white text-xs uppercase">Design</h3>
      <span className='text-xs text-white mt-3 px-5 pb-4'>Make Changes to canvas as you like</span>

      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        isEditingRef={isEditingRef}
        handleInputChange={handleInputChange}
      />
      <Text
        fontFamily={elementAttributes.fontFamily}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        handleInputChange={handleInputChange}
      />
      <Color
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        attributeType='fill'
        placeholder='color'
        handleInputChange={handleInputChange}
      />
      <Color
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        attributeType='stroke'
        placeholder='stroke'
        handleInputChange={handleInputChange}
      />
      <Export/>
    </section>
  )
}

export default RightSideBar
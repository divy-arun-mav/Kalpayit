/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useMemo } from "react";
import Image from "next/image";

import { getShapeInfo } from "@/lib/utils";

const LeftSidebar = ({ allShapes }: { allShapes: Array<unknown> }) => {
    // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
    const memoizedShapes = useMemo(
        () => (
            <section className="flex flex-col border-t-2 border-gray-800 bg-black text-gray-200 min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
                <h3 className=" px-5 py-4 text-xs uppercase">Layers</h3>
                <div className="flex flex-col">
                    {allShapes?.map((shape: unknown) => {
                        // @ts-expect-error
                        const info = getShapeInfo(shape[1]?.type);

                        return (
                            <div
                                // @ts-expect-error
                                key={shape[1]?.objectId}
                                className="group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-yellow-500 hover:text-black"
                            >
                                <Image
                                    src={info?.icon}
                                    alt='Layer'
                                    width={16}
                                    height={16}
                                    className="hover:invert"
                                />
                                <h3 className='text-sm font-semibold capitalize'>{info.name}</h3>
                            </div>
                        );
                    })}
                </div>
            </section>
        ),
        [allShapes?.length]
    );

    return memoizedShapes;
};

export default LeftSidebar;

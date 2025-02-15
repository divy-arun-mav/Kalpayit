/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { fabric } from "fabric";
import LeftSideBar from "@/components/LeftSideBar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import { useEffect, useRef, useState } from "react";
import { handleCanvaseMouseMove, handleCanvasMouseDown, handleCanvasMouseUp, handleCanvasObjectModified, handleCanvasObjectScaling, handleCanvasSelectionCreated, handlePathCreated, handleResize, initializeFabric, renderCanvas } from '@/lib/canvas';
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";


export default function Page() {

    const undo = useUndo();
    const redo = useRedo();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const isDrawing = useRef(false);
    const shapeRef = useRef<fabric.Object | null>(null);

    const [elementAttributes, setElementAttributes] = useState<Attributes>({
        width: '',
        height: '',
        fontSize: '',
        fontWeight: '',
        fill: '#aabbcc',
        stroke: '#aabbcc',
    });

    const selectedShapeRef = useRef<string | null>(null);

    const isEditingRef = useRef(null);

    const imageInputRef = useRef<HTMLInputElement>(null);

    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name: '',
        value: '',
        icon: '',
    });

    const deleteAllShapes = useMutation(({ storage }) => {
        const canvasObjects = storage.get('canvasObjects');

        if (!canvasObjects || canvasObjects.size === 0) {
            return true;
        }

        for (const [key] of canvasObjects.entries()) {
            canvasObjects.delete(key);
        }

        return canvasObjects.size === 0;
    }, []);

    const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
        const canvasObjects = storage.get('canvasObjects');

        canvasObjects.delete(objectId);
    }, []);

    const handleActiveElement = (elem: ActiveElement) => {
        setActiveElement(elem);

        switch (elem?.value) {
            case 'reset':
                deleteAllShapes();
                fabricRef.current?.clear();
                setActiveElement(defaultNavElement);
                break;

            case 'delete':
                handleDelete(fabricRef.current as any, deleteShapeFromStorage);
                setActiveElement(defaultNavElement);
                break;

            case 'image':
                imageInputRef.current?.click();
                isDrawing.current = false;
                if (fabricRef.current) {
                    fabricRef.current.isDrawingMode = false;
                }
                break;

            default:
                break;
        }

        selectedShapeRef.current = elem?.value as string;
    }

    const activeObjectRef = useRef<fabric.Object | null>(null);

    const canvasObjects = useStorage((root) => {
        return root.canvasObjects || new LiveMap();
    });


    const syncShapeInStorage = useMutation(({ storage }, object) => {
        if (!object) return;

        const { objectId } = object;

        const shapeData = object.toJSON();
        shapeData.objectId = objectId;

        const canvasObjects = storage.get("canvasObjects");

        canvasObjects.set(objectId, shapeData);
    }, []);


    useEffect(() => {
        const handleResizeEvent = () => {
            handleResize({
                canvas: fabricRef.current,
            });
        };

        window.addEventListener("resize", handleResizeEvent);

        return () => {
            window.removeEventListener("resize", handleResizeEvent);
        };
    }, []);


    useEffect(() => {
        const canvas = initializeFabric({ canvasRef, fabricRef });


        canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
                options,
                canvas,
                selectedShapeRef,
                isDrawing,
                shapeRef,
            });
        });

        canvas.on("mouse:move", (options) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                selectedShapeRef,
                shapeRef,
                syncShapeInStorage,
            });
        });

        canvas.on("mouse:up", () => {
            handleCanvasMouseUp({
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
                setActiveElement,
                activeObjectRef,
            });
        });

        canvas.on("object:modified", (options) => {
            handleCanvasObjectModified({
                options,
                syncShapeInStorage,
            })
        });

        canvas.on("selection:created", (options: any) => {
            handleCanvasSelectionCreated({
                options,
                isEditingRef,
                setElementAttributes,
            })
        })

        canvas.on("object:scaling", (options: any) => {
            handleCanvasObjectScaling({
                options, setElementAttributes
            })
        })

        canvas.on("path:created", (options: any) => {
            handlePathCreated({
                options, syncShapeInStorage
            })
        })

        window.addEventListener("resize", () => {
            handleResize({
                canvas: fabricRef.current,
            });
        });

        window.addEventListener("keydown", (e: any) => {
            handleKeyDown({
                e,
                canvas: fabricRef.current,
                undo,
                redo,
                syncShapeInStorage,
                deleteShapeFromStorage,
            })
        });

        return () => {
            canvas.dispose();
        }

    }, [syncShapeInStorage, canvasObjects]);

    useEffect(() => {
        renderCanvas({
            fabricRef,
            canvasObjects,
            activeObjectRef
        })
    }, [canvasObjects]);

    return (
        <main className="h-screen overflow-hidden">
            <Navbar
                activeElement={activeElement}
                handleActiveElement={handleActiveElement}
                imageInputRef={imageInputRef}
                handleImageUpload={(e: any) => {
                    e.stopPropagation();

                    handleImageUpload({
                        file: e.target.files[0],
                        canvas: fabricRef as any,
                        shapeRef,
                        syncShapeInStorage,
                    })
                }}
            />
            <section className="flex h-full flex-row">
                <LeftSideBar allShapes={canvasObjects ? Array.from(canvasObjects) : []} />
                <Live canvasRef={canvasRef} undo={undo} redo={redo} />
                <RightSideBar
                    elementAttributes={elementAttributes}
                    setElementAttributes={setElementAttributes}
                    fabricRef={fabricRef}
                    isEditingRef={isEditingRef}
                    activeObjectRef={activeObjectRef}
                    syncShapeInStorage={syncShapeInStorage}
                />
            </section>
        </main>
    );
}
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react'
import LiveCursor from './cursor/LiveCursor'
import { useBroadcastEvent, useEventListener, useMyPresence } from '@liveblocks/react'
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';
import { Comments } from './comments/Comments';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { shortcuts } from '@/constants';


type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  undo: () => void,
  redo: () => void,
}

const Live = ({ canvasRef, undo, redo }:Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  })
  const [reaction, setReaction] = useState<Reaction[]>([]);

  const braodcast = useBroadcastEvent();

  useInterval(() => {
    setReaction((reactions) => reactions.filter((r) =>
      r.timestamp>Date.now()-4000))
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReaction((reactions) =>
        reactions.concat([{
          point: { x: cursor.x, y: cursor.y },
          value: cursorState.reaction,
          timestamp: Date.now()
        }])
      )
    }

    braodcast({
      x: cursor?.x,
      y: cursor?.y,
      value: cursorState.reaction,
    })
  }, 100);


  useEventListener((eventData) => {
    const event = eventData.event;

    setReaction((reactions) =>
      reactions.concat([{
        point: { x: event.x, y: event.y },
        value: event.value,
        timestamp: Date.now()
      }])
    )
  })

  const handlePointerMove = useCallback((event: React.PointerEvent) => {

    event.preventDefault();

    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.x;
      const y = event.clientY - rect.y;

      if (!cursor || cursor.x !== x || cursor.y !== y) {
        updateMyPresence({ cursor: { x, y } });
      }
    }

  }, [updateMyPresence, cursor]);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    setCursorState({mode: CursorMode.Hidden})
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;
    updateMyPresence({ cursor: { x, y } });

    setCursorState((state) =>
      state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );



  }, [updateMyPresence]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    setCursorState((state) =>
      state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );


   }, [cursorState.mode,setCursorState]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
      } else if (e.key === 'e') {
        setCursorState({ mode: CursorMode.ReactionSelector });
      } else if (e.key === 'Escape') {
        updateMyPresence({ message: '' });
        setCursorState({ mode: CursorMode.Hidden });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
      }
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence, setCursorState]);

  const setReactions = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction, reaction, isPressed: false
    });
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        })
        break;
      
      case 'Reactions':
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
        break;

      case 'Undo':
        undo();
        break;
      
      case 'Redo':
        redo();
        break;
    
      default:
        break;
    }
  },[])

  return (
    <ContextMenu>

    <ContextMenuTrigger
      id="canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative h-full w-full flex flex-1 justify-center items-center bg-gray-900"
    >
      <canvas ref={canvasRef} />

      {reaction.map((reaction,index) => (
        <FlyingReaction
          // key={reaction.timestamp.toString()}
          key={index}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}
      
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence = {updateMyPresence}
        />
      )}

      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector
          setReaction={setReactions}
        />
      )}
      <LiveCursor />

      <Comments/>
      </ContextMenuTrigger>

      <ContextMenuContent className='right-menu-content'>
        {shortcuts.map((item,key) => (
          <ContextMenuItem
            key={key}
            onClick={() => handleContextMenuClick(item.name)}
            className='right-menwu-item'
          >
            <p>{item.name}</p>
            <p className='text-xs text-gray-300'>{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
      
    </ContextMenu>
  )
}

export default Live;
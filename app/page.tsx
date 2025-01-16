"use client"

import React, { useRef, useState, useEffect, useCallback } from "react";
import { SketchPicker } from "react-color";
import FloodFill from "q-floodfill";
import Image from "next/image";
import { BaseError, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import sdk from "@farcaster/frame-sdk";
import { base } from "wagmi/chains";
import { parseEther } from "viem";

// Icon
import ColorPallete from "./icons/ColorPallete";
import PaintBrush from "./icons/PaintBrush";
import ColorBucket from "./icons/ColorBucket";
import Undo from "./icons/Undo";
import Redo from "./icons/Redo";
import ToolMenu from "./icons/ToolMenu";
import Delete from "./icons/Delete";

// Library
import { scratchAbi, scratchAddress } from "@/lib/contracs/scratch";

// Farcaster
import { useViewer } from "./providers/FrameContextProvider";
import SendCastButton from "./components/sendCast";
import ShareCastButton from "./components/shareCast";


export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushTool, setShowBrushTool] = useState(false);
  const [tool, setTool] = useState<'brush' | 'fill'>('brush');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showTool, setShowTool] = useState(false);

  // Farcaster
  const { fid, username, pfpUrl, url, token, added, safeAreaInsets } = useViewer();

  const chainId = useChainId();
  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { data: tokenId } = useReadContract({
    address: scratchAddress as `0x${string}`,
    abi: scratchAbi,
    functionName: "totalSupply",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const linkToBaseScan = useCallback((hash?: string) => {
    if (hash) {
      sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
    }
  }, []);

  useEffect(() => {
    if (!added) {
      sdk.actions.addFrame()
    }
  })

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Save initial blank state
        saveToHistory();
      }
    }

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          redrawCanvas();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && history.length > 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
    }
  };

  const getCoordinates = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ('touches' in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
    }
    return { x: 0, y: 0 };
  };

  const bucketFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const floodFill = new FloodFill(imageData);
    floodFill.fill(fillColor, Math.floor(x), Math.floor(y), 0);
    ctx.putImageData(floodFill.imageData, 0, 0);
  };


  const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setIsDrawing(true);
        if (tool === 'brush') {
          ctx.beginPath();
          ctx.moveTo(Math.floor(x), Math.floor(y));
        } else if (tool === 'fill') {
          bucketFill(ctx, Math.floor(x), Math.floor(y), color);
        }
      }
    }
  };

  const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    if (!isDrawing || tool !== 'brush') return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(Math.floor(x), Math.floor(y));
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Specify the willReadFrequently option
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), imageData]);
        setHistoryIndex(prevIndex => prevIndex + 1);
      }
    }
  };


  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyIndex - 1], 0, 0);
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(history[historyIndex + 1], 0, 0);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  };

  useEffect(() => {
    if (showBrushTool) {
      setTool("brush")
    }

    if (isConfirmed) {
      // Notify user
      async function notifyUser() {
        try {
          await fetch('/api/send-notify', {
            method: 'POST',
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: 891914,
              notificationDetails: { url, token },
              title: `New Scratch Art by @${username}`,
              body: "One Awesome Scratch of Art has been minted on the @base Network.",
              targetUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${Number(tokenId)}`,
            }),
          });
        } catch (error) {
          console.error("Notification error:", error);
        }
      };
      notifyUser();
    }

  }, [isConfirmed, showBrushTool, fid, url, token, username, tokenId])

  const saveDrawing = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');

      // Convert data URL to Blob
      const blob = await fetch(dataURL).then(res => res.blob());

      // Create FormData for Pinata upload
      const formData = new FormData();
      formData.append('file', blob, `scratches-${fid}`);
      try {

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });


        const data = await response.json();

        if (response.ok) {
          return data.ipfsHash; // Set the IPFS hash on success
        } else {
          console.log({ message: 'Something went wrong', type: 'error' });
        }
      } catch (err) {
        console.log({ message: 'Error uploading file', type: 'error', error: err });
      }
    }
  }

  const handleMint = async () => {
    const ipfsHash = await saveDrawing();
    if (ipfsHash) {

      writeContract({
        abi: scratchAbi,
        chainId: base.id,
        address: scratchAddress as `0x${string}`,
        functionName: "mint",
        value: parseEther("0.001"),
        args: [`ipfs://${ipfsHash}`],
      });

    } else {
      console.error("Failed to upload drawing to IPFS.");
    }
  };

  return (
    <main
      className="min-h-screen bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative"
      style={typeof safeAreaInsets === 'undefined'
        ? undefined
        : { paddingBottom: safeAreaInsets.bottom * 2.25 }}>

      {/* Header */}
      <div className="w-full p-4 flex flex-row justify-between items-center space-x-4">

        {showTool ? (
          <button
            onClick={() => setShowTool(false)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ToolMenu
              width={34}
              height={34} />
          </button>
        ) : (<button
          onClick={() => setShowTool(true)}
          className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
          <ToolMenu
            width={34}
            height={34} />
        </button>
        )}

        <div className="flex flex-row space-x-4">
          <button
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
            onClick={clearCanvas}
          >
            <Delete width={34} height={34} />
          </button>

          <div className="flex bg-slate-500 text-white rounded-2xl flex-row justify-between items-center gap-2">
            <Image className="object-cover rounded-l-2xl" src={pfpUrl as string} alt={username as string} width={50} height={50} priority />
            <p className="font-bold pr-3">{username}</p>
          </div>
        </div>

      </div>

      {/* Canvas */}
      <div ref={wrapperRef} className="flex justify-center items-center touch-none">
        <div className="w-full p-2 flex-1 flex mx-auto items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block w-full max-w-[384px] bg-gray-200 aspect-square cursor-crosshair shadow-inner touch-none rounded-2xl"
          />
        </div>
      </div>

      {/* Button Area */}
      <div className="w-full max-w-[384px] mx-auto" >

        {isConfirmed ? (
          <div className="flex p-2 mt-4 md:p-0 flex-col md:flex-row gap-2 justify-center items-center">
            <button
              className="w-full py-3 rounded-2xl bg-purple-500 text-white text-2xl font-semibold hover:bg-purple-700 transition"
              onClick={() => linkToBaseScan(hash)}
            >
              Proof
            </button>
            <ShareCastButton castMentions={fid} tokenId={Number(tokenId)} />
          </div>
        ) : (
          <div className="flex p-2 mt-4 md:p-0 flex-col md:flex-row gap-2 justify-center items-center">
            <SendCastButton castText="New Masterpiece of Scratch of Art by " castMentions={fid} getIPFSHash={() => saveDrawing()} />
            <button
              className="w-full py-3 rounded-2xl bg-purple-500 text-white text-2xl font-semibold hover:bg-purple-700 transition"
              disabled={chainId !== base.id || isPending || isConfirmed}
              onClick={handleMint}
            >
              {isPending
                ? "Confirming..."
                : isConfirming
                  ? "Waiting..."
                  : isConfirmed ? "Minted! 🎉" : "Mint"}
            </button>
          </div>
        )}

      </div>

      {showTool && (
        <div className="absolute flex flex-col space-y-6 top-4 left-4">

          {/* Menu Opened */}
          <button
            onClick={() => setShowTool(false)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ToolMenu
              width={34}
              height={34} />
          </button>

          {/* Color Picker Button */}
          <button
            onClick={() => setShowColorPicker(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <ColorPallete
              width={34}
              height={34} />
          </button>

          {/*Brush button */}
          <button
            onClick={() => setShowBrushTool(true)}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
          >
            <PaintBrush
              width={34}
              height={34} />
          </button>

          {/* Fill Button */}
          <button
            onClick={() => setTool('fill')}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400"
          >
            <ColorBucket
              width={34}
              height={34} />
          </button>

          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <Undo
              width={34}
              height={34} />
          </button>

          {/* Redo Button */}
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-200 border border-spacing-2 border-blue-400 shadow-md rounded-2xl bg-blue-200 active:bg-blue-400">
            <Redo
              width={34}
              height={34} />
          </button>

        </div>
      )}

      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="flex space-y-4 flex-col bg-white p-4 rounded-md shadow-lg">
            <SketchPicker
              color={color}
              onChange={(newColor) => setColor(newColor.hex)}
            />
            <button
              onClick={() => setShowColorPicker(false)}
              className="w-full py-2 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {showBrushTool && (
        <div className="fixed flex flex-col space-y-4 p-4 inset-0 items-center justify-center z-10 bg-gray-900 bg-opacity-50">
          <div className="w-64 p-4 bg-gray-200 rounded-2xl">
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
              aria-label="Brush size"
            />
          </div>
          <button
            onClick={() => setShowBrushTool(false)}
            disabled={isPending}
            className="w-64 py-2 rounded-2xl bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      )}

      {/* Transaction Error */}
      {error && (
        <div className="fixed bottom-0 w-full flex justify-between shadow-md">
          <div className="bg-red-500 p-4 text-center text-white">Error: {(error as BaseError).shortMessage || error.message}</div>
        </div>
      )}

    </main>
  );
};


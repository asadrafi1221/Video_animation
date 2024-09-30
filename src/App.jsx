import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useScroll, useMotionValueEvent, useTransform, animate } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Ensure canvas always fills the screen
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    updateCanvasSize(); // Initial setting
    window.addEventListener("resize", updateCanvasSize); // Handle resizing

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from("img", {
      x: -500,
      duration: 1.5,
      opacity: 0,
    })
      .from(".text-animation", {
        y: -88,
        duration: 1.3,
        opacity: 0,
        ease: "bounce",
      })
      .from(".text-div h1", {
        x: -88,
        opacity: 0,
        ease: "bounce",
        stagger: 0.5,
      })
      .from(".text-div p", {
        y: -99,
        opacity: 0,
        ease: "bounce",
      });
  }, []);

  const images = useMemo(() => {
    const loadingImages = [];
    const promises = [];

    for (let i = 2; i <= 27; i++) {
      const img = new Image();
      img.src = `../images/frame000${i}1.png`;
      if (i >= 10) {
        img.src = `../images/frame00${i}1.png`;
      }

      promises.push(
        new Promise((resolve, reject) => {
          img.onload = () => {
            resolve(img);
          };
          img.onerror = () => {
            reject(new Error(`Failed to load image: ${img.src}`));
          };
        })
      );

      loadingImages.push(img);
    }

    return loadingImages;
  }, []);

  const currentIndex = useTransform(scrollYProgress, [0, 1], [0, images.length - 1]);

  const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
  };

  const render = useCallback(
    (index) => {
      const canvas = canvasRef.current;
      if (canvas && images[Math.floor(index)]) {
        const context = canvas.getContext("2d");
        const image = images[Math.floor(index)];

        if (image.complete && image.naturalHeight !== 0) {
          context.clearRect(0, 0, canvas.width, canvas.height);

          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const imgRatio = image.width / image.height;
          const canvasRatio = canvasWidth / canvasHeight;

          let drawWidth, drawHeight;

          // Adjusting to always fill the canvas, cropping sides as needed
          if (imgRatio > canvasRatio) {
            drawHeight = canvasHeight;
            drawWidth = drawHeight * imgRatio;
          } else {
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imgRatio;
          }

          const xOffset = (canvasWidth - drawWidth) / 2;
          const yOffset = (canvasHeight - drawHeight) / 2;

          context.drawImage(image, xOffset, yOffset, drawWidth, drawHeight);
        } else {
          console.error(`Image not loaded: ${image.src}`);
        }
      }
    },
    [images]
  );

  useMotionValueEvent(currentIndex, "change", (latest) => {
    const start = currentIndex.getPrevious();
    animate(0, 1, {
      duration: 0.2,
      onUpdate: (t) => {
        const smoothIndex = lerp(start, latest, t);
        render(smoothIndex);
      },
    });
  });

  return (
    <>
      <div className="text-white text-[10vw] absolute z-[-1] top-0 left-10 text-animation">
        Cristiano
      </div>
      <div className="relative z-30 bg-transparent flex flex-col justify-end items-center h-[100vh]">
        <img
          src="../Ronaldo-removebg-preview (1).png"
          alt="Cristiano Ronaldo"
          className="h-[80vh] w-[50vw] object-cover"
        />
      </div>
      <div className="fixed text-white bottom-[10%] flex items-center justify-center w-[100vw] z-50">
        <div className="flex p-2 rounded-xl list-none w-[20vw] bg-transparent backdrop-blur-lg backdrop-filter justify-around max-h-[12vh]">
          {Array(4).fill(null).map((_, index) => (
            <li key={index} className="blur-none rounded-full h-12 w-12 flex items-center justify-center shadow-sm shadow-gray-400 transition-all duration-300 text-white hover:scale-[1.4] hover:translate-y-[-20px] hover:bg-black">
              H
            </li>
          ))}
        </div>
      </div>
      <div className="h-[100vh] text-white p-10 backdrop-blur-xl text-div">
        <h1 className="text-[10vw]">Amazing Dev</h1>
        <h1 className="text-[10vw]">With</h1>
        <p className="text-[5vw] text-red-400">Watch some Magic</p>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          backgroundPosition: "fixed",
          height: "400vh",
        }}
      >
        {/* Full Screen Responsive Canvas */}
        <canvas
          style={{
            position: "sticky",
            top: 0,
            width: "100vw", // Always fills the width of the viewport
            height: "100vh", // Always fills the height of the viewport
            background: "black",
          }}
          ref={canvasRef}
        />

        <div style={{ height: "100vh" }}></div>
      </div>

      <div className="h-[100vh] text-[10vw] text-red-600 relative left-20">
        <h1>Hope you like</h1>
      </div>
    </>
  );
}

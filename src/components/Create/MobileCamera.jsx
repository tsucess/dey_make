import { useEffect, useRef, useState } from "react";
import { FaCameraRotate } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function MobileCamera({ onClose, className = "" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(true);
  const [facingMode, setFacingMode] = useState("environment");
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  function openGallery() {
    inputRef.current?.click();
  }

  function handleGalleryChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        setLoading(true);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
          },
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraError("");
      } catch (err) {
        console.error(err);
        setCameraError("Unable to access your camera.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (cameraOn) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOn, facingMode]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleClose = () => {
    setCameraOn(false);
    navigate("/home");

    // if (onClose) {
    //   onClose();
    // }
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 ${className}`}>
      {/* Camera */}

      {preview ? (
        <video
          src={preview}
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white">Opening camera...</p>
        </div>
      )}

      {/* Error */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6">
          <p className="text-white text-center">{cameraError}</p>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-5 left-0 right-0 px-5 flex justify-between z-20">
        <button
          onClick={handleClose}
          className="w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center"
        >
          <IoClose size={24} />
        </button>

        <button
          onClick={switchCamera}
          className="w-11 h-11 rounded-full bg-black/50 text-white flex items-center justify-center"
        >
          <FaCameraRotate size={20} />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center z-20">
        <button className="w-15 h-15 rounded-full border-4 border-white bg-red-500" />
      </div>
      <div className="flex absolute bottom-0 left-0 w-full items-center gap-8 py-4 px-3 bg-slate100 backdrop-blur-md backdrop-brightness-110">
        <button onClick={openGallery}>
          <img src="/gallery.png" alt="" />
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/*,video/*"
          onChange={handleGalleryChange}
        />
        <div className="flex items-center w-40">
          <button
            className={`border-b-2 border-slate150 text-slate150 text-sm font-semibold hover:border-orange100 hover:text-orange100 uppercase flex-1 cursor-pointer`}
          >
            Post
          </button>
          <button
            onClick={() => navigate("/live-preview")}
            className={`border-b-2 border-slate150 text-slate150 text-sm font-semibold hover:border-orange100 hover:text-orange100 uppercase flex-1 cursor-pointer`}
          >
            Live
          </button>
        </div>
      </div>
    </div>
  );
}

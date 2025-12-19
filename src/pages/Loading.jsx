import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const ENABLE_CAMERA_INTRO = true;

export default function Loading() {
  const lines = useMemo(
    () => [
      'Generating Trajectories',
      'Accessing Government Repositories',
      'Accessing Private Repositories',
      'Aligning Paths',
    ],
    []
  );

  // Original State
  const [visibleCount, setVisibleCount] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [qubitCount, setQubitCount] = useState(0);
  const [hasStartedCounting, setHasStartedCounting] = useState(false);

  // Counter Effect
  useEffect(() => {
    // Start counting when at least one line is visible (which is "Accessing Government Repositories")
    if (visibleCount >= 1 && !hasStartedCounting) {
      setHasStartedCounting(true);
      const target = 128000001;
      const duration = 8000; // 4 seconds to reach target
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        const current = Math.floor(ease * target);
        setQubitCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [visibleCount, hasStartedCounting]);

  // Camera State
  const [cameraActive, setCameraActive] = useState(ENABLE_CAMERA_INTRO);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null);

  const navigate = useNavigate();

  // Load MediaPipe Model
  useEffect(() => {
    if (!ENABLE_CAMERA_INTRO) return;

    const loadModel = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU'
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        setModelLoaded(true);
      } catch (error) {
        console.error("Error loading face landmarker:", error);
        // Fallback to normal flow if model fails
        setCameraActive(false);
      }
    };

    loadModel();

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  // Handle Camera & Detection
  useEffect(() => {
    if (!cameraActive || !modelLoaded) return;

    let stream = null;
    let detectionTimeout = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
      }
    };

    const predictWebcam = () => {
      if (!videoRef.current || !canvasRef.current || !faceLandmarkerRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Resize canvas to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let startTimeMs = performance.now();
      if (video.currentTime > 0) {
        const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];

          // Draw Connectors for Eyes, Nose, Mouth using MediaPipe definitions if available
          // Or manually drawing key components for a "marking" effect

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00FF00'; // Matrix/Tech green

          // Helper to draw path
          const drawPath = (indices, close = false) => {
            ctx.beginPath();
            const first = landmarks[indices[0]];
            ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
            for (let i = 1; i < indices.length; i++) {
              const point = landmarks[indices[i]];
              ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
            }
            if (close) ctx.closePath();
            ctx.stroke();
          };

          // Indices for features (approximate for standard mesh)
          // Left Eye
          drawPath([33, 160, 158, 133, 153, 144, 163, 7], true);
          // Right Eye
          drawPath([362, 385, 387, 263, 373, 380, 374, 396], true);
          // Nose (vertical line + base)
          drawPath([168, 6, 197, 195, 5, 4]);
          // Mouth (outer lip)
          drawPath([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185], true);

          // If we detected a face, wait a bit then transition
          if (!detectionTimeout) {
            detectionTimeout = setTimeout(() => {
              setCameraActive(false);
            }, 2000); // Show markings for 2 seconds
          }
        }
      }

      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(requestRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (detectionTimeout) clearTimeout(detectionTimeout);
    };
  }, [cameraActive, modelLoaded]);


  // Original Text Animation Logic
  useEffect(() => {
    // Only start text animation if camera is NOT active
    if (!cameraActive) {
      if (visibleCount <= lines.length) {
        const timer = setTimeout(() => {
          setVisibleCount((c) => c + 1);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [visibleCount, lines.length, cameraActive]);

  const allShown = visibleCount > lines.length;

  useEffect(() => {
    if (allShown) {
      setIsButtonLoading(true);
      const timer = setTimeout(() => {
        setIsButtonLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allShown]);

  return (
    <div style={styles.container}>
      {cameraActive ? (
        <div style={styles.cameraContainer}>
          {!modelLoaded && <div style={styles.subtle}>Initializing Neural Interface...</div>}
          <div style={styles.videoWrapper}>
            <video ref={videoRef} autoPlay playsInline style={styles.video} muted></video>
            <canvas ref={canvasRef} style={styles.canvas}></canvas>
          </div>
          {modelLoaded && <div style={styles.scanText}>Scanning Biometrics...</div>}
        </div>
      ) : (
        <>
          {visibleCount >= 1 && (
            <div style={styles.qubitCounter}>
              Initiated {qubitCount.toLocaleString()} Qubits
            </div>
          )}
          <div style={styles.listContainer}>
            {lines.slice(0, visibleCount).map((text, idx) => (
              <div key={idx} style={styles.line}>
                {text}
              </div>
            ))}
          </div>

          {allShown && (
            <button
              style={{
                ...styles.button,
                ...(isButtonLoading ? styles.buttonLoading : styles.buttonReady),
              }}
              onClick={() => navigate('/information')}
            >
              {isButtonLoading ? (
                <span style={styles.spinner} aria-label="Loading" />
              ) : (
                <span style={styles.buttonText}>Observe</span>
              )}
            </button>
          )}

          {!allShown && <div style={styles.subtle}>Please wait…</div>}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#fff' // Ensure background is set
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
  },
  videoWrapper: {
    position: 'relative',
    width: '800px', // Increased size
    maxWidth: '90vw',
    aspectRatio: '4/3',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)' // Mirror effect
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: 'scaleX(-1)' // Mirror effect to match video
  },
  scanText: {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#111827',
    animation: 'pulse 2s infinite'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '16px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qubitCounter: {
    position: 'absolute',
    top: '15vh',
    width: '100%',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    fontFamily: 'monospace',
    textAlign: 'center',
    animation: 'fadeInUp 0.5s ease-out forwards',
  },
  line: {
    fontSize: '18px',
    color: '#111827',
    textAlign: 'center',
    animation: 'fadeInUp 0.35s ease-out forwards',
  },
  button: {
    backgroundColor: '#111827',
    padding: '10px 16px',
    borderRadius: '8px',
    marginTop: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonLoading: {
    animation: 'padExpand 2s ease-in-out forwards',
  },
  buttonReady: {
    padding: '10px 1000px',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  subtle: {
    color: '#6B7280',
    marginTop: '8px',
  },
};

// It's cleaner to add keyframes to index.css, but for component-specific styles, this works.
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    // Check if rule exists before inserting to generate less errors in some cases,
    // though insertRule doesn't error on duplicate names usually.
    // We wrap in try-catch.
    const ruleExists = (name) => {
      for (let i = 0; i < styleSheet.cssRules.length; i++) {
        if (styleSheet.cssRules[i].name === name) return true;
        if (styleSheet.cssRules[i].selectorText === name) return true;
      }
      return false;
    };

    if (!ruleExists('fadeInUp')) {
      styleSheet.insertRule(`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `, styleSheet.cssRules.length);
    }
    if (!ruleExists('spin')) {
      styleSheet.insertRule(`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `, styleSheet.cssRules.length);
    }
    if (!ruleExists('padExpand')) {
      styleSheet.insertRule(`
                @keyframes padExpand {
                    from { padding: 10px 16px; }
                    to { padding: 10px 1600px; }
                }
            `, styleSheet.cssRules.length);
    }
    if (!ruleExists('pulse')) {
      styleSheet.insertRule(`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `, styleSheet.cssRules.length);
    }
  } catch (e) {
    console.error("Could not insert keyframes rule:", e);
  }
}

import React, { useState, useEffect, useRef } from 'react';
import type { StoryPage } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Make TypeScript aware of the jsPDF global variable from the script tag
declare var jspdf: any;

const PAGE_TURN_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_0c4482ce6a.mp3';
const MAGICAL_CHIME_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3925763570.mp3';

const EnterFullScreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m0 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m0 0v-4m0 4l-5-5" />
    </svg>
);

const ExitFullScreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const RegenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);


/**
 * Plays a sound from a given URL, handling errors gracefully.
 * @param {string} url The URL of the sound file to play.
 */
const playSound = (url: string) => {
  try {
    const audio = new Audio(url);
    audio.play().catch(error => {
      // Autoplay can be prevented by the browser; we'll log a warning but not interrupt the user.
      console.warn("Sound playback was prevented by the browser.", error);
    });
  } catch (error) {
    console.error("Failed to play sound:", error);
  }
};

interface StoryDisplayProps {
  story: StoryPage[];
  isLoading: boolean;
  error: string | null;
  onRegenerateImage: (pageIndex: number) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, error, onRegenerateImage }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to the first page whenever a new story is generated.
  useEffect(() => {
    setCurrentPage(0);
    // Exit fullscreen if a new story is generated while in fullscreen mode
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [story]);

  // Play the magical chime whenever the current page's content is displayed.
  useEffect(() => {
    if (story[currentPage] && !isLoading && !isTransitioning) {
      const timer = setTimeout(() => {
        playSound(MAGICAL_CHIME_SOUND_URL);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPage, story, isLoading, isTransitioning]);

  // When the page content has been updated, this effect handles the "fade-in".
  useEffect(() => {
    if (isTransitioning) {
      setIsTransitioning(false);
    }
  }, [currentPage]);

  // Handle fullscreen changes (e.g., user pressing ESC key)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const changePage = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    const targetPage = direction === 'next'
      ? Math.min(currentPage + 1, story.length - 1)
      : Math.max(currentPage - 1, 0);

    if (targetPage === currentPage) return;

    playSound(PAGE_TURN_SOUND_URL);
    setIsTransitioning(true); // Start the "fade-out" animation

    // After the fade-out, update the page content. The useEffect above will handle the fade-in.
    setTimeout(() => {
      setCurrentPage(targetPage);
    }, 300); // This duration must match the transition duration
  };
  
  const goToNextPage = () => changePage('next');
  const goToPreviousPage = () => changePage('prev');

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  const handleSaveAsPDF = async () => {
    if (!story || story.length === 0 || isSaving) return;
    
    setIsSaving(true);
    try {
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        for (let i = 0; i < story.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            const page = story[i];

            // Add Image
            if (page.imageUrl) {
                const imgProps = pdf.getImageProperties(page.imageUrl);
                const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
                pdf.addImage(page.imageUrl, 'JPEG', margin, margin, contentWidth, imgHeight);
                
                let textY = margin + imgHeight + 40; // More space after image

                // Add Text
                if (i === 0) { // Cover Page is now a dedicated Title Page
                    pdf.setFont('Times', 'bold');
                    pdf.setFontSize(32); // Larger font for title
                    pdf.text(page.pageText, pageWidth / 2, textY, { align: 'center', maxWidth: contentWidth });
                } else { // Story Page
                    pdf.setFont('Times', 'normal');
                    pdf.setFontSize(12);
                    const lines = pdf.splitTextToSize(page.pageText, contentWidth);
                    pdf.text(lines, margin, textY);

                    // Add Page Number
                    const pageNumText = `${i}`;
                    pdf.setFontSize(10);
                    pdf.setTextColor(150); // Set color to a light gray
                    pdf.text(pageNumText, pageWidth / 2, pageHeight - (margin / 2), { align: 'center' });
                    pdf.setTextColor(0); // Reset text color to black
                }
            } else {
                 pdf.text("Image not available.", margin, margin);
                 pdf.text(page.pageText, margin, margin + 20);
                 
                 // Still add page number for story pages without images
                 if (i > 0) {
                    const pageNumText = `${i}`;
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text(pageNumText, pageWidth / 2, pageHeight - (margin / 2), { align: 'center' });
                    pdf.setTextColor(0);
                 }
            }
        }
        
        const title = story[0]?.pageText || 'My TaleCraft Story';
        const filename = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.pdf';
        pdf.save(filename);

    } catch (err) {
        console.error("Failed to generate PDF:", err);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        setIsSaving(false);
    }
};


  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-serif font-bold text-red-700">Oops! Something went wrong.</h3>
            <p className="text-brand-light-text mt-2">{error}</p>
        </div>
      );
    }

    if (story.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h3 className="text-2xl font-serif font-bold text-brand-text">Your story awaits!</h3>
          <p className="text-brand-light-text mt-2">Fill out the options on the left to begin your magical journey.</p>
        </div>
      );
    }
    
    const page = story[currentPage];
    const isImageLoading = page?.isImageLoading || false;

    return (
        <div className={`relative p-4 h-full flex flex-col items-center ${isFullscreen ? 'w-full h-full justify-center' : ''}`}>
            {story.length > 0 && (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                        onClick={toggleFullScreen}
                        className="p-2 rounded-full bg-white/50 backdrop-blur-sm text-brand-text hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                        aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                    >
                        {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
                    </button>
                </div>
            )}
            <div className={`flex-grow flex flex-col w-full transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform -translate-y-3' : 'opacity-100 transform translate-y-0'} ${isFullscreen ? 'max-w-6xl' : ''}`}>
                <div className={`relative ${isFullscreen ? 'aspect-w-16 aspect-h-9' : 'aspect-w-4 aspect-h-3'} w-full rounded-lg overflow-hidden shadow-lg bg-gray-200`}>
                    {page.imageUrl ? (
                        <img 
                            src={page.imageUrl} 
                            alt={currentPage === 0 ? `Cover for ${page.pageText}` : `Illustration for page ${currentPage}`} 
                            className="object-cover w-full h-full" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-brand-light-text">Generating image...</p>
                        </div>
                    )}
                    {isImageLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                             <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                        </div>
                    )}
                    {currentPage > 0 && !isImageLoading && (
                         <button
                            onClick={() => onRegenerateImage(currentPage)}
                            disabled={isImageLoading}
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm text-brand-text hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Regenerate image for this page"
                        >
                            <RegenerateIcon />
                        </button>
                    )}
                </div>
                 <div className={`flex-grow flex ${currentPage === 0 ? 'items-center justify-center' : 'items-start'} pt-4`}>
                    {currentPage === 0 ? (
                        <h2 className={`font-serif font-bold text-brand-text text-center px-2 transition-all ${isFullscreen ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                            {page.pageText}
                        </h2>
                    ) : (
                        <p className={`text-brand-text leading-relaxed font-sans transition-all ${isFullscreen ? 'text-lg md:text-xl' : 'text-lg'}`}>
                            {page.pageText}
                        </p>
                    )}
                </div>
            </div>
             <div className={`flex items-center justify-between mt-4 w-full ${isFullscreen ? 'max-w-6xl' : ''}`}>
                <button 
                    onClick={goToPreviousPage} 
                    disabled={currentPage === 0 || isSaving || isImageLoading} 
                    className={`px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition ${isFullscreen ? 'text-base' : 'text-sm'}`}
                >
                    Previous
                </button>
                <div className="flex items-center gap-4">
                     <span className={`font-medium text-brand-light-text ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                      {currentPage === 0 ? 'Cover' : `Page ${currentPage} of ${story.length - 1}`}
                    </span>
                    {story.length > 0 && (
                         <button
                            onClick={handleSaveAsPDF}
                            disabled={isSaving || isImageLoading}
                            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition ${isFullscreen ? 'text-base' : 'text-sm'}`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon />
                                    Save
                                </>
                            )}
                        </button>
                    )}
                </div>
                <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === story.length - 1 || isSaving || isImageLoading} 
                    className={`px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition ${isFullscreen ? 'text-base' : 'text-sm'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
  };
  
  return (
    <div 
        ref={containerRef}
        className={`bg-white/80 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center min-h-[40rem] overflow-hidden transition-all duration-300
        ${isFullscreen ? 'fixed inset-0 z-50 !rounded-none bg-brand-bg/95' : 'relative'}`}
    >
        {renderContent()}
    </div>
  );
};

export default StoryDisplay;
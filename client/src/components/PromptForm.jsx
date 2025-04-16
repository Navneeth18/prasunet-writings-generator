import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionContext';
import { userAPI } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { MOODS, TYPES, GENRES, LENGTHS } from '../constants/promptOptions';

export default function PromptForm() {
  const { user, isSignedIn, isLoaded } = useAuth();

  // Authentication status effect
  useEffect(() => {
    // Check authentication status silently
  }, [isSignedIn, isLoaded, user]);

  // Handle click outside for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const { collections, createCollection, addWritingToCollection } = useCollections();
  const { theme } = useTheme();

  const [mood, setMood] = useState('Happy');
  const [type, setType] = useState('Poetry');
  const [genre, setGenre] = useState('Fantasy');
  const [length, setLength] = useState('Medium');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [promptId, setPromptId] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const exportDropdownRef = useRef(null);
  const shareDropdownRef = useRef(null);

  const generateWriting = async () => {
    if (!isSignedIn || !user?._id) {
      setError('You must be signed in to generate writing');
      return;
    }

    if (!customPrompt) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await userAPI.generatePrompt({
        text: customPrompt,
        genre,
        type,
        length,
        mood,
        user: user._id
      });

      setGenerated(response.data.prompt.response);
      setPromptId(response.data.prompt._id);
    } catch (error) {
      setError(`Failed to generate writing: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
        setShowShareDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportDropdownRef, shareDropdownRef]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to share content to social media
  const shareToSocialMedia = (platform) => {
    try {
      // Clean HTML tags from the generated text
      const cleanedText = cleanHtmlTags(generated);

      // Create a shareable text with title and content
      const title = `${type} - ${genre}`;
      const shareText = encodeURIComponent(`${title}\n\n${cleanedText.substring(0, 300)}${cleanedText.length > 300 ? '...' : ''}\n\nCreated with WriteCraft`);

      // Set up sharing URLs for different platforms
      let shareUrl = '';

      switch(platform) {
        case 'instagram':
          // Copy content to clipboard first
          navigator.clipboard.writeText(`${title}\n\n${cleanedText}\n\nCreated with WriteCraft`);

          // Open Instagram in a new tab
          window.open('https://www.instagram.com/', '_blank');

          setShareSuccess('Content copied to clipboard! Instagram opened in a new tab.');
          break;

        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
          window.open(shareUrl, '_blank');
          setShareSuccess('Opening Twitter to share your writing!');
          break;

        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${shareText}`;
          window.open(shareUrl, '_blank');
          setShareSuccess('Opening Facebook to share your writing!');
          break;

        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}&summary=${shareText}`;
          window.open(shareUrl, '_blank');
          setShareSuccess('Opening LinkedIn to share your writing!');
          break;

        default:
          navigator.clipboard.writeText(`${title}\n\n${cleanedText}\n\nCreated with WriteCraft`);
          setShareSuccess('Content copied to clipboard!');
      }

      // Hide the dropdown
      setShowShareDropdown(false);

      // Clear success message after 3 seconds
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (error) {
      console.error('Sharing error:', error);
      setError('Failed to share content. Please try again.');
      setShowShareDropdown(false);
    }
  };

  // Helper function to clean HTML tags from text
  const cleanHtmlTags = (html) => {
    if (!html) return '';

    // Replace <em> tags with underscores for emphasis in plain text
    let cleanText = html.replace(/<em>(.*?)<\/em>/g, '_$1_');
    // Remove any other HTML tags that might be present
    cleanText = cleanText.replace(/<[^>]*>/g, '');
    return cleanText;
  };

  // Helper function to ensure underscores are preserved for emphasis in text export
  const preserveEmphasis = (text) => {
    if (!text) return '';

    // Make sure we don't have double underscores from previous processing
    let cleanText = text.replace(/_{2,}/g, '_');
    return cleanText;
  };

  const exportAsTxt = () => {
    try {
      // Close the dropdown
      setShowExportDropdown(false);

      // Clean HTML tags from the generated text
      const cleanedText = cleanHtmlTags(generated);

      // Ensure emphasis formatting is preserved
      const formattedText = preserveEmphasis(cleanedText);

      // Create content with title and metadata
      // For poetry, ensure we have proper spacing
      let formattedContent;
      if (type === 'Poetry') {
        // For poetry, preserve exact line breaks
        formattedContent = `${type} - ${genre}\n\nMood: ${mood} | Length: ${length}\n\n${formattedText}`;
      } else {
        formattedContent = `${type} - ${genre}\n\nMood: ${mood} | Length: ${length}\n\n${formattedText}`;
      }

      const content = formattedContent;

      // Create a blob with the content
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      // Create a filename based on the type and genre
      const filename = `${type.toLowerCase().replace(/ /g, '-')}_${genre.toLowerCase().replace(/ /g, '-')}.txt`;

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);

      // Show success message
      setExportSuccess('Text file downloaded successfully!');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (error) {
      setError('Failed to create text file. Please try again.');
    }
  };

  const exportAsPdf = () => {
    try {
      // Close the dropdown
      setShowExportDropdown(false);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const textWidth = pageWidth - (margin * 2);
      let currentY = 20; // Start at a reasonable position at the top

      // Add title with proper centering
      doc.setFontSize(16); // Reasonable title size
      doc.setFont('helvetica', 'bold');
      const title = `${type} - ${genre}`;
      doc.text(title, pageWidth / 2, currentY, { align: 'center' });
      currentY += 12; // Reduced space after title

      // Add metadata with proper centering
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      const metadata = `Mood: ${mood} | Length: ${length}`;
      doc.text(metadata, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15; // Reduced space after metadata

      // Clean HTML tags from the generated text
      const cleanedText = cleanHtmlTags(generated);

      // Add content with word wrapping
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // For PDF export, we'll simplify by removing the emphasis markers
      // but keeping the text. This ensures clean PDF output without formatting issues.
      const simplifiedText = cleanedText.replace(/_([^_]+)_/g, '$1');

      // Special handling for poetry - preserve line breaks exactly
      if (type === 'Poetry') {
        // Split content by lines, preserving empty lines for poetry formatting
        const lines = simplifiedText.split('\n');

        // Track if we're in a stanza or between stanzas
        let inStanza = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check if we need a new page
          if (currentY > 270) { // ~20mm from bottom
            doc.addPage();
            currentY = 20;
          }

          // If it's an empty line, it's a stanza break
          if (line.trim() === '') {
            if (inStanza) {
              // End of a stanza - add a small gap
              currentY += 6; // Reduced space between stanzas
              inStanza = false;
            }
            continue;
          }

          // We're in a stanza
          inStanza = true;

          // Render the line with proper alignment
          doc.text(line, margin, currentY);
          currentY += 6; // Reduced spacing between lines of poetry (was 10)
        }
      } else {
        // For other content types, process as paragraphs
        const paragraphs = simplifiedText.split('\n').filter(p => p.trim() !== '');

        paragraphs.forEach(paragraph => {
          // Check if we need a new page
          if (currentY > 270) { // ~20mm from bottom
            doc.addPage();
            currentY = 20;
          }

          // Render the paragraph normally
          const textLines = doc.splitTextToSize(paragraph, textWidth);
          doc.setFont('helvetica', 'normal');
          doc.text(textLines, margin, currentY);
          currentY += (textLines.length * 6) + 6; // Reduced space after paragraph (was 7+10)
        });
      }

      // Create a filename based on the type and genre
      const filename = `${type.toLowerCase().replace(/ /g, '-')}_${genre.toLowerCase().replace(/ /g, '-')}.pdf`;

      // Save the PDF
      doc.save(filename);

      // Show success message
      setExportSuccess('PDF downloaded successfully!');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      setError('Failed to create PDF. Please try again.');
    }
  };

  const exportAsDocx = () => {
    try {
      // Close the dropdown
      setShowExportDropdown(false);

      // Clean HTML tags from the generated text but keep track of emphasis
      let cleanedText = generated;

      // Replace <em> tags with RTF italic formatting codes
      cleanedText = cleanedText.replace(/<em>(.*?)<\/em>/g, '\\i $1\\i0 ');

      // Remove any other HTML tags that might be present
      cleanedText = cleanedText.replace(/<[^>]*>/g, '');

      // Create a rich text document using RTF format
      // RTF is a format that Word can open
      let rtfContent = '{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}{\\colortbl ;\\red0\\green0\\blue255;}';

      // Add title with formatting
      rtfContent += '\\viewkind4\\uc1\\pard\\qc\\b\\f0\\fs32 ' + type + ' - ' + genre + '\\par\\par';

      // Add metadata
      rtfContent += '\\pard\\qj\\i\\fs22 Mood: ' + mood + ' | Length: ' + length + '\\par\\par';

      // Process the content to handle line breaks and emphasis
      // Replace underscores with RTF italic formatting
      cleanedText = cleanedText.replace(/_([^_]+)_/g, '\\i $1\\i0 ');

      // Special handling for poetry in RTF
      if (type === 'Poetry') {
        // For poetry, we want to preserve exact line breaks and use left alignment
        rtfContent += '\\pard\\ql\\i0\\b0\\fs24\\sl240\\slmult1 '; // Reduced line spacing

        // Split by lines and add proper RTF line breaks
        const lines = cleanedText.split('\n');
        let inStanza = false;

        for (let i = 0; i < lines.length; i++) {
          // Handle empty lines (stanza breaks)
          if (lines[i].trim() === '') {
            if (inStanza) {
              // End of stanza
              rtfContent += '\\par\\par ';
              inStanza = false;
            }
            continue;
          }

          // We're in a stanza
          inStanza = true;

          rtfContent += lines[i];
          if (i < lines.length - 1 && lines[i+1].trim() !== '') {
            // Add line break within stanza
            rtfContent += '\\par ';
          }
        }
        rtfContent += '\\par';
      } else {
        // For other content types, use justified alignment with normal spacing
        rtfContent += '\\pard\\qj\\i0\\b0\\fs24 ' + cleanedText.replace(/\n/g, '\\par ') + '\\par';
      }

      // Close RTF document
      rtfContent += '}'

      // Create a blob with the RTF content
      const blob = new Blob([rtfContent], { type: 'application/rtf' });

      // Create a filename based on the type and genre
      const filename = `${type.toLowerCase().replace(/ /g, '-')}_${genre.toLowerCase().replace(/ /g, '-')}.rtf`;

      // Save the document
      saveAs(blob, filename);

      // Show success message
      setExportSuccess('Word document (RTF) downloaded successfully!');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (error) {
      console.error('RTF export error:', error);
      setError('Failed to create Word document. Please try again.');
    }
  };

  const handleSaveToCollection = async (collectionId) => {
    if (!promptId) {
      setError('No writing to save');
      return;
    }

    try {
      await addWritingToCollection(collectionId, promptId);
      setShowCollectionModal(false);
    } catch (error) {
      setError('Failed to save to collection. Please try again.');
    }
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = await createCollection(newCollectionName.trim());
      if (newCollection && promptId) {
        await addWritingToCollection(newCollection._id, promptId);
      }
      setNewCollectionName('');
      setShowCollectionModal(false);
    } catch (error) {
      setError('Failed to create collection. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">🪄 Writing Prompt Generator</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Select options below to generate creative writing based on your preferences</p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mood-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mood</label>
            <select
              id="mood-select"
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full dropdown-select"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              aria-label="Select the mood for your writing"
            >
              <option value="">Select a mood...</option>
              {MOODS.map(m => <option key={m}>{m}</option>)}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The emotional tone of your writing</p>
          </div>

          <div>
            <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              id="type-select"
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full dropdown-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Select the type of writing"
            >
              <option value="">Select a type...</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {type === 'Social Media Caption' ?
                'Generate engaging captions for Instagram, Twitter, or other social platforms' :
                'The format of your writing'}
            </p>
          </div>

          <div>
            <label htmlFor="genre-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
            <select
              id="genre-select"
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full dropdown-select"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              aria-label="Select the genre for your writing"
            >
              <option value="">Select a genre...</option>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The style or category of your writing</p>
          </div>

          <div>
            <label htmlFor="length-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length</label>
            <select
              id="length-select"
              className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 w-full dropdown-select"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              aria-label="Select the length of your writing"
            >
              <option value="">Select a length...</option>
              {LENGTHS.map(l => <option key={l}>{l}</option>)}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">How long your writing should be</p>
          </div>
        </div>

        <div className="mt-2">
          <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Prompt</label>
          <textarea
            id="custom-prompt"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            placeholder={type === 'Social Media Caption' ?
              "Enter details about what you want captions for. For example: 'Create captions for a beach sunset photo' or 'Generate captions for my new product launch post'..." :
              "Enter specific details or instructions for your writing. For example: 'Write about a journey through an enchanted forest where time flows differently' or 'Create a poem about the changing seasons and their effect on human emotions'..."}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Be specific with your prompt for better results</p>
        </div>

        <button
          onClick={generateWriting}
          disabled={isLoading || !isSignedIn}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium flex items-center justify-center gap-2 w-full sm:w-auto mt-4"
        >
          <span className="text-lg">✨</span>
          <span>{isLoading ? 'Generating...' : 'Generate Writing'}</span>
        </button>

        {!isSignedIn && (
          <p className="text-sm text-amber-600 dark:text-amber-400">You must be signed in to generate writing</p>
        )}

        {generated && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div
              className="text-lg text-gray-800 dark:text-gray-200 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: generated }}
            />
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors"
              >
                📋 Copy
              </button>
              {copied && <span className="text-green-600 dark:text-green-400 text-sm">Copied to clipboard!</span>}
              {exportSuccess && <span className="text-green-600 dark:text-green-400 text-sm ml-2">{exportSuccess}</span>}
              {shareSuccess && <span className="text-green-600 dark:text-green-400 text-sm ml-2">{shareSuccess}</span>}

              {/* Export Dropdown */}
              <div className="relative inline-block action-dropdown" ref={exportDropdownRef}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors"
                >
                  ⬇️ Export
                </button>
                <div className={`${showExportDropdown ? '' : 'hidden'} action-dropdown-menu-up w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700`}>
                  <button
                    onClick={() => {
                      exportAsTxt();
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as TXT
                  </button>
                  <button
                    onClick={() => {
                      exportAsPdf();
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      exportAsDocx();
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export as Word (RTF)
                  </button>
                </div>
              </div>

              {/* Share Dropdown */}
              <div className="relative inline-block action-dropdown" ref={shareDropdownRef}>
                <button
                  onClick={() => setShowShareDropdown(!showShareDropdown)}
                  className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors"
                >
                  🔗 Share
                </button>
                <div className={`${showShareDropdown ? '' : 'hidden'} action-dropdown-menu-up w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700`}>
                  <button
                    onClick={() => shareToSocialMedia('instagram')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-pink-600">📸</span> Instagram
                  </button>
                  <button
                    onClick={() => shareToSocialMedia('twitter')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-blue-400">🐦</span> Twitter
                  </button>
                  <button
                    onClick={() => shareToSocialMedia('facebook')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-blue-600">👍</span> Facebook
                  </button>
                  <button
                    onClick={() => shareToSocialMedia('linkedin')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-blue-700">💼</span> LinkedIn
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowCollectionModal(true)}
                disabled={!isSignedIn || !promptId}
                className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Save to Collections
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{generated.split(' ').length} words · {generated.length} characters</p>
          </div>
        )}

        {showCollectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center modal-overlay">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Save to Collection</h3>
              {collections.length > 0 ? (
                <div className="space-y-2">
                  {collections.map(col => (
                    <button
                      key={col._id}
                      onClick={() => handleSaveToCollection(col._id)}
                      className="block w-full text-left p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No collections found. Create a new one below.</p>
              )}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <button
                  onClick={handleCreateNewCollection}
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  ➕ Create & Save
                </button>
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="w-full mt-2 border dark:border-gray-600 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
